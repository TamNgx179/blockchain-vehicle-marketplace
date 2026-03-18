import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
{
  name: { type: String, required: true },
  brand: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  description: { type: String },

  category: { type: String, required: true },

  thumbnailImage: { type: String, default: "", required: true },
  heroImage: { type: String, default: "", required: true },
  galleryImages: { type: [String], default: [] },

  stock: { type: Number, default: 0, min: 0 },

  // ===== SPECS =====
  specifications: {
    type: {
      model: String,
      engine: String,
      power: Number,
      torque: Number,

      gear: Number, // số cấp số

      topSpeed: Number,

      dimensions: {
        length: Number,
        width: Number,
        height: Number,
      },

      weight: Number,
      fuelConsumption: Number
    },
    required: true,
  },

  safety: {
    type: [String],
    default: [],
  },

  convenience: {
    type: [String],
    default: [],
  },

  averageRating: { type: Number, default: 0, min: 0, max: 5 },
  reviewCount: { type: Number, default: 0 },
},
{ timestamps: true }
);

export default mongoose.model("Product", productSchema);