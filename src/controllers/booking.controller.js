// src/controllers/booking.controller.js

import {
  createBookingService,
  getUserBookingsService,
  getBookingByIdService,
  cancelBookingService,
} from "../services/booking.service.js";
import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../errors/AppError.js";
import isValidObjectId from "../utils/isValidObjectId.js";

export const createBookingController = asyncHandler(async (req, res) => {
  const userId = req.user?.id;

  if (!userId) {
    throw AppError.UnauthorizedError("User not authenticated");
  }

  if (!isValidObjectId(userId)) {
    throw AppError.ValidationError("Invalid user id");
  }

  const { hotelId, roomId, fromDate, toDate, guests, totalPrice } = req.body;

  if (
    !hotelId ||
    !roomId ||
    !fromDate ||
    !toDate ||
    guests == null ||
    totalPrice == null
  ) {
    throw AppError.ValidationError("All booking fields are required");
  }

  const booking = await createBookingService({
    userId,
    hotelId,
    roomId,
    fromDate,
    toDate,
    guests,
    totalPrice,
  });

  return res.status(201).json({
    success: true,
    booking,
  });
});

export const getUserBookingsController = asyncHandler(async (req, res) => {
  const userId = req.user?.id;

  if (!userId) {
    throw AppError.UnauthorizedError("User not authenticated");
  }

  if (!isValidObjectId(userId)) {
    throw AppError.ValidationError("Invalid user id");
  }

  const bookings = await getUserBookingsService(userId);

  return res.json({
    success: true,
    bookings,
  });
});

export const getBookingByIdController = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    throw AppError.ValidationError("Booking id is required");
  }

  if (!isValidObjectId(id)) {
    throw AppError.ValidationError("Invalid user id");
  }

  const booking = await getBookingByIdService(id);

  return res.json({
    success: true,
    booking,
  });
});

export const cancelBookingController = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    throw AppError.ValidationError("Booking id is required");
  }

  if (!isValidObjectId(id)) {
    throw AppError.ValidationError("Invalid user id");
  }

  const booking = await cancelBookingService(id);

  return res.json({
    success: true,
    booking,
  });
});

export default {
  createBookingController,
  getBookingByIdController,
  cancelBookingController,
  getUserBookingsController,
};
