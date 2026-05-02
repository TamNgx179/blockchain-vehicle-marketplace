import assert from "node:assert/strict";
import { test } from "node:test";
import { ethers } from "ethers";
import artifact from "../config/abi/VehicleMarketplaceEscrow.json" with { type: "json" };

process.env.SEPOLIA_RPC_URL ||= "http://127.0.0.1:8545";
process.env.CONTRACT_ADDRESS ||= "0x000000000000000000000000000000000000dEaD";
process.env.SEPOLIA_PRIVATE_KEY ||=
  "0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";

const {
  getVerifiedMarketplaceReceipt,
  getMarketplaceEventFromReceipt,
  assertMarketplaceEvent,
  verifyTransaction,
  MARKETPLACE_EVENTS,
} = await import("../service/BlockchainService.js");

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const TX_HASH = `0x${"1".repeat(64)}`;
const BLOCK_HASH = `0x${"2".repeat(64)}`;
const BUYER = "0x1111111111111111111111111111111111111111";
const SELLER = "0x2222222222222222222222222222222222222222";
const OTHER_CONTRACT = "0x3333333333333333333333333333333333333333";
const iface = new ethers.Interface(artifact.abi);

const buildEventLog = (eventName, args, address = CONTRACT_ADDRESS) => {
  const eventFragment = iface.getEvent(eventName);
  const encoded = iface.encodeEventLog(eventFragment, args);

  return {
    address,
    topics: encoded.topics,
    data: encoded.data,
  };
};

const buildReceipt = (overrides = {}) => ({
  hash: TX_HASH,
  blockHash: BLOCK_HASH,
  blockNumber: 123,
  status: 1,
  from: BUYER,
  to: CONTRACT_ADDRESS,
  gasUsed: 45678n,
  logs: [
    buildEventLog(MARKETPLACE_EVENTS.DEPOSIT_PAID, [
      7n,
      BUYER,
      ethers.parseEther("0.1"),
    ]),
  ],
  ...overrides,
});

test("getVerifiedMarketplaceReceipt uses one receipt RPC call", async () => {
  let receiptCalls = 0;
  const fakeProvider = {
    async getTransactionReceipt(hash) {
      receiptCalls += 1;
      assert.equal(hash, TX_HASH);
      return buildReceipt();
    },
    async getTransaction() {
      throw new Error("getTransaction should not be called");
    },
  };

  const receipt = await getVerifiedMarketplaceReceipt(TX_HASH, fakeProvider);

  assert.equal(receiptCalls, 1);
  assert.equal(receipt.hash, TX_HASH);
  assert.equal(receipt.from, BUYER);
  assert.equal(receipt.logs.length, 1);
});

test("marketplace event parser requires the expected event and order id", async () => {
  const receipt = buildReceipt();

  const event = getMarketplaceEventFromReceipt(
    receipt,
    MARKETPLACE_EVENTS.DEPOSIT_PAID,
    7n
  );

  assert.equal(event.name, MARKETPLACE_EVENTS.DEPOSIT_PAID);
  assert.equal(event.args.orderId, 7n);
  assert.equal(event.args.buyer, BUYER);

  assert.throws(
    () => assertMarketplaceEvent(receipt, MARKETPLACE_EVENTS.DEPOSIT_PAID, 8n),
    /khong co event/
  );
});

test("getVerifiedMarketplaceReceipt rejects transactions outside the marketplace contract", async () => {
  const fakeProvider = {
    async getTransactionReceipt() {
      return buildReceipt({ to: OTHER_CONTRACT });
    },
  };

  await assert.rejects(
    () => getVerifiedMarketplaceReceipt(TX_HASH, fakeProvider),
    /marketplace contract/
  );
});

test("verifyTransaction also relies on receipt lookup only", async () => {
  let receiptCalls = 0;
  const fakeProvider = {
    async getTransactionReceipt() {
      receiptCalls += 1;
      return buildReceipt({ status: 1 });
    },
    async getTransaction() {
      throw new Error("getTransaction should not be called");
    },
  };

  const result = await verifyTransaction(TX_HASH, fakeProvider);

  assert.equal(receiptCalls, 1);
  assert.deepEqual(result, {
    exists: true,
    success: true,
    confirmations: 1,
    blockNumber: 123,
  });
});
