import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../errors/AppError.js";

import { createPaymentOrderService, verifyPaymentService } from "../services/payment.service.js";
import Payment from "../db/models/payment.js";
import isValidObjectId from "../utils/isValidObjectId.js";

export const processPaymentController = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  
  if (!userId) {
    throw AppError.UnauthorizedError("User not authenticated");
  }

  const { bookingId } = req.body;

  if (!bookingId) {
    throw AppError.ValidationError("Booking id, method and pin are required");
  }

  if (!isValidObjectId(userId) || !isValidObjectId(bookingId)) {
    throw AppError.ValidationError("Invalid user or booking id");
  }

  const result = await createPaymentOrderService({
    userId,
    bookingId,
  });

  return res.status(200).json({
    success: true,
    data: result,
  });
});

export const verifyPaymentController = asyncHandler(async (req, res) => {
  const userId = req.user?.id;

  if (!userId) {
    throw AppError.UnauthorizedError("User not authenticated");
  }

  const {
    bookingId,

    razorpay_payment_id,

    razorpay_order_id,

    razorpay_signature,
  } = req.body;

  console.log(req.body);

  if (
    !bookingId ||
    !razorpay_payment_id ||
    !razorpay_order_id ||
    !razorpay_signature
  ) {
    throw AppError.ValidationError("Payment details missing");
  }


  const result = await verifyPaymentService({
    userId,

    bookingId,

    razorpay_payment_id,

    razorpay_order_id,

    razorpay_signature,
  });

  return res.status(200).json({
    success: true,

    data: result,
  });
});

export const getPaymentByBookingController = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const { bookingId } = req.params;

  if (!userId) {
    throw AppError.UnauthorizedError("User not authenticated");
  }

  if (!bookingId) {
    throw AppError.ValidationError("Booking id is required");
  }

  if (!isValidObjectId(userId) || !isValidObjectId(bookingId)) {
    throw AppError.ValidationError("Invalid User Id or Booking Id");
  }

  const payment = await Payment.findOne({
    bookingId,
  });

  if (!payment) {
    throw AppError.NotFoundError("Payment not found");
  }

  if (payment.user.toString() !== userId) {
    throw AppError.ForbiddenError("Access denied");
  }

  return res.status(200).json({
    success: true,
    payment,
  });
});

export const allPayments = asyncHandler(async (req, res) => {
  const payments = await Payment.find();
  console.log(payments);
  
   return res.status(200).json({
    payments,
  });
});


export default {
  processPaymentController,
  getPaymentByBookingController,
  allPayments
};
