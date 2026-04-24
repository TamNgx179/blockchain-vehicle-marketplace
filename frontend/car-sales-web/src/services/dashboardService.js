import api from "./api"; // Sử dụng instance axios đã cấu hình interceptor token

const DashboardService = {
  /**
   * Lấy dữ liệu tổng quan (Tổng user, sản phẩm, doanh thu, tỉ lệ hoàn tất)
   * Tương ứng BE: router.get("/summary", ...)
   */
  getSummary: async () => {
    try {
      const response = await api.get("/dashboard/summary");
      return response; // Trả về object chứa totalUsers, totalRevenue, completionRate...
    } catch (error) {
      throw error;
    }
  },

  /**
   * Lấy dữ liệu doanh thu theo thời gian để vẽ biểu đồ Line Chart
   * @param {number} days - Số ngày muốn thống kê (mặc định 7)
   * Tương ứng BE: router.get("/revenue", ...)
   */
  getRevenue: async (days = 7) => {
    try {
      const response = await api.get(`/dashboard/revenue`, {
        params: { days }
      });
      return response; // Trả về mảng [{ _id: "2024-03-20", revenue: 5000 }, ...]
    } catch (error) {
      throw error;
    }
  },

  /**
   * Lấy danh sách 5 sản phẩm bán chạy nhất
   * Tương ứng BE: router.get("/top-products", ...)
   */
  getTopProducts: async () => {
    try {
      const response = await api.get("/dashboard/top-products");
      return response; // Trả về mảng [{ name: "Tesla Model S", sold: 10 }, ...]
    } catch (error) {
      throw error;
    }
  },

  /**
   * Thống kê số lượng đơn hàng theo trạng thái (Pie Chart)
   * Tương ứng BE: router.get("/order-status", ...)
   */
  getOrderStatus: async () => {
    try {
      const response = await api.get("/dashboard/order-status");
      return response; // Trả về mảng [{ _id: "pending", count: 5 }, ...]
    } catch (error) {
      throw error;
    }
  },

  /**
   * Lấy danh sách đơn hàng mới nhất để hiển thị bảng
   * Tương ứng BE: router.get("/recent-orders", ...)
   */
  getRecentOrders: async () => {
    try {
      const response = await api.get("/dashboard/recent-orders");
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Thống kê các chỉ số liên quan đến Blockchain (Deposit, TxHash)
   * Tương ứng BE: router.get("/blockchain", ...)
   */
  getBlockchainStats: async () => {
    try {
      const response = await api.get("/dashboard/blockchain");
      return response;
    } catch (error) {
      throw error;
    }
  }
};

export default DashboardService;