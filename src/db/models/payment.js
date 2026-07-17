import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
      index: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    hotel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hotel",
      required: true,
    },

    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true,
    },

    // Razorpay Order (created before payment)
    razorpayOrderId: {
      type: String,
      index: true,
    },

    // Razorpay Payment (available after successful payment)
    razorpayPaymentId: {
      type: String,
      default: null,
      index: true,
    },

    // Signature returned by Razorpay
    razorpaySignature: {
      type: String,
      default: null,
    },

    // Keep for future if you support Stripe/Cash/etc.
    transactionId: {
      type: String,
      default: null,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    currency: {
      type: String,
      default: "INR",
    },

    method: {
      type: String,
      enum: [
        "RAZORPAY",
        "CARD",
        "UPI",
        "NETBANKING",
        "WALLET",
        "CASH"
      ],
      default: "RAZORPAY",
    },

    paymentStatus: {
      type: String,
      enum: [
        "INITIATED",
        "SUCCESS",
        "FAILED",
        "REFUNDED",
      ],
      default: "INITIATED",
      index: true,
    },

    gatewayResponse: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;