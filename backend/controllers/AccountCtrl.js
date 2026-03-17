import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import User from "../models/AuthModel.js";
import { verifyToken } from "../utils/jwtUtils.js";

export const changePassword = async (req, res) => {
  const { email, oldPassword, newPassword, resNewPassword } = req.body;

  if (newPassword !== resNewPassword)
    return res.status(400).json({ message: "New passwords do not match" });

  if (!newPassword || newPassword.length < 8)
    return res.status(400).json({ message: "New password must be at least 8 characters long" });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(oldPassword || "", user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid current password" });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.json({ message: "Password updated successfully" });
  } catch (err) {
    return res.status(500).json({ message: "Error updating password", error: err.message });
  }
};


export const getUser = async (req, res) => {
  try {
    const users = await User.find();
    return res.status(200).json(users);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Access denied. No token provided." });

    const decoded = verifyToken(token, process.env.JWT_SECRET || "default_secret_key");
    if (!decoded) return res.status(401).json({ message: "Invalid or expired token" });

    const user = await User.findById(decoded.id).select("-password -refreshToken");
    if (!user) return res.status(404).json({ message: "User not found" });

    return res.status(200).json({ success: true, data: user });
  } catch (error) {
    return res.status(500).json({ message: "Error fetching user data", error: error.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Access denied. No token provided." });

    const decoded = verifyToken(token, process.env.JWT_SECRET || "default_secret_key");
    if (!decoded) return res.status(401).json({ message: "Invalid token" });

    const userId = decoded.id;

    const allowedFields = ["username", "phoneNumber", "email", "address"];
    const updatedData = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) updatedData[field] = req.body[field];
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updatedData, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser) return res.status(404).json({ message: "User not found" });

    return res.status(200).json({ message: "User updated successfully", user: updatedUser });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Access denied. No token provided." });

    const decoded = verifyToken(token, process.env.JWT_SECRET || "default_secret_key");
    if (!decoded) return res.status(401).json({ message: "Invalid token" });

    const userIdFromToken = decoded.id;
    const isAdmin = decoded.isadmin;

    let { id } = req.params;

    if (id === "me") id = userIdFromToken;

    // user tự xóa mình
    if (id === userIdFromToken) {
      if (!mongoose.Types.ObjectId.isValid(id))
        return res.status(400).json({ message: "Invalid user ID" });

      const deletedUser = await User.findByIdAndDelete(id);
      if (!deletedUser) return res.status(404).json({ message: "User not found" });

      return res.status(200).json({ message: "User account deleted successfully", user: deletedUser });
    }

    // admin xóa người khác
    if (isAdmin) {
      if (!mongoose.Types.ObjectId.isValid(id))
        return res.status(400).json({ message: "Invalid user ID" });

      const deletedUser = await User.findByIdAndDelete(id);
      if (!deletedUser) return res.status(404).json({ message: "User not found" });

      return res.status(200).json({ message: "Admin deleted user successfully", user: deletedUser });
    }

    return res.status(403).json({ message: "Permission denied" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const logout = async (req, res) => {
  const refreshToken = req.body.refreshToken || req.cookies?.refreshToken;
  if (!refreshToken) return res.status(401).json({ message: "No refresh token provided" });

  try {
    const user = await User.findOne({ refreshToken });
    if (!user) return res.status(403).json({ message: "Invalid refresh token" });

    user.refreshToken = null;
    await user.save();

    res.clearCookie("refreshToken");
    return res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    return res.status(500).json({ message: "Error during logout", error: error.message });
  }
};

export const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user.id;

    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(productId)
    ) {
      return res.status(400).json({ message: "Invalid userId or productId" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.wishlist.includes(productId))
      return res.status(400).json({ message: "Product already in wishlist" });

    user.wishlist.push(productId);
    await user.save();

    return res.status(200).json({ message: "Product added to wishlist", wishlist: user.wishlist });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getWishlist = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(userId))
      return res.status(400).json({ message: "Invalid userId" });

    const user = await User.findById(userId).populate("wishlist").exec();
    if (!user) return res.status(404).json({ message: "User not found" });

    return res.status(200).json({ wishlist: user.wishlist });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const removeFromWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(productId))
      return res.status(400).json({ message: "Invalid productId" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.wishlist.includes(productId))
      return res.status(400).json({ message: "Product not found in wishlist" });

    user.wishlist = user.wishlist.filter((id) => id.toString() !== productId);
    await user.save();

    return res.status(200).json({ message: "Product removed from wishlist", wishlist: user.wishlist });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};