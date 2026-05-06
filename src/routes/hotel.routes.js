import express from "express";
import hotelController from "../controllers/hotel.controller.js";
import authMiddleware, { requireRole } from "../utils/auth.js";

const router = express.Router();

// Admin
router.get("/browse", hotelController.browseHotels);
router.get("/", hotelController.getAllHotels);
router.get("/:hotelId", hotelController.getHotelById);

export default router;
