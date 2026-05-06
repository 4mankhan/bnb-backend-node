// src/db/models/hotels.js

import mongoose from "mongoose";

const contactInfoSchema = new mongoose.Schema({
  completeAddress: String,
  location: String,
  email: String,
  phoneNumber: String,
}, { _id: false });

const hotelSchema = new mongoose.Schema({
  name: { type: String, required: true },
  city: { type: String, required: true },
  photos: [String],
  amenities: [String],

  contactInfo: contactInfoSchema,

  active: { type: Boolean, default: false },

  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
}, { timestamps: true });

const Hotel = mongoose.model("Hotel", hotelSchema);

export default Hotel;