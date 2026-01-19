import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import {
  deleteUser,
  getUser,
  login,
  logout,
  register,
  updateUser,
  refreshAccessToken,
} from "../controller/user.controller.js";
import { verifyAdmin, verifyUser } from "../middlewares/auth.middleware.js";
import { getAllRoom } from "../controller/room.controller.js";
const userroute = Router();

userroute.route("/register").post(
  upload.fields([
    {
      name: "img",
      maxCount: 1,
    },
  ]),
  register
);
userroute.route("/login").post(login);
userroute.route("/logout").post(verifyUser, logout);
userroute.route("/refreshAccessToken").post(refreshAccessToken);
userroute.route("/update").put(verifyUser, updateUser);
userroute.route("/delete").delete(verifyUser, deleteUser);
userroute.route("/get/:id").get(verifyUser, getUser);
userroute.route("/getall").get(getAllRoom);

export default userroute;
