import { ethers } from "ethers";
import artifact from "../config/abi/VehicleMarketplaceEscrow.json" with { type: "json" };
import "dotenv/config";

const RPC_URL = process.env.SEPOLIA_RPC_URL;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const SEPOLIA_PRIVATE_KEY = process.env.SEPOLIA_PRIVATE_KEY;

if (!RPC_URL) throw new Error("Thieu SEPOLIA_RPC_URL trong .env");
if (!CONTRACT_ADDRESS) throw new Error("Thieu CONTRACT_ADDRESS trong .env");
if (!SEPOLIA_PRIVATE_KEY) throw new Error("Thieu SEPOLIA_PRIVATE_KEY trong .env");

const sepoliaNetwork = ethers.Network.from(11155111);
const provider = new ethers.JsonRpcProvider(RPC_URL, sepoliaNetwork, {
  staticNetwork: sepoliaNetwork,
});
const signer = new ethers.Wallet(SEPOLIA_PRIVATE_KEY, provider);

const contractAbi = artifact.abi;
const contractAddressLower = CONTRACT_ADDRESS.toLowerCase();
const marketplaceInterface = new ethers.Interface(contractAbi);

const readContract = new ethers.Contract(CONTRACT_ADDRESS, contractAbi, provider);
const writeContract = new ethers.Contract(CONTRACT_ADDRESS, contractAbi, signer);

export function getServerWalletAddress() {
  return signer.address;
}

export const CONTRACT_PAYMENT_TYPE = {
  NONE: 0,
  DEPOSIT: 1,
  FULL: 2,
};

export const CONTRACT_ORDER_STATUS = {
  NONE: 0,
  PENDING: 1,
  DEPOSIT_PAID: 2,
  FULL_PAID: 3,
  CONFIRMED: 4,
  COMPLETED: 5,
  CANCELLED: 6,
};

export const MARKETPLACE_EVENTS = {
  ORDER_CREATED: "OrderCreated",
  DEPOSIT_PAID: "DepositPaid",
  FULL_PAID: "FullPaid",
  SELLER_CONFIRMED: "SellerConfirmed",
  ORDER_COMPLETED: "OrderCompleted",
  ORDER_CANCELLED: "OrderCancelled",
};

const assertValidTxHash = (txHash) => {
  if (!ethers.isHexString(txHash, 32)) {
    throw new Error("txHash khong hop le");
  }
};

const normalizeReceipt = (receipt) => ({
  hash: receipt.hash,
  blockHash: receipt.blockHash,
  blockNumber: receipt.blockNumber,
  status: Number(receipt.status),
  from: receipt.from,
  to: receipt.to,
  gasUsed: receipt.gasUsed?.toString?.() || "0",
  logs: (receipt.logs || []).map((log) => ({
    address: log.address,
    topics: [...log.topics],
    data: log.data,
  })),
});

const normalizeOrderId = (orderId) => BigInt(orderId).toString();

export async function getVerifiedMarketplaceReceipt(
  txHash,
  providerOverride = provider
) {
  assertValidTxHash(txHash);

  const receipt = await providerOverride.getTransactionReceipt(txHash);
  if (!receipt) {
    throw new Error("Transaction chua duoc mine hoac khong ton tai");
  }

  const normalizedReceipt = normalizeReceipt(receipt);
  if (normalizedReceipt.status !== 1) {
    throw new Error("Transaction that bai");
  }

  if (
    !normalizedReceipt.to ||
    normalizedReceipt.to.toLowerCase() !== contractAddressLower
  ) {
    throw new Error("Transaction khong goi marketplace contract");
  }

  return normalizedReceipt;
}

export function getMarketplaceEventFromReceipt(receipt, eventName, orderId) {
  const expectedOrderId = normalizeOrderId(orderId);

  for (const log of receipt.logs || []) {
    if (log.address?.toLowerCase() !== contractAddressLower) continue;

    let parsedLog;
    try {
      parsedLog = marketplaceInterface.parseLog({
        topics: log.topics,
        data: log.data,
      });
    } catch {
      continue;
    }

    if (parsedLog?.name !== eventName) continue;

    const eventOrderId = parsedLog.args?.orderId ?? parsedLog.args?.[0];
    if (eventOrderId === undefined) continue;

    if (normalizeOrderId(eventOrderId) === expectedOrderId) {
      return parsedLog;
    }
  }

  return null;
}

export function assertMarketplaceEvent(receipt, eventName, orderId) {
  const event = getMarketplaceEventFromReceipt(receipt, eventName, orderId);
  if (!event) {
    throw new Error(`Transaction khong co event ${eventName} cho order nay`);
  }
  return event;
}

export async function createOrderOnChain({
  blockchainOrderId,
  buyerWallet,
  sellerWallet,
  totalAmountWei,
  depositAmountWei,
  paymentType,
}) {
  const paymentTypeValue =
    paymentType === "deposit"
      ? CONTRACT_PAYMENT_TYPE.DEPOSIT
      : CONTRACT_PAYMENT_TYPE.FULL;

  const tx = await writeContract.createOrder(
    blockchainOrderId,
    buyerWallet,
    sellerWallet,
    totalAmountWei,
    depositAmountWei,
    paymentTypeValue
  );

  const receipt = await tx.wait();

  return {
    txHash: tx.hash,
    blockNumber: receipt.blockNumber,
    gasUsed: receipt.gasUsed.toString(),
  };
}

export async function confirmOrderOnChain(blockchainOrderId) {
  const tx = await writeContract.confirmOrder(blockchainOrderId);
  const receipt = await tx.wait();

  return {
    txHash: tx.hash,
    blockNumber: receipt.blockNumber,
    gasUsed: receipt.gasUsed.toString(),
  };
}

export async function cancelOrderOnChain(blockchainOrderId) {
  const tx = await writeContract.cancelOrder(blockchainOrderId);
  const receipt = await tx.wait();

  return {
    txHash: tx.hash,
    blockNumber: receipt.blockNumber,
    gasUsed: receipt.gasUsed.toString(),
  };
}

export async function getOrderByBlockchainOrderId(orderId) {
  const result = await readContract.getOrder(orderId);

  return {
    orderId: result[0].toString(),
    buyer: result[1],
    seller: result[2],
    totalAmount: result[3].toString(),
    depositAmount: result[4].toString(),
    paidAmount: result[5].toString(),
    paymentType: Number(result[6]),
    contractStatus: Number(result[7]),
    createdAt: result[8].toString(),
  };
}

export async function verifyTransaction(txHash, providerOverride = provider) {
  assertValidTxHash(txHash);
  const receipt = await providerOverride.getTransactionReceipt(txHash);

  if (!receipt) {
    return {
      exists: false,
      success: false,
      confirmations: 0,
    };
  }

  return {
    exists: true,
    success: Number(receipt.status) === 1,
    confirmations: receipt.blockNumber ? 1 : 0,
    blockNumber: receipt.blockNumber,
  };
}

export async function getTransactionDetail(txHash) {
  assertValidTxHash(txHash);
  const tx = await provider.getTransaction(txHash);
  if (!tx) return null;

  return {
    hash: tx.hash,
    from: tx.from,
    to: tx.to,
    value: tx.value.toString(),
    data: tx.data,
    nonce: tx.nonce,
  };
}

export async function getTransactionReceipt(txHash) {
  assertValidTxHash(txHash);
  const receipt = await provider.getTransactionReceipt(txHash);

  if (!receipt) return null;

  return normalizeReceipt(receipt);
}
