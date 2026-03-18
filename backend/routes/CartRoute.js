import express from "express";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
  getAllCarts,
  getCartTotal,
} from "../controllers/CartController.js";
import authenticateToken, { requireAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// ── User routes ───────────────────────────────────────────────────────────────
router.get("/", authenticateToken, getCart);
router.post("/add", authenticateToken, addToCart);
router.put("/update/:productId", authenticateToken, updateCartItem);
router.delete("/remove/:productId", authenticateToken, removeCartItem);
router.delete("/clear", authenticateToken, clearCart);

// Lấy tổng số lượng sản phẩm trong giỏ hàng (dành cho icon cart)
router.get("/total", authenticateToken, getCartTotal);

// ── Admin routes ──────────────────────────────────────────────────────────────
router.get("/admin/all", authenticateToken, requireAdmin, getAllCarts);

export default router;