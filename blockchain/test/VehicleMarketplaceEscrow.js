import { expect } from "chai";
import { network } from "hardhat";

const PAYMENT_TYPE = {
  DEPOSIT: 1,
  FULL: 2,
};

const ORDER_STATUS = {
  PENDING: 1n,
  DEPOSIT_PAID: 2n,
  FULL_PAID: 3n,
  CONFIRMED: 4n,
  COMPLETED: 5n,
  CANCELLED: 6n,
};

describe("VehicleMarketplaceEscrow", function () {
  async function deployFixture() {
    const connection = await network.connect();
    const { ethers } = connection;
    const [owner, buyer, seller, stranger] = await ethers.getSigners();

    const Marketplace = await ethers.getContractFactory("VehicleMarketplaceEscrow");
    const contract = await Marketplace.deploy();
    await contract.waitForDeployment();

    return { contract, owner, buyer, seller, stranger, ethers };
  }

  async function createDepositOrder(contract, buyer, seller, ethers, orderId = 1n) {
    const totalAmount = ethers.parseEther("1");
    const depositAmount = ethers.parseEther("0.1");

    await contract.createOrder(
      orderId,
      buyer.address,
      seller.address,
      totalAmount,
      depositAmount,
      PAYMENT_TYPE.DEPOSIT
    );

    return { orderId, totalAmount, depositAmount };
  }

  async function createFullPaymentOrder(contract, buyer, seller, ethers, orderId = 2n) {
    const totalAmount = ethers.parseEther("1");

    await contract.createOrder(
      orderId,
      buyer.address,
      seller.address,
      totalAmount,
      0,
      PAYMENT_TYPE.FULL
    );

    return { orderId, totalAmount };
  }

  it("runs the full deposit flow: create -> payDeposit -> confirm -> complete", async function () {
    const { contract, buyer, seller, ethers } = await deployFixture();
    const { orderId, depositAmount } = await createDepositOrder(
      contract,
      buyer,
      seller,
      ethers
    );

    await expect(
      contract.connect(buyer).payDeposit(orderId, { value: depositAmount })
    )
      .to.emit(contract, "DepositPaid")
      .withArgs(orderId, buyer.address, depositAmount);

    let order = await contract.getOrder(orderId);
    expect(order[5]).to.equal(depositAmount);
    expect(order[7]).to.equal(ORDER_STATUS.DEPOSIT_PAID);

    await expect(contract.connect(seller).confirmOrder(orderId))
      .to.emit(contract, "SellerConfirmed")
      .withArgs(orderId, seller.address);

    await expect(contract.connect(buyer).completeOrder(orderId))
      .to.emit(contract, "OrderCompleted")
      .withArgs(orderId, buyer.address, depositAmount);

    order = await contract.getOrder(orderId);
    expect(order[5]).to.equal(0n);
    expect(order[7]).to.equal(ORDER_STATUS.COMPLETED);
  });

  it("runs the full payment flow: create -> payFull -> confirm -> complete", async function () {
    const { contract, buyer, seller, ethers } = await deployFixture();
    const { orderId, totalAmount } = await createFullPaymentOrder(
      contract,
      buyer,
      seller,
      ethers
    );

    await expect(contract.connect(buyer).payFull(orderId, { value: totalAmount }))
      .to.emit(contract, "FullPaid")
      .withArgs(orderId, buyer.address, totalAmount);

    let order = await contract.getOrder(orderId);
    expect(order[5]).to.equal(totalAmount);
    expect(order[7]).to.equal(ORDER_STATUS.FULL_PAID);

    await contract.connect(seller).confirmOrder(orderId);
    await contract.connect(buyer).completeOrder(orderId);

    order = await contract.getOrder(orderId);
    expect(order[5]).to.equal(0n);
    expect(order[7]).to.equal(ORDER_STATUS.COMPLETED);
  });

  it("allows buyer to cancel before seller confirmation and records cancelled status", async function () {
    const { contract, buyer, seller, ethers } = await deployFixture();
    const { orderId, depositAmount } = await createDepositOrder(
      contract,
      buyer,
      seller,
      ethers,
      3n
    );

    await contract.connect(buyer).payDeposit(orderId, { value: depositAmount });

    await expect(contract.connect(buyer).cancelOrder(orderId))
      .to.emit(contract, "OrderCancelled")
      .withArgs(orderId, buyer.address, depositAmount);

    const order = await contract.getOrder(orderId);
    expect(order[5]).to.equal(0n);
    expect(order[7]).to.equal(ORDER_STATUS.CANCELLED);
  });

  it("rejects completeOrder before seller confirmation", async function () {
    const { contract, buyer, seller, ethers } = await deployFixture();
    const { orderId, depositAmount } = await createDepositOrder(
      contract,
      buyer,
      seller,
      ethers,
      4n
    );

    await contract.connect(buyer).payDeposit(orderId, { value: depositAmount });

    await expect(contract.connect(buyer).completeOrder(orderId)).to.be.revertedWith(
      "Order not confirmed"
    );
  });

  it("rejects wrong buyer and wrong deposit amount", async function () {
    const { contract, buyer, seller, stranger, ethers } = await deployFixture();
    const { orderId, depositAmount } = await createDepositOrder(
      contract,
      buyer,
      seller,
      ethers,
      5n
    );

    await expect(
      contract.connect(stranger).payDeposit(orderId, { value: depositAmount })
    ).to.be.revertedWith("Not buyer");

    await expect(
      contract.connect(buyer).payDeposit(orderId, {
        value: ethers.parseEther("0.2"),
      })
    ).to.be.revertedWith("Incorrect deposit amount");
  });
});
