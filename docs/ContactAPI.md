## Contact API

**Base URL:** `/api/contacts`

Route ben duoi can header `Authorization: Bearer <ACCESS_TOKEN>` theo ghi chu tung route.

## GET `/getAll` (admin)

Lay tat ca contact.

## POST `/create` (locked)

User da dang nhap tao contact moi.

**Request body:**

```json
{
  "name": "Nguyen Van A",
  "email": "a@example.com",
  "message": "I need support"
}
```

## GET `/:id` (admin)

Lay chi tiet mot contact.

## PUT `/read/:id` (admin)

Danh dau contact da doc.

**Legend:**

- `locked`: can user token.
- `admin`: can user token va role admin.
