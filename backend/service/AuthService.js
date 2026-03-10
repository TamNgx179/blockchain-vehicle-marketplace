import User from "../models/AuthModel.js";
import Otp from "../models/OTPModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import sendMail from "../utils/mailer.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyToken
} from "../utils/jwtUtils.js";

const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

/*
REGISTER
*/
export const registerService = async ({ username, email, password, resPassword }) => {

  if (!password || typeof password !== "string")
    throw new Error("Password is invalid");

  if (!resPassword || typeof resPassword !== "string")
    throw new Error("Confirm password is invalid");

  if (password !== resPassword)
    throw new Error("Passwords do not match");

  const userExists = await User.findOne({
    $or: [{ email }, { username }]
  });

  if (userExists)
    throw new Error("Username or Email already exists");

  const hashedPassword = await bcrypt.hash(password, 10);

  await User.create({
    username,
    email,
    password: hashedPassword,
    isVerified: false
  });

  const otp = generateOtp();
  const hashedOtp = await bcrypt.hash(otp, 10);

  const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

  await Otp.create({
    email,
    otp: hashedOtp,
    expiresAt: otpExpiry
  });

  await sendMail(
    email,
    "Xác nhận đăng ký tài khoản",
    `<div>OTP của bạn: <b>${otp}</b> (hết hạn 5 phút)</div>`
  );

  return true;
};


/*
VERIFY OTP
*/
export const verifyOtpService = async (email, otp) => {

  const otpRecord = await Otp
    .findOne({ email })
    .sort({ createdAt: -1 });

  if (!otpRecord)
    throw new Error("OTP không tồn tại hoặc đã hết hạn");

  if (otpRecord.expiresAt < new Date())
    throw new Error("OTP đã hết hạn");

  const isMatch = await bcrypt.compare(otp, otpRecord.otp);

  if (!isMatch)
    throw new Error("Invalid OTP");

  await User.updateOne(
    { email },
    { isVerified: true }
  );

  await Otp.deleteOne({ email });

  return true;
};


/*
LOGIN
*/
export const loginService = async (email, password) => {

  const user = await User.findOne({ email });

  if (!user)
    throw new Error("Invalid email or password");

  if (!user.isVerified)
    throw new Error("Email chưa được xác thực");

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch)
    throw new Error("Invalid email or password");

  const token = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  user.refreshToken = refreshToken;
  await user.save();

  return {
    token,
    refreshToken,
    user
  };
};


/*
GOOGLE LOGIN
*/
export const googleAuthService = async (googleId) => {

  const user = await User.findOne({ googleId });

  if (!user)
    throw new Error("Người dùng chưa đăng ký với Google");

  const token = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  user.refreshToken = refreshToken;
  await user.save();

  return {
    token,
    refreshToken,
    user
  };
};


/*
REFRESH TOKEN
*/
export const refreshAccessTokenService = async (refreshToken) => {

  if (!refreshToken)
    throw new Error("Refresh token không hợp lệ");

  const decoded = verifyToken(
    refreshToken,
    process.env.JWT_REFRESH_SECRET
  );

  if (!decoded)
    throw new Error("Refresh token không hợp lệ hoặc đã hết hạn");

  const user = await User.findById(decoded.id);
  if (!user || user.refreshToken !== refreshToken)
    throw new Error("Refresh token không hợp lệ");

  const newToken = jwt.sign(
    {
      id: decoded.id,
      username: decoded.username,
      isadmin: decoded.isadmin
    },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  return newToken;
};


/*
FORGOT PASSWORD
*/
export const forgotPasswordService = async (email) => {

  const user = await User.findOne({ email });

  if (!user)
    throw new Error("Email không tồn tại trong hệ thống");

  const otp = generateOtp();
  const hashedOtp = await bcrypt.hash(otp, 10);

  const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

  await Otp.create({
    email,
    otp: hashedOtp,
    expiresAt: otpExpiry
  });

  await sendMail(
    email,
    "Khôi phục mật khẩu",
    `<div>OTP reset: <b>${otp}</b></div>`
  );

  return true;
};


/*
RESET PASSWORD
*/
export const resetPasswordService = async ({ email, otp, newPassword }) => {

  const otpRecord = await Otp
    .findOne({ email })
    .sort({ createdAt: -1 });

  if (!otpRecord)
    throw new Error("OTP không hợp lệ hoặc đã hết hạn");

  if (otpRecord.expiresAt < new Date())
    throw new Error("OTP đã hết hạn");

  const isMatch = await bcrypt.compare(
    otp,
    otpRecord.otp
  );

  if (!isMatch)
    throw new Error("OTP không chính xác");

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await User.updateOne(
    { email },
    { password: hashedPassword }
  );

  await Otp.deleteOne({ email });

  return true;
};