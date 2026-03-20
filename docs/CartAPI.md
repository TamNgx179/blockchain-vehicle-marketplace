## Cart API

**Base URL:** `/api/cart`
**Xác thực:** Tất cả các route đều yêu cầu header `Authorization: Bearer <token>`

---

### User Routes

#### GET `/`
Lấy giỏ hàng của user đang đăng nhập.

Không cần body.

**Response:**
```json
{
  "success": true,
  "data": { ...thông tin giỏ hàng }
}
```

---

#### GET `/total`
Lấy tổng số lượng sản phẩm trong giỏ hàng (dùng cho icon cart).

Không cần body.

**Response:**
```json
{
  "success": true,
  "data": { ...tổng số lượng }
}
```

---

#### POST `/add`
Thêm sản phẩm vào giỏ hàng.

**Request Body:**
```json
{
  "productId": "string",
  "quantity": "number"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Đã thêm vào giỏ hàng",
  "data": { ...thông tin giỏ hàng }
}
```

---

#### PUT `/update/:productId`
Cập nhật số lượng sản phẩm trong giỏ hàng.

**URL Param:** `productId` — MongoDB `_id` của sản phẩm

**Request Body:**
```json
{
  "quantity": "number"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Đã cập nhật giỏ hàng",
  "data": { ...thông tin giỏ hàng }
}
```

---

#### DELETE `/remove/:productId`
Xóa một sản phẩm khỏi giỏ hàng.

**URL Param:** `productId` — MongoDB `_id` của sản phẩm

Không cần body.

**Response:**
```json
{
  "success": true,
  "message": "Đã xóa sản phẩm khỏi giỏ",
  "data": { ...thông tin giỏ hàng }
}
```

---

#### DELETE `/clear`
Xóa toàn bộ sản phẩm trong giỏ hàng.

Không cần body.

**Response:**
```json
{
  "success": true,
  "message": "string"
}
```

---

### Admin Routes

#### GET `/admin/all` 🔑
Lấy giỏ hàng của tất cả user (chỉ admin).

Không cần body.

**Response:**
```json
{
  "success": true,
  "data": [ ...danh sách giỏ hàng ]
}
```

---

> 🔒 = yêu cầu `Authorization: Bearer <token>`
> 🔑 = yêu cầu role **admin**