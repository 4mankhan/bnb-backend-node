import express from "express";

import userRoutes from "./user.routes.js";
import hotelRoutes from "./hotel.routes.js";
import roomRoutes from "./room.routes.js";
import inventoryRoutes from "./inventory.routes.js";
import bookingRoutes from "./booking.route.js";
import paymentRoutes from "./payment.routes.js";
import ownerRoutes from "./owner.routes.js";
import cloudinaryRoutes from "./cloudinary/cloudinary.route.js";
import razorpayRoutes from "./razorpay/razorpay.routes.js";

const router = express.Router();

router.use("/auth", userRoutes);
router.use("/hotels", hotelRoutes);
router.use("/rooms", roomRoutes);
router.use("/inventory", inventoryRoutes);
router.use("/booking", bookingRoutes);
router.use("/payment", paymentRoutes);
router.use("/owner", ownerRoutes);
router.use("/cloudinary", cloudinaryRoutes);
router.use("/razorpay", razorpayRoutes);

export default router;