# Backend API

Backend dùng Node.js, Express 5, MongoDB/Mongoose và ethers.js để xử lý nghiệp vụ off-chain và đồng bộ với smart contract Sepolia.

## Chạy local

```bash
cd backend
npm install
npm run dev
```

Server mặc định:

```text
http://localhost:3000
```

## Scripts

| Script | Mô tả |
| --- | --- |
| `npm run dev` | Chạy server bằng nodemon |
| `npm start` | Chạy server bằng Node |
| `npm test` | Chạy Node test runner |
| `npm run check:mailer` | Kiểm tra cấu hình mailer |

## Env cần có

Tạo file local:

```bash
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

`SEPOLIA_PRIVATE_KEY` phải thuộc về `SELLER_WALLET`, vì backend dùng wallet này để tạo order on-chain, seller confirm và admin cancel.

## Route groups

| Base URL | Mô tả |
| --- | --- |
| `/api/users` | Auth, OTP, login, refresh token, forgot/reset password |
| `/api/accounts` | Profile, password, wishlist |
| `/api/products` | Product CRUD và upload ảnh |
| `/api/reviews` | Review theo product |
| `/api/contacts` | Contact form/admin contact |
| `/api/cart` | Cart user/admin |
| `/api/wallets` | Saved MetaMask wallets |
| `/api/orders` | Checkout, My Orders, blockchain verify, admin orders |
| `/api/dashboard` | Admin dashboard |

## Blockchain integration

Backend tạo order on-chain trước khi lưu order vào MongoDB. Sau khi frontend gửi transaction bằng MetaMask, backend verify `txHash` bằng:

- receipt tồn tại và `status === 1`;
- transaction gọi đúng contract;
- event đúng action và đúng `blockchainOrderId`;
- `receipt.from` khớp buyer/seller wallet;
- state on-chain khớp MongoDB.

Thông tin chi tiết nằm trong `../blockchain/README.md`.