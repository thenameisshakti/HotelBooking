import { Booking } from "../modules/booking.module.js";
import { HotelsReview } from "../modules/hotelsReview.module.js";
import  ApiError from "../utils/ApiError.js";
import  asyncHandler  from "../utils/asyncHandler.js";

export const verifyBookingForReview = asyncHandler(
  async (req, res, next) => {
    console.log(req.body)
    const userId = req.user.id;
    const { groupBookingId, hotelId } = req.body;

    if (!groupBookingId || !hotelId) {
      throw new ApiError(
        400,
        "groupBookingId and hotelId are required"
      );
    }

    // 1️⃣ Check: user has at least ONE confirmed booking in this stay
    const bookingExists = await Booking.exists({
      userId,
      hotelId,
      groupBookingId,
      status: "CONFIRMED"
    });

    if (!bookingExists) {
      throw new ApiError(
        403,
        "You can only review a completed stay"
      );
    }

    // 2️⃣ Check: stay not already reviewed
    const alreadyReviewed = await HotelsReview.exists({
      groupBookingId
    });

    if (alreadyReviewed) {
      throw new ApiError(
        409,
        "You have already reviewed this stay"
      );
    }

    next();
  }
);
