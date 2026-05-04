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
      default: "MetaMask",
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

// One user cannot save the same wallet address more than once.
WalletSchema.index({ user: 1, address: 1 }, { unique: true });

const Wallet = mongoose.model("Wallet", WalletSchema);

export default Wallet;
