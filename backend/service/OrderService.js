import Cart from "../models/CartModel.js";
import Order from "../models/OrderModel.js";
import Product from "../models/ProductModel.js";
import User from "../models/AuthModel.js";
import mongoose from "mongoose";
import { ethers } from "ethers";

import { verifyDeposit } from "../service/DepositVerifier.js";
import {
  createOrderOnChain,
  confirmOrderOnChain,
  cancelOrderOnChain,
  getVerifiedMarketplaceReceipt,
  assertMarketplaceEvent,
  getOrderByBlockchainOrderId,
  getServerWalletAddress,
  MARKETPLACE_EVENTS,
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

const ORDER_STATUSES = [
  "pending_deposit",
  "pending_payment",
  "deposit_paid",
  "payment_paid",
  "processing",
  "completed",
  "cancelled",
];

const PAYMENT_TYPES = ["deposit", "full"];
const DELIVERY_METHODS = ["pickup", "delivery"];
const DEPOSIT_STATUSES = ["pending", "paid"];
const ADMIN_ORDER_SORT_FIELDS = [
  "createdAt",
  "updatedAt",
  "totalAmount",
  "paidAmount",
  "status",
  "paymentType",
  "deliveryMethod",
  "expiresAt",
  "blockchainOrderId",
];

const assertAdmin = (actor) => {
  if (!actor?.isadmin) {
    throw new Error("Admin permission required");
  }
};

const assertServerSellerWallet = (order) => {
  const serverWallet = getServerWalletAddress();
  if (serverWallet.toLowerCase() !== order.sellerWallet.toLowerCase()) {
    throw new Error(
      "Ví server không khớp sellerWallet của đơn hàng. Vui lòng kiểm tra SELLER_WALLET và SEPOLIA_PRIVATE_KEY trong .env"
    );
  }
};

const assertReceiptSender = (receipt, expectedWallet, message) => {
  if (
    expectedWallet &&
    receipt.from?.toLowerCase() !== expectedWallet.toLowerCase()
  ) {
    throw new Error(message);
  }
};

const getVerifiedActionReceipt = async (txHash, eventName, blockchainOrderId) => {
  const receipt = await getVerifiedMarketplaceReceipt(txHash);
  assertMarketplaceEvent(receipt, eventName, blockchainOrderId);
  return receipt;
};

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const parseList = (value) => {
  if (!value) return [];
  const rawValues = Array.isArray(value) ? value : String(value).split(",");
  return rawValues.map((item) => item.trim()).filter(Boolean);
};

const assertAllowedValues = (field, values, allowedValues) => {
  const invalidValue = values.find((value) => !allowedValues.includes(value));
  if (invalidValue) {
    throw new Error(`${field} khong hop le: ${invalidValue}`);
  }
};

const applyListFilter = (filter, field, values, allowedValues) => {
  if (!values.length) return;
  assertAllowedValues(field, values, allowedValues);
  filter[field] = values.length === 1 ? values[0] : { $in: values };
};

const parsePositiveInteger = (value, fallback, maxValue, field) => {
  if (value === undefined || value === null || value === "") return fallback;

  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new Error(`${field} phai la so nguyen duong`);
  }

  return Math.min(parsed, maxValue);
};

const parseAmount = (value, field) => {
  if (value === undefined || value === null || value === "") return undefined;

  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error(`${field} khong hop le`);
  }

  return parsed;
};

const parseDate = (value, field, endOfDay = false) => {
  if (!value) return undefined;

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`${field} khong hop le`);
  }

  if (endOfDay) parsed.setHours(23, 59, 59, 999);
  return parsed;
};

const buildAdminSearchFilter = async (search) => {
  const term = String(search || "").trim();
  if (!term) return null;

  const escapedTerm = escapeRegex(term);
  const regexFilter = { $regex: escapedTerm, $options: "i" };
  const orConditions = [
    { "items.name": regexFilter },
    { buyerWallet: regexFilter },
    { sellerWallet: regexFilter },
  ];

  if (mongoose.Types.ObjectId.isValid(term)) {
    const objectId = new mongoose.Types.ObjectId(term);
    orConditions.push({ _id: objectId }, { userId: objectId });
  }

  const numericTerm = Number(term);
  if (Number.isFinite(numericTerm)) {
    orConditions.push({ blockchainOrderId: numericTerm });
  }

  const users = await User.find({
    $or: [
      { username: regexFilter },
      { email: regexFilter },
      { phoneNumber: regexFilter },
    ],
  })
    .select("_id")
    .lean();

  if (users.length) {
    orConditions.push({ userId: { $in: users.map((user) => user._id) } });
  }

  return { $or: orConditions };
};

