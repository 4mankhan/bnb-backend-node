// src/services/payment.service.js

import mongoose from "mongoose";
import Booking from "../db/models/booking.js";
import Payment from "../db/models/payment.js";
import Inventory from "../db/models/inventory.js";
import { getDateRange } from "../utils/getDateRange.js";
import { valKey as redis } from "../config/redis.js";
import crypto from "crypto";
import razorpay from "../config/razorpay.js";

export const  processPaymentService = async ({
  userId,

  bookingId,
}) => {
  const booking = await Booking.findById(bookingId);

  if (!booking) {
    throw new Error("Booking not found");
  }

  if (booking.user.toString() !== userId) {
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

  // Create Razorpay order

  const order = await razorpay.orders.create({
    amount: booking.totalPrice * 100,

    currency: "INR",

    receipt: `booking_${booking._id}`,

    notes: {
      bookingId: booking._id.toString(),

      userId: userId.toString(),
    },
  });

  // Create payment record

  const payment = await Payment.create({
    bookingId: booking._id,

    user: userId,

    hotel: booking.hotel,

    room: booking.room,

    razorpayOrderId: order.id,

    amount: booking.totalPrice,

    currency: "INR",

    paymentStatus: "PENDING",
  });

  return {
    keyId: process.env.RAZORPAY_KEY_ID,

    orderId: order.id,

    amount: order.amount,

    currency: order.currency,

    paymentId: payment._id,

    bookingId: booking._id,
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

      if (booking.user.toString() !== userId) {
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

        await booking.save({
          session,
        });

        throw new Error("Booking expired");
      }

      // Verify Razorpay signature

      const generatedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_SECRET_KEY)
        .update(razorpay_order_id + "|" + razorpay_payment_id)
        .digest("hex");

      if (generatedSignature !== razorpay_signature) {
        throw new Error("Invalid payment signature");
      }

      // Find payment

      const payment = await Payment.findOne({
        bookingId: booking._id,

        razorpayOrderId: razorpay_order_id,
      }).session(session);

      if (!payment) {
        throw new Error("Payment record not found");
      }

      // Update payment

      payment.paymentStatus = "SUCCESS";

      payment.razorpayPaymentId = razorpay_payment_id;

      payment.razorpaySignature = razorpay_signature;

      await payment.save({
        session,
      });

      // Update Inventory

      const dates = getDateRange(
        booking.fromDate,

        booking.toDate,
      );

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
          throw new Error(`Inventory unavailable ${date}`);
        }

        // remove redis lock

        await redis.del(`lock:${roomId}:${date}`);
      }

      // Confirm booking

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
export default { processPaymentService, verifyPaymentService }