## Order API

**Base URL:** `/api/orders`

Tất cả route bên dưới cần header:

```http
Authorization: Bearer <ACCESS_TOKEN>
Content-Type: application/json
```

## 1. Tạo order từ cart

### POST `/create-from-cart`

Tạo order từ các item đang có trong cart, đồng thời tạo order trên smart contract bằng seller/server wallet.

**Request body - pickup:**

```json
{
  "selectedItems": ["PRODUCT_ID_1", "PRODUCT_ID_2"],
  "paymentType": "deposit",
  "buyerWallet": "0xBuyerWallet",
  "deliveryMethod": "pickup",
  "pickupInfo": {
    "name": "Nguyen Van A",
    "phone": "0900000000",
    "pickupDate": "2026-05-10T09:00:00.000Z"
  }
}
```

**Request body - delivery:**

```json
{
  "selectedItems": ["PRODUCT_ID_1"],
  "paymentType": "full",
  "buyerWallet": "0xBuyerWallet",
  "deliveryMethod": "delivery",
  "shippingAddress": {
    "name": "Nguyen Van A",
    "phone": "0900000000",
    "address": "Thu Duc, Ho Chi Minh City"
  }
}
```

**Field notes:**

| Field | Bắt buộc | Mô tả |
| --- | --- | --- |
| `selectedItems` | Yes | Mảng product `_id` trong cart |
| `paymentType` | Yes | `deposit` hoặc `full` |
| `buyerWallet` | Yes | Địa chỉ MetaMask đã lưu trong `/api/wallets` |
| `deliveryMethod` | Yes | `pickup` hoặc `delivery` |
| `pickupInfo` | Khi pickup | Tên, phone, pickupDate |
| `shippingAddress` | Khi delivery | Tên, phone, address |

**Response:**

```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "_id": "ORDER_ID",
    "blockchainOrderId": 1710000000000,
    "paymentType": "deposit",
    "buyerWallet": "0xBuyerWallet",
    "sellerWallet": "0xSellerWallet",
    "totalAmount": 13000,
    "totalAmountWei": "6500000000000000",
    "depositAmount": 65,
    "depositAmountWei": "32500000000000",
    "status": "pending_deposit"
  }
}
```

## 2. Discard unpaid order

### POST `/:id/discard-unpaid`

Dùng khi frontend tạo order thành công nhưng user từ chối hoặc transaction thất bại trước khi payment hoàn tất. Backend hủy order chưa thanh toán và giữ cart không đổi.

## 3. My orders

### GET `/my-orders`

Lấy danh sách order của user đang đăng nhập.

### GET `/:id`

Lấy chi tiết order. User chỉ xem được order của mình; admin có route riêng.

## 4. Verify blockchain transactions

Frontend gửi `txHash` sau khi MetaMask transaction mined.

### POST `/:id/verify-deposit`

```json
{ "txHash": "0x..." }
```

Verify event `DepositPaid`, update order thành `deposit_paid`.

### POST `/:id/verify-full-payment`

```json
{ "txHash": "0x..." }
```

Verify event `FullPaid`, update order thành `payment_paid`.

### POST `/:id/verify-complete`

```json
{ "txHash": "0x..." }
```

Verify event `OrderCompleted`, update order thành `completed`.

### POST `/:id/verify-cancel`

```json
{ "txHash": "0x..." }
```

Verify event `OrderCancelled`, update order thành `cancelled`.

### POST `/:id/verify-seller-confirm` (admin)

```json
{ "txHash": "0x..." }
```

Verify event `SellerConfirmed`, update order thành `processing`.

## 5. Admin helpers

### GET `/all-orders` (admin)

Lấy tất cả order.

### POST `/admin/:id/confirm` (admin)

Backend tự gọi smart contract `confirmOrder` bằng seller/server wallet, sau đó verify và update MongoDB.

### POST `/admin/:id/cancel` (admin)

Backend tự gọi smart contract `cancelOrder` bằng seller/server wallet, sau đó verify và update MongoDB.

### GET `/admin`

Danh sách order có filter/sort/pagination. Xem `AdminOrderAPI.md`.