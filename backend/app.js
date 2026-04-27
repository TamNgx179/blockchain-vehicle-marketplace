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
app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = new Set([
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://192.168.0.4:5173",
      ]);

      if (!origin) return callback(null, true);
      if (allowedOrigins.has(origin)) return callback(null, true);

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);
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

app.get("/", (req, res) => {
  res.json({
    message: "Car API is running",
    endpoints: [
      "/api/products",
      "/api/users",
      "/api/accounts",
      "/api/reviews",
      "/api/contacts",
      "/api/cart",
      "/api/orders",
      "/api/dashboard",
    ],
  });
});

app.get("/healthz", (req, res) => {
  res.status(200).json({ status: "ok" });
});

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
