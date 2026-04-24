import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import session from "express-session";
import path from "path";
import { fileURLToPath } from "url";
import passport from "./config/passport.js";
import connectDB from "./config/db.js";

// Import Routes
import ProductRoutes from "./routes/Product.js";
import UserRoutes from "./routes/AuthRoute.js";
import AccountRoutes from "./routes/AccountRoute.js";
import ReviewRoutes from "./routes/ReviewRoute.js";
import ContactRoutes from "./routes/ContactRoute.js";
import CartRoutes from "./routes/CartRoute.js";
import OrderRoutes from "./routes/OrderRoutes.js";
import DashboardRoutes from "./routes/DashboardRoute.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Kết nối Database
connectDB();

// Middleware cơ bản
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Cấu hình Session
app.use(session({
  secret: process.env.SESSION_SECRET || "your_secret_key",
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 },
}));

// Khởi tạo Passport
app.use(passport.initialize());
app.use(passport.session());

// Phục vụ file tĩnh (Xem ảnh)
app.use('/images', express.static(path.join(__dirname, 'public/images')));

// --- Routes ---
app.use("/api/products", ProductRoutes);
app.use("/api/users", UserRoutes);
app.use("/api/accounts", AccountRoutes);
app.use("/api/reviews", ReviewRoutes);
app.use("/api/contacts", ContactRoutes);
app.use("/api/cart", CartRoutes);
app.use("/api/orders", OrderRoutes);
app.use("/api/dashboard", DashboardRoutes);

// Middleware xử lý lỗi tập trung
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    message: err.message || "Lỗi Server nội bộ",
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`API Server đang chạy tại: http://localhost:${PORT}`)
);