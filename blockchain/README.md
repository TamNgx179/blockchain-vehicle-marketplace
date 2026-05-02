# Vehicle Marketplace Escrow Blockchain

Thu muc `blockchain` chua smart contract va test cho phan thanh toan Web3 cua ung dung ban xe. Module nay dung Ethereum Sepolia Testnet de ghi nhan qua trinh tao don, thanh toan coc/full, xac nhan cua showroom, hoan tat giao dich va huy/hoan tien.

Smart contract da deploy khong duoc sua trong qua trinh toi uu hien tai. ABI dang duoc backend/frontend su dung cung duoc giu nguyen de dam bao app van noi dung contract da deploy.

## 1. Thong tin contract da deploy

| Hang muc | Gia tri |
|---|---|
| Contract | `VehicleMarketplaceEscrow` |
| Network | Sepolia Testnet |
| Contract address | `0xD0CF607f0bCD60B5ed02896e682450eA4dBf5BB0` |
| Etherscan | `https://sepolia.etherscan.io/address/0xD0CF607f0bCD60B5ed02896e682450eA4dBf5BB0` |
| Seller/server wallet | `0x3aB431DC9782DA26bBdB002e94Fa057A13D2049F` |
| Solidity | `0.8.28` |
| Framework | Hardhat 3 + ethers.js v6 |

Bien moi truong can co:

```env
SEPOLIA_RPC_URL=...
SEPOLIA_PRIVATE_KEY=...
ETHERSCAN_API_KEY=...
CONTRACT_ADDRESS=0xD0CF607f0bCD60B5ed02896e682450eA4dBf5BB0
```

## 2. Vai tro cua blockchain trong he thong

He thong dung mo hinh off-chain ket hop on-chain:

| Off-chain | On-chain |
|---|---|
| User, cart, product, stock, delivery info | Order escrow state |
| MongoDB luu chi tiet don hang | Buyer/seller wallet |
| Backend tinh tien USD sang wei | Total amount/deposit amount |
| Backend cap nhat trang thai don | Payment/confirm/complete/cancel events |
| Frontend dieu huong checkout | MetaMask ky giao dich |

Blockchain khong thay the database. Contract chi giu cac thong tin quan trong can minh bach va co the doi chieu: `orderId`, `buyer`, `seller`, `totalAmount`, `depositAmount`, `paidAmount`, `paymentType`, `status`, `createdAt`.

## 3. Kien truc tich hop

```text
React Frontend
  - Checkout / My Orders
  - MetaMask + ethers.js
  - Goi payDeposit, payFull, completeOrder, cancelOrder

Backend Express
  - Tao order on-chain bang vi server
  - Verify txHash bang receipt + event log
  - Dong bo trang thai vao MongoDB
  - Admin confirm/cancel bang seller wallet server

VehicleMarketplaceEscrow
  - Luu order escrow
  - Nhan ETH tu buyer
  - Giu tien den khi confirm/complete/cancel
  - Emit event cho moi buoc quan trong
```

## 4. Cac trang thai va loai thanh toan

### Payment type

| Gia tri | Ten | Y nghia |
|---:|---|---|
| `0` | `None` | Khong hop le/mac dinh |
| `1` | `Deposit` | Thanh toan dat coc |
| `2` | `Full` | Thanh toan toan bo |

### Order status tren contract

| Gia tri | Ten | Y nghia |
|---:|---|---|
| `0` | `None` | Chua co order |
| `1` | `Pending` | Da tao order, chua thanh toan |
| `2` | `DepositPaid` | Buyer da dat coc |
| `3` | `FullPaid` | Buyer da thanh toan full |
| `4` | `Confirmed` | Seller/showroom da xac nhan |
| `5` | `Completed` | Buyer da nhan xe, tien release cho seller |
| `6` | `Cancelled` | Don bi huy, tien duoc refund neu da thanh toan |

## 5. Flow nghiep vu

### 5.1 Tao order

1. User chon xe trong gio hang va vao checkout.
2. Backend tao `blockchainOrderId`.
3. Backend tinh:
   - `totalAmountWei`
   - `depositAmountWei` neu chon dat coc
4. Backend goi contract:

```solidity
createOrder(orderId, buyer, seller, totalAmount, depositAmount, paymentType)
```

5. Contract luu order voi status `Pending`.
6. Backend luu order vao MongoDB voi status:
   - `pending_deposit` neu thanh toan coc
   - `pending_payment` neu thanh toan full

Event emit:

```text
OrderCreated(orderId, buyer, seller, totalAmount, depositAmount, paymentType)
```

### 5.2 Dat coc

1. Buyer ky giao dich tren MetaMask.
2. Frontend goi:

```solidity
payDeposit(orderId)
```

voi `msg.value == depositAmount`.

3. Contract set:
   - `paidAmount = depositAmount`
   - `status = DepositPaid`
4. Backend verify `txHash`, parse event va cap nhat MongoDB thanh `deposit_paid`.

Event emit:

