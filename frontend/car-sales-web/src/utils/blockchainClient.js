import { BrowserProvider, Contract, parseEther, toBigInt } from "ethers";
import contractArtifact from "../config/abi.json";

const CONTRACT_ADDRESS =
  import.meta.env.VITE_CONTRACT_ADDRESS ||
  "0xD0CF607f0bCD60B5ed02896e682450eA4dBf5BB0";
const SEPOLIA_CHAIN_ID = 11155111n;
const SEPOLIA_CHAIN_HEX = "0xaa36a7";
const USD_PER_ETH = Number(import.meta.env.VITE_USD_PER_ETH || 2000000);

export const getPositiveWeiValue = (amountWei) => {
  if (!amountWei) throw new Error("Payment amount is missing.");

  const value = toBigInt(amountWei);
  if (value <= 0n) throw new Error("Payment amount is invalid.");

  return value;
};

export const getFullPaymentWei = (order) => {
  if (order.totalAmountWei) {
    return getPositiveWeiValue(order.totalAmountWei);
  }

  const ethAmount = (Number(order.totalAmount || 0) / USD_PER_ETH).toFixed(18);
  return parseEther(ethAmount);
};

export const ensureSepoliaNetwork = async () => {
  if (!window.ethereum) {
    throw new Error("MetaMask is not installed in this browser.");
  }

  const provider = new BrowserProvider(window.ethereum);
  const network = await provider.getNetwork();

  if (network.chainId === SEPOLIA_CHAIN_ID) {
    await provider.send("eth_requestAccounts", []);
    return provider;
  }

  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: SEPOLIA_CHAIN_HEX }],
    });
  } catch (switchError) {
    if (switchError?.code !== 4902) throw switchError;
    await window.ethereum.request({
      method: "wallet_addEthereumChain",
      params: [
        {
          chainId: SEPOLIA_CHAIN_HEX,
          chainName: "Sepolia",
          nativeCurrency: { name: "Sepolia ETH", symbol: "ETH", decimals: 18 },
          rpcUrls: ["https://rpc.sepolia.org"],
          blockExplorerUrls: ["https://sepolia.etherscan.io"],
        },
      ],
    });
  }

  const switchedProvider = new BrowserProvider(window.ethereum);
  await switchedProvider.send("eth_requestAccounts", []);
  return switchedProvider;
};

export const getMarketplaceContract = async () => {
  const provider = await ensureSepoliaNetwork();
  const signer = await provider.getSigner();

  return new Contract(CONTRACT_ADDRESS, contractArtifact.abi, signer);
};

export const getBuyerMarketplaceContract = async (order) => {
  const contract = await getMarketplaceContract();
  const connectedWallet = await contract.runner.getAddress();

  if (
    order.buyerWallet &&
    connectedWallet.toLowerCase() !== order.buyerWallet.toLowerCase()
  ) {
    throw new Error(
      "The connected MetaMask wallet is not the buyer wallet for this order."
    );
  }

  return contract;
};
