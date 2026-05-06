// src/controllers/payment.controller.js

import {
  processPaymentService,
} from "../services/payment.service.js";

export const processPaymentController = async (req, res) => {
  try {
    const userId = req.user.id;

    const { bookingId, method, pin } = req.body;

    const success = pin === "1234";

    const result = await processPaymentService({
      userId,
      bookingId,
      success,
      method,
    });

    res.json({ success: true, data: result });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const getPaymentByBookingController = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const payment = await Payment.findOne({ bookingId });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    //ensure user owns this payment
    if (payment.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    res.json({
      success: true,
      payment,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};