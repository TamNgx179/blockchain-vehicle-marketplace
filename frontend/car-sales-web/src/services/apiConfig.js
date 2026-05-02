const getDevApiUrl = () => {
  if (typeof window === "undefined") return "http://localhost:3000";

  const { protocol, hostname } = window.location;
  const isLoopback = hostname === "localhost" || hostname === "127.0.0.1";

  if (isLoopback) return "http://localhost:3000";

  return `${protocol}//${hostname}:3000`;
};

export const API_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? "https://car-api-x622.onrender.com" : getDevApiUrl());
