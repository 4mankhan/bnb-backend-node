// src/services/payment.service.js

import mongoose from "mongoose";
import Booking from "../db/models/booking.js";
import Payment from "../db/models/payment.js";
import Inventory from "../db/models/inventory.js";
import { getDateRange } from "../utils/getDateRange.js";
import { valKey as redis } from "../config/redis.js";
import crypto from "crypto";
import razorpay from "../config/razorpay.js";

export const createPaymentOrderService = async ({ userId, bookingId }) => {
  const booking = await Booking.findById(bookingId);

  if (!booking) {
    throw new Error("Booking not found");
  }

  if (booking.user.toString() !== userId.toString()) {
    throw new Error("Unauthorized booking");
  }

  if (booking.status !== "PENDING") {
    throw new Error("Booking cannot be paid");
  }

  if (booking.expiresAt < new Date()) {
    booking.status = "EXPIRED";
    await booking.save();

    throw new Error("Booking expired");
  }

  // Reuse existing pending payment if present
  let payment = await Payment.findOne({
    bookingId: booking._id,
    paymentStatus: "INITIATED",
  });

  // Always create a fresh Razorpay order
  const order = await razorpay.orders.create({
    amount: booking.totalPrice * 100,
    currency: "INR",
    receipt: `booking_${booking._id}`,
    notes: {
      bookingId: booking._id.toString(),
      userId: userId.toString(),
    },
  });

  if (!payment) {
    payment = await Payment.create({
      bookingId: booking._id,
      user: userId,
      hotel: booking.hotel,
      room: booking.room,
      amount: booking.totalPrice,
      currency: "INR",
      paymentStatus: "INITIATED",
      razorpayOrderId: order.id,
    });
  } else {
    payment.razorpayOrderId = order.id;
    payment.amount = booking.totalPrice;
    payment.currency = "INR";

    await payment.save();
  }

  return {
    bookingId: booking._id,
    paymentId: payment._id,

    keyId: process.env.RAZORPAY_KEY_ID,

    orderId: order.id,

    amount: order.amount,

    currency: order.currency,
  };
};

export const verifyPaymentService = async ({
  userId,
  bookingId,
  razorpay_payment_id,
  razorpay_order_id,
  razorpay_signature,
}) => {
  const session = await mongoose.startSession();

  try {
    const result = await session.withTransaction(async () => {
      const booking = await Booking.findById(bookingId).session(session);

      if (!booking) {
        throw new Error("Booking not found");
      }

      if (booking.user.toString() !== userId.toString()) {
        throw new Error("Unauthorized");
      }

      if (booking.status === "CONFIRMED") {
        return {
          booking,
          payment: null,
        };
      }

      if (booking.expiresAt < new Date()) {
        booking.status = "EXPIRED";

        await booking.save({ session });

        throw new Error("Booking expired");
      }

      const payment = await Payment.findOne({
        bookingId,
        razorpay_order_id,
      }).session(session);

      if (!payment) {
        throw new Error("Payment record not found");
      }

      if (payment.paymentStatus === "SUCCESS") {
        return {
          booking,
          payment,
        };
      }

      // Verify signature

      const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_SECRET_KEY)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest("hex");

      if (expectedSignature !== razorpay_signature) {
        payment.paymentStatus = "FAILED";

        await payment.save({ session });

        throw new Error("Invalid payment signature");
      }

      // Update payment

      payment.paymentStatus = "SUCCESS";

      payment.razorpayPaymentId = razorpay_payment_id;

      payment.razorpaySignature = razorpay_signature;

      await payment.save({ session });

      // Update inventory

      const dates = getDateRange(booking.fromDate, booking.toDate);

      const roomId = booking.room.toString();

      for (const date of dates) {
        const updated = await Inventory.findOneAndUpdate(
          {
            roomId: booking.room,
            date,
            $expr: {
              $lt: ["$bookedCount", "$totalCount"],
            },
          },
          {
            $inc: {
              bookedCount: 1,
            },
          },
          {
            session,
            returnDocument: "after",
          },
        );

        if (!updated) {
          throw new Error(`Inventory unavailable on ${date}`);
        }

        await redis.del(`lock:${roomId}:${date}`);
      }

      booking.status = "CONFIRMED";

      booking.paymentId = payment._id;

      await booking.save({
        session,
      });

      return {
        booking,
        payment,
      };
    });

    return result;
  } finally {
    await session.endSession();
  }
};
export default { createPaymentOrderService, verifyPaymentService };
