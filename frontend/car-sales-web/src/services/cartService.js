import api from './api';

const cartService = {
  // Lấy danh sách sản phẩm trong giỏ hàng
  getCart: async () => {
    const response = await api.get('/cart');
    return response.data;
  },

  // THÊM SẢN PHẨM (Dùng cái này để sửa lỗi "Giỏ hàng trống")
  addToCart: async (productId, quantity = 1) => {
    const response = await api.post('/cart/add', { productId, quantity });
    return response.data;
  },

  // Cập nhật số lượng
  updateCartItem: async (productId, quantity) => {
    const response = await api.put(`/cart/update/${productId}`, { quantity });
    return response.data;
  },

  // Xóa 1 sản phẩm khỏi giỏ
  removeCartItem: async (productId) => {
    const response = await api.delete(`/cart/remove/${productId}`);
    return response.data;
  },

  // Xóa sạch giỏ hàng
  clearCart: async () => {
    const response = await api.delete('/cart/clear');
    return response.data;
  },

  // Lấy tổng số lượng (cho icon thông báo trên Header)
  getCartTotal: async () => {
    const response = await api.get('/cart/total');
    return response.data;
  }
};

export default cartService;