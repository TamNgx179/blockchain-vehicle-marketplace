import jwt from "jsonwebtoken";

export const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, username: user.username, isadmin: user.isadmin },
    process.env.JWT_SECRET || "default_secret_key",
    { expiresIn: "1h" }
  );
};

export const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id, username: user.username, isadmin: user.isadmin },
    process.env.JWT_REFRESH_SECRET || "default_refresh_secret_key",
    { expiresIn: "7d" }
  );
};

export const verifyToken = (token, secret) => {
  try {
    return jwt.verify(token, secret);
  } catch {
    return null;
  }
};