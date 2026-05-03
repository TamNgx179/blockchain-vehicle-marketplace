## Admin Order Management API

**Base URL:** `/api/orders`

Tat ca route ben duoi can admin token:

```http
Authorization: Bearer <ADMIN_ACCESS_TOKEN>
Content-Type: application/json
```

## 1. Lay danh sach order

### GET `/admin`

Ho tro filter, search, sort va phan trang.

**Query params:**

| Param | Vi du | Ghi chu |
| --- | --- | --- |
| `page` | `1` | Mac dinh `1` |
| `limit` | `10` | Toi da `100` |
| `status` | `deposit_paid,processing` | Co the truyen nhieu gia tri cach nhau bang dau phay |
| `paymentType` | `deposit` | `deposit` hoac `full` |
| `deliveryMethod` | `pickup` | `pickup` hoac `delivery` |
| `depositStatus` | `paid` | `pending` hoac `paid` |
| `fromDate` | `2026-04-01` | Loc tu ngay tao |
| `toDate` | `2026-04-30` | Loc den ngay tao |
| `minTotal` | `10000` | Tong tien nho nhat |
| `maxTotal` | `500000` | Tong tien lon nhat |
| `search` | `tam@example.com` | Tim theo order id, blockchainOrderId, user, car, wallet |
| `sortBy` | `createdAt` | `createdAt`, `updatedAt`, `totalAmount`, `paidAmount`, `status`, `paymentType`, `deliveryMethod`, `expiresAt`, `blockchainOrderId` |
| `sortOrder` | `desc` | `asc` hoac `desc` |

## 2. Lay chi tiet order

### GET `/admin/:id`

Lay chi tiet bat ky order cho admin.

## 3. Confirm order

### POST `/admin/:id/confirm`

Backend goi `confirmOrder(orderId)` tren smart contract bang seller/server wallet, verify event `SellerConfirmed`, roi update MongoDB thanh `processing`.

Khong can body.

## 4. Cancel order

### POST `/admin/:id/cancel`

Backend goi `cancelOrder(orderId)` tren smart contract bang seller/server wallet, verify event `OrderCancelled`, roi update MongoDB thanh `cancelled`.

Khong can body.

## 5. Verify endpoints thu cong

Neu da co transaction hash tu client/admin, co the verify truc tiep:

```http
POST /api/orders/:id/verify-deposit
POST /api/orders/:id/verify-full-payment
POST /api/orders/:id/verify-seller-confirm
POST /api/orders/:id/verify-complete
POST /api/orders/:id/verify-cancel
```
