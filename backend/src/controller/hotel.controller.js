import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { Hotels } from "../modules/hotels.module.js";
import {uploadOnCloudinary, deleteFromCloudinary} from "../utils/uploadOnCloundinary.js";
import { Rooms } from "../modules/rooms.module.js";
import { HotelsReview } from "../modules/hotelsReview.module.js";
import {MAX_IMAGE_UPLOAD} from "../utils/constant.js";
import mongoose from "mongoose";
import { Lock } from "../modules/lock.modules.js";
import { getDatesInRange } from "../utils/dateRange.js";


const createHotel = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    username,
    address,
    type,
    city,
    state,
    discription,
    cheapestPrice,
    ...others
  } = req.body;
  if (
    [
      name,
      email,
      username,
      type,
      city,
      state,
      address,
      discription,
      cheapestPrice,
    ].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(401, " All fields are required so do enter ");
  }

  const existHotel = await Hotels.findOne({ username });

  if (existHotel) {
    throw new ApiError(402, "this hotel is already exist ");
  }

  const photoslocalpath = req.files?.photos?.map((field) => field.path);
  const photos = [];
  //change is needed here
  for (let localpath of photoslocalpath) {
    let uploaded = await uploadOnCloudinary(localpath);
    photos.push(uploaded.url);
  }

  if (!photos) {
    console.log(" you are procceding without uploading the image ");
  }

  const hotel = await Hotels.create({
    name,
    type,
    email,
    username,
    address,
    city,
    state,
    discription,
    cheapestPrice,
    photos: photos || "",
    owner: req.user,
    ...others,
  });
  return res
    .status(200)
    .json(new ApiResponse(200, hotel, "hotel created successfully"));
});

const updateHotel = asyncHandler(async (req, res) => {
  const updateField = { ...req.body };

  for (let field in updateField) {
    if (updateField[field] !== "" && updateField[field] !== undefined)
      updateField[field] = req.body[field];
  }

  const hotel = await Hotels.findByIdAndUpdate(
    req.params.hotelId,
    {
      $set: updateField,
    },
    { new: true }
  );
  if (!hotel) {
    throw new ApiError(404, "Hotel not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, hotel, "update value is here"));
});

const deleteHotel = asyncHandler(async (req, res) => {
  const existhotel = await Hotels.findByIdAndDelete(req.params.hotelId);

  if (!existhotel) {
    throw new ApiError(404, "this hotel is not exist");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, existhotel, "hotel delete successfully"));
});

const getHotel = asyncHandler(async (req, res) => {
  const hotelId = req.params.hotelId;

  const hotel = await Hotels.findById(hotelId);

  if (!hotel) {
    throw new ApiError(404, "hotel is not found");
  }

  return res.status(200).json(new ApiResponse(200, hotel, "hotel found"));
});

const getAllHotel = asyncHandler(async (req, res) => {
  let { min, max, limit = 3, page = 1, city, ...others } = req.query;

  limit = Number(limit);
  page = Number(page);

  const filters = {
    ...others,
    featured: true,
  };

  if (max && min) {
    filters.cheapestPrice = { $gt: min, $lt: max };
  }

  if (city) {
    filters.city = { $regex: new RegExp(city.trim(), "i") };
  }

  const skip = (page - 1) * limit;

  const hotels = await Hotels.find(filters).skip(skip).limit(limit);

  const totalHotels = await Hotels.countDocuments(filters);
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        hotels,
        totalHotels,
        totalPages: Math.ceil(totalHotels / limit),
        currentPage: page,
      },
      "Hotels fetched with pagination"
    )
  );
});

const countByCity = asyncHandler(async (req, res) => {
  const cities = req.query.cities.split(",");
  if (cities == "" || cities.length === 0) {
    throw new ApiError(404, "no cities provided");
  }

  // const list = await Promise.all(
  //     cities.map(async (city) => {
  //         return await Hotels.countDocuments({
  //             city: { $regex: new RegExp(`^${city.trim()}$`, "i") }
  //         })
  //     })
  // )

  let list = [];
  for (let city of cities) {
    const count = await Hotels.countDocuments({
      city: { $regex: new RegExp(`^${city.trim()}$`, "i") },
    });
    list.push(count);
  }

  return res
    .status(200)
    .json(new ApiResponse(200, list, "here are the result"));
});

// const addRoomToHotel = asyncHandler( async (req, res) => {
//     const {roomid , hotelid} = req.params
//     const hotel = await Hotels.findById(hotelid)

//     if(!hotel) {
//         throw new ApiError(404,"hostel is not found")
//     }

