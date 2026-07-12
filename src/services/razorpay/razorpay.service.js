import razorpay from "../../config/razorpay.js";
import AppError from "../../errors/AppError.js";

class RazorpayService {
  async createOrder(amount, receipt) {
    try {
      return await razorpay.orders.create({
        amount: amount * 100,
        currency: "INR",
        receipt,
      });
    } catch (err) {
      switch (err.statusCode) {
        case 400:
          throw AppError.BadRequestError(
            err.error?.description || "Invalid Razorpay request"
          );

        case 401:
          throw AppError.UnauthorizedError(
            "Invalid Razorpay credentials"
          );

        case 429:
          throw AppError.TooManyRequestsError(
            "Razorpay rate limit exceeded"
          );

        default:
          throw AppError.ServiceUnavailableError(
            "Unable to connect to Razorpay"
          );
      }
    }
  }
}

export default new RazorpayService();