# Car Sales Web

React + Vite frontend cho Saigon Speed.

## Stack

- React 19
- React Router
- Vite
- Axios
- ethers.js v6
- lucide-react
- Recharts

## Chạy local

```bash
cd frontend/car-sales-web
npm install
npm run dev
```

## Scripts

| Script | Mô tả |
| --- | --- |
| `npm run dev` | Chạy Vite dev server |
| `npm run build` | Build production |
| `npm run preview` | Preview bản build |
| `npm run lint` | Chạy ESLint |

## Env

Tạo file `.env` nếu cần override cấu hình:

```bash
cp .env.example .env
```

```env
VITE_API_URL=http://localhost:3000
VITE_CONTRACT_ADDRESS=0xD0CF607f0bCD60B5ed02896e682450eA4dBf5BB0
VITE_USD_PER_ETH=2000000
```

Nếu không set `VITE_API_URL`, app tự suy ra backend local là `http://localhost:3000` khi chạy trên localhost.

`VITE_CONTRACT_ADDRESS` phải giống `CONTRACT_ADDRESS` trong backend `.env`.

## Luồng chính

- Cars and Reviews: danh sách xe, filter, pagination, wishlist, add to cart.
- Car Detail: thông tin xe, gallery, review, add to cart.
- Cart/Checkout: chọn xe, handover, MetaMask deposit/full escrow.
- Profile: edit profile, change password, wallet management.
- Wallet Management: connect nhiều ví MetaMask, set default, delete. Không edit thông tin ví.
- My Orders: theo dõi đơn, tiếp tục payment nếu cần, complete/cancel.
- Admin: product, order, contact và dashboard.

## Checkout

Checkout chỉ hỗ trợ MetaMask escrow:

1. Select vehicle
2. Plan handover
3. Pay deposit/full with selected MetaMask wallet
4. Confirmation

Frontend sẽ kiểm tra trước khi gọi transaction:

- MetaMask có cài đặt không;
- network là Sepolia;
- account active khớp selected wallet;
- order on-chain tồn tại;
- payment type, status và amount khớp contract.

Nếu MetaMask không hiện popup, thường là vì transaction bị reject trong bước estimate gas. Toast sẽ hiện lý do cụ thể hơn nếu preflight check phát hiện sai cấu hình.