import ownerService from "../services/owner.service.js";
import connectDB from "../db/connectDB.js";
import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../errors/AppError.js";
import isValidObjectId from "../utils/isValidObjectId.js";

const createHotel = asyncHandler(async (req, res) => {
  const userId = req.user?.id;

  if (!userId) {
    throw AppError.UnauthorizedError("User not authenticated");
  }

  if (!isValidObjectId(userId)) {
    throw AppError.ValidationError("Invalid user id");
  }

  const hotel = await ownerService.createOwnerHotel(userId, req.body);

  return res.status(201).json(hotel);
});

const getMyHotels = asyncHandler(async (req, res) => {
  const userId = req.user?.id;

  if (!userId) {
    throw AppError.UnauthorizedError("User not authenticated");
  }

  if (!isValidObjectId(userId)) {
    throw AppError.ValidationError("Invalid user id");
  }

  const hotels = await ownerService.getOwnerHotels(userId);

  return res.status(200).json(hotels);
});

const getMyHotelById = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const { hotelId } = req.params;

  if (!userId) {
    throw AppError.UnauthorizedError("User not authenticated");
  }

  if (!hotelId) {
    throw AppError.ValidationError("Hotel id is required");
  }

  if (!isValidObjectId(userId) || !isValidObjectId(roomId)) {
    throw AppError.ValidationError("Invalid user or room id");
  }

  const hotel = await ownerService.getOwnerHotelById(userId, hotelId);

  return res.status(200).json(hotel);
});

const updateMyHotel = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const { hotelId } = req.params;

  if (!userId) {
    throw AppError.UnauthorizedError("User not authenticated");
  }

  if (!hotelId) {
    throw AppError.ValidationError("Hotel id is required");
  }
  if (!isValidObjectId(userId) || !isValidObjectId(roomId)) {
    throw AppError.ValidationError("Invalid user or room id");
  }

  const hotel = await ownerService.updateOwnerHotel(userId, hotelId, req.body);

  return res.status(200).json({
    success: true,
    data: hotel,
  });
});

const deleteMyHotel = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const { hotelId } = req.params;

  if (!userId) {
    throw AppError.UnauthorizedError("User not authenticated");
  }

  if (!hotelId) {
    throw AppError.ValidationError("Hotel id is required");
  }
  if (!isValidObjectId(userId) || !isValidObjectId(roomId)) {
    throw AppError.ValidationError("Invalid user or room id");
  }

  await ownerService.deleteOwnerHotel(userId, hotelId);

  return res.status(204).send();
});

const activateMyHotel = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const { hotelId } = req.params;

  if (!userId) {
    throw AppError.UnauthorizedError("User not authenticated");
  }

  if (!hotelId) {
    throw AppError.ValidationError("Hotel id is required");
  }
  if (!isValidObjectId(userId) || !isValidObjectId(roomId)) {
    throw AppError.ValidationError("Invalid user or room id");
  }

  const hotel = await ownerService.activateOwnerHotel(userId, hotelId);

  return res.status(200).json(hotel);
});

const createRoom = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const { hotelId } = req.params;

  if (!userId) {
    throw AppError.UnauthorizedError("User not authenticated");
  }

  if (!hotelId) {
    throw AppError.ValidationError("Hotel id is required");
  }
  if (!isValidObjectId(userId) || !isValidObjectId(roomId)) {
    throw AppError.ValidationError("Invalid user or room id");
  }

  const room = await ownerService.createRoomForOwnerHotel(
    userId,
    hotelId,
    req.body,
  );

  return res.status(201).json(room);
});

const getRoomsByHotel = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const { hotelId } = req.params;

  if (!userId) {
    throw AppError.UnauthorizedError("User not authenticated");
  }

  if (!hotelId) {
    throw AppError.ValidationError("Hotel id is required");
  }
  if (!isValidObjectId(userId) || !isValidObjectId(roomId)) {
    throw AppError.ValidationError("Invalid user or room id");
  }

  const rooms = await ownerService.getOwnerRoomsByHotel(userId, hotelId);

  return res.status(200).json(rooms);
});

const updateRoom = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const { roomId } = req.params;

  if (!userId) {
    throw AppError.UnauthorizedError("User not authenticated");
  }

  if (!roomId) {
    throw AppError.ValidationError("Room id is required");
  }

  if (!isValidObjectId(userId) || !isValidObjectId(roomId)) {
    throw AppError.ValidationError("Invalid user or room id");
  }

  const room = await ownerService.updateOwnerRoom(userId, roomId, req.body);

  return res.status(200).json(room);
});

const deleteRoom = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const { roomId } = req.params;

  if (!userId) {
    throw AppError.UnauthorizedError("User not authenticated");
  }

  if (!roomId) {
    throw AppError.ValidationError("Room id is required");
  }
  if (!isValidObjectId(userId) || !isValidObjectId(roomId)) {
    throw AppError.ValidationError("Invalid user or room id");
  }

  await ownerService.deleteOwnerRoom(userId, roomId);

  return res.status(204).send();
});

export default {
  createHotel,
  getMyHotels,
  getMyHotelById,
  updateMyHotel,
  deleteMyHotel,
  activateMyHotel,
  createRoom,
  getRoomsByHotel,
  updateRoom,
  deleteRoom,
};