//     const room = await Rooms.findById(roomid)

//     if (!room) {
//         throw new ApiError(404, "room is not found")
//     }

//     if ( hotel.rooms.includes(roomid)){
//         throw new ApiError(404,"rooms is already in that")
//     }

//     hotel.rooms.push(roomid)
//     await hotel.save()

//     const updateHotel = await hotel.populate("rooms" ,"title price roomNumber") // referende and field which bring from schema

//     return res
//     .status(200)
//     .json(new ApiResponse (200, updateHotel, "room added successfully "))

// })

// const addMutipleRoomsToHotel = asyncHandler (asyncHandler (async (req,res) => {

// }))

const countByType = asyncHandler(async (req, res) => {
  const [hotelCount, apartmentCount, resortCount, villaCount, cabinCount] =
    await Promise.all([
      Hotels.countDocuments({ type: "hotel" }),
      Hotels.countDocuments({ type: "apartment" }),
      Hotels.countDocuments({ type: "resort" }),
      Hotels.countDocuments({ type: "villa" }),
      Hotels.countDocuments({ type: "cabin" }),
    ]);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        [hotelCount, apartmentCount, resortCount, villaCount, cabinCount],
        "here is Your result"
      )
    );
});

const getHotelRooms = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  const now = new Date();

  const hotel = await Hotels.findById(req.params.hotelId);
  if (!hotel) {
    throw new ApiError(404, "Hotel not found");
  }

  const requestedDates = getDatesInRange(
    new Date(startDate),
    new Date(endDate)
  );



  const activeLocks = await Lock.find({
    status: "hold",
    expiresAt: { $gt: now },
    startDate: { $lt: new Date(endDate) },
    endDate: { $gt: new Date(startDate) }
  }).select("roomNumberId");

 

  const lockedRoomNumbers = activeLocks.map(l => l.roomNumberId);

  console.log("lockedRoomIds:", lockedRoomNumbers);
console.log("Type check:", typeof lockedRoomNumbers[0]);

 const rooms = await Rooms.find({ _id: { $in: hotel.rooms } }).lean();

const requestedDays = requestedDates.map(d =>
  d.toISOString().split("T")[0]
);

const lockedSet = new Set(
  lockedRoomNumbers.map(id => id.toString())
);

rooms.forEach(room => {
  room.roomNumbers = room.roomNumbers.filter(rn => {
    // 1️⃣ remove locked
    if (lockedSet.has(rn._id.toString())) return false;

    // 2️⃣ remove booked (calendar day check)
    const bookedDays = rn.unavailableDates.map(d =>
      new Date(d).toISOString().split("T")[0]
    );

    return !bookedDays.some(day =>
      requestedDays.includes(day)
    );
  });
});

// remove rooms with no roomNumbers
const availableRooms = rooms.filter(r => r.roomNumbers.length > 0);





 console.log(rooms)

  return res.status(200).json(
    new ApiResponse(200, availableRooms , "Available rooms")
  );
});



