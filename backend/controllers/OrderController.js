import { createOrderFromCartService } from "../service/OrderService.js";

export const createOrderFromCart = async (req, res) => {
  try {
    const order = await createOrderFromCartService(
      req.user.id,
      req.body
    );

    res.status(200).json({
      success: true,
      message: "Tạo đơn hàng thành công",
      data: order,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};