import Cart from "../models/CartModel.js";
import Order from "../models/OrderModel.js";
import Product from "../models/ProductModel.js";
import mongoose from "mongoose";
import { ethers } from "ethers";

import { verifyDeposit } from "../service/DepositVerifier.js";
import {
  createOrderOnChain,
  verifyTransaction,
  getTransactionDetail,
  getOrderByBlockchainOrderId,
  CONTRACT_PAYMENT_TYPE,
  CONTRACT_ORDER_STATUS,
} from "../service/BlockchainService.js";
import {
  calculateDepositUsd,
  calculateDepositWei,
} from "../utils/convertDeposit.js";

const convertUsdToWei = (usdAmount) => {
  const usdPerEth = Number(process.env.USD_PER_ETH || 2000000);
  if (!usdPerEth || usdPerEth <= 0) {
    throw new Error("USD_PER_ETH không hợp lệ");
  }

  const ethAmount = (Number(usdAmount) / usdPerEth).toFixed(18);
  return ethers.parseEther(ethAmount).toString();
};

/* ================= CREATE ORDER ================= */
export const createOrderFromCartService = async (userId, body) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      selectedItems,
      paymentType = "deposit",
      buyerWallet,
      deliveryMethod,
      pickupInfo,
      shippingAddress,
    } = body;

    if (!Array.isArray(selectedItems) || selectedItems.length === 0) {
      throw new Error("Vui lòng chọn sản phẩm để đặt hàng");
    }

    if (!["deposit", "full"].includes(paymentType)) {
      throw new Error("Phương thức thanh toán không hợp lệ");
    }

    if (!buyerWallet || !ethers.isAddress(buyerWallet)) {
      throw new Error("buyerWallet không hợp lệ");
    }

    if (!["pickup", "delivery"].includes(deliveryMethod)) {
      throw new Error("Phương thức nhận hàng không hợp lệ");
    }

    if (deliveryMethod === "pickup") {
      if (!pickupInfo?.name || !pickupInfo?.phone || !pickupInfo?.pickupDate) {
        throw new Error("Thiếu pickupInfo");
      }
    }

    if (deliveryMethod === "delivery") {
      if (
        !shippingAddress?.name ||
        !shippingAddress?.phone ||
        !shippingAddress?.address
      ) {
        throw new Error("Thiếu shippingAddress");
      }
    }

    const cart = await Cart.findOne({ userId })
      .populate("items.productId", "name price stock")
      .session(session);

    if (!cart || cart.items.length === 0) {
      throw new Error("Giỏ hàng trống");
    }

    const filteredItems = cart.items.filter(
      (item) =>
        item.productId && selectedItems.includes(item.productId._id.toString())
    );

    if (filteredItems.length === 0) {
      throw new Error("Không có sản phẩm hợp lệ");
    }

    for (const item of filteredItems) {
      if (!item.productId) throw new Error("Sản phẩm không tồn tại");
      if (item.quantity > item.productId.stock) {
        throw new Error(`Sản phẩm ${item.productId.name} không đủ hàng`);
      }
    }

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

    const depositAmount =
      paymentType === "full" ? 0 : calculateDepositUsd(totalAmount);

    const depositAmountWei =
      paymentType === "full" ? "0" : calculateDepositWei(totalAmount).toString();

    const totalAmountWei = convertUsdToWei(totalAmount);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const blockchainOrderId = Date.now();

    await createOrderOnChain({
      blockchainOrderId,
      buyerWallet,
      sellerWallet: process.env.SELLER_WALLET,
      totalAmountWei,
      depositAmountWei,
      paymentType,
    });

    const order = await Order.create(
      [
        {
          userId,
          items,
          totalAmount,
          depositAmount,
          depositAmountWei,
          blockchainOrderId,
          buyerWallet,
          sellerWallet: process.env.SELLER_WALLET,
          paymentType,
          paidAmount: 0,
          depositStatus: "pending",
          stockReduced: false,
          status:
            paymentType === "full" ? "pending_payment" : "pending_deposit",
          deliveryMethod,
          pickupInfo: deliveryMethod === "pickup" ? pickupInfo : undefined,
          shippingAddress:
            deliveryMethod === "delivery" ? shippingAddress : undefined,
          expiresAt,
        },
      ],
      { session }
    );

    cart.items = cart.items.filter(
      (item) =>
        !item.productId ||
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

/* ================= VERIFY DEPOSIT ================= */
export const verifyDepositService = async (userId, orderId, txHash) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const order = await Order.findOne({ _id: orderId, userId }).session(session);

    if (!order) throw new Error("Không tìm thấy order");
    if (order.paymentType !== "deposit") {
      throw new Error("Đây không phải đơn deposit");
    }
    if (order.depositStatus === "paid") {
      throw new Error("Order đã được đặt cọc trước đó");
    }
    if (order.status !== "pending_deposit") {
      throw new Error("Order không ở trạng thái chờ đặt cọc");
    }
    if (new Date() > order.expiresAt) {
      throw new Error("Order đã hết hạn thanh toán");
    }

    const existedTx = await Order.findOne({
      $or: [{ depositTxHash: txHash }, { fullTxHash: txHash }],
      _id: { $ne: orderId },
    }).session(session);

    if (existedTx) throw new Error("Transaction đã được sử dụng");

    const result = await verifyDeposit(
      order.blockchainOrderId,
      txHash,
      order.sellerWallet,
      order.totalAmount
    );

    if (!result || !result.success) {
      throw new Error("Xác minh deposit thất bại");
    }

    if (!order.stockReduced) {
      for (const item of order.items) {
        const updated = await Product.updateOne(
          {
            _id: item.productId,
            stock: { $gte: item.quantity },
          },
          { $inc: { stock: -item.quantity } },
          { session }
        );

        if (updated.modifiedCount === 0) {
          throw new Error(`Không đủ stock cho sản phẩm ${item.name}`);
        }
      }
      order.stockReduced = true;
    }

    order.buyerWallet = result.data.buyer;
    order.depositAmountWei = result.data.depositAmount;
    order.depositStatus = "paid";
    order.depositTxHash = txHash;
    order.depositPaidAt = new Date();
    order.paidAmount = order.depositAmount;
    order.status = "deposit_paid";

    await order.save({ session });

    await session.commitTransaction();
    session.endSession();

    return order;
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
};

