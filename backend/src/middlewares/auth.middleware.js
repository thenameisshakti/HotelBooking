import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { Users } from "../modules/user.module.js";
import jwt from "jsonwebtoken"

const verifyjwt =  async (req) => {
       try {
        console.log(req.headers, "in the auth")
         const token = req.cookies?.accessToken || req.get("Authorization")?.replace("Bearer ","") || req.headers?.authorization?.replace("Bearer ", "");
        // console.log(token)
         if(!token) {
             throw new ApiError(401, "unautherized request")
 
         }
        //  console.log("here")
         const decodedToken = jwt.verify(token , process.env.ACCESS_TOKEN_SECRET)

        //  console.log(decodedToken, "here")
         if (!decodedToken) {
             throw new ApiError(401, " error in verifiction")
         }
         
 
         const user = await Users.findById(decodedToken?.id).select(" _id username email isAdmin")
         
         
         if(!user){
             throw new ApiError(401,"invalid access Token")
         }
        //  console.log("user verified in middleware" , user)
         return user
       } catch (error) {
        console.log("error in verify jwt", error.message )
        throw error;
       }
        


}

export const verifyUser = asyncHandler( async (req,res,next) => {
    try {
        const user = await verifyjwt(req)
        // console.log(user,"this is user")
        req.user = user
        next()
    }catch (error){
        console.log(error.message)
        throw new ApiError(401, " unautherized request as user" )
    }
})

export const verifyAdmin = asyncHandler( async(req,res,next) => {
    try {
        
        const user = await verifyjwt(req)
        console.log(user.isAdmin)
        if(!user.isAdmin) {
            throw new ApiError(403, " you are not authorized as Admin")       

        }
        
        req.user = user
        console.log("Admin verify ")
        next()
    } catch (error) {
        throw new ApiError(403, " you are not authorized as Admin")
    }
})