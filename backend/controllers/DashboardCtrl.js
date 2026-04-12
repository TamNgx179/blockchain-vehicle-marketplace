import {
  getSummaryService,
  getRevenueService,
  getTopProductsService,
  getOrderStatusService,
  getRecentOrdersService,
  getBlockchainStatsService,
} from "../service/DashboardService.js";

/* ================= SUMMARY ================= */
export const getSummary = async (req, res) => {
  try {
    const data = await getSummaryService();
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= REVENUE ================= */
export const getRevenue = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const data = await getRevenueService(days);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= TOP PRODUCTS ================= */
export const getTopProducts = async (req, res) => {
  try {
    const data = await getTopProductsService();
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= ORDER STATUS ================= */
export const getOrderStatus = async (req, res) => {
  try {
    const data = await getOrderStatusService();
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= RECENT ORDERS ================= */
export const getRecentOrders = async (req, res) => {
  try {
    const data = await getRecentOrdersService();
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= BLOCKCHAIN ================= */
export const getBlockchainStats = async (req, res) => {
  try {
    const data = await getBlockchainStatsService();
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};