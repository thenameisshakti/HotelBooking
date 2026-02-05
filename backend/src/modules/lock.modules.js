import mongoose from "mongoose";

const lockSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "Users",
      required: true
    },

    hotelId: {
      type: mongoose.Types.ObjectId,
      ref: "Hotel",
      required: true
    },

    roomId: {
      type: mongoose.Types.ObjectId,
      ref: "Rooms",
      required: true
    },

    roomNumberId: {
      type: mongoose.Types.ObjectId,
      required: true
    },

    startDate: {
      type: Date,
      required: true
    },

    endDate: {
      type: Date,
      required: true
    },

    paymentOrderId: {
      type: String // linked later from Payment
    },

    status: {
      type: String,
      enum: ["hold", "expired", "released", "confirmed"],
      default: "hold",
      index: true
    },

    expiresAt: {
      type: Date,
      required: true,
      index: true
    }
  },
  { timestamps: true }
);

// HARD GUARANTEE: only one ACTIVE lock per roomNumber
lockSchema.index(
  { roomNumberId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: "hold",
      expiresAt: { $gt: new Date() }
    }
  }
);

lockSchema.index({
  roomNumberId: 1,
  status: 1,
  expiresAt: 1
});

lockSchema.index({
  startDate: 1,
  endDate: 1
});

export const Lock = mongoose.model("Tempory_Lock", lockSchema);
