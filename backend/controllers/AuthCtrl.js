import {
  registerService,
  verifyOtpService,
  loginService,
  googleAuthService,
  refreshAccessTokenService,
  forgotPasswordService,
  resetPasswordService,
} from "../service/AuthService.js";

export const register = async (req, res) => {
  try {
    await registerService(req.body);

    res.status(201).json({
      message: "OTP sent to email. Please verify your account.",
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    await verifyOtpService(req.body.email, req.body.otp);

    res.status(200).json({
      message: "Verification successful",
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

export const login = async (req, res) => {
  try {
    const { token, refreshToken } = await loginService(
      req.body.email,
      req.body.password
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "Lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "Login successful",
      token,
      refreshToken,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

export const googleAuth = async (req, res) => {
  try {
    const { token, refreshToken, user } = await googleAuthService(
      req.user.googleId
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "Lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "Google login successful",
      token,
      refreshToken,
      user,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

export const refreshAccessToken = async (req, res) => {
  try {
    const token = await refreshAccessTokenService(req.cookies.refreshToken);
    res.json({ token });
  } catch (error) {
    res.status(401).json({
      message: error.message,
    });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    await forgotPasswordService(req.body.email);

    res.status(200).json({
      message: "OTP has been sent to your email",
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    await resetPasswordService(req.body);

    res.status(200).json({
      message: "Password has been updated successfully",
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};
