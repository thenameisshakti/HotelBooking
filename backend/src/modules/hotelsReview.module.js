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
    description: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min:0 ,
        max: 5,
    },
    photos: [
        {
        imageUrl: { type: String},
        imagePublicId: { type: String,}
        }
    ],
}, {timestamps: true}
)

hotelReviewSchema.index({ hotelId: 1, userId: 1 }, { unique: true });

export const HotelsReview = mongoose.model("Hotels_Review", hotelReviewSchema);
