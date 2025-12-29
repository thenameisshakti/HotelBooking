import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { Rooms } from "../modules/rooms.module.js";
import {uploadOnCloudinary} from "../utils/uploadOnCloundinary.js";
import { Hotels } from "../modules/hotels.module.js";

const createRoom = asyncHandler(async (req, res) => {
  const hotelId = req.params.hotelid;
  const { title, price, maxPeople, roomNumbers, ...others } = req.body;

  let RoomNo;
  if (roomNumbers) {
    RoomNo =
      typeof roomNumbers === "string" ? JSON.parse(roomNumbers) : roomNumbers;
  }
  console.log(RoomNo);

  const existedroom = await Rooms.findOne({
    title: { $regex: new RegExp(`^${req.body.title}$`, "i") },
    "roomNumbers.number": { $in: RoomNo.map((r) => r.number) },
  });

  if (existedroom) {
    throw new ApiError(
      404,
      "already exised room with same title or same room number"
    );
  }

  if ([title, price, maxPeople].some((field) => field.trim() === "")) {
    throw new ApiError(404, "new to enter the required field");
  }

  const roomImagelocalpath = req.files?.roomImage?.map((field) => field.path);
  const roomImage = [];
  if (!roomImagelocalpath) {
    console.log("you are moving without roomImage");
  } else {
    for (let localpath of roomImagelocalpath) {
      let uploaded = await uploadOnCloudinary(localpath);
      roomImage.push(uploaded.url);
    }
  }

  if (!roomImage) {
    console.log("without photo");
  }

  const room = await Rooms.create({
    title,
    price,
    maxPeople,
    roomNumbers: RoomNo,
    roomImage: roomImage || "",
    owner: req.user._id,
    ...others,
  });

  if (!room) {
    throw new ApiError("error while creating room");
  }

  const hotel = await Hotels.findByIdAndUpdate(
    hotelId,
    { $push: { rooms: room._id } },
    { new: true }
  );

  if (!hotel) {
    throw new ApiError(404, "we are facing problem in adding room to hotel");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, room, "room is created and added"));
});

const updateRoom = asyncHandler(async (req, res) => {
  const update = req.body;
  const roomId = req.params.id;

  for (let field in update) {
    if (update[field] === "") {
      throw new ApiError(404, " enter the field carefuly check again");
    }
  }

  let newRoom;
  if (update.roomNumbers) {
    newRoom =
      typeof update.roomNumbers === "string"
        ? JSON.parse(update.roomNumbers)
        : update.roomNumbers;
    delete update.roomNumbers;
  }
  console.log(newRoom);

  if (update.roomImage) {
    const roomImagelocalpath = req.files?.roomImage?.map((field) => field.path);
    console.log(roomImagelocalpath);
    let roomImage;
    for (let localpath in roomImagelocalpath) {
      const uploaded = await uploadOnCloudinary(localpath);
      roomImage.push(uploaded.url);
    }
    if (!roomImage) {
      throw new ApiError(404, "room image is provided but fiailed to upload");
    }

    update.roomImage = roomImage || "";
    delete update.roomImage;
  }

  const query = {};
  const room = await Rooms.findByIdAndUpdate(roomId, query, { new: true });

  if (!room) {
    throw new ApiError(404, "unable to found the room you enter ");
  }

  if (Object.keys(update).length > 0) {
    query.$set = update;
  }

  if (newRoom.length > 0) {
    const roomtoadd = newRoom.filter((field) => {
      !room.roomNumbers.some((r) => r.number == field.number);
    });

    console.log(roomtoadd);

    if (roomtoadd.length > 0) {
      query.$push = { roomNumbers: { $each: roomtoadd } };
    } else {
      throw new ApiError(404, " already exist room are passed");
    }
  }

  return res
    .status(200)
    .json(new ApiResponse(200, room, "room updated successfully "));
});

const updateavailability = asyncHandler(async (req, res) => {
  const rid = req.params.roomNumbersid;
  console.log(rid);

  const availabilityupdate = await Rooms.findOneAndUpdate(
    { "roomNumbers._id": rid },
    {
      $push: { "roomNumbers.$.unavailableDates": { $each: req.body.date } },
    },
    { new: true }
  );
  if (!availabilityupdate) {
    throw new ApiError(400, "error in updating the dates");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        availabilityupdate,
        "unavailability update successfully"
      )
    );
});

const deleteRoom = asyncHandler(async (req, res) => {
  const rid = req.params.roomNumbersid;
  console.log(rid);

  const hotelroom = await Hotels.findOneAndUpdate(
    { rooms: rid },
    { $pull: { rooms: rid } },
    { new: true }
  );

  // console.log(hotelroom)

  if (!hotelroom) {
    throw new ApiError(404, "room in Hotel is not deleted");
  }

  const singleroom = await Rooms.findOneAndUpdate(
    { "roomNumbers._id": rid },
    { $pull: { roomNumbers: { _id: rid } } },
    { new: true }
  );
  // console.log(singleroom)

  if (!singleroom) {
    console.log(" so you want to delete the all perticular type of room");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, singleroom, "single room is deleted"));
});

const getRoom = asyncHandler(async (req, res) => {
  console.log("get room");
  const rid = req.params.roomNumbersid;
  const room = await Rooms.findOne({ "roomNumbers._id": rid }).select("price");
  if (!room) {
    throw new ApiError(404, "no single room is founded");
  }
  console.log(room);

  return res
    .status(200)
    .json(new ApiResponse(200, room, "here is your result"));
});

const getAllRoom = asyncHandler(async (req, res) => {
  console.log("get all room");
  const roomId = req.params.id;
  const AllRoom = await Rooms.findById(roomId).select(" title  roomNumbers");
  console.log(AllRoom);
  return res
    .status(200)
    .json(new ApiResponse(200, AllRoom, "here are your all rooms"));
});

export {
  createRoom,
  updateRoom,
  updateavailability,
  deleteRoom,
  getRoom,
  getAllRoom,
};
