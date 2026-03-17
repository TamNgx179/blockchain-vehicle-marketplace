import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import session from "express-session";
import passport from "./config/passport.js";
import connectDB from "./config/db.js";
import Product from "./routes/Product.js";
import User from "./routes/AuthRoute.js";
import Account from "./routes/AccountRoute.js";
import Review from "./routes/ReviewRoute.js";
import Contact from "./routes/ContactRoute.js";
import Cart from "./routes/CartRoute.js";

const app = express();

// Kết nối Database
connectDB();

// Middleware
app.use(cors()); 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Cấu hình express-session
app.use(
  session({
    secret: "your_secret_key", // Chuỗi bí mật để mã hóa session
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }, // 24h
  })
);

// Khởi tạo Passport
app.use(passport.initialize());
app.use(passport.session()); 

// Routes
app.use("/api/products", Product);
app.use("/api/users", User);
app.use("/api/accounts", Account);
app.use("/api/reviews", Review);
app.use("/api/contacts", Contact);
app.use("/api/cart", Cart);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`API Server đang chạy tại: http://localhost:${PORT}`)
);
