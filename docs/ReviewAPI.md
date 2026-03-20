## Review API

**Base URL:** `/api/review`
**Xác thực:** Các route có 🔒 yêu cầu header `Authorization: Bearer <token>`

---

### Tạo đánh giá mới

#### POST `/create` 🔒
Tạo đánh giá cho một sản phẩm. Yêu cầu đăng nhập.

**Request Body:**
```json
{
  "productId": "string",
  "rating": "number",
  "comment": "string"
}
```

**Response:**
```json
{ ...thông tin đánh giá vừa tạo }
```

---

### Lấy đánh giá theo sản phẩm

#### GET `/product/:productId`
Lấy tất cả đánh giá của một sản phẩm. Không cần đăng nhập.

**URL Param:** `productId` — MongoDB `_id` của sản phẩm

Không cần body.

**Response:**
```json
[ ...danh sách đánh giá ]
```

---

> 🔒 = yêu cầu `Authorization: Bearer <token>`