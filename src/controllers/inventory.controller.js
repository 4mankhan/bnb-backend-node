// src/controllers/inventory.controller.js

import AppError from "../errors/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";

import {
  getRoomAvailabilityService,
  getInventoryCalendarService,
  updateSurgeFactorService,
  updateRoomAvailabilityService,
} from "../services/inventory.service.js";
import isValidObjectId from "../utils/isValidObjectId.js";

export const getRoomAvailabilityController = asyncHandler(async (req, res) => {
  const { roomId, fromDate, toDate } = req.query;

  if (!roomId || !fromDate || !toDate) {
    throw AppError.ValidationError(
      "Room id, from date and to date are required",
    );
  }

  if (!isValidObjectId(roomId)) {
    throw AppError.ValidationError("Invalid room id");
  }

  const data = await getRoomAvailabilityService({
    roomId,
    fromDate,
    toDate,
  });

  return res.status(200).json({
    success: true,
    data,
  });
});

export const getInventoryCalendarController = asyncHandler(async (req, res) => {
  const { roomId } = req.params;

  if (!roomId) {
    throw AppError.ValidationError("Room id is required");
  }

  if (!isValidObjectId(roomId)) {
    throw AppError.ValidationError("Invalid room id");
  }

  const data = await getInventoryCalendarService({
    roomId,
  });

  return res.status(200).json({
    success: true,
    data,
  });
});

export const updateSurgeFactorController = asyncHandler(async (req, res) => {
  const { roomId, fromDate, toDate, surgeFactor } = req.body;

  if (!roomId || !fromDate || !toDate || surgeFactor == null) {
    throw AppError.ValidationError(
      "Room id, dates and surge factor are required",
    );
  }

  if (!isValidObjectId(roomId)) {
    throw AppError.ValidationError("Invalid room id");
  }

  const data = await updateSurgeFactorService({
    roomId,
    fromDate,
    toDate,
    surgeFactor,
  });

  return res.status(200).json({
    success: true,
    message: "Surge factor updated successfully",
    data,
  });
});

export const updateRoomAvailabilityController = asyncHandler(
  async (req, res) => {
    const { roomId, fromDate, toDate, closed } = req.body;

    if (!roomId || !fromDate || !toDate || closed == null) {
      throw AppError.ValidationError(
        "Room id, dates and availability status are required",
      );
    }

    if (!isValidObjectId(roomId)) {
      throw AppError.ValidationError("Invalid room id");
    }

    const data = await updateRoomAvailabilityService({
      roomId,
      fromDate,
      toDate,
      closed,
    });

    return res.status(200).json({
      success: true,
      message: "Room availability updated successfully",
      data,
    });
  },
);

export default {
  getRoomAvailabilityController,
  getInventoryCalendarController,
  updateRoomAvailabilityController,
  updateSurgeFactorController,
};
