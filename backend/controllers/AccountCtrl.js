import * as userService from "../service/AccountService.js";

export const changePassword = async (req, res) => {
  try {
    const message = await userService.changePasswordService({
      email: req.user.email, // Use authenticated user's email
      oldPassword: req.body.oldPassword,
      newPassword: req.body.newPassword,
      resNewPassword: req.body.resNewPassword
    });
    res.json({ message });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};


export const getProfile = async (req, res) => {
  try {
    const user = await userService.getProfileService(req.user.id);
    res.status(200).json({ data: user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


export const editProfile = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const user = await userService.editProfileService(token, req.body);
    res.status(200).json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


export const updateUser = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const user = await userService.updateUserService(token, req.body);

    res.status(200).json({
      message: "User updated successfully",
      user,
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


export const deleteUser = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const deletedUser = await userService.deleteUserService(token, req.params.id);

    res.status(200).json({
      message: "User deleted successfully",
      user: deletedUser,
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


export const logout = async (req, res) => {
  try {
    const refreshToken = req.body.refreshToken || req.cookies?.refreshToken;
    await userService.logoutService(refreshToken);

    res.clearCookie("refreshToken");

    res.status(200).json({
      message: "Logout successful",
    });

  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};


export const addToWishlist = async (req, res) => {
  try {

    const wishlist = await userService.addToWishlistService(
      req.user.id,
      req.body.productId
    );

    res.status(200).json({
      message: "Product added to wishlist",
      wishlist,
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


export const getWishlist = async (req, res) => {
  try {

    const wishlist = await userService.getWishlistService(req.user.id);

    res.status(200).json({ wishlist });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


export const removeFromWishlist = async (req, res) => {
  try {

    const wishlist = await userService.removeFromWishlistService(
      req.user.id,
      req.body.productId
    );

    res.status(200).json({
      message: "Product removed from wishlist",
      wishlist,
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};