// src/routes/payment.routes.js

import express from "express";
import {
  processPaymentController,
  getPaymentByBookingController,
} from "../controllers/payment.controller.js";

import authMiddleware from "../utils/auth.js";

const router = express.Router();

// Process payment (your mock PIN flow)
router.post("/process", authMiddleware, processPaymentController);

// Get payment by booking
router.get("/booking/:bookingId", authMiddleware, getPaymentByBookingController);

export default router;