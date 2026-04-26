import express from "express";
import {
  createOrderFromCart,
  verifyDepositController,
  verifyFullPaymentController,
  verifySellerConfirmController,
  adminConfirmOrderController,
  verifyCompleteOrderController,
  verifyCancelOrderController,
  adminCancelOrderController,
  getMyOrdersController,
  getOrderDetailController,
  getAllOrdersController,
  adminGetOrdersController,
  adminGetOrderDetailController
} from "../controllers/OrderController.js";
import authenticateToken, {requireAdmin} from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/create-from-cart", authenticateToken, createOrderFromCart);

router.get("/all-orders", authenticateToken, requireAdmin, getAllOrdersController);

router.get("/admin", authenticateToken, requireAdmin, adminGetOrdersController);
router.post(
  "/admin/:id/confirm",
  authenticateToken,
  requireAdmin,
  adminConfirmOrderController
);
router.post(
  "/admin/:id/cancel",
  authenticateToken,
  requireAdmin,
  adminCancelOrderController
);
router.get(
  "/admin/:id",
  authenticateToken,
  requireAdmin,
  adminGetOrderDetailController
);

router.get("/my-orders", authenticateToken, getMyOrdersController);
router.get("/:id", authenticateToken, getOrderDetailController);

router.post("/:id/verify-deposit", authenticateToken, verifyDepositController);
router.post("/:id/verify-full-payment", authenticateToken, verifyFullPaymentController);
router.post("/:id/verify-seller-confirm", authenticateToken, requireAdmin, verifySellerConfirmController);
router.post("/:id/verify-complete", authenticateToken, verifyCompleteOrderController);
router.post("/:id/verify-cancel", authenticateToken, verifyCancelOrderController);

export default router;
