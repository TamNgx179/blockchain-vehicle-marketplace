## Account API

**Base URL:** `/api/accounts`

Route có ký hiệu lock cần header:

```http
Authorization: Bearer <ACCESS_TOKEN>
Content-Type: application/json
```

## Auth/session

### POST `/logout`

```json
{ "refreshToken": "string" }
```

## Password

### POST `/changePassword` (locked)

```json
{
  "oldPassword": "string",
  "newPassword": "string",
  "resNewPassword": "string"
}
```

## Profile

### GET `/getProfile` (locked)

Lấy profile user đang đăng nhập.

### PUT `/editProfile` (locked)

```json
{
  "username": "Nguyen Van A",
  "phoneNumber": "0900000000",
  "address": "Thu Duc, Ho Chi Minh City"
}
```

## Delete account

### DELETE `/me` (locked)

Xóa tài khoản đang đăng nhập.

### DELETE `/:id` (locked)

Admin xóa user bất kỳ hoặc user tự xóa chính mình.

## Wishlist

### POST `/wishlist/add` (locked)

```json
{ "productId": "PRODUCT_ID" }
```

### GET `/wishlist` (locked)

Lấy wishlist của user.

### DELETE `/wishlist/remove` (locked)

```json
{ "productId": "PRODUCT_ID" }
```