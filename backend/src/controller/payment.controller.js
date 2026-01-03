import { raypay } from "../app.js";
import asyncHandler from "../utils/asyncHandler.js";
import crypto, { verify } from "crypto";
import { PaymentMDB } from "../modules/payment.module.js";
import { Rooms } from "../modules/rooms.module.js";
import mongoose from "mongoose";
import { getDatesInRange } from "../utils/dateRange.js";
import { generateGroupBookingId } from "../utils/codeGenerator.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { Lock } from "../modules/lock.modules.js";
import { Booking } from "../modules/booking.module.js";
const Payment = asyncHandler(async (req, res) => {
  console.log("payment api is called");
  var options = {
    amount: Number(req.body.amount) * 100,
    currency: "INR",
  };

  const order = await raypay.orders.create(options);

  // console.log(order);

  return res
    .status(200)
    .json({ success: true, data: order, message: "Success Operation" });
});

const PaymentVerification = asyncHandler(async (req, res) => {
  console.log("verification will be done")
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body;
  const body = razorpay_order_id + "|" + razorpay_payment_id;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_API_SECRET)
    .update(body.toString())
    .digest("hex");

  const isAuthentic = expectedSignature === razorpay_signature;

  if (isAuthentic) {
    await PaymentMDB.create({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    });

    return res.redirect(
      `/paymentsuccess?pay=${razorpay_payment_id}&order=${razorpay_order_id}`
    );
  } else {
    return res.status(400).json({ success: false });
  }
});

const verifyAndBook = asyncHandler(async (req, res) => {
  console.log("inside the verify and book")
  console.log(req.body)
  const {
    razorpay_payment_id,
    razorpay_order_id,
    razorpay_signature,
    lockIds,
  } = req.body;

  if (!Array.isArray(lockIds) || lockIds.length === 0) {
    throw new ApiError(400, "No locks provided");
  }

  /* --------------------------------------------------- */
  /* 1️⃣ Verify Razorpay signature                        */
  /* --------------------------------------------------- */
  const body = `${razorpay_order_id}|${razorpay_payment_id}`;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_API_SECRET)
    .update(body)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    throw new ApiError(400, "Invalid payment signature");
  }

  /* --------------------------------------------------- */
  /* 2️⃣ Verify payment with Razorpay server              */
  /* --------------------------------------------------- */
  const payment = await raypay.payments.fetch(razorpay_payment_id);
  if (payment.status !== "captured") {
    throw new ApiError(400, "Payment not captured");
  }

  /* --------------------------------------------------- */
  /* 3️⃣ Fetch & validate ALL locks                       */
  /* --------------------------------------------------- */
  const locks = await Lock.find({ _id: { $in: lockIds } });

  if (locks.length !== lockIds.length) {
    throw new ApiError(409, "Some locks expired");
  }

  const now = new Date();
  for (const lock of locks) {
    if (lock.status !== "hold" || lock.expiresAt < now) {
      throw new ApiError(409, "Session expired");
    }
  }

  /* --------------------------------------------------- */
  /* 4️⃣ Batch-fetch rooms & calculate amount             */
  /* --------------------------------------------------- */
  const roomIds = [...new Set(locks.map(l => l.roomId.toString()))];

  const rooms = await Rooms.find(
    { _id: { $in: roomIds } },
    { price: 1 }
  );

  if (rooms.length !== roomIds.length) {
    throw new ApiError(404, "Room not found");
  }

  const roomPriceMap = new Map(
    rooms.map(r => [r._id.toString(), r.price])
  );

  let expectedAmount = 0;
  const bookingDocs = [];
  const roomUpdates = [];
  const lockDeleteIds = [];

  // one checkout → one groupBookingId
  const groupBookingId = generateGroupBookingId();

  for (const lock of locks) {
    const price = roomPriceMap.get(lock.roomId.toString());
    const dates = getDatesInRange(lock.startDate, lock.endDate);
    const nights = dates.length;
    const roomAmount = price * nights;

    expectedAmount += roomAmount;

    bookingDocs.push({
      groupBookingId,
      userId: lock.userId,
      hotelId: lock.hotelId,
      roomId: lock.roomId,
      roomNumberId: lock.roomNumberId,
      startDate: lock.startDate,
      endDate: lock.endDate,
      amount: roomAmount,
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
            "roomNumbers.$.unavailableDates": { $each: dates },
          },
        },
      },
    });

    lockDeleteIds.push(lock._id);
  }

  // if (payment.amount !== expectedAmount * 100) {
  //   throw new ApiError(400, "Amount mismatch");
  // }

  /* --------------------------------------------------- */
  /* 5️⃣ TRANSACTION: booking + inventory + cleanup       */
  /* --------------------------------------------------- */
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await Booking.insertMany(bookingDocs, { session });
    await Rooms.bulkWrite(roomUpdates, { session });
    await Lock.deleteMany({ _id: { $in: lockDeleteIds } }, { session });

    await session.commitTransaction();
    session.endSession();

    return res
    .status(200)
    .json(200, {groupBookingId,razorpay_payment_id,razorpay_order_id},"Booking Confirmed successfully")
      
      
    //   {
    //   success: true,
    //   message: "Booking confirmed successfully",
    //   data: {
    //     groupBookingId,
    //     paymentId: razorpay_payment_id,
    //     orderId: razorpay_order_id,
    //   },
    // }

  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
});

export { Payment,verifyAndBook };
