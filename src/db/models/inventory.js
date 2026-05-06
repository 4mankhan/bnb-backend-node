// src/db/models/inventory.js

import mongoose from "mongoose";

const inventorySchema = new mongoose.Schema(
  {
    hotelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hotel",
      required: true,
    },

    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true,
    },

    date: {
      type: Date,
      required: true,
    },

    bookedCount: {
      type: Number,
      default: 0,
    },

    totalCount: {
      type: Number,
      required: true,
    },

    surgeFactor: {
      type: Number,
      default: 1,
    },

    closed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);


// 🔥 VERY IMPORTANT (prevents duplicate entries per day)
inventorySchema.index({ roomId: 1, date: 1 }, { unique: true });

const Inventory = mongoose.model("Inventory", inventorySchema);

export default Inventory;