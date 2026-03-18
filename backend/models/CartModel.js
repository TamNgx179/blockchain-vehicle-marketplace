import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, "Số lượng phải ít nhất là 1"],
    default: 1,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
});

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    items: {
      type: [cartItemSchema],
      default: [],
    },
    totalPrice: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalItems: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

// backup hook
cartSchema.pre("save", function () {
  this.totalPrice = this.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  this.totalItems = this.items.reduce(
    (sum, item) => sum + item.quantity,
    0
  );
});

export default mongoose.model("Cart", cartSchema);