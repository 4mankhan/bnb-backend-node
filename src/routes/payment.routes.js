// src/routes/payment.routes.js

import express from "express";
import {
  processPaymentController,
  getPaymentByBookingController,
} from "../controllers/payment.controller.js";

import authMiddleware from "../middleware/auth.middleware.js";
import requireRole from "../middleware/role.middleware.js";

const router = express.Router();

// Process payment (your mock PIN flow)
router.post("/process", authMiddleware, requireRole("user"), processPaymentController);

// Get payment by booking
router.get(
  "/booking/:bookingId",
  authMiddleware,
  requireRole("user"),
  getPaymentByBookingController,
);

export default router;
