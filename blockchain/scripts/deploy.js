import hre from "hardhat";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  const { ethers } = await hre.network.connect();

  const ContractFactory = await ethers.getContractFactory("VehicleMarketplaceEscrow");
  const contract = await ContractFactory.deploy();

  await contract.waitForDeployment();

  console.log("Contract deployed to:", await contract.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});