const populateAdminOrderUser = (query) =>
  query.populate("userId", "username email phoneNumber address isadmin");

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
          totalAmountWei,
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

const isFullPaymentRecorded = (order) =>
  order.paymentType === "full" &&
  (
    order.status === "payment_paid" ||
    Boolean(order.fullTxHash) ||
    Number(order.paidAmount || 0) >= Number(order.totalAmount || 0)
  );

const canSellerConfirm = (order) =>
  order.status === "deposit_paid" ||
  order.status === "payment_paid" ||
  (order.status === "pending_payment" && isFullPaymentRecorded(order));

/* ================= DISCARD UNPAID ORDER ================= */
export const discardUnpaidOrderService = async (userId, orderId) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const order = await Order.findOne({ _id: orderId, userId }).session(session);

    if (!order) throw new Error("Khong tim thay order");

    const hasPayment =
      order.depositStatus === "paid" ||
      Boolean(order.depositTxHash) ||
      Boolean(order.fullTxHash) ||
      Number(order.paidAmount || 0) > 0 ||
      ["deposit_paid", "processing", "completed"].includes(order.status);

    if (
      hasPayment ||
      !["pending_deposit", "pending_payment"].includes(order.status)
    ) {
      throw new Error("Order da co thanh toan nen khong the huy tam");
    }

    const cart = await Cart.findOneAndUpdate(
      { userId },
      { $setOnInsert: { userId, items: [] } },
      { returnDocument: "after", upsert: true, session }
    );

    for (const orderItem of order.items) {
      const productId = orderItem.productId.toString();
      const existingIndex = cart.items.findIndex(
        (item) => item.productId.toString() === productId
      );

      if (existingIndex >= 0) {
        cart.items[existingIndex].quantity += orderItem.quantity;
        cart.items[existingIndex].price = orderItem.price;
      } else {
        cart.items.push({
          productId: orderItem.productId,
          quantity: orderItem.quantity,
          price: orderItem.price,
        });
      }
    }

    await cart.save({ session });
    await Order.deleteOne({ _id: order._id }).session(session);

    await session.commitTransaction();
    session.endSession();

    return { restoredItems: order.items.length };
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
      order.buyerWallet,
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

    const receipt = await getVerifiedActionReceipt(
      txHash,
      MARKETPLACE_EVENTS.FULL_PAID,
      order.blockchainOrderId
    );
    assertReceiptSender(
      receipt,
      order.buyerWallet,
      "Transaction nay khong phai do buyer thuc hien"
    );

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
    order.status = "payment_paid";

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
export const verifySellerConfirmService = async (orderId, txHash) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const order = await Order.findById(orderId).session(session);

    if (!order) throw new Error("Không tìm thấy order");

    if (!canSellerConfirm(order)) {
      throw new Error("Order chưa ở trạng thái có thể seller confirm");
    }

    const existedTx = await Order.findOne({
      $or: [{ depositTxHash: txHash }, { fullTxHash: txHash }],
      _id: { $ne: orderId },
    }).session(session);

    if (existedTx) throw new Error("Transaction đã được sử dụng");

    const receipt = await getVerifiedActionReceipt(
      txHash,
      MARKETPLACE_EVENTS.SELLER_CONFIRMED,
      order.blockchainOrderId
    );
    assertReceiptSender(
      receipt,
      order.sellerWallet,
      "Transaction nay khong phai do seller thuc hien"
    );

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

