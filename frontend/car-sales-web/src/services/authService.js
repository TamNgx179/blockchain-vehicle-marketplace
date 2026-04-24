import api from "./api";

const AuthService = {
  // Đăng ký tài khoản mới
  register: (data) => api.post("/users/register", data),

  // Xác thực mã OTP sau khi đăng ký hoặc để reset pass
  verifyOtp: (email, otp) => api.post("/users/verifyOtp", { email, otp }),

  // Đăng nhập
  login: async (email, password) => {
    const response = await api.post("/users/login", { email, password });
    if (response.token) {
      localStorage.setItem("token", response.token);
      localStorage.setItem("refreshToken", response.refreshToken);
      localStorage.setItem("user", JSON.stringify(response.user));
    }
    return response;
  },

  // Quên mật khẩu - gửi OTP về mail
  forgotPassword: (email) => api.post("/users/forgot-password", { email }),

  // Đặt lại mật khẩu mới với OTP
  resetPassword: (data) => api.post("/users/reset-password", data),

  // Làm mới access token khi hết hạn
  refreshToken: async () => {
    const rfToken = localStorage.getItem("refreshToken");
    const response = await api.post("/users/refresh-token", { refreshToken: rfToken });
    if (response.newToken) {
      localStorage.setItem("token", response.newToken);
    }
    return response;
  }
};

export default AuthService;