/* ================= VERIFY FULL PAYMENT ================= */
export const verifyFullPaymentService = async (userId, orderId, txHash) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const order = await Order.findOne({ _id: orderId, userId }).session(session);

    if (!order) throw new Error("Không tìm thấy order");
    if (order.paymentType !== "full") {
      throw new Error("Đây không phải đơn full payment");
    }
    if (order.status !== "pending_payment") {
      throw new Error("Order không ở trạng thái chờ thanh toán");
    }
    if (new Date() > order.expiresAt) {
      throw new Error("Order đã hết hạn");
    }

    const existedTx = await Order.findOne({
      $or: [{ depositTxHash: txHash }, { fullTxHash: txHash }],
      _id: { $ne: orderId },
    }).session(session);

    if (existedTx) throw new Error("Transaction đã được sử dụng");

    const txCheck = await verifyTransaction(txHash);
    if (!txCheck.exists) throw new Error("Transaction không tồn tại");
    if (!txCheck.success) throw new Error("Transaction thất bại");

    const tx = await getTransactionDetail(txHash);
    if (!tx) throw new Error("Không lấy được transaction");

    if (
      order.buyerWallet &&
      tx.from &&
      tx.from.toLowerCase() !== order.buyerWallet.toLowerCase()
    ) {
      throw new Error("Transaction này không phải do buyer thực hiện");
    }

    const contractOrder = await getOrderByBlockchainOrderId(order.blockchainOrderId);

    if (contractOrder.paymentType !== CONTRACT_PAYMENT_TYPE.FULL) {
      throw new Error("Order trên contract không phải loại full");
    }

    if (contractOrder.contractStatus !== CONTRACT_ORDER_STATUS.FULL_PAID) {
      throw new Error("Order trên contract chưa ở trạng thái full paid");
    }

    if (contractOrder.seller.toLowerCase() !== order.sellerWallet.toLowerCase()) {
      throw new Error("Seller trên contract không khớp");
    }

    if (
      order.buyerWallet &&
      contractOrder.buyer.toLowerCase() !== order.buyerWallet.toLowerCase()
    ) {
      throw new Error("Buyer trên contract không khớp");
    }

    const expectedTotalWei = convertUsdToWei(order.totalAmount);

    if (contractOrder.totalAmount !== expectedTotalWei) {
      throw new Error("Tổng tiền trên contract không khớp");
    }

    if (contractOrder.paidAmount !== expectedTotalWei) {
      throw new Error("Số tiền full payment không đúng");
    }

    if (!order.stockReduced) {
      for (const item of order.items) {
        const updated = await Product.updateOne(
          {
            _id: item.productId,
            stock: { $gte: item.quantity },
          },
          { $inc: { stock: -item.quantity } },
          { session }
        );

        if (updated.modifiedCount === 0) {
          throw new Error(`Không đủ stock cho sản phẩm ${item.name}`);
        }
      }
      order.stockReduced = true;
    }

    order.fullTxHash = txHash;
    order.paidAmount = order.totalAmount;
    order.status = "pending_payment";

    await order.save({ session });

    await session.commitTransaction();
    session.endSession();

    return order;
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
};

