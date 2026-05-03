# Vehicle Marketplace Escrow Blockchain

Thu muc `blockchain` chua smart contract va test cho phan thanh toan Web3 cua ung dung ban xe. Contract chay tren Ethereum Sepolia Testnet va xu ly escrow cho deposit/full payment.

## 1. Contract da deploy

| Hang muc | Gia tri |
| --- | --- |
| Contract | `VehicleMarketplaceEscrow` |
| Network | Sepolia Testnet |
| Contract address | `0xD0CF607f0bCD60B5ed02896e682450eA4dBf5BB0` |
| Etherscan | `https://sepolia.etherscan.io/address/0xD0CF607f0bCD60B5ed02896e682450eA4dBf5BB0` |
| Seller/server wallet | `0x3aB431DC9782DA26bBdB002e94Fa057A13D2049F` |
| Solidity | `0.8.28` |
| Framework | Hardhat 3 + ethers.js v6 |

Env can co:

```bash
cp .env.example .env
```

```env
SEPOLIA_RPC_URL=...
SEPOLIA_PRIVATE_KEY=...
ETHERSCAN_API_KEY=...
CONTRACT_ADDRESS=0xD0CF607f0bCD60B5ed02896e682450eA4dBf5BB0
```

## 2. Vai tro blockchain

He thong dung mo hinh off-chain ket hop on-chain:

| Off-chain | On-chain |
| --- | --- |
| User, cart, product, stock, handover info | Order escrow state |
| MongoDB luu chi tiet order | Buyer/seller wallet |
| Backend tinh USD sang wei | Total amount/deposit amount |
| Backend cap nhat status | Payment/confirm/complete/cancel events |
| Frontend checkout | MetaMask ky transaction |

Contract chi luu cac thong tin can minh bach: `orderId`, `buyer`, `seller`, `totalAmount`, `depositAmount`, `paidAmount`, `paymentType`, `status`, `createdAt`.

## 3. Payment type va status

### Payment type

| Value | Name | Mo ta |
| ---: | --- | --- |
| `0` | `None` | Khong hop le |
| `1` | `Deposit` | Thanh toan dat coc |
| `2` | `Full` | Thanh toan toan bo |

### Order status

| Value | Name | Mo ta |
| ---: | --- | --- |
| `0` | `None` | Chua co order |
| `1` | `Pending` | Da tao order, chua thanh toan |
| `2` | `DepositPaid` | Buyer da dat coc |
| `3` | `FullPaid` | Buyer da thanh toan full |
| `4` | `Confirmed` | Seller/showroom da xac nhan |
| `5` | `Completed` | Buyer da nhan xe, tien release cho seller |
| `6` | `Cancelled` | Order bi huy, refund neu da thanh toan |

## 4. Flow nghiep vu

### 4.1 Tao order

Backend goi:

```solidity
createOrder(orderId, buyer, seller, totalAmount, depositAmount, paymentType)
```

Rules:

- `orderId != 0`
- `buyer` va `seller` khac zero address
- `totalAmount > 0`
- `orderId` chua ton tai
- voi `Deposit`, `depositAmount > 0` va `< totalAmount`
- voi `Full`, `depositAmount == 0`

### 4.2 Pay deposit

Frontend goi bang buyer MetaMask:

```solidity
payDeposit(orderId)
```

Voi:

```text
msg.value == order.depositAmount
```

Contract set status thanh `DepositPaid` va emit:

```text
DepositPaid(orderId, buyer, amount)
```

### 4.3 Pay full

Frontend goi bang buyer MetaMask:

```solidity
payFull(orderId)
```

Voi:

```text
msg.value == order.totalAmount
```

Contract set status thanh `FullPaid` va emit:

```text
FullPaid(orderId, buyer, amount)
```

### 4.4 Seller confirm

Backend/admin goi bang seller/server wallet:

```solidity
confirmOrder(orderId)
```

Chi hop le khi status la `DepositPaid` hoac `FullPaid`.

### 4.5 Complete

Buyer goi:

```solidity
completeOrder(orderId)
```

Chi hop le khi seller da confirm. Contract release `paidAmount` cho seller.

### 4.6 Cancel/refund

Buyer hoac seller goi:

```solidity
cancelOrder(orderId)
```

Chi hop le khi order con `Pending`, `DepositPaid` hoac `FullPaid`. Neu da thanh toan, contract refund ve buyer.

## 5. Cach tinh amount

Backend/frontend dang dung ty gia gia lap:

```text
USD_PER_ETH=2000000
deposit rate = 0.5%
```

Vi du:

```text
Vehicle price = $13,000
Total ETH = 13000 / 2000000 = 0.0065 ETH
Deposit = 0.5% * 13000 = $65 = 0.0000325 ETH
```

Contract yeu cau `msg.value` khop chinh xac voi amount da luu on-chain.

## 6. Backend verify transaction

Backend khong tin truc tiep `txHash` tu client. Moi verify deu kiem tra:

1. `txHash` dung dinh dang 32 bytes.
2. Receipt da mined va `status === 1`.
3. Receipt `to` la contract address dang cau hinh.
4. Receipt co dung event cua action.
5. Event co dung `orderId`.
6. `receipt.from` khop buyer/seller wallet.
7. `getOrder(orderId)` tren contract co status, payment type va amount khop MongoDB.

## 7. Troubleshooting MetaMask

Neu bam pay ma MetaMask khong hien popup, thuong la contract reject trong buoc `estimateGas`. Cac nguyen nhan pho bien:

- MetaMask khong o network Sepolia.
- Account active khong phai buyer wallet da chon trong checkout.
- Dung `SELLER_WALLET` de test buyer.
- Frontend `VITE_CONTRACT_ADDRESS` khac backend `CONTRACT_ADDRESS`.
- `USD_PER_ETH` frontend/backend khac nhau lam amount bi lech.
- Order on-chain khong con status `Pending`.

Sau khi doi env, restart ca backend va frontend.

## 8. Test

```bash
cd blockchain
npm install
npm test
```

Test file:

```text
blockchain/test/VehicleMarketplaceEscrow.js
```

## 9. Deploy

```bash
cd blockchain
npx hardhat compile
npx hardhat run scripts/deploy.js --network sepolia
```

Sau khi deploy contract moi, cap nhat:

- `blockchain/.env`: `CONTRACT_ADDRESS`
- `backend/.env`: `CONTRACT_ADDRESS`
- `frontend/car-sales-web/.env`: `VITE_CONTRACT_ADDRESS`
- ABI trong backend/frontend neu contract interface thay doi

## 10. File quan trong

| File | Mo ta |
| --- | --- |
| `contracts/VehicleMarketplaceEscrow.sol` | Smart contract escrow |
| `scripts/deploy.js` | Deploy script |
| `test/VehicleMarketplaceEscrow.js` | Blockchain tests |
| `hardhat.config.js` | Hardhat/Sepolia config |
| `../backend/service/BlockchainService.js` | Backend contract service |
| `../frontend/car-sales-web/src/utils/blockchainClient.js` | Frontend MetaMask client |
