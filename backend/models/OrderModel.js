import mongoose from "mongoose";

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

    sellerWallet: {
      type: String,
      required: true,
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
    },

    depositPaidAt: {
      type: Date,
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