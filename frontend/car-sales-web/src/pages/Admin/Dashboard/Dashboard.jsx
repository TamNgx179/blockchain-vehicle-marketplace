import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Users, Package, DollarSign, CheckCircle,
  Clock, ShoppingBag, CreditCard, Activity
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend
} from "recharts";
import DashboardService from "../../../services/dashboardService"; // Đường dẫn tới file service của bạn
import "./Dashboard.css";
const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [orderStatus, setOrderStatus] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [blockchain, setBlockchain] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [resSummary, resRevenue, resTop, resStatus, resRecent, resBlockchain] = await Promise.all([
        DashboardService.getSummary(),
        DashboardService.getRevenue(7),
        DashboardService.getTopProducts(),
        DashboardService.getOrderStatus(),
        DashboardService.getRecentOrders(),
        DashboardService.getBlockchainStats(),
      ]);
      console.log("Response resRevenue:", resRevenue);
      setSummary(resSummary.data);
      setRevenueData(resRevenue.data);
      setTopProducts(resTop.data);
      setOrderStatus(resStatus.data);
      setRecentOrders(resRecent.data);
      setBlockchain(resBlockchain.data);
      console.log("Dữ liệu Summary:", resSummary.data);
      console.log("Dữ liệu Revenue:", resRevenue.data);
      console.log("Dữ liệu Top Products:", resTop.data);
      console.log("Dữ liệu Order Status:", resStatus.data);
      console.log("Dữ liệu Recent Orders:", resRecent.data);
      console.log("Dữ liệu Blockchain:", resBlockchain.data);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Đang tải dữ liệu...</div>;

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];
  const STATUS_LABELS = {
    processing: "Đang xử lý",
    cancelled: "Đã hủy",
    completed: "Hoàn thành",
    pending_payment: "Chờ thanh toán",
    deposit_paid: "Đã đặt cọc",
    pending_deposit: "Chờ đặt cọc"
  };
  return (
    <div className="dashboard-container">
      {/* Header Section */}
      <div className="dashboard-header">
        <div className="header-title">
          <h1>Hệ thống Quản trị</h1>
          <p>Chào buổi sáng, đây là những gì đang diễn ra hôm nay.</p>
        </div>
        <div className="header-actions">
          <button className="btn-export">Xuất báo cáo</button>
          <button onClick={fetchDashboardData} className="btn-refresh">
            Làm mới dữ liệu
          </button>
        </div>
      </div>

      {/* 1. STAT CARDS */}
      <div className="stat-grid">
        {/* 1. Tổng người dùng - Giữ nguyên */}
        <StatCard
          title="Tổng người dùng"
          value={summary?.totalUsers}
          trend="+12%"
          icon={<Users size={20} />}
          colorClass="text-blue-600"
          bgColorClass="bg-blue-100"
        />

        {/* 2. Tiền thực thu (Total Paid) - CỰC KỲ QUAN TRỌNG */}
        <StatCard
          title="Tổng tiền thực thu"
          value={`${summary?.totalPaid?.toLocaleString()}đ`}
          trend="Dòng tiền thực"
          icon={<Activity size={20} />}
          colorClass="text-emerald-600"
          bgColorClass="bg-emerald-100"
        />

        {/* 3. Doanh thu (Completed) - Chỉ tính đơn đã xong */}
        <StatCard
          title="Doanh thu (Đã chốt)"
          value={`${summary?.totalRevenue?.toLocaleString()}đ`}
          trend={`${summary?.completedOrders} đơn`}
          icon={<DollarSign size={20} />}
          colorClass="text-cyan-600"
          bgColorClass="bg-cyan-100"
        />

        {/* 4. Tổng giá trị đơn (Total Order Value) - Tiềm năng */}
        <StatCard
          title="Tổng giá trị đặt hàng"
          value={`${summary?.totalOrderValue?.toLocaleString()}đ`}
          trend={`${summary?.totalOrders} đơn`}
          icon={<Package size={20} />}
          colorClass="text-purple-600"
          bgColorClass="bg-purple-100"
        />

        {/* 5. Tỉ lệ thanh toán - Hiệu suất thu tiền */}
        <StatCard
          title="Tỉ lệ thanh toán"
          value={`${summary?.paymentRate?.toFixed(1)}%`}
          trend="Trên tổng đơn"
          icon={<CreditCard size={20} />}
          colorClass="text-amber-600"
          bgColorClass="bg-amber-100"
        />

        {/* 6. Đơn hàng mới hôm nay */}
        <StatCard
          title="Đơn hàng mới"
          value={summary?.todayOrders}
          trend="Hôm nay"
          icon={<ShoppingBag size={20} />}
          colorClass="text-indigo-600"
          bgColorClass="bg-indigo-100"
        />
      </div>

      {/* Main Charts Section */}
      <div className="charts-grid">
        <div className="chart-card revenue-chart-container animate-fade-in">
          <div className="chart-header">
            <h3 className="chart-title">Phân tích doanh thu</h3>
            <div className="custom-select">
              <select className="chart-select">
                <option>7 ngày qua</option>
                <option>30 ngày qua</option>
              </select>
              <span className="arrow"></span>
            </div>
          </div>
          <div className="revenue-chart-wrapper">
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="_id" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={4} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="chart-card animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <h3 className="chart-title">Trạng thái đơn hàng</h3>
          <div className="pie-chart-wrapper">
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={orderStatus}
                  dataKey="count"
                  nameKey="_id"
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={90}
                  paddingAngle={5}
                  // Hiển thị tên trực tiếp trên biểu đồ (tùy chọn)
                  label={({ _id, percent }) => `${STATUS_LABELS[_id] || _id} ${(percent * 100).toFixed(0)}%`}
                >
                  {orderStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>

                <Tooltip
                  formatter={(value, name) => [value, STATUS_LABELS[name] || name]}
                />

                {/* Phần chú giải ở dưới biểu đồ */}
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value) => <span style={{ color: '#333', fontWeight: 500 }}>{STATUS_LABELS[value] || value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="bottom-grid">
        <div className="table-container animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="table-header">
            <h3 className="chart-title">Giao dịch gần đây</h3>
            <Link to="/admin/orders" className="btn-text">
              Xem tất cả
            </Link>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="recent-table">
              <thead>
                <tr>
                  <th>Khách hàng</th>
                  <th>Sản phẩm</th>
                  <th>Loại</th>
                  <th>Thanh toán</th>
                  <th>Trạng thái</th>
                  <th>Ngày tạo</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order._id}>
                    {/* Cột Khách hàng */}
                    <td>
                      <div className="user-info">
                        <div className="avatar-circle">
                          {order.userId?.username?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: '700', color: '#334155' }}>{order.userId?.username}</div>
                          <div style={{ fontSize: '11px', color: '#94a3b8' }}>{order.userId?.email}</div>
                        </div>
                      </div>
                    </td>

                    {/* Cột Sản phẩm (Lấy item đầu tiên) */}
                    <td style={{ fontSize: '14px', color: '#475569' }}>
                      {order.items[0]?.name} {order.items.length > 1 && `+${order.items.length - 1}`}
                    </td>

                    {/* Cột Payment Type */}
                    <td>
                      <span style={{
                        fontSize: '12px',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        backgroundColor: order.paymentType === 'deposit' ? '#e0f2fe' : '#f1f5f9',
                        color: order.paymentType === 'deposit' ? '#0369a1' : '#475569'
                      }}>
                        {order.paymentType === 'deposit' ? 'Đặt cọc' : 'Trả hết'}
                      </span>
                    </td>

                    {/* Cột Số tiền (Đã trả / Tổng) */}
                    <td>
                      <div style={{ fontWeight: '700', color: '#1e293b' }}>
                        {order.paidAmount?.toLocaleString()}đ
                      </div>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                        Tổng: {order.totalAmount?.toLocaleString()}đ
                      </div>
                    </td>

                    {/* Cột Trạng thái */}
                    <td>
                      <span className={`status-pill ${getStatusColor(order.status)}`}>
                        {STATUS_LABELS[order.status] || order.status}
                      </span>
                    </td>

                    {/* Cột Ngày tháng */}
                    <td style={{ fontSize: '13px', color: '#64748b' }}>
                      {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="blockchain-card animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <div className="blockchain-header">
            <Activity size={24} color="#3b82f6" />
            <h3 className="chart-title" style={{ color: 'white' }}>Dữ liệu Blockchain & Tài chính</h3>
          </div>

          <div className="blockchain-grid">
            {/* Hàng 1: Các con số tiền tệ */}
            <div>
              <p style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '4px' }}>Tổng tiền đã thu</p>
              <p style={{ fontSize: '1.25rem', fontWeight: '700', color: '#34d399' }}>
                {blockchain?.totalPaid?.toLocaleString()}đ
              </p>
            </div>
            <div>
              <p style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '4px' }}>Tiền chờ thu</p>
              <p style={{ fontSize: '1.25rem', fontWeight: '700', color: '#fbbf24' }}>
                {blockchain?.remainingAmount?.toLocaleString()}đ
              </p>
            </div>

            {/* Hàng 2: Chỉ số Blockchain */}
            <div style={{ marginTop: '1rem' }}>
              <p style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '4px' }}>Blockchain Deposit</p>
              <p style={{ fontSize: '1.1rem', fontWeight: '600', color: '#60a5fa' }}>
                {blockchain?.blockchainDeposit?.toLocaleString()}đ
              </p>
            </div>
            <div style={{ marginTop: '1rem' }}>
              <p style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '4px' }}>Đơn đã xác thực</p>
              <p style={{ fontSize: '1.1rem', fontWeight: '600', color: '#a78bfa' }}>
                {blockchain?.blockchainOrders} <span style={{ fontSize: '12px', fontWeight: 'normal' }}>đơn</span>
              </p>
            </div>
          </div>

          {/* Phần các thanh Progress Bar */}
          <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '15px' }}>

            {/* Thanh tỉ lệ Thanh toán */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                <span style={{ color: '#94a3b8' }}>Tỉ lệ thanh toán (Revenue)</span>
                <span style={{ color: '#34d399' }}>{blockchain?.paymentRate?.toFixed(1)}%</span>
              </div>
              <div className="progress-bar-bg" style={{ height: '6px', backgroundColor: 'rgba(255,255,255,0.1)' }}>
                <div className="progress-bar-fill" style={{
                  width: `${blockchain?.paymentRate}%`,
                  backgroundColor: '#34d399',
                  height: '100%',
                  borderRadius: '4px'
                }}></div>
              </div>
            </div>

            {/* Thanh tỉ lệ Đặt cọc */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                <span style={{ color: '#94a3b8' }}>Tỉ lệ đặt cọc</span>
                <span style={{ color: '#60a5fa' }}>{blockchain?.depositRate?.toFixed(1)}%</span>
              </div>
              <div className="progress-bar-bg" style={{ height: '6px', backgroundColor: 'rgba(255,255,255,0.1)' }}>
                <div className="progress-bar-fill" style={{
                  width: `${blockchain?.depositRate}%`,
                  backgroundColor: '#60a5fa',
                  height: '100%',
                  borderRadius: '4px'
                }}></div>
              </div>
            </div>

            {/* Thanh tỉ lệ Hoàn tất */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                <span style={{ color: '#94a3b8' }}>Tỉ lệ hoàn tất đơn</span>
                <span style={{ color: '#3b82f6' }}>{blockchain?.completionRate?.toFixed(1)}%</span>
              </div>
              <div className="progress-bar-bg" style={{ height: '6px', backgroundColor: 'rgba(255,255,255,0.1)' }}>
                <div className="progress-bar-fill" style={{
                  width: `${blockchain?.completionRate}%`,
                  backgroundColor: '#3b82f6',
                  height: '100%',
                  borderRadius: '4px'
                }}></div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, trend, icon, colorClass, bgColorClass }) => (
  <div className="stat-card">
    <div className="stat-card-header">
      <div className={`icon-box ${bgColorClass} ${colorClass}`}>
        {icon}
      </div>
      <span className="trend-badge">{trend}</span>
    </div>
    <div className="stat-value">
      <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>{title}</p>
      <h4>{value}</h4>
    </div>
  </div>
);
const getStatusColor = (status) => {
  switch (status) {
    case "completed":
      return "status-completed";
    case "processing":
      return "status-processing";
    case "pending_deposit":
      return "status-pending";
    case "cancelled":
      return "status-cancelled";
    default:
      return "status-default";
  }
};
export default Dashboard;
