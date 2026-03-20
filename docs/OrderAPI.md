## Order API

**Base URL:** `/api/order`
**Xác thực:** Tất cả các route đều yêu cầu header `Authorization: Bearer <token>`

---

### Tạo đơn hàng từ giỏ hàng

#### POST `/create-from-cart` 🔒
Tạo đơn hàng mới từ giỏ hàng hiện tại của user.

**Request Body:**
```json
{
  "shippingAddress": "string",
  "paymentMethod": "string"
}
```

> ⚠️ Các trường body cụ thể phụ thuộc vào `OrderService` — kiểm tra thêm trong `service/OrderService.js` để xác nhận.

**Response:**
```json
{
  "success": true,
  "message": "Tạo đơn hàng thành công",
  "data": { ...thông tin đơn hàng }
}
```

---

> 🔒 = yêu cầu `Authorization: Bearer <token>`