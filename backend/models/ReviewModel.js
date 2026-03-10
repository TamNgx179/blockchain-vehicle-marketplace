import mongoose from "mongoose";

/*
  reviewSchema:
  - Mỗi document đại diện cho 1 review
  - Quan hệ:
      1 Product  - N Review
      1 User     - N Review
*/
const reviewSchema = new mongoose.Schema({

    // Tham chiếu tới Product (_id của Product)
    // Dùng ObjectId vì _id của MongoDB có kiểu ObjectId
    // ref: 'Product' để có thể dùng populate()
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },

    // Tham chiếu tới User (_id của User)
    // Cho phép biết user nào đã viết review
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    // Điểm đánh giá (1 - 5)
    // min / max giúp validate dữ liệu
    rating: { type: Number, required: true, min: 1, max: 5 },

    // Nội dung nhận xét (không bắt buộc nhận xét)
    comment: { type: String, trim: true }, 

}, { 
    // Tự động thêm:
    // createdAt → thời điểm tạo review
    // updatedAt → thời điểm chỉnh sửa review
    timestamps: true 
});


/*
  Tạo compound unique index:

  Ý nghĩa:
  - Một user chỉ được review 1 product duy nhất 1 lần.
  - Nếu user cố tạo review lần 2 cho cùng product
    → MongoDB sẽ báo lỗi duplicate key.
*/
reviewSchema.index(
    { productId: 1, userId: 1 }, 
    { unique: true }
);


// Xuất model để sử dụng trong controller
export default mongoose.model("Review", reviewSchema);