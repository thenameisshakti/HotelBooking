import { v2 as cloudinary } from 'cloudinary'
import fs from "fs"

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY ,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

const uploadOnCloudinary = async(filepath) => {
    
    try{
        if(!filepath) return null
        
        const response = await cloudinary.uploader.upload(
            filepath,
            {
                resource_type: "auto"
            }
        )
        console.log("file uploaded on cloudinay")

        await fs.unlinkSync(filepath)
        return response

    }catch (error) {
        console.log("error while uploading file in cloudinary")
        await fs.unlinkSync(filepath)
        return null

    }
}

const deleteFromCloudinary = async (publicId) => {
    try{
        const result = await cloudinary.uploader.destroy(publicId)
        console.log("file deleted from cloudinary", result)
        return result
    } catch (error){
        console.log("error while deleting file from cloudinary",error.message)
        return null
    }
}

export { uploadOnCloudinary, deleteFromCloudinary };