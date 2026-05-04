import {
  getWalletsByUserId,
  createWallet,
  updateWalletById,
  deleteWalletById,
} from "../service/WalletService.js";

const handleError = (res, error) => {
  return res.status(error.statusCode || 500).json({
    message: error.message || "Server error",
  });
};

export const getMyWallets = async (req, res) => {
  try {
    const wallets = await getWalletsByUserId(req.user.id);

    return res.status(200).json({
      message: "Wallets loaded successfully",
      data: wallets,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

export const addWallet = async (req, res) => {
  try {
    const wallet = await createWallet(req.user.id, req.body);

    return res.status(201).json({
      message: "Wallet added successfully",
      data: wallet,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

export const updateWallet = async (req, res) => {
  try {
    const wallet = await updateWalletById(req.user.id, req.params.id, req.body);

    return res.status(200).json({
      message: "Default wallet updated successfully",
      data: wallet,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

export const deleteWallet = async (req, res) => {
  try {
    const wallet = await deleteWalletById(req.user.id, req.params.id);

    return res.status(200).json({
      message: "Wallet removed successfully",
      data: wallet,
    });
  } catch (error) {
    return handleError(res, error);
  }
};
