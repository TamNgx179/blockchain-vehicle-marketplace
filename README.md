# Mô Phỏng Sàn Thương Mại Xe Tích Hợp Blockchain

> **IE213.Q21 — Kỹ thuật Phát triển Hệ thống Web | Nhóm 6 | GVHD: Võ Tấn Khoa**

Dự án xây dựng website mô phỏng sàn thương mại điện tử mua bán xe, tích hợp **Blockchain Ethereum** vào quy trình đặt cọc nhằm đảm bảo tính minh bạch và bảo mật trong giao dịch.

---

## Mục Lục

- [Giới thiệu](#-giới-thiệu)
- [Công nghệ sử dụng](#-công-nghệ-sử-dụng)
- [Kiến trúc hệ thống](#-kiến-trúc-hệ-thống)
- [Chức năng chính](#-chức-năng-chính)
- [Quy trình đặt cọc bằng Blockchain](#-quy-trình-đặt-cọc-bằng-blockchain)
- [Cài đặt & Chạy dự án](#-cài-đặt--chạy-dự-án)
- [Thành viên & Phân công](#-thành-viên--phân-công)

---

## Giới Thiệu

Hệ thống hoạt động theo **mô hình Off-chain kết hợp On-chain**:

- Các nghiệp vụ thông thường (quản lý xe, giỏ hàng, đơn hàng, người dùng) được xử lý **off-chain** trên server truyền thống.
- **Blockchain Ethereum** được tích hợp tại bước **đặt cọc khi mua xe**.
- **Smart Contract** được dùng để ghi nhận và xác nhận giao dịch đặt cọc một cách minh bạch, không thể giả mạo.

---

## Công Nghệ Sử Dụng

| Thành phần | Công nghệ |
|---|---|
| **Database** | MongoDB |
| **Backend** | Node.js + Express |
| **Frontend** | React Native (Web) |
| **Blockchain** | Ethereum (Sepolia Testnet) |
| **Smart Contract** | Solidity + Hardhat |
| **Wallet** | MetaMask |
| **Blockchain SDK** | Ethers.js |

---

## Kiến Trúc Hệ Thống

### Mô hình Off-chain kết hợp Blockchain

| Off-chain (Website & Server) | On-chain (Blockchain Ethereum) |
|---|---|
| Quản lý thông tin xe | Ghi nhận giao dịch đặt cọc |
| Quản lý giỏ hàng | Lưu địa chỉ ví người đặt cọc |
| Tạo và quản lý đơn hàng | Lưu mã đơn hàng liên kết giao dịch |
| Quản lý thông tin người dùng | Xác nhận giao dịch trên blockchain |
| Cập nhật trạng thái đơn hàng | Lưu dấu vết giao dịch minh bạch |

---

## Chức Năng Chính

### 1. Quản lý thông tin xe (Off-chain)

Thêm, sửa, xóa, tìm kiếm xe trên sàn. Admin quản lý danh mục xe; user xem và chọn xe để mua.

### 2. Giỏ hàng (Off-chain)

User thêm xe vào giỏ, cập nhật số lượng (hoặc xóa), xem tổng giá — chuẩn bị cho bước đặt cọc.

### 3. Tạo & quản lý đơn hàng (Off-chain + On-chain)

User tạo đơn hàng từ giỏ hàng → điền thông tin → tiến hành đặt cọc qua blockchain. Mã đơn hàng được lưu liên kết với giao dịch on-chain.

### 4. Đặt cọc bằng Blockchain Ethereum (On-chain)

Luồng 5 bước: chọn xe → tạo đơn → kết nối MetaMask → ký & gửi ETH lên Smart Contract → blockchain xác nhận, backend lắng nghe Event và cập nhật trạng thái đơn hàng thành **"Đã đặt cọc"**.

### 5. Xác thực người dùng (Off-chain)

Đăng ký / đăng nhập với phân quyền User và Admin. **JWT authentication** bảo vệ các API.

### 6. Quản lý người dùng (Off-chain — Admin)

Admin xem danh sách user, quản lý tài khoản, theo dõi lịch sử giao dịch.

### 7. Cập nhật trạng thái đơn hàng (Off-chain + On-chain)

Backend nhận Event từ Smart Contract → tự động cập nhật trạng thái → lưu địa chỉ ví người đặt cọc và hash giao dịch để minh bạch.

---

## Quy Trình Đặt Cọc Bằng Blockchain

```ini
Bước 1: Chọn xe
    └─ Người dùng chọn xe trên giao diện, chuyển đến các bước tiếp theo

Bước 2: Tạo đơn hàng
    └─ Điền các thông tin cần thiết để tạo đơn hàng và tiến hành đặt cọc

Bước 3: Kết nối MetaMask
    └─ Kích hoạt web3 provider, kết nối ví người dùng với hệ thống

Bước 4: Ký gửi và đặt cọc
    ├─ Người dùng ký xác nhận mức tiền cọc
    └─ Giao dịch được đẩy đến Smart Contract qua Ethers.js

Bước 5: Xác nhận và cập nhật
    ├─ Blockchain xác nhận block mới (State Transition)
    └─ Backend nhận tín hiệu sự kiện (Event) → cập nhật trạng thái đơn hàng thành "Đã đặt cọc"
```

---

## Cài Đặt & Chạy Dự Án

### Yêu cầu

- Node.js >= 18
- MongoDB
- MetaMask (extension trình duyệt)
- Tài khoản Sepolia Testnet với ETH test

### Clone dự án

```bash
git clone https://github.com/cogramer/Ky-thuat-phat-trien-he-thong-Web-IE213.Q21-Nhom-6.git
cd Ky-thuat-phat-trien-he-thong-Web-IE213.Q21-Nhom-6
```

### Cài đặt Backend

```bash
cd backend
npm install
cp .env.example .env   # Cấu hình biến môi trường
npm run dev
```

### Cài đặt Frontend

```bash
cd frontend
npm install
npm start
```

### Biến môi trường cần thiết (`.env`)

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CONTRACT_ADDRESS=your_deployed_contract_address
SEPOLIA_RPC_URL=your_sepolia_rpc_url
```

---

## Thành Viên & Phân Công

| MSSV | Họ và Tên | Công việc phụ trách |
|---|---|---|
| 23520101 | **Huỳnh Khánh Bảo** | API giỏ hàng, viết document cho các API, hỗ trợ frontend tích hợp với backend, làm slide, thuyết trình |
| 23521390 | **Nguyễn Minh Tâm** | Khởi tạo dự án backend, viết Smart Contract deploy lên Sepolia Testnet, API xác thực & tài khoản, tích hợp blockchain vào API đơn hàng, giao diện trang contact/profile/quản lý admin, viết báo cáo |
| 23520195 | **Dương Chí Cường** | Khởi tạo dự án frontend, cấu hình điều hướng & kiến trúc, README, giao diện Trang chủ/Header/Footer, trang thanh toán & giỏ hàng, kết nối MetaMask, các file service, Dashboard & quản lý admin |
| 23521456 | **Nguyễn Văn Thanh** | Khởi tạo dự án backend, API Dashboard/Product/Review/Contact, hỗ trợ tích hợp blockchain, viết báo cáo, giao diện trang About/Wishlist/Quên mật khẩu, responsive |
| 23520870 | **Huỳnh Tiến Lợi** | Giao diện trang danh sách xe, trang xe chi tiết kèm review, trang đăng nhập & đăng ký, kiểm thử trang web |

---

## Giấy Phép

Dự án được thực hiện cho mục đích học thuật — môn **IE213.Q21 Kỹ thuật Phát triển Hệ thống Web**, Trường Đại học Công nghệ Thông tin, ĐHQG-HCM.
