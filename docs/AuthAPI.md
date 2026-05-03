## Auth API

**Base URL:** `/api/users`
**Xác thực:** Các route có 🔒 yêu cầu header `Authorization: Bearer <token>`

---

### Đăng ký

#### POST `/register`
Đăng ký tài khoản mới, hệ thống sẽ gửi OTP về email.

**Request Body:**
```json
{
  "email": "string",
  "password": "string",
  "username": "string"
}
```

**Response:**
```json
{ "message": "OTP sent to email. Please verify your account." }
```

---

### Xác thực OTP

#### POST `/verifyOtp`
Xác thực tài khoản sau khi đăng ký.

**Request Body:**
```json
{
  "email": "string",
  "otp": "string"
}
```

**Response:**
```json
{ "message": "Xác thực thành công" }
```

---

### Đăng nhập

#### POST `/login`
Đăng nhập bằng email và mật khẩu.

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "message": "Đăng nhập thành công",
  "token": "string",
  "refreshToken": "string"
}
```

> Cookie `refreshToken` sẽ được set tự động (`httpOnly`, `sameSite: Lax`, hết hạn sau 7 ngày).

---

### Đăng nhập Google

#### GET `/auth/google`
Chuyển hướng người dùng đến trang đăng nhập Google.

Không cần body, gọi trực tiếp trên browser.

#### GET `/auth/google/callback`
Callback sau khi Google xác thực thành công.

**Response:** Redirect về:
```
http://localhost:3001/login?token=<token>&username=<username>&email=<email>
```

---

### Quên mật khẩu

#### POST `/forgot-password`
Gửi OTP về email để reset mật khẩu.

**Request Body:**
```json
{ "email": "string" }
```

**Response:**
```json
{ "message": "OTP đã được gửi đến email của bạn" }
```

---

### Reset mật khẩu

#### POST `/reset-password`
Đặt lại mật khẩu bằng OTP đã nhận.

**Request Body:**
```json
{
  "email": "string",
  "otp": "string",
  "newPassword": "string"
}
```

**Response:**
```json
{ "message": "Mật khẩu đã được cập nhật thành công" }
```

---

### Refresh Token

#### POST `/refresh-token`
Lấy `accessToken` mới từ `refreshToken` trong cookie.

Không cần body, hệ thống tự đọc cookie `refreshToken`.

**Response:**
```json
{ "token": "string" }
```

---

> 🔒 = yêu cầu `Authorization: Bearer <token>`
