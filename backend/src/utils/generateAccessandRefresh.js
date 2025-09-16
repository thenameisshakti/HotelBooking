
import { Users } from "../modules/user.module.js"

const generateAccessandRefresh = async(userId) => {
    try {
        const user = await Users.findById(userId) 

        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken

        await user.save({validateBeforeSave: false })

        if(user.refreshToken) { console.log("refresh token added")}
        
        return {accessToken,refreshToken}

    } catch (error) {
        console.log("while generating the Access and Refresh token ", error)
    }
}

export default generateAccessandRefresh