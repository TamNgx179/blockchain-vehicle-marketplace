## Admin Order Management API

**Base URL:** `/api/orders`

Tất cả route bên dưới cần admin token:

```http
Authorization: Bearer <ADMIN_ACCESS_TOKEN>
Content-Type: application/json
```

## 1. Lấy danh sách order

### GET `/admin`

Hỗ trợ filter, search, sort và phân trang.

**Query params:**

| Param | Ví dụ | Ghi chú |
| --- | --- | --- |
| `page` | `1` | Mặc định `1` |
| `limit` | `10` | Tối đa `100` |
| `status` | `deposit_paid,processing` | Có thể truyền nhiều giá trị cách nhau bằng dấu phẩy |
| `paymentType` | `deposit` | `deposit` hoặc `full` |
| `deliveryMethod` | `pickup` | `pickup` hoặc `delivery` |
| `depositStatus` | `paid` | `pending` hoặc `paid` |
| `fromDate` | `2026-04-01` | Lọc từ ngày tạo |
| `toDate` | `2026-04-30` | Lọc đến ngày tạo |
| `minTotal` | `10000` | Tổng tiền nhỏ nhất |
| `maxTotal` | `500000` | Tổng tiền lớn nhất |
| `search` | `tam@example.com` | Tìm theo order id, blockchainOrderId, user, car, wallet |
| `sortBy` | `createdAt` | `createdAt`, `updatedAt`, `totalAmount`, `paidAmount`, `status`, `paymentType`, `deliveryMethod`, `expiresAt`, `blockchainOrderId` |
| `sortOrder` | `desc` | `asc` hoặc `desc` |

## 2. Lấy chi tiết order

### GET `/admin/:id`

Lấy chi tiết bất kỳ order cho admin.

## 3. Confirm order

### POST `/admin/:id/confirm`

Backend gọi `confirmOrder(orderId)` trên smart contract bằng seller/server wallet, verify event `SellerConfirmed`, rồi update MongoDB thành `processing`.

Không cần body.

## 4. Cancel order

### POST `/admin/:id/cancel`

Backend gọi `cancelOrder(orderId)` trên smart contract bằng seller/server wallet, verify event `OrderCancelled`, rồi update MongoDB thành `cancelled`.

Không cần body.

## 5. Verify endpoints thủ công

Nếu đã có transaction hash từ client/admin, có thể verify trực tiếp:

```http
POST /api/orders/:id/verify-deposit
POST /api/orders/:id/verify-full-payment
POST /api/orders/:id/verify-seller-confirm
POST /api/orders/:id/verify-complete
POST /api/orders/:id/verify-cancel
```