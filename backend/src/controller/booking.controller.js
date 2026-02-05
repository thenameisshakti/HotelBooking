import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { Lock } from "../modules/lock.modules.js";
import UserBookingHistory from "../modules/userHistoryBooking.modules.js";


const createLock = asyncHandler(async (req, res) => {
  const { roomId, roomNumberId, startDate, endDate, hotelId } = req.body;
  const userId = req.user.id;

  const now = new Date();
  const expiresAt = new Date(now.getTime() + 12 * 60 * 1000); // lock < payment

  try {
    const lock = await Lock.create({
      userId,
      roomId,
      hotelId,
      roomNumberId,
      startDate,
      endDate,
      expiresAt,
      status: "hold"
    });

    return res.status(201).json(
      new ApiResponse(
        201,
        {
          lockId: lock._id,
          expiresAt: lock.expiresAt
        },
        "Room locked successfully"
      )
    );
  } catch (err) {
    // duplicate key = another active lock exists
    if (err.code === 11000) {
      throw new ApiError(409, "Room temporarily locked");
    }
    throw err;
  }
});


const removeLock = asyncHandler(async (req, res) => {
  const lockId = req.params.id;

  const lock = await Lock.findById(lockId);

  if (!lock) {
    return res.status(200).json(
      new ApiResponse(200, {}, "Lock already expired")
    );
  }

  // 🔒 payment already started → do not allow manual removal
  if (lock.paymentOrderId) {
    throw new ApiError(
      409,
      "Payment in progress. Lock cannot be released."
    );
  }

  await Lock.deleteOne({ _id: lockId });

  return res.status(200).json(
    new ApiResponse(200, {}, "Lock released successfully")
  );
});

const getUserBookingHistory = asyncHandler (async(req,res) => {
    const userId = req.user._id;

  const {
    type = "upcoming", // upcoming | completed
    limit = 5,
    skip = 0,
  } = req.query;

  const now = new Date();

  const matchCondition = {
    userId,
    ...(type === "upcoming"
      ? { checkOut: { $gte: now } }
      : { checkOut: { $lt: now } }),
  };

  const bookings = await UserBookingHistory.find(matchCondition)
    .sort({ checkIn: -1 }) // latest first
    .limit(Number(limit))
    .skip(Number(skip))
    .lean();

  const totalCount = await UserBookingHistory.countDocuments(matchCondition);

  return res.status(200).json(
    new ApiResponse(200, {
      bookings,
      hasMore: skip + bookings.length < totalCount,
    })
  );
})


export {
    createLock,
    removeLock,
    getUserBookingHistory
}