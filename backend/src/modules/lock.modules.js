import mongoose from "mongoose";

const lockSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Types.ObjectId,
            ref: "Users",
            require: true
        },
        hotelId: {
            type: mongoose.Types.ObjectId,
            ref: "Hotel",
            require: true
        },
        roomId: {
            type: mongoose.Types.ObjectId,
            ref: "Rooms",
            require: true
        },
        roomNumberId: {
            type: mongoose.Schema.Types.ObjectId,
            require: true
        },
        startDate:{
            type: Date,
            require: true
        },
        endDate:{
            type: Date,
            require: true
        },
        status: {
            type: String,
            enum: ["hold", "confirmed"],
            default: "hold"
        },
        expiresAt: {
            type: Date
        }

    },
    {
        timestamps: true
    }
)

lockSchema.index({expiresAt: 1}, {expireAfterSeconds: 0})
lockSchema.index({roomNumberId: 1, expiresAt: 1})

export const Lock = mongoose.model("Tempory_Lock", lockSchema)