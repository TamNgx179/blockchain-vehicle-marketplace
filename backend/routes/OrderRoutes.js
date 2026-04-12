import express from "express";
import {
  createOrderFromCart,
  verifyDepositController,
  verifyFullPaymentController,
  verifySellerConfirmController,
  verifyCompleteOrderController,
  verifyCancelOrderController,
  getMyOrdersController,
  getOrderDetailController,
} from "../controllers/OrderController.js";
import authenticateToken from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/create-from-cart", authenticateToken, createOrderFromCart);

router.get("/my-orders", authenticateToken, getMyOrdersController);
router.get("/:id", authenticateToken, getOrderDetailController);

router.post("/:id/verify-deposit", authenticateToken, verifyDepositController);
router.post("/:id/verify-full-payment", authenticateToken, verifyFullPaymentController);
router.post("/:id/verify-seller-confirm", authenticateToken, verifySellerConfirmController);
router.post("/:id/verify-complete", authenticateToken, verifyCompleteOrderController);
router.post("/:id/verify-cancel", authenticateToken, verifyCancelOrderController);

export default router;