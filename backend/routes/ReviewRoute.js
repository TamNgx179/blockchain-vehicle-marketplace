import express from "express";
import authenticateToken from "../middlewares/authMiddleware.js";

import * as reviewCtrl from "../controllers/ReviewCtrl.js";

const router = express.Router();

// chỉ user đã đăng nhập mới tạo đánh giá
router.post("/create", authenticateToken, reviewCtrl.createReview); // POST /api/reviews/create
router.get("/product/:productId", reviewCtrl.getReviewsByProductId); // GET /api/reviews/product/:productId

export default router;