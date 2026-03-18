import express from "express";
import { createOrderFromCart } from "../controllers/OrderController.js";
import authenticateToken from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/create-from-cart", authenticateToken, createOrderFromCart);

export default router;