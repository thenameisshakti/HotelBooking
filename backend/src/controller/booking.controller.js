import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { Lock } from "../modules/lock.modules.js";

const createLock = asyncHandler(async (req, res) => {
  const { roomId, roomNumberId, startDate, endDate,hotelId } = req.body;
  const userId = req.user.id;

  const now = new Date();
  console.log(req.body)
  const activeLock = await Lock.findOne({
    roomNumberId,
    expiresAt: { $gt: now },
    status: "hold",
  });

  if (activeLock) {
    throw new ApiError(409, "Room temporarily locked");
  }
  const lock = await Lock.create({
    userId,
    roomId,
    hotelId,
    roomNumberId,
    startDate,
    endDate,
    expiresAt: new Date(now.getTime() + 15 * 60 * 1000),
    status: "hold",
  });
 
  return res.status(201).json(
    new ApiResponse(
      201,
      {
        lockId: lock._id,
        expiresAt: lock.expiresAt,
      },
      "Room locked successfully"
    )
  );
});

const removeLock = asyncHandler (async (req,res) => {
    const lockId = req.params.id
    
    const existedLock = await Lock.findById(lockId)

    if(!existedLock){
        return res
        .status(200)
        .json(new ApiResponse(200 ,{} , "Lock for this perticular has been expire"))
    }

    await Lock.deleteOne({_id: lockId})

    return res
    .status(200)
    .json(new ApiResponse (200, {} , "lockId is deleted successfully"))
})

export {
    createLock,
    removeLock
}