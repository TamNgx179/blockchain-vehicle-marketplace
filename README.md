# Saigon Speed - Car Marketplace with Blockchain Escrow

> IE213.Q21 - Ky thuat phat trien he thong Web | Nhom 6

Saigon Speed la website mua ban xe ket hop React, Express, MongoDB va Ethereum Sepolia. He thong xu ly du lieu san pham, gio hang, tai khoan va don hang off-chain; cac buoc dat coc/thanh toan duoc ghi nhan on-chain bang smart contract escrow va MetaMask.

## Noi dung

- [Cong nghe](#cong-nghe)
- [Kien truc](#kien-truc)
- [Chuc nang chinh](#chuc-nang-chinh)
- [Checkout va blockchain](#checkout-va-blockchain)
- [Cai dat](#cai-dat)
- [Bien moi truong](#bien-moi-truong)
- [Tai lieu API](#tai-lieu-api)
- [Luu y khi test MetaMask](#luu-y-khi-test-metamask)

## Cong nghe

| Thanh phan | Cong nghe |
| --- | --- |
| Frontend | React 19 + Vite + React Router |
| Backend | Node.js + Express 5 |
| Database | MongoDB + Mongoose |
| Blockchain | Ethereum Sepolia Testnet |
| Smart contract | Solidity + Hardhat |
| Wallet | MetaMask |
| Web3 client | ethers.js v6 |

## Kien truc

```text
React Frontend
  - Cars and Reviews
  - Cart / Checkout / My Orders
  - Profile + Wallet Management
  - Admin product, order, contact, dashboard

Express Backend
  - Auth, Account, Product, Review, Cart, Order, Wallet APIs
  - Tao order on-chain bang seller/server wallet
  - Verify transaction receipt va event log
  - Dong bo trang thai order vao MongoDB

VehicleMarketplaceEscrow
  - Luu orderId, buyer, seller, total/deposit amount
  - Nhan payDeposit/payFull tu buyer
  - Cho seller confirm, buyer complete, cancel/refund
```

Blockchain khong thay the database. MongoDB van la noi luu chi tiet user, product, cart, delivery info va order detail; smart contract chi luu nhung du lieu can minh bach va doi chieu giao dich.

## Chuc nang chinh

- Xac thuc user/admin bang JWT, OTP email, forgot/reset password.
- Quan ly san pham xe, hinh anh, thong so, review va wishlist.
- Gio hang va checkout theo tung xe da chon.
- Profile gom edit profile, change password va wallet management.
- Moi tai khoan co the luu nhieu vi MetaMask.
- Wallet management cho phep connect, set default, delete; khong cho edit chi tiet vi.
- Checkout chi dung MetaMask escrow, khong con thanh toan tien mat.
- User co the chon vi da luu de thanh toan.
- Admin quan ly order, confirm/cancel order bang seller/server wallet.

## Checkout va blockchain

Checkout hien tai gom 4 buoc:

1. `Vehicle`: chon xe trong gio hang, sua quantity hoac xoa xe.
2. `Handover`: chon showroom pickup hoac home delivery.
3. `Deposit`: dien contact, chon payment plan va chon MetaMask wallet.
4. `Done`: hien thi confirmation va transaction hash.

Payment plan:

| Plan | Mo ta |
| --- | --- |
| `deposit` | Thanh toan tien coc truoc. So con lai chi thanh toan sau khi nhan xe. |
| `full` | Thanh toan toan bo gia tri don ngay tren smart contract. |

Ty gia gia lap dang dung:

```text
USD_PER_ETH=2000000
deposit rate = 0.5% tong gia xe
```

Vi du xe `$13,000`:

```text
Full amount = 0.0065 ETH
Deposit = 0.0000325 ETH ($65)
Remaining = 0.0064675 ETH ($12,935)
```

## Cai dat

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

Backend mac dinh chay tai:

```text
http://localhost:3000
```

### 3. Frontend

```bash
cd frontend/car-sales-web
npm install
npm run dev
```

Vite mac dinh chay tai:

```text
http://localhost:5173
```

### 4. Blockchain tests

```bash
cd blockchain
npm install
npm test
```

## Bien moi truong

### Backend `.env`

Tao file tu template:

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

Tao file tu template:

```bash
cd frontend/car-sales-web
cp .env.example .env
```

```env
VITE_API_URL=http://localhost:3000
VITE_CONTRACT_ADDRESS=0xD0CF607f0bCD60B5ed02896e682450eA4dBf5BB0
VITE_USD_PER_ETH=2000000
```

Quan trong: `CONTRACT_ADDRESS` cua backend va `VITE_CONTRACT_ADDRESS` cua frontend phai giong nhau. Sau khi doi env, restart ca backend va frontend.

### Blockchain `.env`

Tao file tu template neu can compile/deploy/verify contract:

```bash
cd blockchain
cp .env.example .env
```

## Tai lieu API

Tai lieu route nam trong thu muc `docs/`:

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

## Luu y khi test MetaMask

- Chon dung network `Sepolia`.
- Vi buyer phai co Sepolia ETH de tra tien va gas.
- Khong dung `SELLER_WALLET` lam buyer wallet khi test checkout.
- Wallet duoc chon trong checkout phai la account dang active trong MetaMask.
- Neu MetaMask khong hien popup, giao dich thuong da bi reject o buoc `estimateGas`. Kiem tra:
  - frontend/backend co cung contract address khong;
  - wallet dang active co phai buyer cua order khong;
  - payment plan va amount co khop order on-chain khong;
  - order tren contract con status `Pending` khong.

## License

Du an phuc vu muc dich hoc tap cho mon IE213.Q21.
