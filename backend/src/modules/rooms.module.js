import mongoose , {model, Schema } from "mongoose";


const roomShema = new Schema({
    title: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    maxPeople : {
        type: Number,
        required: true
    },
    desc: {
        type: String,

    },
    visibility: {
        type: Boolean
    },
    roomNumbers: [{number: Number ,unavailableDates: {type: [Date]}, status: {type: String, enum: [ "booked"]}}],
    roomImage: {
        type: [String]
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "Users"
    }
} , {timestamps: true})

roomShema.index({"roomNumbers._id": 1})

export const Rooms = mongoose.model("Rooms", roomShema)