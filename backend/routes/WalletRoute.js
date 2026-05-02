import express from "express";
import authenticateToken from "../middlewares/authMiddleware.js";
import {
  getMyWallets,
  addWallet,
  updateWallet,
  deleteWallet,
} from "../controllers/WalletController.js";

const router = express.Router();

router.get("/", authenticateToken, getMyWallets);
router.post("/", authenticateToken, addWallet);
router.put("/:id", authenticateToken, updateWallet);
router.delete("/:id", authenticateToken, deleteWallet);

export default router;