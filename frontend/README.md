# Chuẩn bị đối với các bạn Dev tham gia dự án
# Cài đặt môi trường cho dự án  
## ReactJS + Material UI | TrungQuanDev

## 1. Cài đặt môi trường cho dự án

Trong quá trình cài đặt có thể sử dụng **AI hỗ trợ** để hướng dẫn nếu gặp lỗi.

### 1.1 Cài đặt Node.js
Cài đặt Node.js theo **phiên bản yêu cầu của dự án**. (22.13.1)

Link tải:

https://nodejs.org/en/download

Sau khi cài đặt xong kiểm tra:

```bash
node -v
npm -v
```

---

### 1.2 Cài đặt NVM (Node Version Manager)

NVM giúp quản lý nhiều phiên bản Node.js trên cùng một máy. (nvm 1.2.2)

**Windows**

Cài đặt tại:

https://github.com/coreybutler/nvm-windows

Kiểm tra:

```bash
nvm version
```

Cài Node version:

```bash
nvm install 18
nvm use 18
```

**MacOS**

Đối với Mac có thể dùng `zsh`.

Cài NVM bằng terminal:

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash
```

Kiểm tra:

```bash
nvm --version
```

---

### 1.3 Cài đặt Git và Git Bash (git version 2.47.1.windows.2)

Tải Git tại:

https://git-scm.com/downloads

Kiểm tra sau khi cài:

```bash
git --version
```

---

### 1.4 Cài đặt Visual Studio Code

Tải VS Code:

https://code.visualstudio.com/

Khuyến nghị cài thêm extensions:

- ES7+ React Snippets
- Prettier
- ESLint
- Material Icon Theme

---

### 1.5 Cài đặt Yarn (1.22.22)

Yarn là công cụ quản lý package **chạy nhanh hơn npm**, phù hợp cho việc phát triển dự án.

Cài đặt:

```bash
npm install -g yarn
```

Kiểm tra:

```bash
yarn -v
```

---

## 2. Built Tool của dự án

Hiện tại dự án đang sử dụng **Vite** làm build tool.

Vite giúp:

- Build nhanh
- Hot reload nhanh
- Cấu hình đơn giản

Trang chủ:

https://vitejs.dev/

---

## 3. Vite, Create React App và NextJS – Lựa chọn cái nào?

| Tool | Mục đích | Đặc điểm |
|-----|-----|-----|
| Vite | Build tool | Nhanh, nhẹ, hot reload tốt |
| Create React App | Tool cũ | Dễ setup nhưng build chậm |
| Next.js | React Framework | Hỗ trợ SSR, routing, backend API |

Dự án này sử dụng **Vite** vì:

- Tốc độ build nhanh
- Setup đơn giản
- Phù hợp cho SPA

---

## 4. Kiến trúc dự án (Project Structure)
Khi khởi tạo

```
yarn create vite
JavaScript
```

Ví dụ cấu trúc thư mục:

```
car-sales-web/
│
├── node_modules/
├── public/
│
├── src/
│   ├── assets/
│   ├── App.css
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
│
├── .gitignore
├── eslint.config.js
├── index.html
├── package.json
├── vite.config.js
├── yarn.lock
└── README.md
```

---

## 5. Tổng kết

Sau khi hoàn thành cài đặt, môi trường phát triển cần có:

- NodeJS
- NVM
- Git
- VS Code
- Yarn
- Vite