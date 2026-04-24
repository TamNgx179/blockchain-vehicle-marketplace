import React, { useEffect, useState } from "react";
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
        <StatCard
          title="Tổng người dùng"
          value={summary?.totalUsers}
          trend="+12%"
          icon={<Users size={20} />}
          colorClass="text-blue-600"
          bgColorClass="bg-blue-100"
        />
        <StatCard
          title="Doanh thu"
          value={`${summary?.totalRevenue?.toLocaleString()}đ`}
          trend="+8.4%"
          icon={<DollarSign size={20} />}
          colorClass="text-emerald-600"
          bgColorClass="bg-emerald-100"
        />
        <StatCard
          title="Tỉ lệ thanh toán"
          value={`${summary?.paymentRate?.toFixed(1)}%`}
          trend="Ổn định"
          icon={<CreditCard size={20} />}
          colorClass="text-amber-600"
          bgColorClass="bg-amber-100"
        />
        <StatCard
          title="Đơn hàng mới"
          value={summary?.todayOrders}
          trend="Mới"
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
            <div class="custom-select">
              <select class="chart-select">
                <option>7 ngày qua</option>
                <option>30 ngày qua</option>
              </select>
              <span class="arrow"></span>
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
                <Pie data={orderStatus} dataKey="count" nameKey="_id" cx="50%" cy="50%" innerRadius={70} outerRadius={90}>
                  {orderStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
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
            <button className="btn-text">Xem tất cả</button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="recent-table">
              <thead>
                <tr>
                  <th>Khách hàng</th>
                  <th>Số tiền</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order._id}>
                    <td>
                      <div className="user-info">
                        <div className="avatar-circle">
                          {order.userId?.username?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: '700', color: '#334155' }}>{order.userId?.username}</div>
                          <div style={{ fontSize: '12px', color: '#94a3b8' }}>{order.userId?.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontWeight: '700' }}>{order.totalAmount?.toLocaleString()}đ</td>
                    <td>
                      <span className={`status-pill ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
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
            <h3 className="chart-title" style={{ color: 'white' }}>Dữ liệu Blockchain</h3>
          </div>
          <div className="blockchain-grid">
            <div>
              <p style={{ color: '#94a3b8', fontSize: '14px' }}>Tổng đặt cọc</p>
              <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#60a5fa' }}>
                {blockchain?.blockchainDeposit?.toLocaleString()}đ
              </p>
            </div>
            <div>
              <p style={{ color: '#94a3b8', fontSize: '14px' }}>Xác thực</p>
              <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#34d399' }}>
                {blockchain?.blockchainOrders}
              </p>
            </div>
          </div>
          <div style={{ marginTop: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
              <span style={{ color: '#94a3b8' }}>Tỉ lệ hoàn tất</span>
              <span style={{ color: '#3b82f6' }}>{blockchain?.completionRate?.toFixed(1)}%</span>
            </div>
            <div className="progress-bar-bg">
              <div className="progress-bar-fill" style={{ width: `${blockchain?.completionRate}%` }}></div>
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
