import User from "../models/AuthModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import sendMail from "../utils/mailer.js";
import Otp from "../models/OTPModel.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
} from "../utils/jwtUtils.js";

const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

// REGISTER
export const register = async (req, res) => {
  const { username, email, password, resPassword } = req.body;

  if (!password || typeof password !== "string")
    return res.status(400).json({ message: "Password is invalid" });

  if (!resPassword || typeof resPassword !== "string")
    return res.status(400).json({ message: "Confirm password is invalid" });

  if (password !== resPassword)
    return res.status(400).json({ message: "Passwords do not match" });

  try {
    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists)
      return res.status(400).json({ message: "Username or Email already exists" });

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      isVerified: false,
    });

    const otp = generateOtp();
    const hashedOtp = await bcrypt.hash(otp, saltRounds);
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

    await Otp.create({ email, otp: hashedOtp, expiresAt: otpExpiry });

    await sendMail(
      email,
      "Xác nhận đăng ký tài khoản",
      `<div>OTP của bạn: <b>${otp}</b> (hết hạn 5 phút)</div>`
    );

    return res
      .status(201)
      .json({ message: "OTP sent to email. Please verify your account." });
  } catch (err) {
    console.error("Error registering user:", err);
    return res
      .status(500)
      .json({ message: "Error registering user", error: err.message });
  }
};

export const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const otpRecord = await Otp.findOne({ email }).sort({createdAt: -1});
    if (!otpRecord)
      return res.status(400).json({ message: "OTP không tồn tại hoặc đã hết hạn" });

    if (otpRecord.expiresAt < new Date())
      return res.status(400).json({ message: "OTP đã hết hạn" });

    const isMatch = await bcrypt.compare(otp, otpRecord.otp);
    if (!isMatch) return res.status(400).json({ message: "Invalid OTP" });

    await User.updateOne({ email }, { isVerified: true });
    await Otp.deleteOne({ email });

    return res.status(200).json({ message: "Xác thực thành công" });
  } catch (err) {
    return res.status(500).json({ message: "Lỗi xác thực OTP", error: err.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid email or password" });

    const token = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    user.refreshToken = refreshToken;
    await user.save();
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: "Đăng nhập thành công",
      token,
      refreshToken,
    });
  } catch (err) {
    return res.status(500).json({ message: "Lỗi khi đăng nhập", error: err.message });
  }
};

export const googleAuth = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Google authentication thất bại" });

    const user = await User.findOne({ googleId: req.user.googleId });
    if (!user) return res.status(400).json({ message: "Người dùng chưa đăng ký với Google" });

    const token = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    user.refreshToken = refreshToken;
    await user.save();
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: "Đăng nhập Google thành công",
      token,
      refreshToken,
      user: { id: user._id, username: user.username, email: user.email },
    });
  } catch (err) {
    return res.status(500).json({ message: "Lỗi khi đăng nhập bằng Google", error: err.message });
  }
};


export const refreshAccessToken = async (req, res) => {
  const { refreshToken } = req.cookies;
  if (!refreshToken) return res.status(401).json({ message: "Refresh token không hợp lệ" });

  const decoded = verifyToken(
    refreshToken,
    process.env.JWT_REFRESH_SECRET || "default_refresh_secret_key"
  );

  if (!decoded) return res.status(403).json({ message: "Refresh token không hợp lệ hoặc đã hết hạn" });

  const newToken = jwt.sign(
    { id: decoded.id, username: decoded.username, isadmin: decoded.isadmin },
    process.env.JWT_SECRET || "default_secret_key",
    { expiresIn: "1h" }
  );

  return res.json({ token: newToken });
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Email không tồn tại trong hệ thống" });

    const otp = generateOtp();
    const hashedOtp = await bcrypt.hash(otp, 10);
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

    await Otp.create({ email, otp: hashedOtp, expiresAt: otpExpiry });

    await sendMail(email, "Khôi phục mật khẩu", `<div>OTP reset: <b>${otp}</b></div>`);
    return res.status(200).json({ message: "OTP đã được gửi đến email của bạn" });
  } catch (err) {
    return res.status(500).json({ message: "Lỗi khi gửi OTP", error: err.message });
  }
};

export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    const otpRecord = await Otp.findOne({ email }).sort({createdAt: -1});
    if (!otpRecord) return res.status(400).json({ message: "OTP không hợp lệ hoặc đã hết hạn" });

    if (otpRecord.expiresAt < new Date())
      return res.status(400).json({ message: "OTP đã hết hạn" });

    const isMatch = await bcrypt.compare(otp, otpRecord.otp);
    if (!isMatch) return res.status(400).json({ message: "OTP không chính xác" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.updateOne({ email }, { password: hashedPassword });
    await Otp.deleteOne({ email });

    return res.status(200).json({ message: "Mật khẩu đã được cập nhật thành công" });
  } catch (err) {
    return res.status(500).json({ message: "Lỗi khi đặt lại mật khẩu", error: err.message });
  }
};