```text
DepositPaid(orderId, buyer, amount)
```

### 5.3 Thanh toan full

1. Buyer ky giao dich tren MetaMask.
2. Frontend goi:

```solidity
payFull(orderId)
```

voi `msg.value == totalAmount`.

3. Contract set:
   - `paidAmount = totalAmount`
   - `status = FullPaid`
4. Backend verify `txHash`, parse event va cap nhat MongoDB thanh `payment_paid`.

Event emit:

```text
FullPaid(orderId, buyer, amount)
```

### 5.4 Seller/showroom confirm

1. Admin bam confirm tren trang quan ly don.
2. Backend dung `SEPOLIA_PRIVATE_KEY` cua seller/server wallet.
3. Backend goi:

```solidity
confirmOrder(orderId)
```

4. Contract set status `Confirmed`.
5. Backend cap nhat MongoDB thanh `processing`.

Event emit:

```text
SellerConfirmed(orderId, seller)
```

### 5.5 Complete order

1. Buyer xac nhan da nhan xe.
2. Frontend goi:

```solidity
completeOrder(orderId)
```

3. Contract set status `Completed`.
4. Contract chuyen `paidAmount` dang giu cho seller.
5. Backend cap nhat MongoDB thanh `completed`.

Event emit:

```text
OrderCompleted(orderId, buyer, releasedAmount)
```

### 5.6 Cancel/refund

1. Buyer hoac seller co the huy khi order chua duoc seller confirm.
2. Frontend/backend goi:

```solidity
cancelOrder(orderId)
```

3. Contract set status `Cancelled`.
4. Neu da thanh toan, contract refund ETH ve buyer.
5. Backend cap nhat MongoDB thanh `cancelled` va tra stock neu can.

Event emit:

```text
OrderCancelled(orderId, caller, refundedAmount)
```

## 6. Cach backend xac minh giao dich

Backend khong tin truc tiep vao `txHash` do client gui len. Moi verify deu kiem tra:

1. `txHash` dung dinh dang 32 bytes.
2. Receipt da mined va `status === 1`.
3. Receipt `to` la `VehicleMarketplaceEscrow`.
4. Receipt co dung event cua action dang verify.
5. Event co dung `orderId`.
6. `receipt.from` khop buyer/seller wallet.
7. `getOrder(orderId)` tren contract co status, payment type va amount khop voi MongoDB.

Bang event verify:

| API/action backend | Event can co |
|---|---|
| Verify deposit | `DepositPaid` |
| Verify full payment | `FullPaid` |
| Verify seller confirm | `SellerConfirmed` |
| Verify complete | `OrderCompleted` |
| Verify cancel | `OrderCancelled` |

## 7. Test

Test nam tai:

```text
blockchain/test/VehicleMarketplaceEscrow.js
```

Bo test nay deploy mot instance contract local trong Hardhat Network. Test khong goi truc tiep contract Sepolia da deploy, nhung xac minh logic contract hien tai hoat dong dung.

### Cac truong hop da test

| Test case | Muc dich |
|---|---|
| Deposit flow | `createOrder -> payDeposit -> confirmOrder -> completeOrder` |
| Full payment flow | `createOrder -> payFull -> confirmOrder -> completeOrder` |
| Cancel flow | Buyer huy don va contract refund truoc seller confirm |
| Revert complete early | Khong cho complete khi seller chua confirm |
| Revert invalid payment | Sai buyer hoac sai so tien coc bi reject |

### Chay test

```bash
cd blockchain
npm test
```

Ket qua mong doi:

```text
VehicleMarketplaceEscrow
  5 passing
```

## 8. Chay/deploy contract

### Compile

```bash
cd blockchain
npx hardhat compile
```

### Test local

```bash
npm test
```

### Deploy

Script deploy:

```text
blockchain/scripts/deploy.js
```

Lenh deploy Sepolia:

```bash
npx hardhat run scripts/deploy.js --network sepolia
```

Sau khi deploy contract moi, can cap nhat:

- `CONTRACT_ADDRESS` trong `blockchain/.env`
- `CONTRACT_ADDRESS` trong `backend/.env`
- `VITE_CONTRACT_ADDRESS` trong frontend neu co dung bien moi truong
- ABI neu contract bi thay doi

Trong ban hien tai, contract da deploy va dang duoc cau hinh la:

```text
0xD0CF607f0bCD60B5ed02896e682450eA4dBf5BB0
```

## 9. File quan trong

| File | Mo ta |
|---|---|
| `contracts/VehicleMarketplaceEscrow.sol` | Smart contract escrow |
| `scripts/deploy.js` | Script deploy contract |
| `test/VehicleMarketplaceEscrow.js` | Test flow blockchain |
| `hardhat.config.js` | Cau hinh Hardhat, Sepolia va verify |
| `../backend/service/BlockchainService.js` | Service backend doc/ghi va verify contract |
| `../frontend/car-sales-web/src/utils/blockchainClient.js` | Client ket noi MetaMask va contract |

