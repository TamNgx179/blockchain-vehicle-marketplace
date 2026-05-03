# Saigon Speed - Car Marketplace with Blockchain Escrow

> IE213.Q21 - Kỹ thuật phát triển hệ thống Web | Nhóm 6

Saigon Speed là website mua bán xe kết hợp React, Express, MongoDB và Ethereum Sepolia. Hệ thống xử lý dữ liệu sản phẩm, giỏ hàng, tài khoản và đơn hàng off-chain; các bước đặt cọc/thanh toán được ghi nhận on-chain bằng smart contract escrow và MetaMask.

## Nội dung

- [Công nghệ](#công-nghệ)
- [Kiến trúc](#kiến-trúc)
- [Chức năng chính](#chức-năng-chính)
- [Checkout và blockchain](#checkout-và-blockchain)
- [Cài đặt](#cài-đặt)
- [Biến môi trường](#biến-môi-trường)
- [Tài liệu API](#tài-liệu-api)
- [Lưu ý khi test Metamask](#lưu-ý-khi-test-metamask)

## Công nghệ

| Thành phần | Công nghệ |
| --- | --- |
| Frontend | React 19 + Vite + React Router |
| Backend | Node.js + Express 5 |
| Database | MongoDB + Mongoose |
| Blockchain | Ethereum Sepolia Testnet |
| Smart contract | Solidity + Hardhat |
| Wallet | MetaMask |
| Web3 client | ethers.js v6 |

## Kiến trúc

```text
React Frontend
  - Cars and Reviews
  - Cart / Checkout / My Orders
  - Profile + Wallet Management
  - Admin product, order, contact, dashboard

Express Backend
  - Auth, Account, Product, Review, Cart, Order, Wallet APIs
  - Tạo order on-chain bằng seller/server wallet
  - Verify transaction receipt và event log
  - Đồng bộ trạng thái order vao MongoDB

VehicleMarketplaceEscrow
  - Lưu orderId, buyer, seller, total/deposit amount
  - Nhấn payDeposit/payFull từ buyer
  - Cho seller confirm, buyer complete, cancel/refund
```

Blockchain không thay thế database. MongoDB vẫn là nơi lưu chi tiết user, product, cart, delivery info và order detail; smart contract chỉ lưu những dữ liệu cần minh bạch và đối chiếu giao dịch.

## Chức năng chính

- Xác thực user/admin bằng JWT, OTP email, forgot/reset password.
- Quản lý sản phẩm xe, hình ảnh, thông số, review va wishlist.
- Giỏ hàng và checkout theo từng xe đã chọn.
- Profile gồm edit profile, change password và wallet management.
- Mỗi tài khoản có thể lưu nhiều ví MetaMask.
- Wallet management cho phép connect, set default, delete.
- Checkout chỉ dùng MetaMask escrow.
- User có thể chọn ví đã lưu để thanh toán.
- Admin quản lý order, confirm/cancel order bằng seller/server wallet.

## Checkout và blockchain

Checkout hiện tại gồm 4 bước:

1. `Vehicle`: chọn xe trong giỏ hàng, sửa quantity hoặc xóa xe.
2. `Handover`: chọn showroom pickup hoặc home delivery.
3. `Deposit`: điền contact, chọn payment plan và chọn MetaMask wallet.
4. `Done`: hiển thị confirmation và transaction hash.

Payment plan:

| Plan | Mô tả |
| --- | --- |
| `deposit` | Thanh toán tiền cọc trước. Số còn lại chỉ thanh toán sau khi nhận xe. |
| `full` | Thanh toán toàn bộ giá trị đơn trên smart contract. |

Tỷ giá giả lập đang dùng:

```text
USD_PER_ETH=2000000
deposit rate = 0.5% tổng giá xe
```

Ví dụ xe `$13,000`:

```text
Full amount = 0.0065 ETH
Deposit = 0.0000325 ETH ($65)
Remaining = 0.0064675 ETH ($12,935)
```

## Cài đặt

### 1. Clone repo

```bash
git clone https://github.com/cogramer/Ky-thuat-phat-trien-he-thong-Web-IE213.Q21-Nhom-6.git
cd Ky-thuat-phat-trien-he-thong-Web-IE213.Q21-Nhom-6
```

### 2. Backend

```bash
cd backend
npm install
npm run dev
```

Backend mặc định chạy tại:

```text
http://localhost:3000
```

### 3. Frontend

```bash
cd frontend/car-sales-web
npm install
npm run dev
```

Vite mặc định chạy tại:

```text
http://localhost:5173
```

### 4. Blockchain tests

```bash
cd blockchain
npm install
npm test
```

## Biến môi trường

### Backend `.env`

Tạo file từ template:

```bash
cd backend
cp .env.example .env
```

```env
PORT=3000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_access_token_secret
JWT_REFRESH_SECRET=your_refresh_token_secret

SEPOLIA_RPC_URL=your_sepolia_rpc_url
SEPOLIA_PRIVATE_KEY=private_key_of_seller_server_wallet
CONTRACT_ADDRESS=0xD0CF607f0bCD60B5ed02896e682450eA4dBf5BB0
SELLER_WALLET=0x3aB431DC9782DA26bBdB002e94Fa057A13D2049F
USD_PER_ETH=2000000
```

### Frontend `frontend/car-sales-web/.env`

Tao file từ template:

```bash
cd frontend/car-sales-web
cp .env.example .env
```

```env
VITE_API_URL=http://localhost:3000
VITE_CONTRACT_ADDRESS=0xD0CF607f0bCD60B5ed02896e682450eA4dBf5BB0
VITE_USD_PER_ETH=2000000
```

Quan trọng: `CONTRACT_ADDRESS` của backend va `VITE_CONTRACT_ADDRESS` của frontend phải giống nhau. Sau khi đổi env, restart cả backend và frontend.

### Blockchain `.env`

Tạo file từ template nếu cần compile/deploy/verify contract:

```bash
cd blockchain
cp .env.example .env
```

## Tài liệu API

Tài liệu route nằm trong thư mục `docs/`:

- `docs/AuthAPI.md`
- `docs/AccountAPI.md`
- `docs/WalletAPI.md`
- `docs/CartAPI.md`
- `docs/OrderAPI.md`
- `docs/AdminOrderAPI.md`
- `docs/ProductAPI.md`
- `docs/ReviewAPI.md`
- `docs/ContactAPI.md`
- `docs/DashboardAPI.md`

## Lưu ý khi test Metamask

- Chọn đúng network `Sepolia`.
- Ví buyer phải có Sepolia ETH để trả tiền và gas.
- Không dùng `SELLER_WALLET` làm buyer wallet khi test checkout.
- Wallet được chọn trong checkout phải là account đang active trong MetaMask.
- Nếu Metamask không hiện popup, giao dịch thường đã bị reject ở bước `estimateGas`. Kiểm tra:
  - frontend/backend có cùng contract address không;
  - wallet đang active có phải buyer của order không;
  - payment plan va amount có khớp order on-chain không;
  - order trên contract còn status `Pending` không.

## License

Dự án phục vụ mục đích học tập cho môn IE213.Q21.
