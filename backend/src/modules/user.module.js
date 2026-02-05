import mongoose from "mongoose";
import { Schema } from "mongoose";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

const userSchema = new Schema({
    username: {
        type: String,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    img: {
        type: String
    },
    number: {
        type: String
    },
    password: {
        type: String,
    },
   
    refreshToken : {
        type: String
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    googleId:{
        type: String
    },
    modeOfAuth: {
        type: String,
        enum: ["local","google"]
    }
},{timestamps: true})

userSchema.pre("save", async function(next) {
    if (!this.isModified("password")) return next()
    this.password = await bcrypt.hash(this.password,10)
    next()
})

userSchema.methods.isPasswordcorrect = async function (password) {
    
    return await bcrypt.compare(password,this.password)
 
}

userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            id: this._id,

        },
        process.env.ACCESS_TOKEN_SECRET,
        {
           expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }

    )
}

userSchema.methods.generateRefreshToken =  function(){ // refresh token required less information
    return jwt.sign(
        {
            _id: this._id, // this._id we will get form mongodb
            
        },
        process.env.REFRESH_TOKEN_SECRET,
        { 
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY // expiry as object this is syntax
        }
         
    )

}


export const  Users = mongoose.model("Users",userSchema)