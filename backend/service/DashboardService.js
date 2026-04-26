import User from "../models/AuthModel.js";
import Product from "../models/ProductModel.js";
import Order from "../models/OrderModel.js";

/* ================= SUMMARY ================= */
export const getSummaryService = async () => {
  const [
    totalUsers,
    totalProducts,
    orderStats,
    todayStats,
  ] = await Promise.all([
    User.countDocuments(),
    Product.countDocuments(),

    // ===== ORDER AGGREGATE =====
    Order.aggregate([
      {
        $match: { status: { $ne: "cancelled" } },
      },
      {
        $group: {
          _id: null,

          totalOrders: { $sum: 1 },

          // Doanh thu hoàn tất
          totalRevenue: {
            $sum: {
              $cond: [
                { $eq: ["$status", "completed"] },
                "$totalAmount",
                0,
              ],
            },
          },

          // Đơn hoàn tất
          completedOrders: {
            $sum: {
              $cond: [{ $eq: ["$status", "completed"] }, 1, 0],
            },
          },

          // Đơn đang xử lý
          processingOrders: {
            $sum: {
              $cond: [{ $eq: ["$status", "processing"] }, 1, 0],
            },
          },

          // Đơn đang chờ cọc
          pendingOrders: {
            $sum: {
              $cond: [
                { $eq: ["$status", "pending_deposit"] },
                1,
                0,
              ],
            },
          },

          // Tổng giá trị đơn
          totalOrderValue: { $sum: "$totalAmount" },

          // Tổng tiền đã trả
          totalPaid: { $sum: "$paidAmount" },
        },
      },
    ]),

    // ===== TODAY STATS =====
    Order.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      },
      {
        $group: {
          _id: null,
          todayOrders: { $sum: 1 },
          todayRevenue: {
            $sum: {
              $cond: [
                { $eq: ["$status", "completed"] },
                "$totalAmount",
                0,
              ],
            },
          },
        },
      },
    ]),
  ]);

  const stats = orderStats[0] || {
    totalOrders: 0,
    totalRevenue: 0,
    completedOrders: 0,
    processingOrders: 0,
    pendingOrders: 0,
    totalOrderValue: 0,
    totalPaid: 0,
  };

  const today = todayStats[0] || {
    todayOrders: 0,
    todayRevenue: 0,
  };

  return {
    totalUsers,
    totalProducts,

    // ===== ORDERS =====
    totalOrders: stats.totalOrders,
    completedOrders: stats.completedOrders,
    processingOrders: stats.processingOrders,
    pendingOrders: stats.pendingOrders,

    // ===== MONEY =====
    totalRevenue: stats.totalRevenue,
    totalOrderValue: stats.totalOrderValue,
    totalPaid: stats.totalPaid,

    // ===== TODAY =====
    todayOrders: today.todayOrders,
    todayRevenue: today.todayRevenue,

    // ===== CALCULATED =====
    completionRate:
      stats.totalOrders > 0
        ? (stats.completedOrders / stats.totalOrders) * 100
        : 0,

    paymentRate:
      stats.totalOrderValue > 0
        ? (stats.totalPaid / stats.totalOrderValue) * 100
        : 0,
  };
};

/* ================= REVENUE ================= */
export const getRevenueService = async (days = 7) => {
  return await Order.aggregate([
    {
      $match: {
        status: "completed",
        createdAt: {
          $gte: new Date(Date.now() - days * 86400000),
        },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
        },
        revenue: { $sum: "$totalAmount" },
      },
    },
    { $sort: { _id: 1 } },
  ]);
};

/* ================= TOP PRODUCTS ================= */
export const getTopProductsService = async () => {
  return await Order.aggregate([
    {
      $match: {
        status: { $in: ["deposit_paid", "processing", "completed"] }
      }
    },
    { $unwind: "$items" },
    {
      $group: {
        _id: "$items.productId",
        name: { $first: "$items.name" },
        sold: { $sum: "$items.quantity" },
      },
    },
    { $sort: { sold: -1 } },
    { $limit: 5 },
  ]);
};

/* ================= ORDER STATUS ================= */
export const getOrderStatusService = async () => {
  return await Order.aggregate([
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);
};

/* ================= RECENT ORDERS ================= */
export const getRecentOrdersService = async () => {
  return await Order.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .populate("userId", "username email")
    .lean();
};


/* ================= BLOCKCHAIN ================= */
export const getBlockchainStatsService = async () => {
  const data = await Order.aggregate([
    {
      $match: {
        status: { $ne: "cancelled" },
      },
    },
    {
      $group: {
        _id: null,

        // ===== BASIC =====
        totalOrders: { $sum: 1 },

        totalDeposit: {
          $sum: {
            $cond: [
              { $eq: ["$depositStatus", "paid"] },
              "$depositAmount",
              0,
            ],
          },
        },

        totalPaid: { $sum: "$paidAmount" },

        paidOrders: {
          $sum: {
            $cond: [{ $eq: ["$depositStatus", "paid"] }, 1, 0],
          },
        },

        // ===== ADVANCED =====

        // Số đơn hoàn tất
        completedOrders: {
          $sum: {
            $cond: [{ $eq: ["$status", "completed"] }, 1, 0],
          },
        },

        // Số đơn đang xử lý
        processingOrders: {
          $sum: {
            $cond: [{ $eq: ["$status", "processing"] }, 1, 0],
          },
        },

        // Tổng giá trị đơn hàng
        totalOrderValue: { $sum: "$totalAmount" },

        // Tổng số tiền còn phải trả
        remainingAmount: {
          $sum: {
            $subtract: ["$totalAmount", "$paidAmount"],
          },
        },

        // Số đơn có transaction blockchain (deposit)
        blockchainOrders: {
          $sum: {
            $cond: [
              { $ne: ["$depositTxHash", ""] },
              1,
              0,
            ],
          },
        },

        // Tổng tiền cọc theo blockchain thật
        blockchainDeposit: {
          $sum: {
            $cond: [
              { $ne: ["$depositTxHash", ""] },
              "$depositAmount",
              0,
            ],
          },
        },
      },
    },
  ]);

  const result = data[0] || {
    totalOrders: 0,
    totalDeposit: 0,
    totalPaid: 0,
    paidOrders: 0,
    completedOrders: 0,
    processingOrders: 0,
    totalOrderValue: 0,
    remainingAmount: 0,
    blockchainOrders: 0,
    blockchainDeposit: 0,
  };

  // ===== CALCULATED FIELDS =====

  return {
    ...result,

    // % đơn đã cọc
    depositRate:
      result.totalOrders > 0
        ? (result.paidOrders / result.totalOrders) * 100
        : 0,

    // % hoàn thành
    completionRate:
      result.totalOrders > 0
        ? (result.completedOrders / result.totalOrders) * 100
        : 0,

    // % đã thanh toán
    paymentRate:
      result.totalOrderValue > 0
        ? (result.totalPaid / result.totalOrderValue) * 100
        : 0,
  };
};