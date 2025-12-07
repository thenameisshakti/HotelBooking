import { Router } from "express";
import { verifyAdmin} from "../middlewares/auth.middleware.js"
import {  createRoom, deleteRoom, getAllRoom, getRoom, updateavailability, updateRoom } from "../controller/room.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
const roomsroute = Router()

roomsroute.route("/create/:hotelid").post(
    verifyAdmin,
    upload.fields([
        {
        name: "roomImage",
        maxCount: 10
    }]),
    createRoom
)
roomsroute.route("/update/:id").post(
    verifyAdmin,
    upload.array("roomImage",5),
    updateRoom
)

roomsroute.route('/availability/:roomNumbersid').put(updateavailability)
roomsroute.route('/delete/:roomNumbersid').delete(verifyAdmin, deleteRoom)
roomsroute.route("/get/:roomNumbersid").get(getRoom)
roomsroute.route("/getall/:id").get(getAllRoom)

export default roomsroute