// src/routes/booking.routes.js

import express from "express";
import {
  createBookingController,
  getUserBookingsController,
  getBookingByIdController,
  cancelBookingController,
} from "../controllers/booking.controller.js";

import authMiddleware from "../middleware/auth.middleware.js";
import requireRole from "../middleware/role.middleware.js";

const router = express.Router();

// Create booking (PENDING + inventory block)
router.post("/create", authMiddleware, requireRole("user"), createBookingController);

// Get all bookings of logged-in user
router.get("/bookings", authMiddleware, requireRole("user","owner"), getUserBookingsController);

// Get single booking
router.get("/:id", authMiddleware, requireRole("user"), getBookingByIdController);

// Cancel booking (optional)
router.patch("/:id/cancel", authMiddleware, requireRole("user","owner"), cancelBookingController);

export default router;
