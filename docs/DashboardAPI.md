## Dashboard API

**Base URL:** `/api/dashboard`  
**Xác thực:** Tất cả các route đều yêu cầu header `Authorization: Bearer <token>` và quyền admin 🔒

---

### Tổng quan hệ thống

#### GET `/summary` 🔒
Lấy dữ liệu tổng quan cho dashboard (user, sản phẩm, đơn hàng, doanh thu).

**Response:**
```json
{
  "totalUsers": "number",
  "totalProducts": "number",

  "totalOrders": "number",
  "completedOrders": "number",
  "processingOrders": "number",
  "pendingOrders": "number",

  "totalRevenue": "number",
  "totalOrderValue": "number",
  "totalPaid": "number",

  "todayOrders": "number",
  "todayRevenue": "number",

  "completionRate": "number",
  "paymentRate": "number"
}
```

---

### Doanh thu theo ngày

#### GET `/revenue` 🔒
Lấy dữ liệu doanh thu theo số ngày (dùng cho biểu đồ).

**Query Params:**
```json
{
  "days": "number (mặc định 7, min 1, max 90)"
}
```

**Response:**
```json
[
  {
    "_id": "YYYY-MM-DD",
    "date": "YYYY-MM-DD",
    "label": "DD/MM",
    "revenue": "number",
    "completedRevenue": "number",
    "orderValue": "number",
    "orders": "number"
  }
]
```

---

### Top sản phẩm bán chạy

#### GET `/top-products` 🔒
Lấy danh sách 5 sản phẩm bán chạy nhất.

**Response:**
```json
[
  {
    "_id": "productId",
    "name": "string",
    "sold": "number"
  }
]
```

---

### Thống kê trạng thái đơn hàng

#### GET `/order-status` 🔒
Thống kê số lượng đơn hàng theo trạng thái.

**Response:**
```json
[
  {
    "_id": "status",
    "count": "number"
  }
]
```

---

### Đơn hàng gần đây

#### GET `/recent-orders` 🔒
Lấy danh sách 5 đơn hàng mới nhất.

**Response:**
```json
[
  {
    "_id": "string",
    "userId": {
      "username": "string",
      "email": "string"
    },
    "totalAmount": "number",
    "paidAmount": "number",
    "status": "string",
    "createdAt": "string"
  }
]
```

---

### Thống kê blockchain

#### GET `/blockchain` 🔒
Thống kê dữ liệu thanh toán liên quan blockchain.

**Response:**
```json
{
  "totalOrders": "number",
  "totalDeposit": "number",
  "totalPaid": "number",
  "paidOrders": "number",

  "completedOrders": "number",
  "processingOrders": "number",

  "totalOrderValue": "number",
  "remainingAmount": "number",

  "blockchainOrders": "number",
  "blockchainDeposit": "number",

  "depositRate": "number",
  "completionRate": "number",
  "paymentRate": "number"
}
```

---

> 🔒 = yêu cầu `Authorization: Bearer <token>` và quyền admin
