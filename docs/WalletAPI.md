## Wallet API

**Base URL:** `/api/wallets`

Tất cả route cần header:

```http
Authorization: Bearer <ACCESS_TOKEN>
Content-Type: application/json
```

Wallet dùng để lưu các địa chỉ MetaMask mà user có thể chọn khi checkout.

## GET `/`

Lấy danh sách wallet của user đang đăng nhập.

**Response:**

```json
{
  "success": true,
  "message": "Wallets loaded successfully",
  "data": [
    {
      "_id": "WALLET_ID",
      "user": "USER_ID",
      "name": "MetaMask",
      "address": "0x...",
      "network": "sepolia",
      "isDefault": true
    }
  ]
}
```

## POST `/`

Thêm wallet mới.

**Request body:**

```json
{
  "name": "MetaMask",
  "address": "0xBuyerWallet",
  "network": "sepolia",
  "isDefault": false
}
```

**Rules:**

- `address` bắt buộc và phải là Ethereum address hợp lệ.
- Một user không thể lưu trùng cùng một address.
- Wallet đầu tiên của user tự động là default.
- Nếu `isDefault=true`, các wallet khác của user sẽ bị set `isDefault=false`.

## PUT `/:id`

Chỉ dùng để set default wallet.

**Request body hợp lệ:**

```json
{ "isDefault": true }
```

Không cho edit `name`, `address`, `network` hay thông tin khác của wallet.

## DELETE `/:id`

Xóa wallet của user. Nếu wallet bị xóa là default, backend tự chọn wallet còn lại gần nhất làm default.

## Checkout note

Order API chỉ chấp nhận `buyerWallet` đã tồn tại trong danh sách wallet của user. Khi thanh toán, frontend sẽ yêu cầu MetaMask active đúng wallet đã chọn.