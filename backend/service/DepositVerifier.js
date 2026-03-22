import {
  getOrderByBlockchainOrderId,
  verifyTransaction,
  CONTRACT_PAYMENT_TYPE,
  CONTRACT_ORDER_STATUS,
} from "./BlockchainService.js";
import { calculateDepositWei } from "../utils/convertDeposit.js";

export async function verifyDeposit(orderId, txHash, expectedSeller, carPriceUsd) {
  const txCheck = await verifyTransaction(txHash);

  if (!txCheck.exists) {
    throw new Error("Transaction không tồn tại");
  }

  if (!txCheck.success) {
    throw new Error("Transaction thất bại");
  }

  const order = await getOrderByBlockchainOrderId(orderId);

  if (order.paymentType !== CONTRACT_PAYMENT_TYPE.DEPOSIT) {
    throw new Error("Order trên contract không phải loại deposit");
  }

  if (order.contractStatus !== CONTRACT_ORDER_STATUS.DEPOSIT_PAID) {
    throw new Error("Order trên contract chưa ở trạng thái đã đặt cọc");
  }

  if (order.seller.toLowerCase() !== expectedSeller.toLowerCase()) {
    throw new Error("Seller không khớp");
  }

  const expectedAmountWei = calculateDepositWei(carPriceUsd).toString();

  if (order.depositAmount !== expectedAmountWei) {
    throw new Error("Số tiền đặt cọc không khớp");
  }

  if (order.paidAmount !== expectedAmountWei) {
    throw new Error("Số tiền buyer đã trả trên contract không đúng");
  }

  return {
    success: true,
    message: "Deposit hợp lệ",
    data: order,
  };
}