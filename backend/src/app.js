import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import errorHandler from "./utils/ErrorHandler.js"
import Razorpay from "razorpay"

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

export const raypay = new Razorpay({
    key_id: process.env.RAZORPAY_API_KEY,
    key_secret: process.env.RAZORPAY_API_SECRET
})


app.use(
    express.json({
        limit: "16kb"
    })
)

app.use(
    express.urlencoded({
        extended: true,
        limit: "16kb"
    })
)
app.use(express.static('public'))

app.use(cookieParser())




import hotelsroute from "./routes/hotels.routes.js"
import roomsroute from "./routes/rooms.routes.js"
import userroute from "./routes/user.routes.js"
import { payRouter } from "./routes/payment.routes.js"


app.use('/api/v1/users', userroute)
app.use('/api/v1/hotels', hotelsroute)
app.use('/api/v1/rooms', roomsroute )
app.use('/api/v1/pay',payRouter)


app.get('/api/v1/getkey',(req,res) => {
    console.log("inside of getkey")
    res.status(200).json({key: process.env.RAZORPAY_API_KEY})})

app.use(errorHandler)





export {app}