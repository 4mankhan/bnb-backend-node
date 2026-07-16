import express from "express";
import cors from "cors";

import errorHandler from "./src/middleware/errorHandler.js";
import apiRoutes from "./src/routes/index.routes.js";
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

// HEALTH CHECK ROUTES

app.get("/health", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Server is running",
  });
});

//DEVELOPMENT / TEST ROUTES

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

// API ROUTES
app.use("/api/v1", apiRoutes);

//404 NOT FOUND
app.use((req, res, next) => {
  throw AppError.NotFoundError(`Route ${req.originalUrl} not found`);
});

//GLOBAL ERROR HANDLER
app.use(errorHandler);

export default app;
