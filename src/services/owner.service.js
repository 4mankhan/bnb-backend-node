import Hotel from "../db/models/hotels.js";
import Room from "../db/models/rooms.js";
import Inventory from "../db/models/inventory.js";
import Booking from "../db/models/booking.js";
import hotelService from "./hotel.service.js";
import deleteUnusedCloudinaryImages from "../utils/deleteCloudinaryImages.js";
import mongoose from "mongoose";
import { transformDailyAnalytics } from "../utils/analytics.js";

const createOwnerHotel = async (ownerId, data) => {
  return Hotel.create({
    ...data,
    owner: ownerId,
    active: false,
  });
};

const getOwnerHotels = async (ownerId) => {
  return Hotel.find({ owner: ownerId }).sort({ createdAt: -1 });
};

const getOwnerHotelById = async (ownerId, hotelId) => {
  const hotel = await Hotel.findOne({ _id: hotelId, owner: ownerId });
  if (!hotel) throw new Error("Hotel not found for this owner");
  return hotel;
};

export const updateOwnerHotel = async (ownerId, hotelId, data) => {
  const hotel = await Hotel.findById(hotelId);

  if (!hotel) {
    throw new Error("Hotel not found");
  }

  if (hotel.owner.toString() !== ownerId.toString()) {
    throw new Error("Unauthorized for this hotel");
  }

  // keep snapshot before update
  const oldPhotos = [...hotel.photos];

  Object.assign(hotel, data);
  await hotel.save();

  // cleanup cloudinary AFTER successful save
  // Delete removed Cloudinary images
  try {
    await deleteUnusedCloudinaryImages(oldPhotos, hotel.photos);
  } catch (err) {
    console.error("Cloudinary cleanup failed:", err);
  }

  return hotel;
};

const deleteOwnerHotel = async (ownerId, hotelId) => {
  await hotelService.deleteHotel(hotelId, ownerId);
};

const activateOwnerHotel = async (ownerId, hotelId) => {
  return hotelService.activateHotel(hotelId, ownerId);
};

const createRoomForOwnerHotel = async (ownerId, hotelId, data) => {
  const hotel = await Hotel.findOne({ _id: hotelId, owner: ownerId });
  if (!hotel) throw new Error("Hotel not found for this owner");

  return Room.create({
    ...data,
    hotelId,
  });
};

const getOwnerRoomsByHotel = async (ownerId, hotelId) => {
  const hotel = await Hotel.findOne({ _id: hotelId, owner: ownerId });
  if (!hotel) throw new Error("Hotel not found for this owner");

  return Room.find({ hotelId }).sort({ createdAt: -1 });
};

const updateOwnerRoom = async (ownerId, roomId, data) => {
  const room = await Room.findById(roomId);
  if (!room) throw new Error("Room not found");

  const hotel = await Hotel.findById(room.hotelId);
  if (!hotel || hotel.owner.toString() !== ownerId.toString()) {
    throw new Error("Unauthorized for this room");
  }

  Object.assign(room, data);
  await room.save();
  return room;
};

const deleteOwnerRoom = async (ownerId, roomId) => {
  const room = await Room.findById(roomId);
  if (!room) throw new Error("Room not found");

  const hotel = await Hotel.findById(room.hotelId);
  if (!hotel || hotel.owner.toString() !== ownerId.toString()) {
    throw new Error("Unauthorized for this room");
  }

  await Inventory.deleteMany({ roomId: room._id });
  await Room.findByIdAndDelete(roomId);
};

export const getHotelAnalyticsService = async (hotelId) => {
  const hotel = await Hotel.findById(hotelId).select("name city photos").lean();

  const rooms = await Room.find({
    hotelId,
  })
    .select("type basePrice photos totalCount")
    .lean();

  const totalRooms = rooms.reduce(
    (sum, room) => sum + Number(room.totalCount || 0),
    0,
  );

  const bookings = await Booking.find({
    hotel: hotelId,

    status: "CONFIRMED",
  })
    .select("room fromDate toDate totalPrice")
    .lean();

  const daily = transformDailyAnalytics(bookings, totalRooms);

  const totalRevenue = daily.reduce((sum, item) => sum + item.revenue, 0);

  const totalBooked = daily.reduce((sum, item) => sum + item.bookedRooms, 0);

  const totalRoomNights = daily.length * totalRooms;

  const occupancy = totalRoomNights ? (totalBooked / totalRoomNights) * 100 : 0;

  const averageRoomPrice = totalBooked ? totalRevenue / totalBooked : 0;

  const revPAR = totalRoomNights ? totalRevenue / totalRoomNights : 0;

  const activeDays = daily.filter((item) => !item.closed);

  const weakDays = [...activeDays]
    .sort((a, b) => a.occupancy - b.occupancy)
    .slice(0, 5);

  const bestDays = [...activeDays]
    .sort((a, b) => b.occupancy - a.occupancy)
    .slice(0, 5);

  return {
    hotel,

    rooms,

    summary: {
      totalRevenue,

      estimatedRevenue: totalRevenue,

      totalBookings: bookings.length,

      totalBooked,

      totalRooms,

      totalRoomNights,

      occupancy,

      averageRoomPrice,

      revPAR,
    },

    daily,

    weakDays,

    bestDays,
  };
};


export default {
  createOwnerHotel,
  getOwnerHotels,
  getOwnerHotelById,
  updateOwnerHotel,
  deleteOwnerHotel,
  activateOwnerHotel,
  createRoomForOwnerHotel,
  getOwnerRoomsByHotel,
  updateOwnerRoom,
  deleteOwnerRoom,
  getHotelAnalyticsService,
};
