import { Router } from "express";
import {
  countByCity,
  countByType,
  createHotel,
  deleteHotel,
  getAllHotel,
  getHotel,
  getHotelRooms,
  updateHotel,
  reviewHotel,
  updateReview,
  deleteReview,
  deleteReviewPhoto,
  getHotelReviews
} from "../controller/hotel.controller.js";
import { verifyAdmin , verifyUser} from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const hotelsroute = Router();

hotelsroute.route("/create").post(
  verifyAdmin,
  upload.fields([
    {
      name: "photos",
      maxCount: 5,
    },
  ]),
  createHotel
);
hotelsroute.route("/update/:hotelId").post(verifyAdmin, updateHotel); // remember for the next project
hotelsroute.route("/delete/:hotelId").delete(verifyAdmin, deleteHotel); // hotel id has been passed
hotelsroute.route("/all").get(getAllHotel); 
hotelsroute.route("/city").get(countByCity);
hotelsroute.route("/type").get(countByType);
hotelsroute.route("/room/:hotelId").get(getHotelRooms); //hotelid 
hotelsroute.route("/get/:hotelId").get(getHotel);
hotelsroute.route("/review/:hotelId").post(verifyUser,
    upload.fields([
    {
      name: "photos",
      maxCount: 5,
    },
  ]),
    reviewHotel);
hotelsroute.route("/reviewUpdate/:reviewId").patch(verifyUser,
    upload.fields([
    {
      name: "photos",
      maxCount: 5,
    },
  ]),
    updateReview);
hotelsroute.route('/reviewDelete/:reviewId').delete(verifyUser,deleteReview)
hotelsroute.route('/reviewDeletePhoto/:reviewId/:reviewPhotoId').patch(verifyUser,deleteReviewPhoto) 
hotelsroute.route('/review/:hotelId').get(verifyUser,getHotelReviews) 

export default hotelsroute;
