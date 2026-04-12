import { defineConfig } from "hardhat/config";
import dotenv from "dotenv";

import hardhatToolboxMochaEthersPlugin from "@nomicfoundation/hardhat-toolbox-mocha-ethers";
import hardhatVerify from "@nomicfoundation/hardhat-verify";

dotenv.config();

export default defineConfig({
  plugins: [
    hardhatToolboxMochaEthersPlugin,
    hardhatVerify,
  ],

  solidity: "0.8.28",

  networks: {
    sepolia: {
      type: "http",
      chainType: "l1",
      url: process.env.SEPOLIA_RPC_URL,
      accounts: [process.env.SEPOLIA_PRIVATE_KEY],
    },
  },

  verify: {
    etherscan: {
      apiKey: process.env.ETHERSCAN_API_KEY,
    },
  },
});