import roomService from "../services/room.service.js";
import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../errors/AppError.js";
import isValidObjectId from "../utils/isValidObjectId.js";

const createRoom = asyncHandler(async (req, res) => {
  const userId = req.user?.id;

  if (!userId) {
    throw AppError.UnauthorizedError("User not authenticated");
  }

  if (!req.body || Object.keys(req.body).length === 0) {
    throw AppError.ValidationError("Room data is required");
  }

  if (!isValidObjectId(userId)) {
    throw AppError.ValidationError("Invalid user id");
  }
  const room = await roomService.createRoom(req.body, userId);

  return res.status(201).json({
    success: true,
    data: room,
  });
});

const getRoomsByHotel = asyncHandler(async (req, res) => {
  const { hotelId } = req.params;

  if (!hotelId) {
    throw AppError.ValidationError("Hotel id is required");
  }

  if (!isValidObjectId(roomId)) {
    throw AppError.ValidationError("Invalid room id");
  }

  const rooms = await roomService.getRoomsByHotel(hotelId);

  return res.status(200).json({
    success: true,
    data: rooms,
  });
});

const getRoomById = asyncHandler(async (req, res) => {
  const { roomId } = req.params;

  if (!roomId) {
    throw AppError.ValidationError("Room id is required");
  }
  if (!isValidObjectId(roomId)) {
    throw AppError.ValidationError("Invalid user or room id");
  }

  const room = await roomService.getRoomById(roomId);

  return res.status(200).json({
    success: true,
    data: room,
  });
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

  if (!req.body || Object.keys(req.body).length === 0) {
    throw AppError.ValidationError("Update data is required");
  }

  if (!isValidObjectId(userId) || !isValidObjectId(roomId)) {
    throw AppError.ValidationError("Invalid user or room id");
  }
  const room = await roomService.updateRoom(roomId, req.body, userId);

  return res.status(200).json({
    success: true,
    data: room,
  });
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

  await roomService.deleteRoom(roomId, userId);

  return res.status(204).send();
});

export default {
  createRoom,
  getRoomsByHotel,
  getRoomById,
  updateRoom,
  deleteRoom,
};
