import Review from "../models/ReviewModel.js";
import Product from "../models/ProductModel.js";

// Tạo đánh giá mới và cập nhật rating sản phẩm
export const createReviewService = async (data) => {
    // destructure input once
    const { productId, userId, rating, comment } = data;

    // Validate dữ liệu đầu vào
    if (!productId || !userId || rating === undefined) {
        throw new Error("productId, userId và rating là bắt buộc");
    }

    // Đảm bảo rating là số
    const numericRating = Number(rating);
    if (isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
        throw new Error("Rating phải là số từ 1 đến 5");
    }

    // 1. Kiểm tra product tồn tại
    const product = await Product.findById(productId);
    if (!product) {
        throw new Error("Không tìm thấy sản phẩm");
    }

    // 2. Kiểm tra user đã review chưa
    const existingReview = await Review.findOne({
        productId,
        userId
    });

    if (existingReview) {
        throw new Error("User đã đánh giá sản phẩm này");
    }

    // 3. Tạo review
    const newReview = await Review.create({
        productId,
        userId,
        rating: numericRating,
        comment,
    });

    // 4. Tính rating mới (O(1))
    const newReviewCount = product.reviewCount + 1;
    const newAverageRating = (product.averageRating * product.reviewCount + numericRating) / newReviewCount;

    // 5. Update product
    product.reviewCount = newReviewCount;
    product.averageRating = newAverageRating;
    await product.save();

    return newReview;
};

// Lấy tất cả đánh giá của một sản phẩm
export const getReviewsByProductIdService = async (productId) => {
    const product = await Product.findById(productId);
    if (!product) {
        throw new Error("Không tìm thấy sản phẩm");
    }

    return await Review.find({ productId }).populate('userId', 'username');
};



