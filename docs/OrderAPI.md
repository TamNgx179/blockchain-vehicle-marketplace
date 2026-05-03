## Order API

**Base URL:** `/api/orders`

Tat ca route ben duoi can header:

```http
Authorization: Bearer <ACCESS_TOKEN>
Content-Type: application/json
```

## 1. Tao order tu cart

### POST `/create-from-cart`

Tao order tu cac item dang co trong cart, dong thoi tao order tren smart contract bang seller/server wallet.

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

| Field | Bat buoc | Mo ta |
| --- | --- | --- |
| `selectedItems` | Yes | Mang product `_id` trong cart |
| `paymentType` | Yes | `deposit` hoac `full` |
| `buyerWallet` | Yes | Dia chi MetaMask da luu trong `/api/wallets` |
| `deliveryMethod` | Yes | `pickup` hoac `delivery` |
| `pickupInfo` | Khi pickup | Ten, phone, pickupDate |
| `shippingAddress` | Khi delivery | Ten, phone, address |

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

Dung khi frontend tao order thanh cong nhung user tu choi hoac transaction that bai truoc khi payment hoan tat. Backend huy order chua thanh toan va giu cart khong doi.

## 3. My orders

### GET `/my-orders`

Lay danh sach order cua user dang dang nhap.

### GET `/:id`

Lay chi tiet order. User chi xem duoc order cua minh; admin co route rieng.

## 4. Verify blockchain transactions

Frontend gui `txHash` sau khi MetaMask transaction mined.

### POST `/:id/verify-deposit`

```json
{ "txHash": "0x..." }
```

Verify event `DepositPaid`, update order thanh `deposit_paid`.

### POST `/:id/verify-full-payment`

```json
{ "txHash": "0x..." }
```

Verify event `FullPaid`, update order thanh `payment_paid`.

### POST `/:id/verify-complete`

```json
{ "txHash": "0x..." }
```

Verify event `OrderCompleted`, update order thanh `completed`.

### POST `/:id/verify-cancel`

```json
{ "txHash": "0x..." }
```

Verify event `OrderCancelled`, update order thanh `cancelled`.

### POST `/:id/verify-seller-confirm` (admin)

```json
{ "txHash": "0x..." }
```

Verify event `SellerConfirmed`, update order thanh `processing`.

## 5. Admin helpers

### GET `/all-orders` (admin)

Lay tat ca order.

### POST `/admin/:id/confirm` (admin)

Backend tu goi smart contract `confirmOrder` bang seller/server wallet, sau do verify va update MongoDB.

### POST `/admin/:id/cancel` (admin)

Backend tu goi smart contract `cancelOrder` bang seller/server wallet, sau do verify va update MongoDB.

### GET `/admin`

Danh sach order co filter/sort/pagination. Xem `AdminOrderAPI.md`.
