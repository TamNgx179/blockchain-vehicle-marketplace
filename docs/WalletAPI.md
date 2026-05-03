## Wallet API

**Base URL:** `/api/wallets`

Tat ca route can header:

```http
Authorization: Bearer <ACCESS_TOKEN>
Content-Type: application/json
```

Wallet dung de luu cac dia chi MetaMask ma user co the chon khi checkout.

## GET `/`

Lay danh sach wallet cua user dang dang nhap.

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

Them wallet moi.

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

- `address` bat buoc va phai la Ethereum address hop le.
- Mot user khong the luu trung cung mot address.
- Wallet dau tien cua user tu dong la default.
- Neu `isDefault=true`, cac wallet khac cua user se bi set `isDefault=false`.

## PUT `/:id`

Chi dung de set default wallet.

**Request body hop le:**

```json
{ "isDefault": true }
```

Khong cho edit `name`, `address`, `network` hay thong tin khac cua wallet.

## DELETE `/:id`

Xoa wallet cua user. Neu wallet bi xoa la default, backend tu chon wallet con lai gan nhat lam default.

## Checkout note

Order API chi chap nhan `buyerWallet` da ton tai trong danh sach wallet cua user. Khi thanh toan, frontend se yeu cau MetaMask active dung wallet da chon.
