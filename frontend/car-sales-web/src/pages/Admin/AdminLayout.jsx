import React, { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import {
  ChevronLeft,
  Menu,
  LayoutDashboard,
  MessageSquareText,
  ShoppingBag,
  Package,
  LogOut
} from "lucide-react";
import "./AdminLayout.css";

const AdminLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  // Hàm kiểm tra link đang active để tô màu menu
  const isActive = (path) => location.pathname === path;

  return (
    <div className={`admin-container ${isCollapsed ? "sidebar-collapsed" : ""}`}>
      {/* SIDEBAR */}
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          {!isCollapsed && <span className="brand-name">CAR ADMIN</span>}
          <button
            className="toggle-btn"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        <nav className="sidebar-nav">
          <ul>
            <li>
              <Link to="/admin" className={isActive("/admin") ? "active" : ""}>
                <LayoutDashboard size={20} />
                <span>Thống kê chung</span>
              </Link>
            </li>
            <li>
              <Link to="/admin/orders" className={isActive("/admin/orders") ? "active" : ""}>
                <ShoppingBag size={20} />
                <span>Quản lý đơn hàng</span>
              </Link>
            </li>
            <li>
              <Link to="/admin/contacts" className={isActive("/admin/contacts") ? "active" : ""}>
                <MessageSquareText size={20} />
                <span>Quản lý liên hệ</span>
              </Link>
            </li>
            <li>
              <Link to="/admin/products" className={isActive("/admin/products") ? "active" : ""}>
                <Package size={20} />
                <span>Quản lý sản phẩm</span>
              </Link>
            </li>
          </ul>
        </nav>

        <div className="sidebar-footer">
          <Link to="/">
            <LogOut size={20} />
            <span>Thoát Admin</span>
          </Link>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="admin-main">
        <header className="main-header">
          <div className="breadcrumb">
            Admin / {location.pathname.split("/").pop() || "Dashboard"}
          </div>
        </header>
        <div className="admin-content-inner">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
