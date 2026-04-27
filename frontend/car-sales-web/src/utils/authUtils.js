/**
 * Utility functions for authentication
 */

/**
 * Clear all auth data and redirect to login
 */
export const handleLogout = () => {
  localStorage.removeItem("authToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("authUsername");
  localStorage.removeItem("authEmail");

  window.dispatchEvent(new Event("auth-change"));
  window.dispatchEvent(new Event("auth-expired"));

  if (window.location.pathname !== "/login") {
    window.location.href = "/login";
  }
};

/**
 * Check if token exists in localStorage
 */
export const hasToken = () => {
  return !!(
    localStorage.getItem("authToken") ||
    localStorage.getItem("token")
  );
};

/**
 * Get stored token
 */
export const getToken = () => {
  return localStorage.getItem("authToken") || localStorage.getItem("token");
};

/**
 * Get refresh token
 */
export const getRefreshToken = () => {
  return localStorage.getItem("refreshToken");
};

/**
 * Get user data from localStorage
 */
export const getStoredUser = () => {
  try {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
};

/**
 * Check if JWT token is expired
 */
export const isTokenExpired = (token) => {
  if (!token) return true;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));

    if (!payload.exp) return true;

    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
  const token = getToken();

  if (!token || isTokenExpired(token)) {
    return false;
  }

  return true;
};