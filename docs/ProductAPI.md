## Product API

**Base URL:** `/api/product`
**Xác thực:** Các route có 🔒 yêu cầu header `Authorization: Bearer <token>`

---

### Lấy tất cả sản phẩm

#### GET `/getAll`
Lấy toàn bộ danh sách sản phẩm.

Không cần body.

**Response:**
```json
[ ...danh sách sản phẩm ]
```

---

### Lọc sản phẩm

#### GET `/filter`
Lọc sản phẩm theo các tiêu chí truyền qua query string.

**Query Params:**
```
?brand=string
&type=string
&minPrice=number
&maxPrice=number
&sort=string
&page=number
&limit=number
```

> ⚠️ Các query param cụ thể phụ thuộc vào `filterProductsService` — kiểm tra thêm trong `service/ProductService.js` để xác nhận.

**Response:**
```json
{
  "success": true,
  "message": "Lọc xe thành công",
  ...kết quả lọc
}
```

---

### Lấy sản phẩm theo ID

#### GET `/:id`
Lấy thông tin chi tiết một sản phẩm.

**URL Param:** `id` — MongoDB `_id` của sản phẩm

Không cần body.

**Response:**
```json
{ ...thông tin sản phẩm }
```

---

### Tạo sản phẩm mới

#### POST `/create` 🔒🔑
Tạo sản phẩm mới, hỗ trợ upload ảnh.

**Content-Type:** `multipart/form-data`

**Request Body:**
```
thumbnailImage  : file (tối đa 1 ảnh)
heroImage       : file (tối đa 1 ảnh)
galleryImages   : file (tối đa 10 ảnh)
name            : string
price           : number
...các trường khác của sản phẩm
```

**Response:**
```json
{
  "success": true,
  "message": "Tạo sản phẩm thành công",
  "data": { ...thông tin sản phẩm }
}
```

---

### Cập nhật sản phẩm

#### PUT `/edit/:id` 🔒🔑
Cập nhật thông tin sản phẩm, hỗ trợ upload ảnh mới.

**URL Param:** `id` — MongoDB `_id` của sản phẩm

**Content-Type:** `multipart/form-data`

**Request Body:**
```
thumbnailImage  : file (tối đa 1 ảnh)
heroImage       : file (tối đa 1 ảnh)
galleryImages   : file (tối đa 10 ảnh)
name            : string
price           : number
...các trường muốn cập nhật
```

**Response:**
```json
{
  "success": true,
  "message": "Cập nhật sản phẩm thành công",
  "data": { ...thông tin sản phẩm sau khi cập nhật }
}
```

---

### Xóa sản phẩm

#### DELETE `/deleteOne/:id` 🔒🔑
Xóa một sản phẩm theo ID.

**URL Param:** `id` — MongoDB `_id` của sản phẩm

Không cần body.

**Response:**
```json
{ "message": "Đã xóa sản phẩm" }
```

---

> 🔒 = yêu cầu `Authorization: Bearer <token>`
> 🔑 = yêu cầu role **admin**