import Hotel from "../db/models/hotels.js";
import Room from "../db/models/rooms.js";
import Inventory from "../db/models/inventory.js";
import Booking from "../db/models/booking.js";
import hotelService from "./hotel.service.js";
import deleteUnusedCloudinaryImages from "../utils/deleteCloudinaryImages.js";
import mongoose from "mongoose";
import { transformDailyAnalytics } from "../utils/analytics.js";

const normalizeDateRange = (from, to) => {
  const startDate = new Date(`${from}T00:00:00.000Z`);

  const endDate = new Date(`${to}T23:59:59.999Z`);

  return {
    startDate,
    endDate,
  };
};

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

const parseStartDate = (dateString) => {
  const date = new Date(`${dateString}T00:00:00.000Z`);

  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid start date: ${dateString}`);
  }

  return date;
};

const parseEndDate = (dateString) => {
  const date = new Date(`${dateString}T23:59:59.999Z`);

  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid end date: ${dateString}`);
  }

  return date;
};

const formatDate = (date) => {
  return date.toISOString().split("T")[0];
};

const round = (value, decimals = 2) => {
  const multiplier = 10 ** decimals;

  return Math.round((Number(value) || 0) * multiplier) / multiplier;
};

export const getHotelAnalyticsService = async (hotelId, from, to) => {
 
  console.log("SERVICE INPUT", {
    hotelId,
    from,
    to,
  });

  /* ---------------------------------------------------------------------- */
  /* Validate hotel                                                         */
  /* ---------------------------------------------------------------------- */

  if (!mongoose.isValidObjectId(hotelId)) {
    throw AppError.ValidationError(
      "Invalid hotel id"
    );
  }

  /* ---------------------------------------------------------------------- */
  /* Validate dates                                                         */
  /* ---------------------------------------------------------------------- */

  if (!from || !to) {
    throw AppError.ValidationError(
      "Analytics from and to dates are required"
    );
  }

  const fromDate = parseStartDate(from);
  const toDate = parseEndDate(to);

  console.log("SERVICE DATES", {
    fromDate: fromDate.toISOString(),
    toDate: toDate.toISOString(),
  });

  if (fromDate > toDate) {
    throw AppError.ValidationError(
      "from date cannot be greater than to date"
    );
  }

  /* ---------------------------------------------------------------------- */
  /* Create ObjectId                                                        */
  /* ---------------------------------------------------------------------- */

  const hotelObjectId =
    new mongoose.Types.ObjectId(hotelId);

  /* ---------------------------------------------------------------------- */
  /* Fetch hotel                                                            */
  /* ---------------------------------------------------------------------- */

  const hotel = await Hotel.findById(
    hotelObjectId
  )
    .select("_id name city photos")
    .lean();

  if (!hotel) {
    throw AppError.NotFoundError(
      "Hotel not found"
    );
  }


  /* ---------------------------------------------------------------------- */
  /* Fetch rooms                                                            */
  /* ---------------------------------------------------------------------- */

  const rooms = await Room.find({
    hotelId: hotelObjectId,
  })
    .select(
      "_id type basePrice photos totalCount"
    )
    .lean();

  console.log("rooms found:", rooms.length);

  /*
   * Keep the same behavior as the old analytics:
   *
   * If the hotel has no rooms, return a valid analytics
   * response rather than throwing.
   */

  if (!rooms.length) {
    return {
      hotel: {
        _id: hotel._id,
        name: hotel.name,
        city: hotel.city,
        photos: hotel.photos || [],
      },

      rooms: [],

      summary: {
        totalRevenue: 0,
        estimatedRevenue: 0,
        totalBookings: 0,
        totalBooked: 0,
        totalRooms: 0,
        totalRoomNights: 0,
        occupancy: 0,
        averageRoomPrice: 0,
        revPAR: 0,
      },

      daily: [],
      weakDays: [],
      bestDays: [],

      dateRange: {
        from: formatDate(fromDate),
        to: formatDate(toDate),
      },
    };
  }

  /* ---------------------------------------------------------------------- */
  /* Room IDs                                                               */
  /* ---------------------------------------------------------------------- */

  const roomIds = rooms.map((room) => room._id);

  /* ---------------------------------------------------------------------- */
  /* Fetch inventory                                                        */
  /* ---------------------------------------------------------------------- */

  /*
   * IMPORTANT:
   *
   * The date filter is applied HERE.
   *
   * This is what makes the same analytics work for:
   *
   * 7 days
   * 30 days
   * 3 months
   * 1 year
   */

  const inventories = await Inventory.find({
    roomId: {
      $in: roomIds,
    },

    date: {
      $gte: fromDate,
      $lte: toDate,
    },
  })
    .sort({
      date: 1,
    })
    .lean();

  /* ---------------------------------------------------------------------- */
  /* Booking count                                                          */
  /* ---------------------------------------------------------------------- */

  /*
   * Booking count should be based on bookings belonging to this hotel
   * and overlapping the selected period.
   *
   * Change checkIn/checkOut field names below if your Booking schema
   * uses different names.
   */

  const totalBookings = await Booking.countDocuments({
    hotelId: hotelObjectId,

    status: "CONFIRMED",

    checkIn: {
      $lt: toDate,
    },

    checkOut: {
      $gt: fromDate,
    },
  });

  /* ---------------------------------------------------------------------- */
  /* Room lookup                                                            */
  /* ---------------------------------------------------------------------- */

  const roomMap = new Map();

  rooms.forEach((room) => {
    roomMap.set(String(room._id), room);
  });

  /* ---------------------------------------------------------------------- */
  /* Daily aggregation                                                      */
  /* ---------------------------------------------------------------------- */

  const dailyMap = new Map();

  let totalRevenue = 0;
  let totalBooked = 0;
  let totalRoomNights = 0;

  /*
   * We calculate room nights from the actual inventory records,
   * exactly like the previous implementation.
   */

  inventories.forEach((inventory) => {
    const room = roomMap.get(String(inventory.roomId));

    if (!room) {
      return;
    }

    const roomTotal = Number(room.totalCount || 0);

    const bookedRooms = Math.max(
      0,
      Number(inventory.bookedRooms ?? inventory.bookedCount ?? 0),
    );

    const availableRooms = Math.max(
      0,
      Number(inventory.availableRooms ?? roomTotal - bookedRooms),
    );

    /*
     * Prefer inventory-specific price.
     * Fall back to room base price.
     */

    const roomPrice = Number(
      inventory.price ??
        inventory.roomPrice ??
        inventory.basePrice ??
        room.basePrice ??
        0,
    );

    const surgeFactor = Number(inventory.surgeFactor || 1);

    const dayRevenue = bookedRooms * roomPrice;

    const dateKey = formatDate(new Date(inventory.date));

    if (!dailyMap.has(dateKey)) {
      dailyMap.set(dateKey, {
        date: dateKey,
        bookedRooms: 0,
        availableRooms: 0,
        totalRooms: 0,
        revenue: 0,
        surgeFactor: 1,
        closed: false,
      });
    }

    const day = dailyMap.get(dateKey);

    day.bookedRooms += bookedRooms;

    day.availableRooms += availableRooms;

    day.totalRooms += roomTotal;

    day.revenue += dayRevenue;

    day.surgeFactor = Math.max(day.surgeFactor, surgeFactor);

    day.closed = day.closed || Boolean(inventory.closed);

    /*
     * Overall totals
     */

    totalBooked += bookedRooms;

    totalRevenue += dayRevenue;

    totalRoomNights += roomTotal;
  });

  /* ---------------------------------------------------------------------- */
  /* Daily response                                                         */
  /* ---------------------------------------------------------------------- */

  const daily = [...dailyMap.values()]
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map((day) => {
      const occupancy =
        day.totalRooms > 0 ? (day.bookedRooms / day.totalRooms) * 100 : 0;

      return {
        ...day,

        revenue: round(day.revenue),

        occupancy: round(occupancy),

        surgeFactor: round(day.surgeFactor),
      };
    });

  /* ---------------------------------------------------------------------- */
  /* Summary calculations                                                   */
  /* ---------------------------------------------------------------------- */

  const totalRooms = rooms.reduce(
    (sum, room) => sum + Number(room.totalCount || 0),
    0,
  );

  const occupancy =
    totalRoomNights > 0 ? (totalBooked / totalRoomNights) * 100 : 0;

  const averageRoomPrice = totalBooked > 0 ? totalRevenue / totalBooked : 0;

  const revPAR = totalRoomNights > 0 ? totalRevenue / totalRoomNights : 0;

  /* ---------------------------------------------------------------------- */
  /* Best / weak days                                                       */
  /* ---------------------------------------------------------------------- */

  const activeDays = daily.filter((day) => !day.closed);

  const weakDays = [...activeDays]
    .sort((a, b) => a.occupancy - b.occupancy)
    .slice(0, 5);

  const bestDays = [...activeDays]
    .sort((a, b) => b.occupancy - a.occupancy)
    .slice(0, 5);

  /* ---------------------------------------------------------------------- */
  /* Final response                                                         */
  /* ---------------------------------------------------------------------- */

  return {
    hotel: {
      _id: hotel._id,
      name: hotel.name,
      city: hotel.city,
      photos: hotel.photos || [],
    },

    rooms: rooms.map((room) => ({
      _id: room._id,
      type: room.type,
      basePrice: Number(room.basePrice || 0),
      photos: room.photos || [],
      totalCount: Number(room.totalCount || 0),
    })),

    summary: {
      totalRevenue: round(totalRevenue),

      estimatedRevenue: round(totalRevenue),

      totalBookings,

      totalBooked,

      totalRooms,

      totalRoomNights,

      occupancy: round(occupancy),

      averageRoomPrice: round(averageRoomPrice),

      revPAR: round(revPAR),
    },

    daily,

    weakDays,

    bestDays,

    dateRange: {
      from: formatDate(fromDate),
      to: formatDate(toDate),
    },
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
