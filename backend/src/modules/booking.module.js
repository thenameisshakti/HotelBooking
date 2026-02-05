import mongoose from "mongoose";



const bookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },

    hotelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hotels",
      required: true,
    },

    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Rooms",
      required: true,
    },

    roomNumberId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    groupBookingId:{
        type: String,
        require: true,
        index: true,
    },
    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    paymentProvider: {
      type: String,
      enum: ["RAZORPAY"],
      required: true,
    },

    paymentOrderId: {
      type: String,
      required: true,
    },

    paymentId: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["CONFIRMED", "CANCELLED", "REFUNDED"],
      default: "CONFIRMED",
    },
  },
  { timestamps: true }
);
bookingSchema.index({roomNumberId: 1, startDate: 1  , endDate: 1})

bookingSchema.index({
  userId: 1,
  createdAt: -1
});

export const Booking = mongoose.model("Booking", bookingSchema);
