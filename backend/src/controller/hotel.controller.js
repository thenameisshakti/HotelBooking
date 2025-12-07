import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asynHandler from "../utils/asyncHandler.js";
import {Hotels} from "../modules/hotels.module.js"
import uploadOnCloudinary from "../utils/uploadOnCloundinary.js";
import { Rooms } from "../modules/rooms.module.js";


const createHotel = asynHandler(async (req,res) =>{
    const {name,email,username,address,type,city,state,discription,cheapestPrice ,...others} = req.body
   if ([name,email,username, type, city, state,address, discription,cheapestPrice]
    .some((field) => field?.trim() === "")){
        throw new ApiError(401, " All fields are required so do enter ")
    }

    const existHotel = await Hotels.findOne({username})

    if(existHotel) {
        throw  new ApiError(402, "this hotel is already exist ")
    }
    console.log("this is files",req.files)

    const photoslocalpath =  req.files?.photos?.map((field) => field.path)
    const photos = []
    for (let localpath of photoslocalpath){
        let uploaded = await uploadOnCloudinary(localpath)
        photos.push(uploaded.url)
    }
    
    if (!photos) {
        console.log(" you are procceding without uploading the image ")
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
        photos: photos  || "",
        owner: req.user,
        ...others
    })
    return res
    .status(200)
    .json( new ApiResponse ( 200, hotel, "hotel created successfully"))
   
})



const updateHotel = asynHandler(async (req,res) => {
    const updateField = {...req.body}
    console.log(updateField)

    for(let field in updateField) {
        if (updateField[field] !== "" && updateField[field] !== undefined)
        updateField[field] = req.body[field]
    }

    const hotel = await Hotels.findByIdAndUpdate(
        req.params.id,
        {
            $set: updateField
        },
        {new : true}
    )
    if (!hotel) {
        throw new ApiError(404, "Hotel not found");
      }

    return res
    .status(200)
    .json(new ApiResponse (200, hotel, "update value is here"))

})

const deleteHotel = asynHandler( async (req, res) => {
    
    const existhotel = await Hotels.findByIdAndDelete(req.params.id)

    if (!existhotel) {
        throw new ApiError(404, "this hotel is not exist")
    }

    return res
    .status(200)
    .json (new ApiResponse(200, existhotel, "hotel delete successfully"))
})

const getHotel = asynHandler(async (req,res) => {
        console.log("get the Hotel")
        const hotelid = req.params.id
        console.log(hotelid)

        const hotel = await Hotels.findById(hotelid)

        if(!hotel) {
            throw new ApiError(404, "hotel is not found")
        }

        return res 
        .status(200)
        .json(new ApiResponse(200, hotel, "hotel found"))



})

const getAllHotel = asynHandler(async (req, res) => {
    console.log("++++++++++++++++++++++++++++ enter")
  console.log("get all the hotel");
  console.log(req.query)

  let { min , max , limit = 3, page = 1, city, ...others } = req.query;

    limit = Number(limit);
    page = Number(page);

  const filters = {
    ...others,
    featured: true,
  };

  if (max && min){
    filters.cheapestPrice= { $gt: min, $lt: max}
  }

  if (city) {
    filters.city = { $regex: new RegExp(city.trim(), "i") };
  }

  const skip = (page - 1) * limit;

  const hotels = await Hotels.find(filters)
    .skip(skip)              
    .limit(limit);

  const totalHotels = await Hotels.countDocuments(filters);
  console.log("-----------------------------------------------> sending response")
  console.log(page )
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


const countByCity = asynHandler(async (req,res) => {
    const cities = req.query.cities.split(",")
    console.log(cities)
    if (cities == '' || cities.length === 0){
        throw new ApiError (404 , "no cities provided")
    }

    // const list = await Promise.all(
    //     cities.map(async (city) => {
    //         return await Hotels.countDocuments({ 
    //             city: { $regex: new RegExp(`^${city.trim()}$`, "i") }
    //         })
    //     })
    // )

    let list = []
    for (let city of cities) {
        const count =  await Hotels.countDocuments({
            city: { $regex: new RegExp(`^${city.trim()}$`, "i") }
        })
        list.push(count)
    }
    
    console.log(list)

    return res
    .status(200) 
    .json(new ApiResponse(200, list , 'here are the result'))

})

// const addRoomToHotel = asynHandler( async (req, res) => {
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

const countByType = asynHandler(async (req,res) => {
    console.log("count by the type")
    const [hotelCount, apartmentCount, resortCount, villaCount, cabinCount] = await Promise.all([
    Hotels.countDocuments({ type: "hotel" }),
    Hotels.countDocuments({ type: "apartment" }),
    Hotels.countDocuments({ type: "resort" }),
    Hotels.countDocuments({ type: "villa" }),
    Hotels.countDocuments({ type: "cabin" })
  ]);


    return res
    .status(200)
    .json(new ApiResponse(200, [hotelCount,apartmentCount,resortCount,villaCount,cabinCount],"here is Your result"))

}

)

const getHotelRooms = asynHandler(async (req,res) => {
    console.log("get the hotel room")
    const hotel = await Hotels.findById(req.params.id)

    if (!hotel) {
        throw new ApiError(404, "the hotel you are looking for is not present")

    }
    console.log(hotel.rooms)

    const list = await Promise.all ( 
       hotel.rooms.map(async (room) => {
        return await Rooms.findById(room).select("title roomNumbers maxPeople price ")
        
           
        })
    )
    console.log(list)

    return res
    .status(200)
    .json (new ApiResponse(200, list, "here all the rooms"))
})

export {
    createHotel,
    updateHotel,
    deleteHotel,
    getHotel,
    getAllHotel,
    countByCity,
    countByType,
    getHotelRooms,
}