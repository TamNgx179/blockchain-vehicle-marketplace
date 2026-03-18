```sh
## Account API

**Base URL:** `/api/account`
**Xác thực:** Các route có 🔒 yêu cầu header `Authorization: Bearer <token>`

---

### Xác thực

#### POST `/logout`
Không cần token.

**Request Body:**
```json
{ "refreshToken": "string" }
```

**Response:**
```json
{ "message": "Logout successful" }
```

---

### Mật khẩu

#### POST `/changePassword` 🔒

**Request Body:**
```json
{
  "oldPassword": "string",
  "newPassword": "string",
  "resNewPassword": "string"
}
```

**Response:**
```json
{ "message": "string" }
```

---

### Hồ sơ cá nhân

#### GET `/getProfile` 🔒
Không cần body.

**Response:**
```json
{ "data": { ...thông tin user } }
```

#### PUT `/editProfile` 🔒

**Request Body:**
```json
{ "name": "string", "phone": "string", ... }
```

**Response:**
```json
{ "user": { ...thông tin user sau khi cập nhật } }
```

---

### Xóa tài khoản

#### DELETE `/me` 🔒
Xóa chính tài khoản đang đăng nhập.

**Response:**
```json
{ "message": "User deleted successfully", "user": { ...user đã xóa } }
```

#### DELETE `/:id` 🔒
Admin hoặc tự xóa chính mình theo ID.

**URL Param:** `id` — MongoDB `_id` của user

**Response:**
```json
{ "message": "User deleted successfully", "user": { ...user đã xóa } }
```

---

### Wishlist

#### POST `/wishlist/add` 🔒

**Request Body:**
```json
{ "productId": "string" }
```

**Response:**
```json
{ "message": "Product added to wishlist", "wishlist": [...] }
```

#### GET `/wishlist` 🔒
Không cần body.

**Response:**
```json
{ "wishlist": [...] }
```

#### DELETE `/wishlist/remove` 🔒

**Request Body:**
```json
{ "productId": "string" }
```

**Response:**
```json
{ "message": "Product removed from wishlist", "wishlist": [...] }
```

---

> 🔒 = yêu cầu `Authorization: Bearer <token>`
```