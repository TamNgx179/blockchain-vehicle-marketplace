import express from "express";
import * as contactCtrl from "../controllers/ContactCtrl.js";
import authenticateToken, {requireAdmin} from "../middlewares/authMiddleware.js";

const router = express.Router();

//Chỉ admin mới có quyền xem tất cả liên hệ
router.get("/getAll", authenticateToken, requireAdmin, contactCtrl.getAllContacts);

//Người dùng đã đăng nhập có thể tạo liên hệ mới
router.post("/create", authenticateToken, contactCtrl.createContact);

//Chỉ admin mới có quyền đánh dấu đã đọc và xem chi tiết liên hệ
router.put("/read/:id", authenticateToken, requireAdmin, contactCtrl.readContact);
router.get("/:id", authenticateToken, requireAdmin, contactCtrl.getContactById);

export default router;