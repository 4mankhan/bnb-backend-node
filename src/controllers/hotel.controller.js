// controllers/hotelController.js
import hotelService from "../services/hotel.service.js";
import connectDB from "../db/connectDB.js";
import AppError from "../errors/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";
import isValidObjectId from "../utils/isValidObjectId.js";

const browseHotels = asyncHandler(async (req, res) => {
  const { location, fromDate, toDate } = req.query;

  if (!location) {
    throw AppError.ValidationError("Location is required");
  }

  const today = new Date().toISOString().split("T")[0];

  const hotels = await hotelService.browseHotels({
    city: location,
    fromDate: fromDate || today,
    toDate: toDate || today,
  });

  return res.status(200).json(hotels);
});

const getHotelById = asyncHandler(async (req, res) => {
  const { hotelId } = req.params;

  if (!hotelId) {
    throw AppError.ValidationError("Hotel id is required");
  }

  if (!isValidObjectId(hotelId)) {
    throw AppError.ValidationError("Invalid Hotel Id");
  }

  const hotel = await hotelService.getHotelById(hotelId);

  return res.status(200).json(hotel);
});

const getAllHotels = asyncHandler(async (req, res) => {
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 10);

  if (Number.isNaN(page) || Number.isNaN(limit) || page < 1 || limit < 1) {
    throw AppError.ValidationError("Page and limit must be positive numbers");
  }

  const hotels = await hotelService.getAllHotels(page, limit);

  return res.status(200).json(hotels);
});

export default {
  browseHotels,
  getHotelById,
  getAllHotels,
};
