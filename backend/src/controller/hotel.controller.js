import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { Hotels } from "../modules/hotels.module.js";
import {uploadOnCloudinary, deleteFromCloudinary} from "../utils/uploadOnCloundinary.js";
import { Rooms } from "../modules/rooms.module.js";
import { HotelsReview } from "../modules/hotelsReview.module.js";
import {MAX_IMAGE_UPLOAD} from "../utils/constant.js";


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
  const hotel = await Hotels.findById(req.params.hotelId);

  if (!hotel) {
    throw new ApiError(404, "the hotel you are looking for is not present");
  }

  const list = await Promise.all(
    hotel.rooms.map(async (room) => {
      return await Rooms.findById(room).select(
        "title roomNumbers maxPeople price "
      );
    })
  );

  return res.status(200).json(new ApiResponse(200, list, "here all the rooms"));
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
  if (!description || !rating) {
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
  const hotelReview = await HotelsReview.create({
    hotelId: hotelId,
    userId: req.user._id,
    description,
    rating,
    photos: photosUrl || "",
  });
  return res
    .status(200)
    .json(new ApiResponse(200, hotelReview, "review hotel "));
});

const updateReview = asyncHandler(async (req, res) => {
  const reviewId = req.params.reviewId;
  const {description , rating } = req.body;

  const review = await HotelsReview.findById(reviewId);

  if (review.userId.toString() !== req.user._id.toString()) {
    throw new ApiError (403, " you are not allowed to update this review ");
  }

  if (!review) {
    throw new ApiError(404, "review not found");
  }

  if (description) review.description = description;
  if (rating) review.rating = rating;

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

const deleteReview = asyncHandler(async (req,res) =>{
    const reviewId = req.params.reviewId
    const review = await HotelsReview.findById(reviewId).select('userId photos')

    if(!review){
        throw new ApiError (404," review not found ")
    }

    if(review.userId.toString() !== req.user._id.toString()) {
        throw new ApiError (403, " you are not allowed to delete this review ");
    }
    
    if(review.photos.length > 0){
      for (let photo of review.photos){
        console.log("deleting photo from cloudinary", photo.imagePublicId)
        await deleteFromCloudinary (photo.imagePublicId)
      }
    }
    await review.deleteOne();
    return res
    .status(200)
    .json (new ApiResponse (200, review, " review deleted successfully "))
})

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
    const reviews = await HotelsReview.find({ hotelId })
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
