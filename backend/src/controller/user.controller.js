import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { Users } from "../modules/user.module.js";
import { uploadOnCloudinary } from "../utils/uploadOnCloundinary.js";
import generateAccessandRefresh from "../utils/generateAccessandRefresh.js";
import jwt from "jsonwebtoken"
import googleClient from "../utils/googleClients.js";

const googleAuth = asyncHandler (async(req,res) => {
    const {token} = req.body

    if(!token){
      throw new ApiError(400, "Google tokenn is required")
      
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    })

    const payload = ticket.getPayload()
    console.log(payload)

    const {email, name, picture, sub } = payload

    if(!email) {
      throw new ApiError(400, "Google account has no email")
    }

    let user = await Users.findOne({email})
    console.log(user)
    if(!user) {
     user = await Users.create({
        email,
        name,
        img: picture,
        googleId: sub,
        modeOfAuth: ["google"]
      })
    }

    if(!user) {
      throw new ApiError (400, "Unable to to create the user")
    }
    console.log(user)
    const {accessToken,refreshToken} = await generateAccessandRefresh(user._id)

    const options = {
      httpOnly: true,
      secure: false // true in production with HTTPs
    }
    console.log("user login and register by the google")
    return res 
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json (
      new ApiResponse(200, {loggedInUser: user} , "Google login successful")
    )

    

})

const register = asyncHandler(async (req, res) => {
  const { username, name, password, email, ...other } = req.body;

  if ([username, name, password, email].some((field) => field.trim() === "")) {
    throw new ApiError(404, "enter the all the required field");
  }

  console.log(req.files)

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
    secure: false,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(200, { loggedInUser }, "user logged in Successfully")
    );
});

const checkUsername = asyncHandler(async (req,res) => {
   const {username} = req.query
  
   const exist = await Users.findOne({username: username})

   if(exist) {
    throw new ApiError(409, "user name already exisit")
   }

   return res
   .status(200)
   .json(new ApiResponse(200,{username},"available username"))
})

const logout = asyncHandler(async (req, res) => {
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

const refreshAccessToken = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.refreshToken
  console.log(refreshToken)

  if (!refreshToken) {
    throw new ApiError(401, "Refresh token missing")
  }

  let decoded
  console.log(process.env.REFRESH_TOKEN_SECRET)
  try {
    decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET
    )

  } catch (error) {
    console.log("error ", error.message)
    throw new ApiError(403, "Refresh token expired")
  }
  // console.log(decoded,"decoded")
  const user = await Users.findById(decoded._id)

  if (!user) {
    throw new ApiError(403, "Invalid refresh token")
  }

  //  OPTIONAL (recommended): check refresh token stored in DB
  // if (user.refreshToken !== refreshToken) {
  //   throw new ApiError(403, "Refresh token mismatch")
  // }
  // Create new access token
  
  const newAccessToken = user.generateAccessToken()

  const options = {
    httpOnly: true,
    secure: false
  }

  res
    .status(200)
    .cookie("accessToken", newAccessToken, options)
    .json(
      new ApiResponse(200, {}, "Access token refreshed")
    )
})


export {
  register,
  login,
  logout,
  updateUser,
  deleteUser,
  getUser,
  refreshAccessToken,
  checkUsername,
  googleAuth,
};
