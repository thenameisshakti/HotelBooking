import { Router } from "express";
import { Payment, PaymentVerification } from "../controller/payment.controller.js";

export const payRouter = Router()

payRouter.route("/payment").post(Payment)
payRouter.route('/paymentverification').post(PaymentVerification)