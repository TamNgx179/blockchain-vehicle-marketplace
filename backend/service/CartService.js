import Cart from "../models/CartModel.js";
import Product from "../models/ProductModel.js";

export const getCartService = async (userId) => {
  const cart = await Cart.findOne({ userId }).populate(
    "items.productId",
    "name price images"
  );
  if (!cart) return { userId, items: [], totalPrice: 0 };
  return cart;
};

export const addToCartService = async (userId, body) => {
  const { productId, quantity = 1 } = body;
  if (!productId) throw new Error("productId là bắt buộc");
  if (quantity < 1) throw new Error("Số lượng phải ít nhất là 1");

  const product = await Product.findById(productId);
  if (!product) throw new Error("Sản phẩm không tồn tại");

  let cart = await Cart.findOne({ userId });

  if (!cart) {
    cart = new Cart({
      userId,
      items: [{ productId, quantity, price: product.price }],
    });
  } else {
    const existingIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );
    if (existingIndex >= 0) {
      cart.items[existingIndex].quantity += quantity;
    } else {
      cart.items.push({ productId, quantity, price: product.price });
    }
  }

  await cart.save();
  return Cart.findById(cart._id).populate("items.productId", "name price images");
};

export const updateCartItemService = async (userId, productId, body) => {
  const { quantity } = body;
  if (!quantity || quantity < 1) throw new Error("Số lượng phải ít nhất là 1");

  const cart = await Cart.findOne({ userId });
  if (!cart) throw new Error("Giỏ hàng không tồn tại");

  const itemIndex = cart.items.findIndex(
    (item) => item.productId.toString() === productId
  );
  if (itemIndex === -1) throw new Error("Sản phẩm không có trong giỏ hàng");

  cart.items[itemIndex].quantity = quantity;
  await cart.save();
  return Cart.findById(cart._id).populate("items.productId", "name price images");
};

export const removeCartItemService = async (userId, productId) => {
  const cart = await Cart.findOne({ userId });
  if (!cart) throw new Error("Giỏ hàng không tồn tại");

  const itemIndex = cart.items.findIndex(
    (item) => item.productId.toString() === productId
  );
  if (itemIndex === -1) throw new Error("Sản phẩm không có trong giỏ hàng");

  cart.items.splice(itemIndex, 1);
  await cart.save();
  return Cart.findById(cart._id).populate("items.productId", "name price images");
};

export const clearCartService = async (userId) => {
  const cart = await Cart.findOneAndDelete({ userId });
  if (!cart) throw new Error("Giỏ hàng không tồn tại");
  return { message: "Đã xóa toàn bộ giỏ hàng" };
};

export const getAllCartsService = async () => {
  return await Cart.find()
    .populate("userId", "name email")
    .populate("items.productId", "name price");
};