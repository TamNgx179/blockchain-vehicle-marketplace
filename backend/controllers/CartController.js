import {
  getCartService,
  addToCartService,
  updateCartItemService,
  removeCartItemService,
  clearCartService,
  getAllCartsService,
  getCartTotalService,

} from "../service/CartService.js";

export const getCart = async (req, res) => {
  try {
    const cart = await getCartService(req.user.id);
    res.status(200).json({ success: true, data: cart });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const addToCart = async (req, res) => {
  try {
    const cart = await addToCartService(req.user.id, req.body);
    res.status(200).json({
      success: true,
      message: "Đã thêm vào giỏ hàng",
      data: cart,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateCartItem = async (req, res) => {
  try {
    const cart = await updateCartItemService(
      req.user.id,
      req.params.productId,
      req.body
    );
    res.status(200).json({
      success: true,
      message: "Đã cập nhật giỏ hàng",
      data: cart,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const removeCartItem = async (req, res) => {
  try {
    const cart = await removeCartItemService(
      req.user.id,
      req.params.productId
    );
    res.status(200).json({
      success: true,
      message: "Đã xóa sản phẩm khỏi giỏ",
      data: cart,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const clearCart = async (req, res) => {
  try {
    const result = await clearCartService(req.user.id);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getAllCarts = async (req, res) => {
  try {
    const carts = await getAllCartsService();
    res.status(200).json({ success: true, data: carts });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getCartTotal = async (req, res) => {
  try {
    const data = await getCartTotalService(req.user.id);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};