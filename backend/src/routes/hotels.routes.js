import { Router } from "express";
import { countByCity, countByType, createHotel, deleteHotel, getAllHotel, getHotel, getHotelRooms, updateHotel } from "../controller/hotel.controller.js";
import { verifyAdmin } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";


const hotelsroute = Router()

hotelsroute.route("/create").post(
    verifyAdmin,
    upload.fields([
        {
            name: "photos",
            maxCount: 5
        }
    ]),
    createHotel)
hotelsroute.route('/update/:id').post(verifyAdmin,updateHotel)     // remember for the next project 
hotelsroute.route('/delete/:id').delete(verifyAdmin,deleteHotel)
hotelsroute.route('/all').get(getAllHotel)
hotelsroute.route('/city').get(countByCity)
hotelsroute.route('/type').get(countByType)
hotelsroute.route('/room/:id').get(getHotelRooms)
hotelsroute.route('/get/:id').get(getHotel)


export default hotelsroute