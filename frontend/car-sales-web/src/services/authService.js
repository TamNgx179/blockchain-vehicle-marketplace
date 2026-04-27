import api from "./api";

const API_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD
    ? "https://car-api-x622.onrender.com"
    : "http://localhost:3000");

const AuthService = {
  // Đăng ký tài khoản mới
  register: (data) => api.post("/users/register", data),

  // Xác thực mã OTP sau khi đăng ký hoặc để reset pass
  verifyOtp: (email, otp) => api.post("/users/verifyOtp", { email, otp }),

  // Đăng nhập
  login: async (email, password) => {
    const response = await api.post("/users/login", { email, password });

    const { token, refreshToken, user } = response.data;

    if (token) {
      localStorage.setItem("authToken", token);
      localStorage.setItem("token", token); 
      if (refreshToken) {
        localStorage.setItem("refreshToken", refreshToken);
      }

      if (user) {
        localStorage.setItem("user", JSON.stringify(user));

        if (user.username) {
          localStorage.setItem("authUsername", user.username);
        }

        if (user.email) {
          localStorage.setItem("authEmail", user.email);
        }
      }

      window.dispatchEvent(new Event("auth-change"));
    }

    return response;
  },

  // Đăng nhập bằng Google
  googleLogin: () => {
    window.location.href = `${API_URL}/api/users/auth/google`;
  },

  // Quên mật khẩu - gửi OTP về mail
  forgotPassword: (email) => api.post("/users/forgot-password", { email }),

  // Đặt lại mật khẩu mới với OTP
  resetPassword: (data) => api.post("/users/reset-password", data),

  // Verify OTP cho reset password
  verifyResetOtp: (email, otp) => api.post("/users/verifyOtp", { email, otp }),

  // Làm mới access token khi hết hạn
  refreshToken: async () => {
    const response = await api.post("/users/refresh-token");

    const { token, newToken } = response.data;
    const accessToken = token || newToken;

    if (accessToken) {
      localStorage.setItem("authToken", accessToken);
      localStorage.setItem("token", accessToken);

      window.dispatchEvent(new Event("auth-change"));
    }

    return response;
  },
};

export default AuthService;
