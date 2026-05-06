// src/db/models/rooms.js

import mongoose from "mongoose";

const capacitySchema = new mongoose.Schema(
  {
    adults: { type: Number, required: true },
    children: { type: Number, default: 0 },
    infants: { type: Number, default: 0 }, // always allowed, no pricing impact
  },
  { _id: false }
);

const roomSchema = new mongoose.Schema(
  {
    hotelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hotel",
      required: true,
    },

    type: { type: String, required: true },
    basePrice: { type: Number, required: true },

    amenities: [String],
    photos: {
      type: [String],
      validate: [(arr) => arr.length <= 2, "Max 2 images allowed"],
    },

    totalCount: { type: Number, required: true },

    capacity: capacitySchema,
  },
  { timestamps: true }
);

const Room = mongoose.model("Room", roomSchema);

export default Room;