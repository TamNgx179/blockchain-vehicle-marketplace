import mongoose from "mongoose";
import { ethers } from "ethers";

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
});

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    items: {
      type: [orderItemSchema],
      required: true,
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    depositAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    depositAmountWei: {
      type: String,
      default: "",
    },

    blockchainOrderId: {
      type: Number,
      required: true,
      unique: true,
      index: true,
    },

    buyerWallet: {
      type: String,
      default: "",
      validate: {
        validator: (v) => !v || ethers.isAddress(v),
        message: "Invalid buyer wallet address",
      },
    },

    sellerWallet: {
      type: String,
      required: true,
      validate: {
        validator: (v) => ethers.isAddress(v),
        message: "Invalid seller wallet address",
      },
    },

    paymentType: {
      type: String,
      enum: ["deposit", "full"],
      default: "deposit",
    },

    paidAmount: {
      type: Number,
      default: 0,
    },

    depositStatus: {
      type: String,
      enum: ["pending", "paid"],
      default: "pending",
    },

    depositTxHash: {
      type: String,
      default: "",
      index: true,
    },

    fullTxHash: {
      type: String,
      default: "",
      index: true,
    },

    depositPaidAt: {
      type: Date,
    },

    stockReduced: {
      type: Boolean,
      default: false,
    },

    deliveryMethod: {
      type: String,
      enum: ["pickup", "delivery"],
      required: true,
    },

    pickupInfo: {
      name: String,
      phone: String,
      pickupDate: Date,
    },

    shippingAddress: {
      name: String,
      phone: String,
      address: String,
    },

    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },

    status: {
      type: String,
      enum: [
        "pending_deposit",
        "pending_payment",
        "deposit_paid",
        "processing",
        "completed",
        "cancelled",
      ],
      default: "pending_deposit",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);