import { Router } from "express";
import { pocessingPayment, verifyAndBook  } from "../controller/payment.controller.js";
import { verifyUser } from "../middlewares/auth.middleware.js";

export const payRouter = Router()

payRouter.route("/payment").post(verifyUser,pocessingPayment)
payRouter.route('/verify-and-book').post(verifyAndBook)
