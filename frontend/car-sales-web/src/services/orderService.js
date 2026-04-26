import api from './api';

export const orderService = {
  // 1. Tạo order từ cart
  createOrder: async (orderData) => {
    // orderData bao gồm: selectedItems, paymentType, buyerWallet, deliveryMethod, pickupInfo/shippingAddress
    const response = await api.post('/orders/create-from-cart', orderData);
    return response.data;
  },

  // 2. Lấy danh sách order của user
  getMyOrders: async () => {
    const response = await api.get('/orders/my-orders');
    return response.data;
  },

  // 3. Chi tiết order
  getOrderDetail: async (id) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  // 4. Verify đặt cọc (payDeposit)
  verifyDeposit: async (id, txHash) => {
    const response = await api.post(`/orders/${id}/verify-deposit`, { txHash });
    return response.data;
  },

  // 5. Verify thanh toán toàn bộ (payFull)
  verifyFullPayment: async (id, txHash) => {
    const response = await api.post(`/orders/${id}/verify-full-payment`, { txHash });
    return response.data;
  },

  // 6. Verify Seller xác nhận (confirmOrder)
  verifySellerConfirm: async (id, txHash) => {
    const response = await api.post(`/orders/${id}/verify-seller-confirm`, { txHash });
    return response.data;
  },

  // 7. Verify hoàn tất (completeOrder)
  verifyComplete: async (id, txHash) => {
    const response = await api.post(`/orders/${id}/verify-complete`, { txHash });
    return response.data;
  },

  // 8. Verify hủy đơn (cancelOrder)
  verifyCancel: async (id, txHash) => {
    const response = await api.post(`/orders/${id}/verify-cancel`, { txHash });
    return response.data;
  },
  getAllOrders: async () => {
    // Lưu ý: Đảm bảo đường dẫn này khớp với prefix router của bạn 
    // Ví dụ nếu router tổng là app.use('/orders', orderRoutes) thì endpoint là /orders/all-orders
    const response = await api.get('/orders/all-orders');
    return response.data;
  }
};