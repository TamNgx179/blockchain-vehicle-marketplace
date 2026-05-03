## Account API

**Base URL:** `/api/accounts`

Route co ky hieu lock can header:

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

Lay profile user dang dang nhap.

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

Xoa tai khoan dang dang nhap.

### DELETE `/:id` (locked)

Admin xoa user bat ky hoac user tu xoa chinh minh.

## Wishlist

### POST `/wishlist/add` (locked)

```json
{ "productId": "PRODUCT_ID" }
```

### GET `/wishlist` (locked)

Lay wishlist cua user.

### DELETE `/wishlist/remove` (locked)

```json
{ "productId": "PRODUCT_ID" }
```
