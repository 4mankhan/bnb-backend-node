// src/controllers/booking.controller.js

import {
  createBookingService,
  getUserBookingsService,
  getBookingByIdService,
  cancelBookingService,
} from "../services/booking.service.js";

export const createBookingController = async (req, res) => {
  try {
    const userId = req.user.id;

    const { hotelId, roomId, fromDate, toDate, totalPrice } = req.body;

    const booking = await createBookingService({
      userId,
      hotelId,
      roomId,
      fromDate,
      toDate,
      totalPrice,
    });

    res.status(201).json({ success: true, booking });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const getUserBookingsController = async (req, res) => {
  
  try {
    const bookings = await getUserBookingsService(req.user.id);
    res.json({ success: true, bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getBookingByIdController = async (req, res) => {
  try {
    const booking = await getBookingByIdService(req.params.id);
    res.json({ success: true, booking });
  } catch (err) {
    res.status(404).json({ success: false, message: err.message });
  }
};

export const cancelBookingController = async (req, res) => {
 
  try {
    const booking = await cancelBookingService(req.params.id);
    res.json({ success: true, booking });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};