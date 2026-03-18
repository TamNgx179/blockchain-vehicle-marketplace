## Contact API

**Base URL:** `/api/contact`
**Xác thực:** Không yêu cầu token (public routes)

---

### Lấy tất cả liên hệ

#### GET `/getAll`
Lấy toàn bộ danh sách liên hệ.

Không cần body.

**Response:**
```json
[ ...danh sách liên hệ ]
```

---

### Lấy liên hệ theo ID

#### GET `/:id`
Lấy thông tin một liên hệ cụ thể.

**URL Param:** `id` — MongoDB `_id` của liên hệ

Không cần body.

**Response:**
```json
{ ...thông tin liên hệ }
```

---

### Tạo liên hệ mới

#### POST `/create`
Tạo một liên hệ mới.

**Request Body:**
```json
{
  "name": "string",
  "email": "string",
  "message": "string"
}
```

**Response:**
```json
{ ...thông tin liên hệ vừa tạo }
```

---

### Đánh dấu đã đọc

#### PUT `/read/:id`
Đánh dấu một liên hệ là đã đọc.

**URL Param:** `id` — MongoDB `_id` của liên hệ

Không cần body.

**Response:**
```json
{ ...thông tin liên hệ sau khi cập nhật }
```

---

> ⚠️ Các route này không có middleware xác thực. Nếu cần bảo vệ (đặc biệt là `getAll` và `read`), nên thêm `authenticateToken` và `requireAdmin` vào sau.