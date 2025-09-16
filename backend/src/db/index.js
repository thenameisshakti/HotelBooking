import { DB_Name } from "../name.js"
import mongoose from "mongoose"

const connectDB = async() => {
    try {
        const connectionIstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_Name}`)
        console.log(`\n MONGODB connected !! ${connectionIstance.connection.host}`)

    }catch (error) {

        console.log("error while creating instance",error)
        process.exit(1)
    }
}
export default connectDB