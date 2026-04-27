import axios from "axios";

const resolveApiOrigin = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) return envUrl;

  if (typeof window !== "undefined" && window.location.hostname === "localhost") {
    return "http://localhost:3000";
  }

  return import.meta.env.PROD ? "https://car-api-x622.onrender.com" : "http://localhost:3000";
};

const API_URL = resolveApiOrigin();

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  isRefreshing = false;
  failedQueue = [];
};

const handleLogout = () => {
  // Clear all auth data
  localStorage.removeItem("authToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
  localStorage.removeItem("authUsername");
  localStorage.removeItem("authEmail");
  localStorage.removeItem("token");

  // Dispatch event for components to listen to
  window.dispatchEvent(new Event("auth-expired"));

  // Redirect to login
  if (window.location.pathname !== "/login") {
    window.location.href = "/login";
  }
};

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config;

    // If the error is 401 or 403 (token expired/invalid)
    if ((error.response?.status === 401 || error.response?.status === 403) && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => {
            handleLogout();
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem("refreshToken");

      if (!refreshToken) {
        handleLogout();
        return Promise.reject(error);
      }

      return api
        .post("/users/refresh-token", { refreshToken })
        .then((response) => {
          const { token } = response.data;
          localStorage.setItem("authToken", token);
          api.defaults.headers.common.Authorization = `Bearer ${token}`;
          originalRequest.headers.Authorization = `Bearer ${token}`;

          processQueue(null, token);
          return api(originalRequest);
        })
        .catch((err) => {
          processQueue(err, null);
          handleLogout();
          return Promise.reject(err);
        });
    }

    return Promise.reject(error);
  }
);

export default api;
