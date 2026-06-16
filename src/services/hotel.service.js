// services/hotel.service.js

import Hotel from "../db/models/hotels.js";
import Room from "../db/models/rooms.js";
import Inventory from "../db/models/inventory.js";


const browseHotels = async ({ city, fromDate, toDate }) => {
  // Basic filtering (city + active)
  const hotels = await Hotel.find({
    city: { $regex: `^${city}$`, $options: "i" },
    active: true,
  });

  //  Future: filter based on availability using bookings collection

  return hotels;
};


//Get Hotel By ID
const getHotelById = async (hotelId) => {
  const hotel = await Hotel.findById(hotelId);

  if (!hotel) throw new Error("Hotel not found");

  // if (hotel.owner.toString() !== userId.toString()) {
  //   throw new Error("Unauthorized");
  // }

  return hotel;
};

//Get All Hotels (Admin)
const getAllHotels = async (page, limit) => {
  
  const skip = (page - 1) * limit;

  return await Hotel.find()
    .skip(skip)
    .limit(limit);
};


export default {
  browseHotels,
  getHotelById,
  getAllHotels,
 
 };