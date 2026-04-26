import {
  createOrderFromCartService,
  verifyDepositService,
  verifyFullPaymentService,
  verifySellerConfirmService,
  adminConfirmOrderService,
  verifyCompleteOrderService,
  verifyCancelOrderService,
  adminCancelOrderService,
  getMyOrdersService,
  getAllOrdersService,
  getOrderDetailService,
  adminGetOrdersService,
  adminGetOrderDetailService,
} from "../service/OrderService.js";

// ===== CREATE ORDER =====
export const createOrderFromCart = async (req, res) => {
  try {
    const order = await createOrderFromCartService(req.user.id, req.body);

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

// ===== VERIFY DEPOSIT =====
export const verifyDepositController = async (req, res) => {
  try {
    const { txHash } = req.body;

    if (!txHash) {
      return res.status(400).json({
        success: false,
        message: "Thiếu txHash",
      });
    }

    const order = await verifyDepositService(req.user.id, req.params.id, txHash);

    res.status(200).json({
      success: true,
      message: "Xác nhận đặt cọc thành công",
      data: order,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ===== VERIFY FULL PAYMENT =====
export const verifyFullPaymentController = async (req, res) => {
  try {
    const { txHash } = req.body;

    if (!txHash) {
      return res.status(400).json({
        success: false,
        message: "Thiếu txHash",
      });
    }

    const order = await verifyFullPaymentService(req.user.id, req.params.id, txHash);

    res.status(200).json({
      success: true,
      message: "Xác nhận thanh toán full thành công",
      data: order,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ===== VERIFY SELLER CONFIRM =====
export const verifySellerConfirmController = async (req, res) => {
  try {
    const { txHash } = req.body;

    if (!txHash) {
      return res.status(400).json({
        success: false,
        message: "Thiếu txHash",
      });
    }

    const order = await verifySellerConfirmService(req.params.id, txHash);

    res.status(200).json({
      success: true,
      message: "Seller xác nhận thành công",
      data: order,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ===== ADMIN CONFIRM ORDER =====
export const adminConfirmOrderController = async (req, res) => {
  try {
    const result = await adminConfirmOrderService(req.user, req.params.id);

    res.status(200).json({
      success: true,
      message: "Admin xác nhận đơn hàng thành công",
      data: result.order,
      txHash: result.txHash,
      blockNumber: result.blockNumber,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ===== VERIFY COMPLETE =====
export const verifyCompleteOrderController = async (req, res) => {
  try {
    const { txHash } = req.body;

    if (!txHash) {
      return res.status(400).json({
        success: false,
        message: "Thiếu txHash",
      });
    }

    const order = await verifyCompleteOrderService(req.user.id, req.params.id, txHash);

    res.status(200).json({
      success: true,
      message: "Hoàn tất giao dịch thành công",
      data: order,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ===== VERIFY CANCEL =====
export const verifyCancelOrderController = async (req, res) => {
  try {
    const { txHash } = req.body;

    if (!txHash) {
      return res.status(400).json({
        success: false,
        message: "Thiếu txHash",
      });
    }

    const order = await verifyCancelOrderService(req.user, req.params.id, txHash);

    res.status(200).json({
      success: true,
      message: "Hủy đơn hàng thành công",
      data: order,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ===== ADMIN CANCEL ORDER =====
export const adminCancelOrderController = async (req, res) => {
  try {
    const result = await adminCancelOrderService(req.user, req.params.id);

    res.status(200).json({
      success: true,
      message: "Admin hủy đơn hàng thành công",
      data: result.order,
      txHash: result.txHash,
      blockNumber: result.blockNumber,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ===== GET MY ORDERS =====
export const getMyOrdersController = async (req, res) => {
  try {
    const orders = await getMyOrdersService(req.user.id);

    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ===== GET ORDER DETAIL =====
export const getOrderDetailController = async (req, res) => {
  try {
    const order = await getOrderDetailService(req.user.id, req.params.id);

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ===== GET ALL ORDERS (ADMIN) =====
export const getAllOrdersController = async (req, res) => {
  try {
    const orders = await getAllOrdersService();
    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ===== ADMIN: GET ORDERS =====
export const adminGetOrdersController = async (req, res) => {
  try {
    const result = await adminGetOrdersService(req.query);

    res.status(200).json({
      success: true,
      data: result.orders,
      pagination: result.pagination,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ===== ADMIN: GET ORDER DETAIL =====
export const adminGetOrderDetailController = async (req, res) => {
  try {
    const order = await adminGetOrderDetailService(req.params.id);

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
