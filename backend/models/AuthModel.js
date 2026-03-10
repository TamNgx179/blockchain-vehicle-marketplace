import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phoneNumber: { type: String, default: null },
    password: { type: String, required: false },
    address: { type: String },
    googleId: { type: String, unique: true, sparse: true },
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    isadmin: { type: Boolean, default: false, required: true },
    isVerified: { type: Boolean, default: false },
    refreshToken: { type: String },
  },
  { timestamps: true }
);

const User = mongoose.model("User", UserSchema);
export default User;