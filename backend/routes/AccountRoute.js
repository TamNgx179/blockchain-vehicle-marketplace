import express from "express";
import authenticateToken from "../middlewares/authMiddleware.js";

import {
  changePassword,
  getProfile,
  editProfile,
  deleteUser,
  addToWishlist,
  getWishlist,
  removeFromWishlist,
  logout,
} from "../controllers/AccountCtrl.js";

const router = express.Router();

// Đổi mật khẩu yêu cầu đăng nhập
router.post("/changePassword", authenticateToken, changePassword);
router.get('/getProfile', authenticateToken, getProfile);
router.put('/editProfile', authenticateToken, editProfile);

// Xóa tài khoản chính mình (PHẢI đặt trước /:id)
router.delete("/me", authenticateToken, (req, res) => {
  req.params.id = "me";
  return deleteUser(req, res);
});

// Xóa user theo id (admin hoặc tự xóa chính mình)
router.delete("/:id", authenticateToken, deleteUser);

router.post("/logout", logout);

// wishlist
router.post("/wishlist/add", authenticateToken, addToWishlist);
router.get("/wishlist", authenticateToken, getWishlist);
router.delete("/wishlist/remove", authenticateToken, removeFromWishlist);

export default router;