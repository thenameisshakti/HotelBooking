import { raypay } from "../app.js";
import asyncHandler from "../utils/asyncHandler.js";
import crypto, { verify } from "crypto";
import Payment from "../modules/payment.module.js";
import { Rooms } from "../modules/rooms.module.js";
import mongoose from "mongoose";
import { getDatesInRange } from "../utils/dateRange.js";
import { generateGroupBookingId } from "../utils/codeGenerator.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { Lock } from "../modules/lock.modules.js";
import { Booking } from "../modules/booking.module.js";
import UserBookingHistory from "../modules/userHistoryBooking.modules.js";
import Refund from "../modules/refund.modules.js";

const pocessingPayment = asyncHandler(async (req, res) => {
  console.log(req.body);
  const { amount, lockIds } = req.body;
  const userId = req.user._id;

  const now = new Date();
  const expiresAt = new Date(now.getTime() + 14 * 60 * 1000);

  const order = await raypay.orders.create({
    amount: Number(amount) * 100,
    currency: "INR",
  });

  await Payment.create({
    userId,
    razorpayOrderId: order.id,
    lockIds,
    amount,
    currency: "INR",
    expiresAt,
    status: "created",
  });

  return res
    .status(200)
    .json(new ApiResponse(200, { order, expiresAt }, "Proceed to the payment"));
});

