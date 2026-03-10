import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    brand: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    description: { type: String },  //Mô tả chi tiết về sản phẩm
    category: { type: String, required: true },
    thumbnailImage: { type: String, default: "",required: true },   // ảnh card ngoài
    heroImage: { type: String, default: "", required: true },        // ảnh lớn trang chi tiết
    galleryImages: { type: [String], default: [] }, // ảnh photo gallery
    stock: { type: Number, default: 0, min: 0 },

    specifications: {
        engine: String,
        horsepower: Number,
        fuelType: String,
        transmission: String
    },

    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 }

}, { timestamps: true });

export default mongoose.model('Product', productSchema);