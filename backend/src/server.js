import dotenv from "dotenv"
import connectDB from "./db/index.js"
import {app} from "./app.js"

dotenv.config({
    path:'./.env'
})


connectDB()
.then(() => {
    app.listen(process.env.PORT || 2000 ,"0.0.0.0",() =>{
        console.log(`\n this web site will be run on the port ${process.env.PORT}`)
    })
})
.catch((error) => {
    console.log("MOGODB connection failed !! Restart ")
})

