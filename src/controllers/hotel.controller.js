// controllers/hotelController.js
import hotelService from "../services/hotel.service.js";

// controllers/hotelController.js
const browseHotels = async (req, res) => {
  try {
    const { location, fromDate, toDate } = req.query;

    if (!location) {
      return res.status(400).json({
        error: "location, fromDate and toDate are required",
      });
    }
    const today = new Date().toISOString().split("T")[0];
    const hotels = await hotelService.browseHotels({
      city: location,
      fromDate: fromDate || today,
      toDate: toDate || today,
    });

    res.json(hotels);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get Hotel (Admin)
const getHotelById = async (req, res) => {
  try {
    const hotel = await hotelService.getHotelById(req.params.hotelId);

    res.json(hotel);
  } catch (err) {
    res.status(403).json({ error: err.message });
  }
};

// Admin Hotels
const getAllHotels = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // default page = 1
    const limit = parseInt(req.query.limit) || 10; // default limit = 10

    const hotels = await hotelService.getAllHotels(page, limit);

    res.status(200).json(hotels);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export default {
  browseHotels,
  getHotelById,
  getAllHotels,
};
