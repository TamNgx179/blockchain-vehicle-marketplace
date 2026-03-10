import {
    createReviewService,
    getReviewsByProductIdService
} from "../service/ReviewService.js";

// Tạo đánh giá mới
export const createReview = async (req, res) => {
    try {
        const { productId, rating, comment } = req.body;
        const userId = req.user?.id; // lấy từ token do đã chạy authMiddleware
        const numericRating = Number(rating);
        
        const review = await createReviewService({ productId, userId, rating: numericRating, comment });
        res.status(201).json(review);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

// Lấy tất cả đánh giá của một sản phẩm
export const getReviewsByProductId = async (req, res) => {
    try {
        const { productId } = req.params;
        const reviews = await getReviewsByProductIdService(productId);
        res.status(200).json(reviews);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}