import { useRef, lazy, Suspense, useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import CarDetail from "./pages/CarDetail";
import Cars from "./pages/Cars";
import Checkout from './pages/Checkout/Checkout';
import { CartProvider } from "./context/CartContext";
import Notification from './components/Notification/Notification';
import Auth from "./pages/Auth";
import AccountService from "./services/AccountService"; // Import service của bạn
import AdminLayout from "./pages/Admin/AdminLayout";
const AdminDashboard = lazy(() => import("./pages/Admin/Dashboard/Dashboard"));
const OrderList = lazy(() => import("./pages/Admin/Orders/OrderList"));
const ProductList = lazy(() => import("./pages/Admin/Products/ProductList"));
import ProductEdit from "./pages/Admin/ProductEdit/ProductEdit";
// --- 1. PROTECTED ROUTE (Cho User đã đăng nhập) ---
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token"); // Đổi thành "token" cho khớp với AuthService
  return token ? children : <Navigate to="/login" replace />;
};

// --- 2. ADMIN ROUTE (Check quyền qua API) ---
const AdminRoute = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const verifyAdmin = async () => {
      if (!token) {
        setIsAdmin(false);
        return;
      }
      try {
        const res = await AccountService.getProfile();
        // console.log("Response từ API getProfile:", res);
        const profile = await res.data.data; // Lấy thông tin user từ response
        // console.log("Thông tin profile từ API:", profile);
        // Kiểm tra đúng trường 'role' trong response BE của bạn
        // console.log("Trường role trong profile:", profile.isadmin);
        if (profile && profile.isadmin === true) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        console.error("Xác thực Admin thất bại:", error);
        setIsAdmin(false);
      }
    };
    verifyAdmin();
  }, [token]);

  if (isAdmin === null) return <div>Đang kiểm tra quyền truy cập...</div>;
  return isAdmin ? children : <Navigate to="/" replace />;
};

function App() {
  const notifyRef = useRef();

  return (
    <CartProvider>
      <Notification ref={notifyRef} />
      <BrowserRouter>
        <Suspense fallback={<div>Đang tải trang...</div>}>
          <Routes>
            {/* PUBLIC */}
            <Route path="/login" element={<Auth initialMode="login" />} />
            <Route path="/signup" element={<Auth initialMode="signup" />} />

            {/* PRIVATE */}
            <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
            <Route path="/cars" element={<PrivateRoute><Cars /></PrivateRoute>} />
            <Route path="/product/:id" element={<PrivateRoute><CarDetail /></PrivateRoute>} />
            <Route path="/checkout" element={<PrivateRoute><Checkout notifyRef={notifyRef} /></PrivateRoute>} />

            {/* ADMIN ONLY */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminLayout /> {/* Cái khung bảo vệ */}
                </AdminRoute>
              }
            >
              {/* path="/admin" -> Hiện trang Dashboard (biểu đồ bạn đã viết) */}
              <Route index element={<AdminDashboard />} />

              {/* path="/admin/orders" -> Hiện danh sách đơn */}
              <Route path="orders" element={<OrderList />} />

              {/* path="/admin/products" -> Hiện danh sách sản phẩm */}
              <Route path="products" element={<ProductList />} />
              <Route path="productEdit/:id" element={<ProductEdit />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </CartProvider >
  );
}

export default App;