const verifyAndBook = asyncHandler(async (req, res) => {
  console.log("inside the verify")
  const { razorpay_payment_id, razorpay_order_id, razorpay_signature } =
    req.body;

  const now = new Date();

  /* --------------------------------------------------
     1. Fetch payment attempt (SOURCE OF TRUTH)
  -------------------------------------------------- */
  const paymentRecord = await Payment.findOne({
    razorpayOrderId: razorpay_order_id,
  });

  if (!paymentRecord) {
    throw new ApiError(404, "Payment record not found");
  }

  if (paymentRecord.status !== "created") {
    // idempotency protection
    return res.status(200).json({
      message: "Booking already processed",
    });
  }

  /* --------------------------------------------------
     2. Enforce PAYMENT EXPIRY (14 min cutoff)
  -------------------------------------------------- */
  if (now > paymentRecord.expiresAt) {
    paymentRecord.status = "expired";
    await paymentRecord.save();

    // refund will be triggered later (or webhook)
    throw new ApiError(409, "Payment session expired");
  }

  /* --------------------------------------------------
     3. Verify Razorpay signature
  -------------------------------------------------- */
  const body = `${razorpay_order_id}|${razorpay_payment_id}`;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_API_SECRET)
    .update(body)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    throw new ApiError(400, "Invalid payment signature");
  }

  /* --------------------------------------------------
     4. Fetch Razorpay payment
  -------------------------------------------------- */
  const payment = await raypay.payments.fetch(razorpay_payment_id);
  if (payment.status !== "captured") {
    throw new ApiError(400, "Payment not captured");
  }

  /* --------------------------------------------------
     5. Fetch locks OWNED by this payment
  -------------------------------------------------- */
  const locks = await Lock.find({
    _id: { $in: paymentRecord.lockIds },
    status: "hold",
  });

  if (locks.length !== paymentRecord.lockIds.length) {
    // payment ok, inventory lost → refund
    paymentRecord.status = "captured";
    await paymentRecord.save();

    throw new ApiError(
      409,
      "Room no longer available, payment will be refunded",
    );
  }

  /* --------------------------------------------------
     6. Validate lock expiry (inventory authority)
  -------------------------------------------------- */
  for (const lock of locks) {
    if (lock.expiresAt < now) {
      paymentRecord.status = "captured";
      await paymentRecord.save();

      throw new ApiError(409, "Session expired, payment will be refunded");
    }
  }

  /* --------------------------------------------------
     7. Create bookings (TRANSACTION)
  -------------------------------------------------- */
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
  const bookingDocs = [];
  const roomUpdates = [];
  const lockIds = [];

  const groupBookingId = generateGroupBookingId();

  // Collect stay-level info
  let userId;
  let hotelId;
  let earliestStartDate = null;
  let latestEndDate = null;

  for (const lock of locks) {
    userId = lock.userId;
    hotelId = lock.hotelId;

    if (!earliestStartDate || lock.startDate < earliestStartDate) {
      earliestStartDate = lock.startDate;
    }

    if (!latestEndDate || lock.endDate > latestEndDate) {
      latestEndDate = lock.endDate;
    }

    bookingDocs.push({
      groupBookingId,
      userId: lock.userId,
      hotelId: lock.hotelId,
      roomId: lock.roomId,
      roomNumberId: lock.roomNumberId,
      startDate: lock.startDate,
      endDate: lock.endDate,
      amount: paymentRecord.amount,
      paymentProvider: "RAZORPAY",
      paymentOrderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      status: "CONFIRMED",
    });

    roomUpdates.push({
      updateOne: {
        filter: { "roomNumbers._id": lock.roomNumberId },
        update: {
          $push: {
            "roomNumbers.$.unavailableDates": {
              $each: getDatesInRange(lock.startDate, lock.endDate),
            },
          },
        },
      },
    });

    lockIds.push(lock._id);
  }

  // 1️⃣ Create Booking documents (PER ROOM)
  const createdBookings = await Booking.insertMany(
    bookingDocs,
    { session }
  );

  // 2️⃣ Create ONE UserBookingHistory (PER STAY)
  await UserBookingHistory.create(
    [{
      userId,
      hotel: hotelId,
      groupBookingId,
      checkIn: earliestStartDate,
      checkOut: latestEndDate,
      status: "confirmed",
      reviewed: false,
      roomsCount: createdBookings.length,
      payment: {
        amount: paymentRecord.amount,
        currency: paymentRecord.currency || "INR",
      },
      bookedAt: new Date(),
    }],
    { session }
  );

  // 3️⃣ Update rooms availability
  await Rooms.bulkWrite(roomUpdates, { session });

  // 4️⃣ Confirm locks
  await Lock.updateMany(
    { _id: { $in: lockIds } },
    { status: "confirmed" },
    { session }
  );

  // 5️⃣ Update payment record
  paymentRecord.status = "captured";
  paymentRecord.razorpayPaymentId = razorpay_payment_id;
  paymentRecord.razorpaySignature = razorpay_signature;
  await paymentRecord.save({ session });

  await session.commitTransaction();
  session.endSession();

  return res.status(200).json({
    groupBookingId,
    message: "Booking confirmed successfully",
  });

} catch (err) {
  await session.abortTransaction();
  session.endSession();
  throw err;
}

});

const refundPayment = asyncHandler(async (req, res) => {
  const { razorpay_payment_id, reason } = req.body;

  // 1️⃣ Find payment record
  const paymentRecord = await Payment.findOne({
    razorpayPaymentId: razorpay_payment_id,
  });

  if (!paymentRecord) {
    throw new ApiError(404, "Payment record not found");
  }

  // 2️⃣ Idempotency: already refunded
  if (paymentRecord.status === "refunded") {
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Payment already refunded"));
  }

  // 3️⃣ Call Razorpay refund API
  const refund = await raypay.payments.refund(razorpay_payment_id, {
    amount: paymentRecord.amount * 100,
  });

  // 4️⃣ Save refund record
  await Refund.create({
    paymentId: razorpay_payment_id,
    razorpayRefundId: refund.id,
    amount: paymentRecord.amount,
    reason,
  });

  // 5️⃣ Update payment status
  paymentRecord.status = "refunded";
  await paymentRecord.save();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { refundId: refund.id },
        "Payment refunded successfully",
      ),
    );
});

export { pocessingPayment, verifyAndBook, refundPayment };
