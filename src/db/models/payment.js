//payment schema
import mongoose from "mongoose";
const paymentSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    hotel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hotel",
    },

    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
    },

    transactionId: String,

    amount: {
      type: Number,
      required: true,
    },

    currency: {
      type: String,
      default: "INR",
    },

    method: String,

    paymentStatus: {
      type: String,
      enum: ["INITIATED", "SUCCESS", "FAILED", "REFUNDED"],
      default: "INITIATED",
    },

    gatewayResponse: Object,
  },
  { timestamps: true }
);

const Payment = mongoose.model("Payment", paymentSchema);
export default Payment;