import { raypay } from "../app.js";
import asyncHandler from "../utils/asyncHandler.js";
import crypto from "crypto";
import { PaymentMDB } from "../modules/payment.module.js";

const Payment = asyncHandler(async (req, res) => {
  console.log("ok");
  var options = {
    amount: Number(req.body.amount) * 100,
    currency: "INR",
  };

  const order = await raypay.orders.create(options);

  console.log(order);

  return res
    .status(200)
    .json({ success: true, data: order, message: "Success Operation" });
});

const PaymentVerification = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body;
  const body = razorpay_order_id + "|" + razorpay_payment_id;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_API_SECRET)
    .update(body.toString())
    .digest("hex");

  const isAuthentic = expectedSignature === razorpay_signature;

  if (isAuthentic) {
    await PaymentMDB.create({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    });

    res.redirect(
      `/paymentsuccess?pay=${razorpay_payment_id}&order=${razorpay_order_id}`
    );
  } else {
    res.status(400).json({ success: false });
  }

  console.log(req.body);
  res
    .status(200)
    .json({
      success: true,
      message: "actual Payment has done successfully   ",
    });
});

export { Payment, PaymentVerification };
