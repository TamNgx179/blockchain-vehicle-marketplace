import mongoose from "mongoose";
import Wallet from "../models/WalletModel.js";

const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const isValidEthereumAddress = (address) => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

const validateObjectId = (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw createError("Wallet id is invalid", 400);
  }
};

export const getWalletsByUserId = async (userId) => {
  return await Wallet.find({ user: userId }).sort({
    isDefault: -1,
    createdAt: -1,
  });
};

export const createWallet = async (userId, payload) => {
  try {
    const { name, address, network, isDefault } = payload;

    if (!address) {
      throw createError("Wallet address is required", 400);
    }

    if (!isValidEthereumAddress(address)) {
      throw createError("Wallet address is invalid", 400);
    }

    const normalizedAddress = address.toLowerCase();

    const existedWallet = await Wallet.findOne({
      user: userId,
      address: normalizedAddress,
    });

    if (existedWallet) {
      throw createError("This wallet is already saved", 409);
    }

    const walletCount = await Wallet.countDocuments({ user: userId });
    const shouldBeDefault = walletCount === 0 || Boolean(isDefault);

    if (shouldBeDefault) {
      await Wallet.updateMany(
        { user: userId },
        { $set: { isDefault: false } }
      );
    }

    return await Wallet.create({
      user: userId,
      name: name?.trim() || "MetaMask",
      address: normalizedAddress,
      network: network || "sepolia",
      isDefault: shouldBeDefault,
    });
  } catch (error) {
    if (error.code === 11000) {
      throw createError("This wallet is already saved", 409);
    }

    throw error;
  }
};

export const updateWalletById = async (userId, walletId, payload = {}) => {
  validateObjectId(walletId);

  const wallet = await Wallet.findOne({
    _id: walletId,
    user: userId,
  });

  if (!wallet) {
    throw createError("Wallet not found", 404);
  }

  if (payload.isDefault !== true) {
    throw createError("Wallet details cannot be edited", 400);
  }

  await Wallet.updateMany(
    { user: userId, _id: { $ne: walletId } },
    { $set: { isDefault: false } }
  );

  wallet.isDefault = true;
  return await wallet.save();
};

export const deleteWalletById = async (userId, walletId) => {
  validateObjectId(walletId);

  const wallet = await Wallet.findOneAndDelete({
    _id: walletId,
    user: userId,
  });

  if (!wallet) {
    throw createError("Wallet not found", 404);
  }

  if (wallet.isDefault) {
    const nextDefaultWallet = await Wallet.findOne({ user: userId }).sort({
      createdAt: -1,
    });

    if (nextDefaultWallet) {
      nextDefaultWallet.isDefault = true;
      await nextDefaultWallet.save();
    }
  }

  return wallet;
};
