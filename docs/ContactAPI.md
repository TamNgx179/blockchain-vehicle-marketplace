## Contact API

**Base URL:** `/api/contacts`

Route bên dưới cần header `Authorization: Bearer <ACCESS_TOKEN>` theo ghi chú từng route.

## GET `/getAll` (admin)

Lấy tất cả contact.

## POST `/create` (locked)

User đã đăng nhập tạo contact mới.

**Request body:**

```json
{
  "name": "Nguyen Van A",
  "email": "a@example.com",
  "message": "I need support"
}
```

## GET `/:id` (admin)

Lấy chi tiết một contact.

## PUT `/read/:id` (admin)

Đánh dấu contact đã đọc.

**Legend:**

- `locked`: cần user token.
- `admin`: cần user token và role admin.