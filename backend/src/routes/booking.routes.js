import { Router } from "express";
import { createLock , removeLock,getUserBookingHistory} from "../controller/booking.controller.js";
import { verifyUser } from "../middlewares/auth.middleware.js";

const  bookingRoute = Router() 

bookingRoute.route('/createLock').post(verifyUser,createLock)
bookingRoute.route('/deleteLock/:id').delete(verifyUser,removeLock)
// routes/bookingHistory.routes.js
bookingRoute.route("/history",verifyUser,getUserBookingHistory);




export default bookingRoute


