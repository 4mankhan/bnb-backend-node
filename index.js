import express from "express";
import cors from "cors";

import errorHandler from "./src/middleware/errorHandler.js";

import userRoutes from "./src/routes/user.routes.js";
import hotelRoutes from "./src/routes/hotel.routes.js";
import roomRoutes from "./src/routes/room.routes.js";
import inventoryRoutes from "./src/routes/inventory.routes.js";
import bookingRoutes from "./src/routes/booking.route.js";
import paymentRoutes from "./src/routes/payment.routes.js";
import ownerRoutes from "./src/routes/owner.routes.js";
import cloudinaryRoutes from "./src/routes/cloudinary/cloudinary.route.js";
import razorpayRoutes from "./src/routes/razorpay/razorpay.routes.js"
import { valKey as redis } from "./src/config/redis.js";

import AppError from "./src/errors/AppError.js";

import "./src/utils/booking.cron.js";

const app = express();

// GLOBAL MIDDLEWARE

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  }),
);

app.use(express.json());

app.get("/favicon.ico", (req, res) => {
  res.status(204).end();
});

// HEALTH CHECK ROUTES

app.get("/health", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Server is running",
  });
});

//DEVELOPMENT / TEST ROUTES

if (process.env.NODE_ENV !== "production") {
  app.get("/test/redis", async (req, res, next) => {
    try {
      await redis.set("hello", "Valkey server is running");

      const value = await redis.get("hello");

      return res.json({
        success: true,
        value,
      });
    } catch (err) {
      next(err);
    }
  });
}

// API ROUTES

app.use("/auth", userRoutes);

app.use("/hotels", hotelRoutes);

app.use("/rooms", roomRoutes);

app.use("/inventory", inventoryRoutes);

app.use("/booking", bookingRoutes);

app.use("/payment", paymentRoutes);

app.use("/owner", ownerRoutes);

app.use("/cloudinary", cloudinaryRoutes);

app.use("/razorpay", razorpayRoutes);

//404 NOT FOUND
app.use((req, res, next) => {
  throw AppError.NotFoundError(`Route ${req.originalUrl} not found`);
});

//GLOBAL ERROR HANDLER
app.use(errorHandler);

export default app;
