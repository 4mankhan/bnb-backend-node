import RazorpayService from "../../services/razorpay/razorpay.service.js";
import asyncHandler from "../../utils/asyncHandler.js";

class RazorpayController {
  createOrder = asyncHandler(async (req, res) => {
    const { amount } = req.body;

    const order = await RazorpayService.createOrder(
      amount,
      `receipt_${Date.now()}`
    );

    res.status(201).json({
      success: true,
      data: order,
    });
  });
}

export default new RazorpayController();