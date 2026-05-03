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

## Chay local

```bash
cd frontend/car-sales-web
npm install
npm run dev
```

## Scripts

| Script | Mo ta |
| --- | --- |
| `npm run dev` | Chay Vite dev server |
| `npm run build` | Build production |
| `npm run preview` | Preview ban build |
| `npm run lint` | Chay ESLint |

## Env

Tao file `.env` neu can override cau hinh:

```bash
cp .env.example .env
```

```env
VITE_API_URL=http://localhost:3000
VITE_CONTRACT_ADDRESS=0xD0CF607f0bCD60B5ed02896e682450eA4dBf5BB0
VITE_USD_PER_ETH=2000000
```

Neu khong set `VITE_API_URL`, app tu suy ra backend local la `http://localhost:3000` khi chay tren localhost.

`VITE_CONTRACT_ADDRESS` phai giong `CONTRACT_ADDRESS` trong backend `.env`.

## Luong chinh

- Cars and Reviews: danh sach xe, filter, pagination, wishlist, add to cart.
- Car Detail: thong tin xe, gallery, review, add to cart.
- Cart/Checkout: chon xe, handover, MetaMask deposit/full escrow.
- Profile: edit profile, change password, wallet management.
- Wallet Management: connect nhieu vi MetaMask, set default, delete. Khong edit thong tin vi.
- My Orders: theo doi don, tiep tuc payment neu can, complete/cancel.
- Admin: product, order, contact va dashboard.

## Checkout

Checkout chi ho tro MetaMask escrow:

1. Select vehicle
2. Plan handover
3. Pay deposit/full with selected MetaMask wallet
4. Confirmation

Frontend se kiem tra truoc khi goi transaction:

- MetaMask co cai dat khong;
- network la Sepolia;
- account active khop selected wallet;
- order on-chain ton tai;
- payment type, status va amount khop contract.

Neu MetaMask khong hien popup, thuong la vi transaction bi reject trong buoc estimate gas. Toast se hien ly do cu the hon neu preflight check phat hien sai cau hinh.