/* ================= ADMIN CONFIRM ON CHAIN ================= */
export const adminConfirmOrderService = async (actor, orderId) => {
  assertAdmin(actor);

  const order = await Order.findById(orderId);
  if (!order) throw new Error("Không tìm thấy order");

  if (!canSellerConfirm(order)) {
    throw new Error("Order chưa ở trạng thái có thể seller confirm");
  }

  assertServerSellerWallet(order);

  const result = await confirmOrderOnChain(order.blockchainOrderId);
  const updatedOrder = await verifySellerConfirmService(orderId, result.txHash);

  return {
    order: updatedOrder,
    txHash: result.txHash,
    blockNumber: result.blockNumber,
  };
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

    const receipt = await getVerifiedActionReceipt(
      txHash,
      MARKETPLACE_EVENTS.ORDER_COMPLETED,
      order.blockchainOrderId
    );
    assertReceiptSender(
      receipt,
      order.buyerWallet,
      "Transaction nay khong phai do buyer thuc hien"
    );

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
export const verifyCancelOrderService = async (actor, orderId, txHash) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const query = actor?.isadmin ? { _id: orderId } : { _id: orderId, userId: actor?.id };
    const order = await Order.findOne(query).session(session);

    if (!order) throw new Error("Không tìm thấy order");
    if (order.status === "completed") {
      throw new Error("Order đã completed, không thể hủy");
    }
    if (order.status === "cancelled") {
      throw new Error("Order đã bị hủy trước đó");
    }

    const receipt = await getVerifiedActionReceipt(
      txHash,
      MARKETPLACE_EVENTS.ORDER_CANCELLED,
      order.blockchainOrderId
    );
    const txFrom = receipt.from?.toLowerCase();
    const allowedWallets = [order.buyerWallet, order.sellerWallet]
      .filter(Boolean)
      .map((wallet) => wallet.toLowerCase());

    if (!txFrom || !allowedWallets.includes(txFrom)) {
      throw new Error("Transaction huy don khong phai do buyer hoac seller thuc hien");
    }

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

/* ================= ADMIN CANCEL ON CHAIN ================= */
export const adminCancelOrderService = async (actor, orderId) => {
  assertAdmin(actor);

  const order = await Order.findById(orderId);
  if (!order) throw new Error("Không tìm thấy order");

  if (order.status === "completed") {
    throw new Error("Order đã completed, không thể hủy");
  }
  if (order.status === "cancelled") {
    throw new Error("Order đã bị hủy trước đó");
  }
  if (!["pending_deposit", "pending_payment", "deposit_paid", "payment_paid"].includes(order.status)) {
    throw new Error("Order không còn ở trạng thái có thể hủy");
  }

  assertServerSellerWallet(order);

  const result = await cancelOrderOnChain(order.blockchainOrderId);
  const updatedOrder = await verifyCancelOrderService(actor, orderId, result.txHash);

  return {
    order: updatedOrder,
    txHash: result.txHash,
    blockNumber: result.blockNumber,
  };
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

/* ================= GET ALL ORDERS (ADMIN) ================= */
export const getAllOrdersService = async () => {
  return await Order.find().sort({ createdAt: -1 });
};

/* ================= ADMIN: GET ORDERS ================= */
export const adminGetOrdersService = async (query = {}) => {
  const filter = {};

  applyListFilter(filter, "status", parseList(query.status), ORDER_STATUSES);
  applyListFilter(
    filter,
    "paymentType",
    parseList(query.paymentType),
    PAYMENT_TYPES
  );
  applyListFilter(
    filter,
    "deliveryMethod",
    parseList(query.deliveryMethod),
    DELIVERY_METHODS
  );
  applyListFilter(
    filter,
    "depositStatus",
    parseList(query.depositStatus),
    DEPOSIT_STATUSES
  );

  const fromDate = parseDate(query.fromDate, "fromDate");
  const toDate = parseDate(query.toDate, "toDate", true);
  if (fromDate || toDate) {
    filter.createdAt = {};
    if (fromDate) filter.createdAt.$gte = fromDate;
    if (toDate) filter.createdAt.$lte = toDate;
  }

  const minTotal = parseAmount(query.minTotal, "minTotal");
  const maxTotal = parseAmount(query.maxTotal, "maxTotal");
  if (minTotal !== undefined || maxTotal !== undefined) {
    filter.totalAmount = {};
    if (minTotal !== undefined) filter.totalAmount.$gte = minTotal;
    if (maxTotal !== undefined) filter.totalAmount.$lte = maxTotal;
  }

  const searchFilter = await buildAdminSearchFilter(query.search);
  if (searchFilter) {
    filter.$or = searchFilter.$or;
  }

  const page = parsePositiveInteger(query.page, 1, 100000, "page");
  const limit = parsePositiveInteger(query.limit, 10, 100, "limit");
  const skip = (page - 1) * limit;

  const sortBy = ADMIN_ORDER_SORT_FIELDS.includes(query.sortBy)
    ? query.sortBy
    : "createdAt";
  const sortOrder = query.sortOrder === "asc" ? 1 : -1;

  const [orders, total] = await Promise.all([
    populateAdminOrderUser(Order.find(filter))
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit)
      .lean(),
    Order.countDocuments(filter),
  ]);

  return {
    orders,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/* ================= ADMIN: GET ORDER DETAIL ================= */
export const adminGetOrderDetailService = async (orderId) => {
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    throw new Error("Order ID khong hop le");
  }

  const order = await populateAdminOrderUser(Order.findById(orderId)).lean();
  if (!order) throw new Error("Khong tim thay order");

  return order;
};
