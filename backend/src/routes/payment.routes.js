import { Router } from "express";
import { Payment, verifyAndBook  } from "../controller/payment.controller.js";

export const payRouter = Router()

payRouter.route("/payment").post(Payment)
payRouter.route('/verify-and-book').post(verifyAndBook)
