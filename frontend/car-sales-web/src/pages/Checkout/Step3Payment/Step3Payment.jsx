import React, { useEffect, useState } from "react";
import { Banknote, Blocks, CheckCircle, Plus } from "lucide-react";
import "./Step3Payment.css";
import metamaskIcon from "../../../assets/icon/metamask.png";
import { getMyWallets, addWallet } from "../../../services/walletService";
import { requestMetaMaskAccounts } from "../../../utils/metamaskWallets";

function Step3Payment({
  paymentMethod,
  setPaymentMethod,
  paymentType,
  setPaymentType,
  paymentDetails,
  setPaymentDetails,
  showNotify,
}) {
  const [wallets, setWallets] = useState([]);
  const [loadingWallets, setLoadingWallets] = useState(false);
  const [connectingWallet, setConnectingWallet] = useState(false);

  const notify = (message) => showNotify?.(message);

  const shortenAddress = (address) => {
    if (!address) return "";
    return `${address.substring(0, 10)}...${address.slice(-4)}`;
  };

  const normalizeWalletResponse = (response) => {
    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.wallets)) return response.wallets;
    if (Array.isArray(response?.data)) return response.data;
    return [];
  };

  const selectedWallet = wallets.find(
    (wallet) =>
      wallet.address?.toLowerCase() ===
      paymentDetails.walletAddress?.toLowerCase()
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setPaymentDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const loadWallets = async () => {
    try {
      setLoadingWallets(true);

      const response = await getMyWallets();
      const walletList = normalizeWalletResponse(response);

      setWallets(walletList);

      if (!paymentDetails.walletAddress && walletList.length > 0) {
        const defaultWallet =
          walletList.find((wallet) => wallet.isDefault) || walletList[0];

        setPaymentDetails((prev) => ({
          ...prev,
          walletAddress: defaultWallet.address,
        }));
      }

      return walletList;
    } catch (error) {
      notify(
        error.response?.data?.message || "Could not load your saved wallets."
      );
      return [];
    } finally {
      setLoadingWallets(false);
    }
  };

  useEffect(() => {
    if (paymentMethod === "blockchain") {
      loadWallets();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentMethod]);

  const handleSelectWallet = (walletAddress) => {
    setPaymentDetails((prev) => ({
      ...prev,
      walletAddress,
    }));
  };

  const connectWallet = async () => {
    try {
      setConnectingWallet(true);

      const accounts = await requestMetaMaskAccounts();

      if (!accounts.length) {
        notify("Could not get any wallet address from MetaMask.");
        return;
      }

      const existingAddresses = new Set(
        wallets.map((wallet) => wallet.address?.toLowerCase()).filter(Boolean)
      );
      let savedCount = 0;
      let duplicateCount = 0;

      for (const [index, walletAddress] of accounts.entries()) {
        const normalizedAddress = walletAddress.toLowerCase();

        try {
          await addWallet({
            name: "MetaMask",
            address: walletAddress,
            network: "sepolia",
            isDefault:
              wallets.length === 0 &&
              savedCount === 0 &&
              index === 0 &&
              !existingAddresses.size,
          });
          savedCount += 1;
          existingAddresses.add(normalizedAddress);
        } catch (error) {
          if (error.response?.status === 409) {
            duplicateCount += 1;
          } else {
            throw error;
          }
        }
      }

      setPaymentDetails((prev) => ({
        ...prev,
        walletAddress: accounts[0],
      }));

      await loadWallets();

      if (savedCount > 0) {
        notify(
          `${savedCount} MetaMask ${
            savedCount === 1 ? "wallet" : "wallets"
          } connected successfully.`
        );
      } else if (duplicateCount > 0) {
        notify("Selected MetaMask wallet is already saved.");
      }
    } catch (error) {
      if (error.code === 4001) {
        notify("MetaMask connection was rejected.");
        return;
      }

      notify(
        error.response?.data?.message ||
          error.message ||
          "Could not connect MetaMask."
      );
    } finally {
      setConnectingWallet(false);
    }
  };

  return (
    <div className="payment-selection">
      <h2>Payment & Contact Information</h2>

      <div className="payment-grid">
        <button
          type="button"
          className={`payment-card ${paymentMethod === "cash" ? "active" : ""}`}
          onClick={() => setPaymentMethod("cash")}
        >
          <div className="payment-icon">
            <Banknote size={25} />
          </div>
          <div className="payment-info">
            <h3>Cash Payment</h3>
            <p>Pay at showroom</p>
          </div>
        </button>

        <button
          type="button"
          className={`payment-card ${
            paymentMethod === "blockchain" ? "active" : ""
          }`}
          onClick={() => setPaymentMethod("blockchain")}
        >
          <div className="payment-icon">
            <Blocks size={25} />
          </div>
          <div className="payment-info">
            <h3>Blockchain</h3>
            <p>Smart contract payment</p>
          </div>
        </button>
      </div>

      {paymentMethod === "blockchain" && (
        <div className="payment-type-selection">
          <h3>Select Payment Plan</h3>

          <div className="type-grid">
            <label
              className={`type-option ${
                paymentType === "full" ? "selected" : ""
              }`}
            >
              <input
                type="radio"
                name="paymentType"
                value="full"
                checked={paymentType === "full"}
                onChange={() => setPaymentType("full")}
              />
              <div className="type-content">
                <strong>Full Payment</strong>
                <span>Pay 100% of the total amount</span>
              </div>
            </label>

            <label
              className={`type-option ${
                paymentType === "deposit" ? "selected" : ""
              }`}
            >
              <input
                type="radio"
                name="paymentType"
                value="deposit"
                checked={paymentType === "deposit"}
                onChange={() => setPaymentType("deposit")}
              />
              <div className="type-content">
                <strong>Deposit</strong>
                <span>Pay a deposit first and complete later</span>
              </div>
            </label>
          </div>
        </div>
      )}

      <div className="details-form">
        <h3>Contact Details</h3>

        <div className="input-group">
          <input
            type="text"
            name="fullName"
            placeholder="Full Name"
            value={paymentDetails.fullName}
            onChange={handleInputChange}
          />

          <input
            type="text"
            name="phoneNumber"
            placeholder="Phone Number"
            value={paymentDetails.phoneNumber}
            onChange={handleInputChange}
          />
        </div>

        <input
          type="email"
          name="email"
          placeholder="Email Address"
          className="full-width-input"
          value={paymentDetails.email}
          onChange={handleInputChange}
        />

        {paymentMethod === "blockchain" && (
          <div className="blockchain-section">
            <div className="checkout-wallet-header">
              <div>
                <h3>Payment Wallet</h3>
                <p>
                  Choose one of your saved MetaMask wallets. The same wallet
                  must be active in MetaMask when you confirm the payment.
                </p>
              </div>

              <button
                type="button"
                className="connect-btn"
                onClick={connectWallet}
                disabled={connectingWallet}
              >
                {connectingWallet ? (
                  "Connecting..."
                ) : (
                  <>
                    <Plus size={16} />
                    Connect wallet
                  </>
                )}
              </button>
            </div>

            {loadingWallets ? (
              <p className="wallet-loading-text">Loading your wallets...</p>
            ) : wallets.length > 0 ? (
              <div className="checkout-wallet-grid">
                {wallets.map((wallet) => {
                  const isSelected =
                    wallet.address?.toLowerCase() ===
                    paymentDetails.walletAddress?.toLowerCase();

                  return (
                    <button
                      key={wallet._id || wallet.address}
                      type="button"
                      className={`checkout-wallet-card ${
                        isSelected ? "selected" : ""
                      }`}
                      onClick={() => handleSelectWallet(wallet.address)}
                    >
                      <div className="checkout-wallet-card-main">
                        <div className="checkout-wallet-avatar">
                          <img src={metamaskIcon} alt="MetaMask" />
                        </div>

                        <div className="checkout-wallet-main">
                          <span className="checkout-wallet-name">
                            {wallet.name || "MetaMask"}
                          </span>
                          <code title={wallet.address}>
                            {shortenAddress(wallet.address)}
                          </code>
                        </div>
                      </div>

                      <div className="checkout-wallet-meta">
                        <span>{wallet.network || "sepolia"}</span>

                        {wallet.isDefault && (
                          <span className="checkout-wallet-default">
                            Default
                          </span>
                        )}

                        {isSelected && (
                          <span className="checkout-wallet-selected">
                            <CheckCircle size={12} />
                            Selected
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="no-wallet-box">
                <div>
                  <strong>No wallets connected</strong>
                  <p>Connect MetaMask to add a wallet and continue checkout.</p>
                </div>
              </div>
            )}

            {selectedWallet && (
              <p className="note">
                Selected wallet: {shortenAddress(selectedWallet.address)}.{" "}
                {paymentType === "deposit"
                  ? "You chose to pay a deposit."
                  : "You chose to pay the full amount."}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Step3Payment;
