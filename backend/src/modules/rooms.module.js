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
    roomNumbers: [{number: Number ,unavailableDates: {type: [Date]}}],
    roomImage: {
        type: [String]
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "Users"
    }
} , {timestamps: true})

export const Rooms = mongoose.model("Rooms", roomShema)