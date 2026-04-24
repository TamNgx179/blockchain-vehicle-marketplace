import api from "./api"; // Instance axios đã có interceptor gắn token

const AccountService = {
  /**
   * Lấy thông tin cá nhân của người dùng hiện tại
   * BE: router.get('/getProfile', ...)
   */
  getProfile: async () => {
    try {
      const response = await api.get("/accounts/getProfile");
      return response; // Trả về thông tin user (đã loại bỏ password)
    } catch (error) {
      throw error;
    }
  },

  /**
   * Chỉnh sửa thông tin cá nhân (username, phoneNumber, address)
   * BE: router.put('/editProfile', ...)
   */
  editProfile: async (profileData) => {
    try {
      const response = await api.put("/accounts/editProfile", profileData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Đổi mật khẩu
   * @param {Object} passwordData - { email, oldPassword, newPassword, resNewPassword }
   * BE: router.post("/changePassword", ...)
   */
  changePassword: async (passwordData) => {
    try {
      const response = await api.post("/accounts/changePassword", passwordData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Xóa tài khoản chính mình
   * BE: router.delete("/me", ...)
   */
  deleteMyAccount: async () => {
    try {
      const response = await api.delete("/accounts/me");
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Đăng xuất (xóa Refresh Token ở BE)
   * BE: router.post("/logout", ...)
   */
  logout: async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      const response = await api.post("/accounts/logout", { refreshToken });
      // Sau khi gọi BE thành công, FE nên xóa các dữ liệu ở storage
      localStorage.clear();
      return response;
    } catch (error) {
      throw error;
    }
  },

  /* ================= WISHLIST (DANH SÁCH YÊU THÍCH) ================= */

  /**
   * Lấy danh sách wishlist của user
   * BE: router.get("/wishlist", ...)
   */
  getWishlist: async () => {
    try {
      const response = await api.get("/accounts/wishlist");
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Thêm sản phẩm vào wishlist
   * BE: router.post("/wishlist/add", ...)
   */
  addToWishlist: async (productId) => {
    try {
      const response = await api.post("/accounts/wishlist/add", { productId });
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Xóa sản phẩm khỏi wishlist
   * BE: router.delete("/wishlist/remove", ...)
   */
  removeFromWishlist: async (productId) => {
    try {
      // Lưu ý: Với axios.delete, dữ liệu gửi đi nằm trong property 'data'
      const response = await api.delete("/accounts/wishlist/remove", {
        data: { productId }
      });
      return response;
    } catch (error) {
      throw error;
    }
  }
};

export default AccountService;