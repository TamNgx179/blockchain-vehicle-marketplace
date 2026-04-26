import api from "./api"; // Instance axios đã có interceptor gắn token

const AccountService = {
  /**
   * Lấy thông tin cá nhân của người dùng hiện tại
   * BE: router.get('/getProfile', ...)
   */
  getProfile: async () => {
    const response = await api.get("/accounts/getProfile");
    return response;
  },

  /**
   * Chỉnh sửa thông tin cá nhân (username, phoneNumber, address)
   * BE: router.put('/editProfile', ...)
   */
  editProfile: async (profileData) => {
    const response = await api.put("/accounts/editProfile", profileData);
    return response;
  },

  /**
   * Đổi mật khẩu
   * @param {Object} passwordData - { email, oldPassword, newPassword, resNewPassword }
   * BE: router.post("/changePassword", ...)
   */
  changePassword: async (passwordData) => {
    const response = await api.post("/accounts/changePassword", passwordData);
    return response;
  },

  /**
   * Xóa tài khoản chính mình
   * BE: router.delete("/me", ...)
   */
  deleteMyAccount: async () => {
    const response = await api.delete("/accounts/me");
    return response;
  },

  /**
   * Đăng xuất (xóa Refresh Token ở BE)
   * BE: router.post("/logout", ...)
   */
  logout: async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    const response = await api.post("/accounts/logout", { refreshToken });
    localStorage.clear();
    return response;
  },

  /* ================= WISHLIST (DANH SÁCH YÊU THÍCH) ================= */

  /**
   * Lấy danh sách wishlist của user
   * BE: router.get("/wishlist", ...)
   */
  getWishlist: async () => {
    const response = await api.get("/accounts/wishlist");
    return response;
  },

  /**
   * Thêm sản phẩm vào wishlist
   * BE: router.post("/wishlist/add", ...)
   */
  addToWishlist: async (productId) => {
    const response = await api.post("/accounts/wishlist/add", { productId });
    return response;
  },

  /**
   * Xóa sản phẩm khỏi wishlist
   * BE: router.delete("/wishlist/remove", ...)
   */
  removeFromWishlist: async (productId) => {
    const response = await api.delete("/accounts/wishlist/remove", {
      data: { productId },
    });
    return response;
  }
};

export default AccountService;