const reviewHotel = asyncHandler(async (req, res) => {
  const hotelId = req.params.hotelId;

  const existReview = await HotelsReview.exists({
    hotelId: hotelId,
    userId: req.user._id,
  });

  if (existReview) {
    throw new ApiError(404, "you have already reviewed this hotel");
  }

  const { description, rating } = req.body;
  const categoryRatings = JSON.parse(req.body.categoryRatings);
  if (!description || !rating || !categoryRatings) {
    throw new ApiError(404, " all fields are required ");
  }

  const photosLocalPath = req.files?.photos?.map((field) => field.path);
  const photosUrl = [];
  if (!photosLocalPath) {
    console.log("you are proceeding without images");
  } else {
    for (let localPath of photosLocalPath) {
      let uploaded = await uploadOnCloudinary(localPath);
      photosUrl.push({imageUrl: uploaded.url,imagePublicId: uploaded.public_id});
    }
  }
  const hotel = await Hotels.findById(hotelId)
  hotel.reviewStats.totalReviews += 1
  hotel.reviewStats.averageRating = 
  ((hotel.reviewStats.averageRating * (hotel.reviewStats.totalReviews - 1) + Number(rating)) 
    / hotel.reviewStats.totalReviews).toFixed(2)
  console.log(rating, " rating value ")
  if (rating === "5") hotel.reviewStats.ratingCounts.fiveStar += 1;
  if (rating === "4") hotel.reviewStats.ratingCounts.fourStar += 1;
  if (rating === "3") hotel.reviewStats.ratingCounts.threeStar += 1;
  if (rating === "2") hotel.reviewStats.ratingCounts.twoStar += 1;
  if (rating === "1") hotel.reviewStats.ratingCounts.oneStar += 1;

  hotel.reviewStats.categoryAverages.staff =
  (
    hotel.reviewStats.categoryAverages.staff *
    (hotel.reviewStats.totalReviews - 1) +
    categoryRatings.staff
  ) / hotel.reviewStats.totalReviews;

hotel.reviewStats.categoryAverages.facilities =
  (
    hotel.reviewStats.categoryAverages.facilities *
    (hotel.reviewStats.totalReviews - 1) +
    categoryRatings.facilities
  ) / hotel.reviewStats.totalReviews;

hotel.reviewStats.categoryAverages.cleanliness =
  (
    hotel.reviewStats.categoryAverages.cleanliness *
    (hotel.reviewStats.totalReviews - 1) +
    categoryRatings.cleanliness
  ) / hotel.reviewStats.totalReviews;

hotel.reviewStats.categoryAverages.comfort =
  (
    hotel.reviewStats.categoryAverages.comfort *
    (hotel.reviewStats.totalReviews - 1) +
    categoryRatings.comfort
  ) / hotel.reviewStats.totalReviews;

hotel.reviewStats.categoryAverages.valueForMoney =
  (
    hotel.reviewStats.categoryAverages.valueForMoney *
    (hotel.reviewStats.totalReviews - 1) +
    categoryRatings.valueForMoney
  ) / hotel.reviewStats.totalReviews;

hotel.reviewStats.categoryAverages.location =
  (
    hotel.reviewStats.categoryAverages.location *
    (hotel.reviewStats.totalReviews - 1) +
    categoryRatings.location
  ) / hotel.reviewStats.totalReviews;

hotel.reviewStats.categoryAverages.freeWifi =
  (
    hotel.reviewStats.categoryAverages.freeWifi *
    (hotel.reviewStats.totalReviews - 1) +
    categoryRatings.freeWifi
  ) / hotel.reviewStats.totalReviews;




  await hotel.save();

  const hotelReview = await HotelsReview.create({
    hotelId: hotelId,
    userId: req.user._id,
    groupBookingId: req.body.groupBookingId,
    rating,
    categoryRatings,
    description,
    photos: photosUrl || "",
  });
  return res
    .status(200)
    .json(new ApiResponse(200, hotelReview, "review hotel "));
});

