/**
 * Utility functions for authentication
 */

/**
 * Clear all auth data and redirect to login
 */
export const handleLogout = () => {
  // Clear all auth data
  localStorage.removeItem("authToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("authUsername");
  localStorage.removeItem("authEmail");

  // Dispatch events for components to listen to
  window.dispatchEvent(new Event("auth-change"));
  window.dispatchEvent(new Event("auth-expired"));

  // Redirect to login if not already there
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
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
  return hasToken();
};
