// src/services/booking.service.js
import mongoose from "mongoose";
import Booking from "../db/models/booking.js";
import Inventory from "../db/models/inventory.js";
import Room from "../db/models/rooms.js";

const getDateRange = (start, end) => {
  const dates = [];
  const current = new Date(start);

  while (current <= new Date(end)) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  return dates;
};

export const createBookingService = async ({
  userId,
  hotelId,
  roomId,
  fromDate,
  toDate,
  totalPrice,
}) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    //0. check for expired pending booking
    const expiredBookings = await Booking.find({
      status: "PENDING",
      expiresAt: { $lt: new Date() },
    }).session(session);
    //1. clearing the inventory if the booking is expired
    for (const b of expiredBookings) {
      const dates = getDateRange(b.fromDate, b.toDate);

      for (const date of dates) {
        await Inventory.findOneAndUpdate(
          { roomId: b.room, date },
          { $inc: { bookedCount: -1 } },
          { session },
        );
      }

      b.status = "EXPIRED";
      await b.save({ session });
    }

    //2. now delete all expired pending bookings
    await Booking.deleteMany({
      status: "EXPIRED",
      expiresAt: { $lt: new Date() },
    }).session(session);

    const dates = getDateRange(fromDate, toDate);

    // 3. Check or create inventory
    for (const date of dates) {
      let inventory = await Inventory.findOne({ roomId, date }).session(
        session,
      );

      if (!inventory) {
        const room = await Room.findById(roomId).session(session);

        inventory = await Inventory.create(
          [
            {
              hotelId,
              roomId,
              date,
              bookedCount: 0,
              totalCount: room.totalCount,
              closed: false,
              surgeFactor: 1,
            },
          ],
          { session },
        );

        inventory = inventory[0];
      }

      if (inventory.closed) {
        throw new Error(`Closed on ${date}`);
      }

      if (inventory.bookedCount >= inventory.totalCount) {
        throw new Error(`Fully booked on ${date}`);
      }
    }

    // 4. CHECK EXISTING PENDING BOOKING (IMPORTANT FIX)
    const existingBooking = await Booking.findOne({
      user: userId,
      hotel: hotelId,
      room: roomId,
      status: "PENDING",
      expiresAt: { $gt: new Date() },
    }).session(session);

    // 5. IF EXISTS → RETURN IT (Can continue that booking)
    if (existingBooking) {
      await session.commitTransaction();
      session.endSession();
      return existingBooking;
    } else {
      // 6. BLOCK INVENTORY ONLY FOR NEW BOOKING
      for (const date of dates) {
        await Inventory.findOneAndUpdate(
          { roomId, date },
          { $inc: { bookedCount: 1 } },
          { session },
        );
      }
    }

    // 7. CREATE NEW BOOKING
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 min
    const booking = await Booking.create(
      [
        {
          user: userId,
          hotel: hotelId,
          room: roomId,
          fromDate,
          toDate,
          totalPrice,
          status: "PENDING",
          paymentId: null,
          expiresAt,
        },
      ],
      { session },
    );

    await session.commitTransaction();
    session.endSession();

    return booking[0];
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
};

//list of alll bookings done either failed or success
export const getUserBookingsService = async (userId) => {
  return Booking.find({ user: userId })
    .populate("hotel room")
    .sort({ createdAt: -1 });
};

export const getBookingByIdService = async (bookingId) => {
  const booking = await Booking.findById(bookingId).populate("hotel room");
  if (!booking) throw new Error("Booking not found");
  return booking;
};

export const cancelBookingService = async (bookingId) => {
  const booking = await Booking.findById(bookingId);

  if (!booking) throw new Error("Booking not found");
  if (booking.status === "CANCELLED") throw new Error("Already cancelled");

  const dates = getDateRange(booking.fromDate, booking.toDate);

  for (const date of dates) {
    await Inventory.findOneAndUpdate(
      { roomId: booking.room, date },
      { $inc: { bookedCount: -1 } },
    );
  }

  booking.status = "CANCELLED";
  booking.paymentStatus = "FAILED";

  await booking.save();

  return booking;
};
