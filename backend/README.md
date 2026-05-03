# Backend API

Backend dung Node.js, Express 5, MongoDB/Mongoose va ethers.js de xu ly nghiep vu off-chain va dong bo voi smart contract Sepolia.

## Chay local

```bash
cd backend
npm install
npm run dev
```

Server mac dinh:

```text
http://localhost:3000
```

## Scripts

| Script | Mo ta |
| --- | --- |
| `npm run dev` | Chay server bang nodemon |
| `npm start` | Chay server bang Node |
| `npm test` | Chay Node test runner |
| `npm run check:mailer` | Kiem tra cau hinh mailer |

## Env can co

Tao file local:

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

`SEPOLIA_PRIVATE_KEY` phai thuoc ve `SELLER_WALLET`, vi backend dung wallet nay de tao order on-chain, seller confirm va admin cancel.

## Route groups

| Base URL | Mo ta |
| --- | --- |
| `/api/users` | Auth, OTP, login, refresh token, forgot/reset password |
| `/api/accounts` | Profile, password, wishlist |
| `/api/products` | Product CRUD va upload anh |
| `/api/reviews` | Review theo product |
| `/api/contacts` | Contact form/admin contact |
| `/api/cart` | Cart user/admin |
| `/api/wallets` | Saved MetaMask wallets |
| `/api/orders` | Checkout, My Orders, blockchain verify, admin orders |
| `/api/dashboard` | Admin dashboard |

## Blockchain integration

Backend tao order on-chain truoc khi luu order vao MongoDB. Sau khi frontend gui transaction bang MetaMask, backend verify `txHash` bang:

- receipt ton tai va `status === 1`;
- transaction goi dung contract;
- event dung action va dung `blockchainOrderId`;
- `receipt.from` khop buyer/seller wallet;
- state on-chain khop MongoDB.

Thong tin chi tiet nam trong `../blockchain/README.md`.
