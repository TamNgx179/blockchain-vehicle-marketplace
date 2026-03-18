import Cart from "../models/CartModel.js";
import Order from "../models/OrderModel.js";
import mongoose from "mongoose";
import Product from "../models/ProductModel.js";

export const createOrderFromCartService = async (userId, body) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { selectedItems, paymentType = "deposit" } = body;

    // ===== VALIDATE INPUT =====
    if (!Array.isArray(selectedItems) || selectedItems.length === 0) {
      throw new Error("Vui lòng chọn sản phẩm để đặt hàng");
    }

    if (!["deposit", "full"].includes(paymentType)) {
      throw new Error("Phương thức thanh toán không hợp lệ");
    }

    const cart = await Cart.findOne({ userId })
      .populate("items.productId", "name price stock")
      .session(session);

    if (!cart || cart.items.length === 0) {
      throw new Error("Giỏ hàng trống");
    }

    // ===== FILTER ITEM =====
    const filteredItems = cart.items.filter((item) =>
      selectedItems.includes(item.productId._id.toString())
    );

    if (filteredItems.length === 0) {
      throw new Error("Không có sản phẩm hợp lệ");
    }

    // ===== CHECK STOCK =====
    for (const item of filteredItems) {
      if (!item.productId) {
        throw new Error("Sản phẩm không tồn tại");
      }

      if (item.quantity > item.productId.stock) {
        throw new Error(
          `Sản phẩm ${item.productId.name} không đủ hàng`
        );
      }
    }

    // ===== PREPARE ORDER ITEMS =====
    const items = filteredItems.map((item) => ({
      productId: item.productId._id,
      name: item.productId.name,
      price: item.productId.price,
      quantity: item.quantity,
    }));

    const totalAmount = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    let depositAmount = totalAmount * 0.1;

    if (paymentType === "full") {
      depositAmount = 0;
    }

    let paidAmount = 0;
    let depositStatus = "pending";
    let status = paymentType === "full"
      ? "pending_payment"
      : "pending_deposit";

    // ===== TRỪ STOCK =====
    for (const item of filteredItems) {
      await Product.updateOne(
        { _id: item.productId._id },
        { $inc: { stock: -item.quantity } },
        { session }
      );
    }

    // ===== CREATE ORDER =====
    const order = await Order.create(
      [
        {
          userId,
          items,
          totalAmount,
          depositAmount,
          sellerWallet: process.env.SELLER_WALLET_ADDRESS,
          paymentType,
          paidAmount,
          depositStatus,
          status,
        },
      ],
      { session }
    );

    // ===== REMOVE FROM CART =====
    cart.items = cart.items.filter(
      (item) =>
        !selectedItems.includes(item.productId._id.toString())
    );

    await cart.save({ session });

    await session.commitTransaction();
    session.endSession();

    return order[0];
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};