const updateReview = asyncHandler(async (req, res) => {
  const reviewId = req.params.reviewId;
  const {description , rating, } = req.body;
  const categoryRatings = JSON.parse(req.body.categoryRatings);

  const review = await HotelsReview.findById(reviewId);

  if (review.userId.toString() !== req.user._id.toString()) {
    throw new ApiError (403, " you are not allowed to update this review ");
  }

  if (!review) {
    throw new ApiError(404, "review not found");
  }

  if (description) review.description = description;
  if (rating) review.rating = rating;
  if (categoryRatings) review.categoryRatings = categoryRatings;

  const hotel = await Hotels.findById(review.hotelId)
  hotel.reviewStats.totalReviews += 1
  hotel.reviewStats.averageRating = 
      ((hotel.reviewStats.averageRating * (hotel.reviewStats.totalReviews - 1) + rating) 
      / hotel.reviewStats.totalReviews).toFixed(2)
  console.log(rating, " rating value ")
  if (rating === "5") hotel.reviewStats.ratingCounts.fiveStar += 1;
  if (rating === "4") hotel.reviewStats.ratingCounts.fourStar += 1;
  if (rating === "3") hotel.reviewStats.ratingCounts.threeStar += 1;
  if (rating === "2") hotel.reviewStats.ratingCounts.twoStar += 1;
  if (rating === "1") hotel.reviewStats.ratingCounts.oneStar += 1;

  hotel.reviewStats.categoryAverages.staff =
  (
    hotel.reviewStats.categoryAverages.staff *
    (hotel.reviewStats.totalReviews - 1) +
    categoryRatings.staff
  ) / hotel.reviewStats.totalReviews;

hotel.reviewStats.categoryAverages.facilities =
  (
    hotel.reviewStats.categoryAverages.facilities *
    (hotel.reviewStats.totalReviews - 1) +
    categoryRatings.facilities
  ) / hotel.reviewStats.totalReviews;

hotel.reviewStats.categoryAverages.cleanliness =
  (
    hotel.reviewStats.categoryAverages.cleanliness *
    (hotel.reviewStats.totalReviews - 1) +
    categoryRatings.cleanliness
  ) / hotel.reviewStats.totalReviews;

hotel.reviewStats.categoryAverages.comfort =
  (
    hotel.reviewStats.categoryAverages.comfort *
    (hotel.reviewStats.totalReviews - 1) +
    categoryRatings.comfort
  ) / hotel.reviewStats.totalReviews;

hotel.reviewStats.categoryAverages.valueForMoney =
  (
    hotel.reviewStats.categoryAverages.valueForMoney *
    (hotel.reviewStats.totalReviews - 1) +
    categoryRatings.valueForMoney
  ) / hotel.reviewStats.totalReviews;

hotel.reviewStats.categoryAverages.location =
  (
    hotel.reviewStats.categoryAverages.location *
    (hotel.reviewStats.totalReviews - 1) +
    categoryRatings.location
  ) / hotel.reviewStats.totalReviews;

hotel.reviewStats.categoryAverages.freeWifi =
  (
    hotel.reviewStats.categoryAverages.freeWifi *
    (hotel.reviewStats.totalReviews - 1) +
    categoryRatings.freeWifi
  ) / hotel.reviewStats.totalReviews;

  const photosLocalPath = req.files?.photos?.map((field) => field.path) || []

  if (photosLocalPath.length > 0) {
    const existingPhotosCount = review.photos.length;
    const maxPhotoAllowed = MAX_IMAGE_UPLOAD - existingPhotosCount;

    if (maxPhotoAllowed <= 0) {
      throw new ApiError(
        400,
        `you have already reached the maximum limit of ${MAX_IMAGE_UPLOAD} photos`
      );
    }
    const uploadedPhotos = photosLocalPath.slice(0, maxPhotoAllowed);
    for (let localPath of uploadedPhotos) {
      let uploaded = await uploadOnCloudinary(localPath);
      review.photos.push({imageUrl: uploaded.url,imagePublicId: uploaded.public_id});
    }
  } else{
    console.log("no new photos uploaded");
  }
  await review.save();

  return res
    .status(200)
    .json(new ApiResponse(200, review, " review updated successfully "));
});

const deleteReview = asyncHandler(async (req, res) => {
  const reviewId = req.params.reviewId;
  const review = await HotelsReview.findById(reviewId).select("userId photos");

  if (!review) {
    throw new ApiError(404, " review not found ");
  }

  if (review.userId.toString() !== req.user._id.toString()) {
    throw new ApiError(403, " you are not allowed to delete this review ");
  }

  const hotel = await Hotels.findById(review.hotelId);
  hotel.reviewStats.totalReviews -= 1;
  hotel.reviewStats.averageRating =
   ( (hotel.reviewStats.averageRating * (hotel.reviewStats.totalReviews + 1) -
      review.rating) /
    (hotel.reviewStats.totalReviews === 0 ? 1 : hotel.reviewStats.totalReviews)
).toFixed(2);
  console.log(review.rating, " rating value ");
  if (review.rating == 5) hotel.reviewStats.ratingCounts.fiveStar -= 1;
  if (review.rating === 4) hotel.reviewStats.ratingCounts.fourStar -= 1;
  if (review.rating === 3) hotel.reviewStats.ratingCounts.threeStar -= 1;
  if (review.rating === 2) hotel.reviewStats.ratingCounts.twoStar -= 1;
  if (review.rating === 1) hotel.reviewStats.ratingCounts.oneStar -= 1;

  hotel.reviewStats.categoryRatings.staff =
    (hotel.reviewStats.categoryRatings.staff *
      (hotel.reviewStats.totalReviews + 1) -
      review.categoryRatings.staff) /
    hotel.reviewStats.totalReviews;
  hotel.reviewStats.categoryRatings.facilities =
    (hotel.reviewStats.categoryRatings.facilities *
      (hotel.reviewStats.totalReviews + 1) -
      review.categoryRatings.facilities) /
    hotel.reviewStats.totalReviews;
  hotel.reviewStats.categoryRatings.cleanliness =
    (hotel.reviewStats.categoryRatings.cleanliness *
      (hotel.reviewStats.totalReviews + 1) -
      review.categoryRatings.cleanliness) /
    hotel.reviewStats.totalReviews;
  hotel.reviewStats.categoryRatings.comfort =
    (hotel.reviewStats.categoryRatings.comfort *
      (hotel.reviewStats.totalReviews + 1) -
      review.categoryRatings.comfort) /
    hotel.reviewStats.totalReviews;
  hotel.reviewStats.categoryRatings.valueForMoney =
    (hotel.reviewStats.categoryRatings.valueForMoney *
      (hotel.reviewStats.totalReviews + 1) -
      review.categoryRatings.valueForMoney) /
    hotel.reviewStats.totalReviews;
  hotel.reviewStats.categoryRatings.location =
    (hotel.reviewStats.categoryRatings.location *
      (hotel.reviewStats.totalReviews + 1) -
      review.categoryRatings.location) /
    hotel.reviewStats.totalReviews;
  hotel.reviewStats.categoryRatings.freeWifi =
    (hotel.reviewStats.categoryRatings.freeWifi *
      (hotel.reviewStats.totalReviews + 1) -
      review.categoryRatings.freeWifi) /
    hotel.reviewStats.totalReviews;

  await hotel.save();

  if (review.photos.length > 0) {
    for (let photo of review.photos) {
      console.log("deleting photo from cloudinary", photo.imagePublicId);
      await deleteFromCloudinary(photo.imagePublicId);
    }
  }
  await review.deleteOne();
  return res
    .status(200)
    .json(new ApiResponse(200, review, " review deleted successfully "));
});

