import mongoose from "mongoose";

const WalletSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    name: {
      type: String,
      trim: true,
      default: "Ví của tôi",
    },

    address: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    network: {
      type: String,
      enum: ["ethereum", "sepolia"],
      default: "sepolia",
    },

    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// 1 user không được lưu trùng cùng 1 địa chỉ ví
WalletSchema.index({ user: 1, address: 1 }, { unique: true });

const Wallet = mongoose.model("Wallet", WalletSchema);

export default Wallet;