import express from "express";
import RazorpayController from "../../controllers/razorpay/razorpay.controller.js";

const router = express.Router();

router.post("/create-order", RazorpayController.createOrder);

export default router;