const deleteReviewPhoto = asyncHandler(async (req,res) => {
    const reviewId = req.params.reviewId
    const reviewPhotoId = req.params.reviewPhotoId
    const review= await HotelsReview.findById(reviewId).select("userId photos")
    if(!review){
        throw new ApiError (404," review not found ")
    }
    if ( review.userId.toString() !== req.user._id.toString()) {
      throw new ApiError (403, " you are not allowed to delete this review photo ");
    }
    const perticularPhoto =  review.photos.id(reviewPhotoId)
    if(!perticularPhoto){
        throw new ApiError (404," review photo not found ")
    }

    await deleteFromCloudinary(perticularPhoto.imagePublicId)

    perticularPhoto.deleteOne();
    await review.save()

    return res
    .status(200)
    .json (new ApiResponse (200, review, " review photo deleted successfully "))
})

const getHotelReviews = asyncHandler(async (req, res) => {
    const { hotelId } = req.params;

    // 1️⃣ Check if hotelId is missing
    if (!hotelId) {
        throw new ApiError(400, "Hotel ID is required");
    }

    // 2️⃣ Check if hotel exists
    const hotelExists = await Hotels.findById(hotelId).select("_id");
    if (!hotelExists) {
        throw new ApiError(404, "Hotel not found");
    }

    // 3️⃣ Pagination logic
    const skip = parseInt(req.query.skip) || 0;   // default skip = 0
    const limit = parseInt(req.query.limit) || 5; // default limit = 5

    // 4️⃣ Get total review count
    const totalReviews = await HotelsReview.countDocuments({ hotelId });

    // 5️⃣ If no reviews exist
    if (totalReviews === 0) {
        return res.status(200).json({
            success: true,
            reviews: [],
            totalReviews: 0,
            message: "No reviews yet. Be the first to review!"
        });
    }

    // 6️⃣ Fetch reviews
    const reviews = await HotelsReview.aggregate([
      {
        $match: {hotelId : new mongoose.Types.ObjectId(hotelId)}
      },
      {
        $lookup: {
          from: "users" ,
          localField: "userId",
          foreignField: "_id",
          as: "user",
          pipeline: [
            {
            $project : {
              _id: 0,
            username: 1
          }
        }]
      }
      },
      { $unwind: "$user" }
    ])
        .sort({ createdAt: -1 })  // newest first
        .skip(skip)
        .limit(limit);

    return res.status(200).json({
        success: true,
        reviews,
        skip,
        limit,
        totalReviews,
        hasMore: skip + reviews.length < totalReviews  // helpful for frontend
    });
});
 
// const addressRetrieve = asyncHandler(async (req, res) => {
//   console.log(req.query)
//   const {address} = req.query

//   if(!address.trim()){
//     throw new ApiError(400,"adress field is required")
//   }
//   const filter = { address : {$regex: address.trim() , $options:"i"}}

//   const hotels = await Hotels.find(filter).sort({address: 1})

//   return res.status(200).json(
//     new ApiResponse(
//       200,
//       { hotels },
//       "hotels fetched by address"
//     )
//   );
// });






export {
  createHotel,
  updateHotel,
  deleteHotel,
  getHotel,
  getAllHotel,
  countByCity,
  countByType,
  getHotelRooms,
  reviewHotel,
  updateReview,
  deleteReview,
  deleteReviewPhoto,
  getHotelReviews,

};
