import mongoose from "mongoose";
import { Schema } from "mongoose";

const hotlesSchema = new mongoose.Schema({
    name: {
        type: String,
        requried: true
    },
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        
    },
    email: {
        type: String,
        required: true
    },
    type : {
        type: String,
        required: true,

    },
    address: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    photos:{
         type: [String],
         
    },
    discription: {
        type: String,
        required: true
    },
    rating:{
        type: Number,
        min: 0,
        max: 5
    },
    rooms: [{
        type: Schema.Types.ObjectId,
        ref: "Rooms"
    }]

     ,
    AveragePrice: {
        type: Number,
        
    },
    LowestPrice: {
        type: Number
    },
    featured: {
        type: Boolean,
        default: false
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "Users"
    }

}, {timestamps: true})

export const Hotels = mongoose.model("Hotels",hotlesSchema)