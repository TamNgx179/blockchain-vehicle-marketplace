# Vehicle Marketplace Escrow Blockchain

Thư mục `blockchain` chứa smart contract và test cho phần thanh toán Web3 của ứng dụng bán xe. Contract chạy trên Ethereum Sepolia Testnet và xử lý escrow cho deposit/full payment.

## 1. Contract đã deploy

| Hạng mục | Giá trị |
| --- | --- |
| Contract | `VehicleMarketplaceEscrow` |
| Network | Sepolia Testnet |
| Contract address | `0xD0CF607f0bCD60B5ed02896e682450eA4dBf5BB0` |
| Etherscan | `https://sepolia.etherscan.io/address/0xD0CF607f0bCD60B5ed02896e682450eA4dBf5BB0` |
| Seller/server wallet | `0x3aB431DC9782DA26bBdB002e94Fa057A13D2049F` |
| Solidity | `0.8.28` |
| Framework | Hardhat 3 + ethers.js v6 |

Env cần có:

```bash
cp .env.example .env
```

```env
SEPOLIA_RPC_URL=...
SEPOLIA_PRIVATE_KEY=...
ETHERSCAN_API_KEY=...
CONTRACT_ADDRESS=0xD0CF607f0bCD60B5ed02896e682450eA4dBf5BB0
```

## 2. Vai trò blockchain

Hệ thống dùng mô hình off-chain kết hợp on-chain:

| Off-chain | On-chain |
| --- | --- |
| User, cart, product, stock, handover info | Order escrow state |
| MongoDB lưu chi tiết order | Buyer/seller wallet |
| Backend tính USD sang wei | Total amount/deposit amount |
| Backend cập nhật status | Payment/confirm/complete/cancel events |
| Frontend checkout | MetaMask ký transaction |

Contract chỉ lưu các thông tin cần minh bạch: `orderId`, `buyer`, `seller`, `totalAmount`, `depositAmount`, `paidAmount`, `paymentType`, `status`, `createdAt`.

## 3. Payment type và status

### Payment type

| Value | Name | Mô tả |
| ---: | --- | --- |
| `0` | `None` | Không hợp lệ |
| `1` | `Deposit` | Thanh toán đặt cọc |
| `2` | `Full` | Thanh toán toàn bộ |

### Order status

| Value | Name | Mô tả |
| ---: | --- | --- |
| `0` | `None` | Chưa có order |
| `1` | `Pending` | Đã tạo order, chưa thanh toán |
| `2` | `DepositPaid` | Buyer đã đặt cọc |
| `3` | `FullPaid` | Buyer đã thanh toán full |
| `4` | `Confirmed` | Seller/showroom đã xác nhận |
| `5` | `Completed` | Buyer đã nhận xe, tiền release cho seller |
| `6` | `Cancelled` | Order bị hủy, refund nếu đã thanh toán |

## 4. Flow nghiệp vụ

### 4.1 Tạo order

Backend gọi:

```solidity
createOrder(orderId, buyer, seller, totalAmount, depositAmount, paymentType)
```

Rules:

- `orderId != 0`
- `buyer` và `seller` khác zero address
- `totalAmount > 0`
- `orderId` chưa tồn tại
- với `Deposit`, `depositAmount > 0` và `< totalAmount`
- với `Full`, `depositAmount == 0`

### 4.2 Pay deposit

Frontend gọi bằng buyer MetaMask:

```solidity
payDeposit(orderId)
```

Với:

```text
msg.value == order.depositAmount
```

Contract set status thành `DepositPaid` và emit:

```text
DepositPaid(orderId, buyer, amount)
```

### 4.3 Pay full

Frontend gọi bằng buyer MetaMask:

```solidity
payFull(orderId)
```

Với:

```text
msg.value == order.totalAmount
```

Contract set status thành `FullPaid` và emit:

```text
FullPaid(orderId, buyer, amount)
```

### 4.4 Seller confirm

Backend/admin gọi bằng seller/server wallet:

```solidity
confirmOrder(orderId)
```

Chỉ hợp lệ khi status là `DepositPaid` hoặc `FullPaid`.

### 4.5 Complete

Buyer gọi:

```solidity
completeOrder(orderId)
```

Chỉ hợp lệ khi seller đã confirm. Contract release `paidAmount` cho seller.

### 4.6 Cancel/refund

Buyer hoặc seller gọi:

```solidity
cancelOrder(orderId)
```

Chỉ hợp lệ khi order còn `Pending`, `DepositPaid` hoặc `FullPaid`. Nếu đã thanh toán, contract refund về buyer.

## 5. Cách tính amount

Backend/frontend đang dùng tỷ giá giả lập:

```text
USD_PER_ETH=2000000
deposit rate = 0.5%
```

Ví dụ:

```text
Vehicle price = $13,000
Total ETH = 13000 / 2000000 = 0.0065 ETH
Deposit = 0.5% * 13000 = $65 = 0.0000325 ETH
```

Contract yêu cầu `msg.value` khớp chính xác với amount đã lưu on-chain.

## 6. Backend verify transaction

Backend không tin trực tiếp `txHash` từ client. Mỗi verify đều kiểm tra:

1. `txHash` đúng định dạng 32 bytes.
2. Receipt đã mined và `status === 1`.
3. Receipt `to` là contract address đang cấu hình.
4. Receipt có đúng event của action.
5. Event có đúng `orderId`.
6. `receipt.from` khớp buyer/seller wallet.
7. `getOrder(orderId)` trên contract có status, payment type và amount khớp MongoDB.

## 7. Troubleshooting MetaMask

Nếu bấm pay mà MetaMask không hiện popup, thường là contract reject trong bước `estimateGas`. Các nguyên nhân phổ biến:

- MetaMask không ở network Sepolia.
- Account active không phải buyer wallet đã chọn trong checkout.
- Dùng `SELLER_WALLET` để test buyer.
- Frontend `VITE_CONTRACT_ADDRESS` khác backend `CONTRACT_ADDRESS`.
- `USD_PER_ETH` frontend/backend khác nhau làm amount bị lệch.
- Order on-chain không còn status `Pending`.

Sau khi đổi env, restart cả backend và frontend.

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

Sau khi deploy contract mới, cập nhật:

- `blockchain/.env`: `CONTRACT_ADDRESS`
- `backend/.env`: `CONTRACT_ADDRESS`
- `frontend/car-sales-web/.env`: `VITE_CONTRACT_ADDRESS`
- ABI trong backend/frontend nếu contract interface thay đổi

## 10. File quan trọng

| File | Mô tả |
| --- | --- |
| `contracts/VehicleMarketplaceEscrow.sol` | Smart contract escrow |
| `scripts/deploy.js` | Deploy script |
| `test/VehicleMarketplaceEscrow.js` | Blockchain tests |
| `hardhat.config.js` | Hardhat/Sepolia config |
| `../backend/service/BlockchainService.js` | Backend contract service |
| `../frontend/car-sales-web/src/utils/blockchainClient.js` | Frontend MetaMask client |