## Admin Order Management API

**Base URL:** `/api/orders`

Tat ca route ben duoi can header:

```http
Authorization: Bearer <ADMIN_ACCESS_TOKEN>
Content-Type: application/json
```

### 1. Lay danh sach don hang cho admin

#### GET `/admin`

Ho tro filter, search, sort va phan trang.

**Query params tuy chon:**

| Param | Vi du | Ghi chu |
| --- | --- | --- |
| `page` | `1` | Trang hien tai, mac dinh `1` |
| `limit` | `10` | So dong moi trang, toi da `100` |
| `status` | `pending_deposit` | Co the truyen nhieu gia tri cach nhau bang dau phay |
| `paymentType` | `deposit` | `deposit` hoac `full` |
| `deliveryMethod` | `pickup` | `pickup` hoac `delivery` |
| `depositStatus` | `paid` | `pending` hoac `paid` |
| `fromDate` | `2026-04-01` | Loc tu ngay tao |
| `toDate` | `2026-04-30` | Loc den ngay tao |
| `minTotal` | `10000` | Tong tien nho nhat |
| `maxTotal` | `500000` | Tong tien lon nhat |
| `search` | `tam@example.com` | Tim theo order id, blockchainOrderId, ten/email/sdt user, ten xe, wallet |
| `sortBy` | `createdAt` | `createdAt`, `updatedAt`, `totalAmount`, `paidAmount`, `status`, `paymentType`, `deliveryMethod`, `expiresAt`, `blockchainOrderId` |
| `sortOrder` | `desc` | `asc` hoac `desc` |

**Postman URL mau:**

```http
GET http://localhost:3000/api/orders/admin?page=1&limit=10&status=deposit_paid,processing&sortBy=createdAt&sortOrder=desc
```

**Response mau:**

```json
{
  "success": true,
  "data": [],
  "pagination": {
    "total": 0,
    "page": 1,
    "limit": 10,
    "totalPages": 0
  }
}
```

### 2. Lay chi tiet don hang bat ky cho admin

#### GET `/admin/:id`

**Postman URL mau:**

```http
GET http://localhost:3000/api/orders/admin/ORDER_ID
```

### 3. Luu y ve cap nhat trang thai

Admin order management chi dung de xem va loc don hang. Cac buoc cap nhat trang thai thanh toan/giao dich van di qua API blockchain hien co:

```http
POST /api/orders/:id/verify-deposit
POST /api/orders/:id/verify-full-payment
POST /api/orders/:id/verify-seller-confirm
POST /api/orders/:id/verify-complete
POST /api/orders/:id/verify-cancel
```
