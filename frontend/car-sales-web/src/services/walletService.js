import api from "./api";

export const getMyWallets = async () => {
  const response = await api.get("/wallets");
  return response.data;
};

export const addWallet = async (walletData) => {
  const response = await api.post("/wallets", walletData);
  return response.data;
};

export const updateWallet = async (walletId, walletData) => {
  const response = await api.put(`/wallets/${walletId}`, walletData);
  return response.data;
};

export const deleteWallet = async (walletId) => {
  const response = await api.delete(`/wallets/${walletId}`);
  return response.data;
};