import api from "./api"; // Instance axios dùng chung

const ReviewService = {
  /**
   * [USER] Tạo đánh giá mới cho sản phẩm
   * API: POST /api/reviews/create
   * @param {Object} reviewData - { productId, rating, comment }
   * Lưu ý: userId sẽ được BE lấy từ token, nhưng nếu BE yêu cầu truyền 
   * trong body thì bạn thêm vào object này.
   */
  createReview: async (reviewData) => {
    try {
      // Backend yêu cầu productId, userId, rating, comment
      const response = await api.post("/reviews/create", reviewData);
      return response; // Trả về thông tin review vừa tạo
    } catch (error) {
      // Trả về lỗi cụ thể (ví dụ: "User đã đánh giá sản phẩm này")
      throw error;
    }
  },

  /**
   * [PUBLIC] Lấy danh sách đánh giá của một sản phẩm
   * API: GET /api/reviews/product/:productId
   * @param {string} productId - ID của xe/sản phẩm
   */
  getReviewsByProductId: async (productId) => {
    try {
      const response = await api.get(`/reviews/product/${productId}`);
      return response; // Trả về mảng reviews kèm thông tin username
    } catch (error) {
      throw error;
    }
  },
};

export default ReviewService;