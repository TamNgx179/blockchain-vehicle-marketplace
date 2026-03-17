import express from "express";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
  getAllCarts,
} from "../controllers/CartController.js";
import authenticateToken, { requireAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// ── User routes ───────────────────────────────────────────────────────────────
router.get("/", authenticateToken, getCart);
router.post("/add", authenticateToken, addToCart);
router.put("/update/:productId", authenticateToken, updateCartItem);
router.delete("/remove/:productId", authenticateToken, removeCartItem);
router.delete("/clear", authenticateToken, clearCart);

// ── Admin routes ──────────────────────────────────────────────────────────────
router.get("/admin/all", authenticateToken, requireAdmin, getAllCarts);

export default router;