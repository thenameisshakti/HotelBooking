import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { Users } from "../modules/user.module.js";
import {uploadOnCloudinary} from "../utils/uploadOnCloundinary.js";
import generateAccessandRefresh from "../utils/generateAccessandRefresh.js";

const register = asyncHandler(async (req, res) => {
  const { username, name, password, email, ...other } = req.body;

  if ([username, name, password, email].some((field) => field.trim() === "")) {
    throw new ApiError(404, "enter the all the required field");
  }

  const existUser = await Users.findOne({ username });

  if (existUser) {
    throw new ApiError(404, " User exist already");
  }

  const imglocalpath = req.files?.img[0]?.path;

  if (!imglocalpath) {
    console.log("your are not uploading the img");
  }

  const img = await uploadOnCloudinary(imglocalpath);

  if (!img?.url) {
    console.log(" you are proceeding without user img");
  }

  const user = await Users.create({
    name,
    email,
    username,
    password,
    img: img?.url || "",
    ...other,
  });

  await user.save();

  return res.status(200).json(new ApiResponse(200, user, "user is register"));
});

const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  if (!username) {
    throw new ApiError(404, "provide the username");
  }

  const user = await Users.findOne({ username });

  if (!user) {
    throw new ApiError(404, "username is not exist ");
  }

  const isPasswordvalid = await user.isPasswordcorrect(password);

  if (!isPasswordvalid) {
    throw new ApiError(404, "Password is not valid");
  }

  const { accessToken, refreshToken } = await generateAccessandRefresh(
    user._id
  );

  const loggedInUser = await Users.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(200, { loggedInUser }, "user logged in Successfully")
    );
});

const logout = asyncHandler(async (req, res) => {
  console.log(req.user);

  const user = await Users.findByIdAndUpdate(
    req.user._id,
    {
      $unset: { refreshToken: "" },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: false,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "user logout successfully"));
});

const updateUser = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const updates = req.body;
  console.log(updates);

  for (const key in updates) {
    if (typeof updates[key] === "string" && updates[key] === "") {
      throw new ApiError(400, `${key} can not be empty`);
    }
  }

  if (updates.password) {
    const user = await Users.findById(userId);
    user.password = updates.password;
    await user.save();
    delete updates.password;
    console.log("password change successfully");
  }

  const updateuser = await Users.findByIdAndUpdate(
    userId,
    { $set: updates },
    { new: true }
  );

  if (!updateuser) {
    throw new ApiError(400, "user not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, updateuser, "user updated successfully"));
});

const deleteUser = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const user = await Users.findByIdAndDelete(userId);
  if (!user) {
    throw new ApiError(404, "unable to find the user");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "user delete successfully"));
});

const getUser = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const user = await Users.findOne(userId);
  if (!user) {
    throw new ApiError(404, "user not found to display");
  }

  return res.status(200).json(new ApiResponse(200, user, "here we go "));
});

export { register, login, logout, updateUser, deleteUser, getUser };
