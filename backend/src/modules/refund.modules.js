import mongoose from "mongoose";

const refundSchema = new mongoose.Schema(
  {
    paymentId: {
      type: String,
      required: true,
      unique: true // guarantees single refund
    },

    razorpayRefundId: {
      type: String
    },

    amount: {
      type: Number,
      required: true
    },

    reason: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

const Refund = mongoose.model("Refund", refundSchema);
export default Refund
