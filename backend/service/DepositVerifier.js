import {
  getOrderByBlockchainOrderId,
  getVerifiedMarketplaceReceipt,
  assertMarketplaceEvent,
  MARKETPLACE_EVENTS,
  CONTRACT_PAYMENT_TYPE,
  CONTRACT_ORDER_STATUS,
} from "./BlockchainService.js";
import { calculateDepositWei } from "../utils/convertDeposit.js";

export async function verifyDeposit(
  orderId,
  txHash,
  expectedBuyer,
  expectedSeller,
  carPriceUsd
) {
  const receipt = await getVerifiedMarketplaceReceipt(txHash);
  assertMarketplaceEvent(receipt, MARKETPLACE_EVENTS.DEPOSIT_PAID, orderId);

  if (
    expectedBuyer &&
    receipt.from?.toLowerCase() !== expectedBuyer.toLowerCase()
  ) {
    throw new Error("Transaction nay khong phai do buyer thuc hien");
  }

  const order = await getOrderByBlockchainOrderId(orderId);

  if (order.paymentType !== CONTRACT_PAYMENT_TYPE.DEPOSIT) {
    throw new Error("Order tren contract khong phai loai deposit");
  }

  if (order.contractStatus !== CONTRACT_ORDER_STATUS.DEPOSIT_PAID) {
    throw new Error("Order tren contract chua o trang thai da dat coc");
  }

  if (order.seller.toLowerCase() !== expectedSeller.toLowerCase()) {
    throw new Error("Seller khong khop");
  }

  if (
    expectedBuyer &&
    order.buyer.toLowerCase() !== expectedBuyer.toLowerCase()
  ) {
    throw new Error("Buyer tren contract khong khop");
  }

  const expectedAmountWei = calculateDepositWei(carPriceUsd).toString();

  if (order.depositAmount !== expectedAmountWei) {
    throw new Error("So tien dat coc khong khop");
  }

  if (order.paidAmount !== expectedAmountWei) {
    throw new Error("So tien buyer da tra tren contract khong dung");
  }

  return {
    success: true,
    message: "Deposit hop le",
    data: order,
  };
}