/* ================= VERIFY SELLER CONFIRM ================= */
export const verifySellerConfirmService = async (userId, orderId, txHash) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const order = await Order.findOne({ _id: orderId, userId }).session(session);

    if (!order) throw new Error("Không tìm thấy order");

    if (!["deposit_paid", "pending_payment"].includes(order.status)) {
      throw new Error("Order chưa ở trạng thái có thể seller confirm");
    }

    const existedTx = await Order.findOne({
      $or: [{ depositTxHash: txHash }, { fullTxHash: txHash }],
      _id: { $ne: orderId },
    }).session(session);

    if (existedTx) throw new Error("Transaction đã được sử dụng");

    const txCheck = await verifyTransaction(txHash);
    if (!txCheck.exists) throw new Error("Transaction không tồn tại");
    if (!txCheck.success) throw new Error("Transaction thất bại");

    const tx = await getTransactionDetail(txHash);
    if (!tx) throw new Error("Không lấy được transaction");

    if (!tx.from || tx.from.toLowerCase() !== order.sellerWallet.toLowerCase()) {
      throw new Error("Transaction này không phải do seller thực hiện");
    }

    const contractOrder = await getOrderByBlockchainOrderId(order.blockchainOrderId);

    if (contractOrder.contractStatus !== CONTRACT_ORDER_STATUS.CONFIRMED) {
      throw new Error("Order trên contract chưa ở trạng thái confirmed");
    }

    order.status = "processing";
    await order.save({ session });

    await session.commitTransaction();
    session.endSession();

    return order;
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
};

/* ================= VERIFY COMPLETE ================= */
export const verifyCompleteOrderService = async (userId, orderId, txHash) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const order = await Order.findOne({ _id: orderId, userId }).session(session);

    if (!order) throw new Error("Không tìm thấy order");
    if (order.status !== "processing") {
      throw new Error("Order chưa ở trạng thái có thể hoàn tất");
    }

    const existedTx = await Order.findOne({
      $or: [{ depositTxHash: txHash }, { fullTxHash: txHash }],
      _id: { $ne: orderId },
    }).session(session);

    if (existedTx) throw new Error("Transaction đã được sử dụng");

    const txCheck = await verifyTransaction(txHash);
    if (!txCheck.exists) throw new Error("Transaction không tồn tại");
    if (!txCheck.success) throw new Error("Transaction thất bại");

    const tx = await getTransactionDetail(txHash);
    if (!tx) throw new Error("Không lấy được transaction");

    if (
      order.buyerWallet &&
      tx.from &&
      tx.from.toLowerCase() !== order.buyerWallet.toLowerCase()
    ) {
      throw new Error("Transaction này không phải do buyer thực hiện");
    }

    const contractOrder = await getOrderByBlockchainOrderId(order.blockchainOrderId);

    if (contractOrder.contractStatus !== CONTRACT_ORDER_STATUS.COMPLETED) {
      throw new Error("Order trên contract chưa ở trạng thái completed");
    }

    order.fullTxHash = txHash;
    order.paidAmount = order.totalAmount;
    order.status = "completed";

    await order.save({ session });

    await session.commitTransaction();
    session.endSession();

    return order;
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
};

/* ================= VERIFY CANCEL ================= */
export const verifyCancelOrderService = async (userId, orderId, txHash) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const order = await Order.findOne({ _id: orderId, userId }).session(session);

    if (!order) throw new Error("Không tìm thấy order");
    if (order.status === "completed") {
      throw new Error("Order đã completed, không thể hủy");
    }
    if (order.status === "cancelled") {
      throw new Error("Order đã bị hủy trước đó");
    }

    const txCheck = await verifyTransaction(txHash);
    if (!txCheck.exists) throw new Error("Transaction không tồn tại");
    if (!txCheck.success) throw new Error("Transaction thất bại");

    const contractOrder = await getOrderByBlockchainOrderId(order.blockchainOrderId);

    if (contractOrder.contractStatus !== CONTRACT_ORDER_STATUS.CANCELLED) {
      throw new Error("Order trên contract chưa ở trạng thái cancelled");
    }

    if (order.stockReduced) {
      for (const item of order.items) {
        await Product.updateOne(
          { _id: item.productId },
          { $inc: { stock: item.quantity } },
          { session }
        );
      }
      order.stockReduced = false;
    }

    order.status = "cancelled";
    await order.save({ session });

    await session.commitTransaction();
    session.endSession();

    return order;
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
};

/* ================= GET MY ORDERS ================= */
export const getMyOrdersService = async (userId) => {
  return await Order.find({ userId }).sort({ createdAt: -1 });
};

/* ================= GET ORDER DETAIL ================= */
export const getOrderDetailService = async (userId, orderId) => {
  const order = await Order.findOne({ _id: orderId, userId });
  if (!order) throw new Error("Không tìm thấy order");
  return order;
};