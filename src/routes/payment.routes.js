// src/routes/payment.routes.js

import express from "express";
import {
  processPaymentController,
  verifyPaymentController,
  getPaymentByBookingController,
} from "../controllers/payment.controller.js";

import authMiddleware from "../middleware/auth.middleware.js";
import requireRole from "../middleware/role.middleware.js";

const router = express.Router();

// Process payment (your mock PIN flow)
router.post("/create-order", authMiddleware, requireRole("user"), processPaymentController);

router.post("/verify-payment", authMiddleware, requireRole("user"), verifyPaymentController);

// Get payment by booking
router.get(
  "/booking/:bookingId",
  authMiddleware,
  requireRole("user"),
  getPaymentByBookingController,
);

export default router;
