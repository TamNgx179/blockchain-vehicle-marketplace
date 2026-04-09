import { expect } from "chai";
import { network } from "hardhat";

describe("VehicleDeposit", function () {
  async function deployFixture() {
    const connection = await network.connect();
    const { ethers } = connection;

    const [owner, buyer, seller] = await ethers.getSigners();

    const VehicleDeposit = await ethers.getContractFactory("VehicleDeposit");
    const contract = await VehicleDeposit.deploy();
    await contract.waitForDeployment();

    return { contract, owner, buyer, seller, ethers };
  }

  it("Flow đầy đủ: deposit -> confirm -> complete", async function () {
    const { contract, buyer, seller, ethers } = await deployFixture();

    const orderId = 1;
    const amount = ethers.parseEther("0.01");

    // deposit
    await contract.connect(buyer).deposit(orderId, seller.address, {
      value: amount,
    });

    // confirm
    await contract.connect(seller).confirm(orderId);

    // complete
    await contract.connect(buyer).complete(orderId);

    const result = await contract.getDeposit(orderId);
    expect(result[5]).to.equal(3); // Completed
  });

  it("Flow huỷ giao dịch", async function () {
    const { contract, buyer, seller, ethers } = await deployFixture();

    const orderId = 2;
    const amount = ethers.parseEther("0.01");

    await contract.connect(buyer).deposit(orderId, seller.address, {
      value: amount,
    });

    await contract.connect(buyer).cancel(orderId);

    const result = await contract.getDeposit(orderId);
    expect(result[5]).to.equal(4); // Cancelled
  });

  it("Không cho complete khi chưa confirm", async function () {
    const { contract, buyer, seller, ethers } = await deployFixture();

    const orderId = 3;
    const amount = ethers.parseEther("0.01");

    await contract.connect(buyer).deposit(orderId, seller.address, {
      value: amount,
    });

    await expect(
      contract.connect(buyer).complete(orderId)
    ).to.be.revertedWith("Not confirmed");
  });
});