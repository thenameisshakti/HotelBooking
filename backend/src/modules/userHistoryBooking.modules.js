import mongoose from "mongoose";

const userBookingHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
     groupBookingId:{
        type: String,
        require: true,
        index: true,
    },
    hotel: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Hotel",
        required: true
    },

    room: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Room"
    },

    checkIn: {
      type: Date,
      required: true
    },

    checkOut: {
      type: Date,
      required: true
    },

    status: {
      type: String,
      enum: ["confirmed", "cancelled", "completed"],
      default: "confirmed"
    },

    payment: {
      amount: {
        type: Number,
        required: true
      },
      currency: {
        type: String,
        default: "USD"
      },
      paymentId: {
        type: String
      }
    },

    bookedAt: {
      type: Date,
      default: Date.now
    },

    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true // auto manages createdAt & updatedAt
  }
);

userBookingHistorySchema.index({ userId: 1, checkOut: 1 });
userBookingHistorySchema.index({ groupBookingId: 1 }, { unique: true });

const UserBookingHistory = mongoose.model("UserBookingHistory", userBookingHistorySchema)

export default UserBookingHistory