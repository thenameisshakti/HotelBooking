import ApiError from "../utils/ApiError.js";
import asynHandler from "../utils/asyncHandler.js";
import { Users } from "../modules/user.module.js";
import jwt from "jsonwebtoken"

const verifyjwt =  async (req) => {
       

        const token = req.cookies?.accessToken || req.get("Authorization")?.replace("Bearer ","") || req.headers?.authorization?.replace("Bearer ", "");

        if(!token) {
            throw new ApiError(401, "unautherized request")

        }

        const decodedToken = jwt.verify(token , process.env.ACCESS_TOKEN_SECRET)

        if (!decodedToken) {
            throw new ApiError(402, " error in verifiction")
        }
        

        const user = await Users.findById(decodedToken?.id).select("-password -refreshToken")
        
        
        if(!user){
            throw new ApiError(403,"invalid access Token")
        }

        return user
        


}

export const verifyUser = asynHandler( async (req,res,next) => {
    try {
        const user = await verifyjwt(req)
        req.user = user
        console.log("user verified")
        next()
    }catch (error){
        console.log("error while verify user",error)
    }
})

export const verifyAdmin = asynHandler( async(req,res,next) => {
    try {
        
        const user = await verifyjwt(req)
        
        if(!user.isAdmin) {
            throw new ApiError(403, " you are not authorized as Admin")

        }
        
        req.user = user
        console.log("Admin verify ")
        next()
    } catch (error) {
        console.log(403,"error to verify admin",error)
    }
})