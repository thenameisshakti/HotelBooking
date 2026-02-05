import mongoose from "mongoose";

const hotelReviewSchema = new mongoose.Schema({
    hotelId: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"Hotels",
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'Users',
        required: true
    },
   groupBookingId: {
  type: String,
  required: true,
  unique: true
},

    description: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        min: 0,
        max: 5 ,
        require: true
    },
     categoryRatings: {
      staff: { type: Number, min: 0, max: 5, required: true },
      facilities: { type: Number, min: 0, max: 5, required: true },
      cleanliness: { type: Number, min: 0, max: 5, required: true },
      comfort: { type: Number, min: 0, max: 5, required: true },
      valueForMoney: { type: Number, min: 0, max: 5, required: true },
      location: { type: Number, min: 0, max: 5, required: true },
      freeWifi: { type: Number, min: 0, max: 5, required: true },
    },
    photos: [
        {
        imageUrl: { type: String},
        imagePublicId: { type: String,}
        }
    ],
}, {timestamps: true}
)

hotelReviewSchema.index({ groupBookingId:1 }, { unique: true });

export const HotelsReview = mongoose.model("Hotels_Review", hotelReviewSchema);
