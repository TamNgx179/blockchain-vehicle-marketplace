import express from "express";
import passport from "../config/passport.js"; // bạn đặt đường dẫn đúng theo project
import authenticateToken from "../middlewares/authMiddleware.js";
import {
  register,
  verifyOtp,
  login,
  googleAuth,
  forgotPassword,
  resetPassword,
  refreshAccessToken,
} from "../controllers/AuthCtrl.js";
import { generateAccessToken, verifyToken } from "../utils/jwtUtils.js";

const router = express.Router();

router.post("/register", register);
router.post("/verifyOtp", verifyOtp);
router.post("/login", login);

router.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    if (!req.user) return res.status(401).json({ message: "Google authentication failed" });

    const token = generateAccessToken(req.user);
    // nếu cần refreshToken thì bạn import generateRefreshToken thêm

    // Sau khi xác thực thành công, chuyển hướng về frontend với token và thông tin người dùng (URL fe)
    res.redirect(
      `https://blockchain-vehicle-marketplace.netlify.app/login?token=${token}&username=${req.user.username}&email=${req.user.email}`
    );
  }
);


router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

router.post("/refresh-token", refreshAccessToken);



export default router;