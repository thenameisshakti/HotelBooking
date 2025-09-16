import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import errorHandler from "./utils/ErrorHandler.js"

const app = express()

app.use(cors({
    orgin: process.env.CORS_ORIGIN,
    credentials: true
}))

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


app.use('/api/v1/users', userroute)
app.use('/api/v1/hotels', hotelsroute)
app.use('/api/v1/rooms', roomsroute )

app.use(errorHandler)





export {app}