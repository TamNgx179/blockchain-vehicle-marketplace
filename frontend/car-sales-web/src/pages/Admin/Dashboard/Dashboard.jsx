import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  CheckCircle,
  CreditCard,
  DollarSign,
  Package,
  RefreshCw,
  ShoppingBag,
  Users,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import DashboardService from "../../../services/dashboardService";
import "./Dashboard.css";

const STATUS_CONFIG = {
  pending_deposit: { label: "Chờ đặt cọc", color: "#14b8a6", bg: "#ccfbf1" },
  pending_payment: { label: "Chờ thanh toán", color: "#2563eb", bg: "#dbeafe" },
  deposit_paid: { label: "Đã đặt cọc", color: "#f59e0b", bg: "#fef3c7" },
  processing: { label: "Đang xử lý", color: "#f97316", bg: "#ffedd5" },
  completed: { label: "Hoàn thành", color: "#7c3aed", bg: "#ede9fe" },
  cancelled: { label: "Đã hủy", color: "#ef4444", bg: "#fee2e2" },
};

const currencyFormatter = new Intl.NumberFormat("vi-VN");

const toNumber = (value) => Number(value) || 0;
const formatCurrency = (value) => `${currencyFormatter.format(toNumber(value))}đ`;
const formatNumber = (value) => currencyFormatter.format(toNumber(value));
const formatPercent = (value) => `${toNumber(value).toFixed(1)}%`;
const getResponseData = (response, fallback) => response?.data ?? response ?? fallback;
const clampPercent = (value) => Math.min(Math.max(toNumber(value), 0), 100);

const formatDateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const buildRevenueSeries = (rawData, days) => {
  const list = Array.isArray(rawData) ? rawData : [];
  const startDate = new Date();
  startDate.setHours(0, 0, 0, 0);
  startDate.setDate(startDate.getDate() - days + 1);

  const byDate = new Map(
    list.map((item) => [
      item.date || item._id,
      {
        revenue: toNumber(item.revenue ?? item.paidAmount),
        completedRevenue: toNumber(item.completedRevenue),
        orderValue: toNumber(item.orderValue),
        orders: toNumber(item.orders),
      },
    ])
  );

  return Array.from({ length: days }, (_, index) => {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + index);
    const key = formatDateKey(date);
    const item = byDate.get(key) || {};

    return {
      date: key,
      label: date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" }),
      revenue: item.revenue || 0,
      completedRevenue: item.completedRevenue || 0,
      orderValue: item.orderValue || 0,
      orders: item.orders || 0,
    };
  });
};

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [orderStatus, setOrderStatus] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [blockchain, setBlockchain] = useState(null);
  const [revenueDays, setRevenueDays] = useState(7);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchDashboardData = useCallback(async (days) => {
    setLoading(true);
    setErrorMessage("");

    const requests = await Promise.allSettled([
      DashboardService.getSummary(),
      DashboardService.getRevenue(days),
      DashboardService.getTopProducts(),
      DashboardService.getOrderStatus(),
      DashboardService.getRecentOrders(),
      DashboardService.getBlockchainStats(),
    ]);

    const hasError = requests.some((result) => result.status === "rejected");
    if (hasError) {
      setErrorMessage("Một số dữ liệu dashboard chưa tải được. Bạn có thể bấm làm mới để thử lại.");
    }

    const dataOf = (index, fallback) =>
      requests[index].status === "fulfilled"
        ? getResponseData(requests[index].value, fallback)
        : fallback;

    setSummary(dataOf(0, null));
    setRevenueData(buildRevenueSeries(dataOf(1, []), days));
    setTopProducts(dataOf(2, []));
    setOrderStatus(dataOf(3, []));
    setRecentOrders(dataOf(4, []));
    setBlockchain(dataOf(5, null));
    setLoading(false);
  }, []);

  useEffect(() => {
    const id = setTimeout(() => {
      fetchDashboardData(revenueDays);
    }, 0);

    return () => clearTimeout(id);
  }, [fetchDashboardData, revenueDays]);

  const statusData = useMemo(() => {
    const list = Array.isArray(orderStatus) ? orderStatus : [];
    const total = list.reduce((sum, item) => sum + toNumber(item.count), 0);

    return list.map((item) => {
      const config = STATUS_CONFIG[item._id] || {
        label: item._id || "Không rõ",
        color: "#64748b",
        bg: "#f1f5f9",
      };

      return {
        ...item,
        name: config.label,
        value: toNumber(item.count),
        percent: total > 0 ? (toNumber(item.count) / total) * 100 : 0,
        color: config.color,
        bg: config.bg,
      };
    });
  }, [orderStatus]);

  const totalStatusOrders = statusData.reduce((sum, item) => sum + item.value, 0);
  const hasRevenue = revenueData.some((item) => item.revenue > 0);
  const topProductData = (Array.isArray(topProducts) ? topProducts : []).map((item) => ({
    name: item.name || "Không rõ",
    sold: toNumber(item.sold),
  }));

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <p className="dashboard-eyebrow">Saigon Speed Admin</p>
          <h1>Hệ thống quản trị</h1>
          <p className="dashboard-subtitle">
            Theo dõi doanh thu, đơn hàng và dữ liệu blockchain đã xác minh.
          </p>
        </div>

        <div className="header-actions">
          <Link to="/admin/orders" className="btn-secondary">
            Xem đơn hàng
          </Link>
          <button onClick={() => fetchDashboardData(revenueDays)} className="btn-refresh" disabled={loading}>
            <RefreshCw size={16} className={loading ? "spin-icon" : ""} />
            Làm mới
          </button>
        </div>
      </div>

      {errorMessage && <div className="dashboard-alert">{errorMessage}</div>}

      <div className="stat-grid">
        <StatCard
          title="Tổng người dùng"
          value={formatNumber(summary?.totalUsers)}
          note="Tài khoản đã đăng ký"
          icon={<Users size={22} />}
          tone="blue"
        />
        <StatCard
          title="Tổng tiền thực thu"
          value={formatCurrency(summary?.totalPaid)}
          note="Dòng tiền đã xác minh"
          icon={<Activity size={22} />}
          tone="emerald"
          highlight
        />
        <StatCard
          title="Doanh thu đã chốt"
          value={formatCurrency(summary?.totalRevenue)}
          note={`${formatNumber(summary?.completedOrders)} đơn hoàn thành`}
          icon={<DollarSign size={22} />}
          tone="cyan"
        />
        <StatCard
          title="Tổng giá trị đặt hàng"
          value={formatCurrency(summary?.totalOrderValue)}
          note={`${formatNumber(summary?.totalOrders)} đơn hợp lệ`}
          icon={<Package size={22} />}
          tone="violet"
        />
        <StatCard
          title="Tỉ lệ thanh toán"
          value={formatPercent(summary?.paymentRate)}
          note="Trên tổng giá trị đơn"
          icon={<CreditCard size={22} />}
          tone="amber"
        />
        <StatCard
          title="Đơn hàng hôm nay"
          value={formatNumber(summary?.todayOrders)}
          note="Đơn mới phát sinh"
          icon={<ShoppingBag size={22} />}
          tone="indigo"
        />
      </div>

      <div className="charts-grid">
        <section className="dashboard-panel revenue-panel">
          <div className="panel-header">
            <div>
              <h2>Phân tích doanh thu</h2>
              <p>Dòng tiền thực thu theo ngày từ các đơn không bị hủy.</p>
            </div>
            <select
              className="chart-select"
              value={revenueDays}
              onChange={(event) => setRevenueDays(Number(event.target.value))}
            >
              <option value={7}>7 ngày qua</option>
              <option value={30}>30 ngày qua</option>
              <option value={90}>90 ngày qua</option>
            </select>
          </div>

          <div className="revenue-chart-wrapper">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 12, right: 18, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.28} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#e5eef8" />
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                  minTickGap={18}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                  tickFormatter={(value) => `${Math.round(value / 1000)}k`}
                  width={48}
                />
                <Tooltip
                  cursor={{ stroke: "#93c5fd", strokeWidth: 1 }}
                  formatter={(value) => [formatCurrency(value), "Thực thu"]}
                  labelFormatter={(label) => `Ngày ${label}`}
                  contentStyle={{
                    border: "1px solid #e2e8f0",
                    borderRadius: 8,
                    boxShadow: "0 12px 28px rgba(15, 23, 42, 0.12)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#2563eb"
                  strokeWidth={3}
                  fill="url(#revenueGradient)"
                  dot={{ r: 3, strokeWidth: 2, fill: "#ffffff" }}
                  activeDot={{ r: 5 }}
                />
              </AreaChart>
            </ResponsiveContainer>

            {!hasRevenue && (
              <div className="chart-empty-state">
                Chưa có dòng tiền thực thu trong khoảng thời gian này.
              </div>
            )}
          </div>
        </section>

        <section className="dashboard-panel status-panel">
          <div className="panel-header compact">
            <div>
              <h2>Trạng thái đơn hàng</h2>
              <p>{formatNumber(totalStatusOrders)} đơn trong hệ thống</p>
            </div>
          </div>

          <div className="status-chart-layout">
            <div className="donut-chart-shell">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={66}
                    outerRadius={92}
                    paddingAngle={4}
                  >
                    {statusData.map((entry) => (
                      <Cell key={entry._id} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [`${value} đơn`, name]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="donut-center">
                <strong>{formatNumber(totalStatusOrders)}</strong>
                <span>đơn</span>
              </div>
            </div>

            <div className="status-list">
              {statusData.length === 0 ? (
                <div className="small-empty">Chưa có dữ liệu trạng thái.</div>
              ) : (
                statusData.map((item) => (
                  <div className="status-item" key={item._id}>
                    <span className="status-dot" style={{ backgroundColor: item.color }} />
                    <div>
                      <strong>{item.name}</strong>
                      <span>
                        {formatNumber(item.value)} đơn · {item.percent.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      </div>

      <div className="bottom-grid">
        <section className="dashboard-panel recent-panel">
          <div className="panel-header">
            <div>
              <h2>Giao dịch gần đây</h2>
              <p>Các đơn hàng mới nhất cần theo dõi.</p>
            </div>
            <Link to="/admin/orders" className="btn-text">
              Xem tất cả
            </Link>
          </div>

          <div className="recent-table-wrap">
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
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="table-empty">
                      Chưa có đơn hàng gần đây.
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((order) => {
                    const statusConfig = STATUS_CONFIG[order.status] || {
                      label: order.status || "Không rõ",
                      color: "#64748b",
                      bg: "#f1f5f9",
                    };

                    return (
                      <tr key={order._id}>
                        <td>
                          <div className="user-info">
                            <div className="avatar-circle">
                              {order.userId?.username?.charAt(0)?.toUpperCase() || "K"}
                            </div>
                            <div>
                              <strong>{order.userId?.username || "Khách hàng"}</strong>
                              <span>{order.userId?.email || "Không có email"}</span>
                            </div>
                          </div>
                        </td>
                        <td>{order.items?.[0]?.name || "Không rõ"}</td>
                        <td>
                          <span className="type-pill">
                            {order.paymentType === "deposit" ? "Đặt cọc" : "Trả toàn bộ"}
                          </span>
                        </td>
                        <td>
                          <strong>{formatCurrency(order.paidAmount)}</strong>
                          <span className="muted-line">Tổng: {formatCurrency(order.totalAmount)}</span>
                        </td>
                        <td>
                          <span
                            className="dashboard-status-pill"
                            style={{
                              "--status-color": statusConfig.color,
                              "--status-bg": statusConfig.bg,
                            }}
                          >
                            {statusConfig.label}
                          </span>
                        </td>
                        <td>{new Date(order.createdAt).toLocaleDateString("vi-VN")}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>

        <div className="side-grid">
          <section className="dashboard-panel blockchain-panel">
            <div className="blockchain-header">
              <Activity size={22} />
              <div>
                <h2>Dữ liệu Blockchain & Tài chính</h2>
                <p>Đối soát các khoản đã ghi nhận.</p>
              </div>
            </div>

            <div className="blockchain-metrics">
              <Metric label="Tổng tiền đã thu" value={formatCurrency(blockchain?.totalPaid)} tone="green" />
              <Metric label="Tiền chờ thu" value={formatCurrency(blockchain?.remainingAmount)} tone="amber" />
              <Metric label="Blockchain Deposit" value={formatCurrency(blockchain?.blockchainDeposit)} tone="blue" />
              <Metric label="Đơn đã xác thực" value={`${formatNumber(blockchain?.blockchainOrders)} đơn`} tone="violet" />
            </div>

            <ProgressRow label="Tỉ lệ thanh toán" value={blockchain?.paymentRate} color="#34d399" />
            <ProgressRow label="Tỉ lệ đặt cọc" value={blockchain?.depositRate} color="#60a5fa" />
            <ProgressRow label="Tỉ lệ hoàn tất đơn" value={blockchain?.completionRate} color="#a78bfa" />
          </section>

          <section className="dashboard-panel top-products-panel">
            <div className="panel-header compact">
              <div>
                <h2>Xe bán chạy</h2>
                <p>Top mẫu xe theo số lượng trong đơn hợp lệ.</p>
              </div>
            </div>

            <div className="top-product-chart">
              {topProductData.length === 0 ? (
                <div className="small-empty">Chưa có dữ liệu sản phẩm bán chạy.</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topProductData} layout="vertical" margin={{ top: 4, right: 12, left: 8, bottom: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#edf2f7" />
                    <XAxis type="number" allowDecimals={false} axisLine={false} tickLine={false} />
                    <YAxis
                      type="category"
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      width={110}
                      tick={{ fill: "#475569", fontSize: 12 }}
                    />
                    <Tooltip formatter={(value) => [`${value} xe`, "Đã bán"]} />
                    <Bar dataKey="sold" radius={[0, 6, 6, 0]} fill="#2563eb" barSize={16} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, note, icon, tone, highlight = false }) => (
  <article className={`stat-card tone-${tone} ${highlight ? "highlight" : ""}`}>
    <div className="stat-card-header">
      <div className="stat-icon">{icon}</div>
      {highlight && (
        <span className="trend-badge">
          <CheckCircle size={12} />
          Đã xác minh
        </span>
      )}
    </div>
    <p>{title}</p>
    <h3>{value}</h3>
    <span>{note}</span>
  </article>
);

const Metric = ({ label, value, tone }) => (
  <div className={`metric-box tone-${tone}`}>
    <span>{label}</span>
    <strong>{value}</strong>
  </div>
);

const ProgressRow = ({ label, value, color }) => (
  <div className="progress-row">
    <div>
      <span>{label}</span>
      <strong>{formatPercent(value)}</strong>
    </div>
    <div className="progress-track">
      <div
        className="progress-fill"
        style={{ width: `${clampPercent(value)}%`, backgroundColor: color }}
      />
    </div>
  </div>
);

export default Dashboard;
