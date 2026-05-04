export const requestMetaMaskAccounts = async () => {
  if (!window.ethereum) {
    throw new Error("Please install MetaMask to use this feature.");
  }

  try {
    await window.ethereum.request({
      method: "wallet_requestPermissions",
      params: [{ eth_accounts: {} }],
    });
  } catch (error) {
    if (error?.code === 4001) throw error;
    if (error?.code !== -32601) throw error;
  }

  const accounts = await window.ethereum.request({
    method: "eth_requestAccounts",
  });

  return Array.from(new Set((accounts || []).filter(Boolean)));
};
