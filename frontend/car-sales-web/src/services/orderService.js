import api from './api';

export const orderService = {
  createOrder: async (orderData) => {
    const response = await api.post('/orders/create-from-cart', orderData);
    return response.data;
  },

  discardUnpaidOrder: async (id) => {
    const response = await api.post(`/orders/${id}/discard-unpaid`);
    return response.data;
  },

  getMyOrders: async () => {
    const response = await api.get('/orders/my-orders');
    return response.data;
  },

  getOrderDetail: async (id) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  verifyDeposit: async (id, txHash) => {
    const response = await api.post(`/orders/${id}/verify-deposit`, { txHash });
    return response.data;
  },

  verifyFullPayment: async (id, txHash) => {
    const response = await api.post(`/orders/${id}/verify-full-payment`, { txHash });
    return response.data;
  },

  verifySellerConfirm: async (id, txHash) => {
    const response = await api.post(`/orders/${id}/verify-seller-confirm`, { txHash });
    return response.data;
  },

  verifyComplete: async (id, txHash) => {
    const response = await api.post(`/orders/${id}/verify-complete`, { txHash });
    return response.data;
  },

  verifyCancel: async (id, txHash) => {
    const response = await api.post(`/orders/${id}/verify-cancel`, { txHash });
    return response.data;
  },

  adminConfirm: async (id) => {
    const response = await api.post(`/orders/admin/${id}/confirm`);
    return response.data;
  },

  adminCancel: async (id) => {
    const response = await api.post(`/orders/admin/${id}/cancel`);
    return response.data;
  },

  getAllOrders: async () => {
    const response = await api.get('/orders/all-orders');
    return response.data;
  }
};
