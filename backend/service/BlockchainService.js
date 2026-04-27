import { ethers } from "ethers";
import artifact from "../config/abi/VehicleMarketplaceEscrow.json" with { type: "json" };
import "dotenv/config";

const RPC_URL = process.env.SEPOLIA_RPC_URL;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const SEPOLIA_PRIVATE_KEY = process.env.SEPOLIA_PRIVATE_KEY;

if (!RPC_URL) throw new Error("Thiếu SEPOLIA_RPC_URL trong .env");
if (!CONTRACT_ADDRESS) throw new Error("Thiếu CONTRACT_ADDRESS trong .env");
if (!SEPOLIA_PRIVATE_KEY) throw new Error("Thiếu SEPOLIA_PRIVATE_KEY trong .env");

const provider = new ethers.JsonRpcProvider(RPC_URL);
const signer = new ethers.Wallet(SEPOLIA_PRIVATE_KEY, provider);

const contractAbi = artifact.abi;

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
  };
}

export async function confirmOrderOnChain(blockchainOrderId) {
  const tx = await writeContract.confirmOrder(blockchainOrderId);
  const receipt = await tx.wait();

  return {
    txHash: tx.hash,
    blockNumber: receipt.blockNumber,
  };
}

export async function cancelOrderOnChain(blockchainOrderId) {
  const tx = await writeContract.cancelOrder(blockchainOrderId);
  const receipt = await tx.wait();

  return {
    txHash: tx.hash,
    blockNumber: receipt.blockNumber,
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

export async function verifyTransaction(txHash) {
  const tx = await provider.getTransaction(txHash);

  if (!tx) {
    return {
      exists: false,
      success: false,
      confirmations: 0,
    };
  }

  const receipt = await provider.getTransactionReceipt(txHash);

  return {
    exists: true,
    success: receipt ? receipt.status === 1 : false,
    confirmations: tx.confirmations,
  };
}

export async function getTransactionDetail(txHash) {
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
  const receipt = await provider.getTransactionReceipt(txHash);

  if (!receipt) return null;

  return {
    hash: receipt.hash,
    blockNumber: receipt.blockNumber,
    status: receipt.status,
    from: receipt.from,
    to: receipt.to,
    gasUsed: receipt.gasUsed.toString(),
  };
}
