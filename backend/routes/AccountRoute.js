import express from "express";
import authenticateToken from "../middlewares/authMiddleware.js";

import {
  changePassword,
  getUser,
  updateUser,
  deleteUser,
  getUserById,
  addToWishlist,
  getWishlist,
  removeFromWishlist,
  logout,
} from "../controllers/AccountCtrl.js";

const router = express.Router();

// Đổi mật khẩu yêu cầu đăng nhập
router.post("/changePassword", authenticateToken, changePassword);

// Admin / dev: lấy toàn bộ user
router.get("/all", getUser);

// Lấy thông tin user theo token (me)
router.get("/", getUserById);

// Update profile theo token (me)
router.put("/", updateUser);

// Xóa tài khoản chính mình (PHẢI đặt trước /:id)
router.delete("/me", authenticateToken, (req, res) => {
  req.params.id = "me";
  return deleteUser(req, res);
});

// Xóa user theo id (admin hoặc tự xóa chính mình)
router.delete("/:id", deleteUser);

router.post("/logout", logout);

// wishlist
router.post("/wishlist/add", authenticateToken, addToWishlist);
router.get("/wishlist", authenticateToken, getWishlist);
router.delete("/wishlist/remove", authenticateToken, removeFromWishlist);

export default router;