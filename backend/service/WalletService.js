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
    throw createError("ID ví không hợp lệ", 400);
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
      throw createError("Vui lòng nhập địa chỉ ví", 400);
    }

    if (!isValidEthereumAddress(address)) {
      throw createError("Địa chỉ ví không hợp lệ", 400);
    }

    const normalizedAddress = address.toLowerCase();

    const existedWallet = await Wallet.findOne({
      user: userId,
      address: normalizedAddress,
    });

    if (existedWallet) {
      throw createError("Ví này đã tồn tại", 409);
    }

    if (isDefault) {
      await Wallet.updateMany(
        { user: userId },
        { $set: { isDefault: false } }
      );
    }

    return await Wallet.create({
      user: userId,
      name,
      address: normalizedAddress,
      network,
      isDefault: Boolean(isDefault),
    });
  } catch (error) {
    if (error.code === 11000) {
      throw createError("Ví này đã tồn tại", 409);
    }

    throw error;
  }
};

export const updateWalletById = async (userId, walletId, payload) => {
  try {
    validateObjectId(walletId);

    const { name, address, network, isDefault } = payload;

    const wallet = await Wallet.findOne({
      _id: walletId,
      user: userId,
    });

    if (!wallet) {
      throw createError("Không tìm thấy ví", 404);
    }

    if (address) {
      if (!isValidEthereumAddress(address)) {
        throw createError("Địa chỉ ví không hợp lệ", 400);
      }

      const normalizedAddress = address.toLowerCase();

      const existedWallet = await Wallet.findOne({
        _id: { $ne: walletId },
        user: userId,
        address: normalizedAddress,
      });

      if (existedWallet) {
        throw createError("Ví này đã tồn tại", 409);
      }

      wallet.address = normalizedAddress;
    }

    if (name !== undefined) wallet.name = name;
    if (network !== undefined) wallet.network = network;

    if (isDefault === true) {
      await Wallet.updateMany(
        { user: userId, _id: { $ne: walletId } },
        { $set: { isDefault: false } }
      );

      wallet.isDefault = true;
    }

    if (isDefault === false) {
      wallet.isDefault = false;
    }

    return await wallet.save();
  } catch (error) {
    if (error.code === 11000) {
      throw createError("Ví này đã tồn tại", 409);
    }

    throw error;
  }
};

export const deleteWalletById = async (userId, walletId) => {
  validateObjectId(walletId);

  const wallet = await Wallet.findOneAndDelete({
    _id: walletId,
    user: userId,
  });

  if (!wallet) {
    throw createError("Không tìm thấy ví", 404);
  }

  return wallet;
};