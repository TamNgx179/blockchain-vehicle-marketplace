import React, { useEffect, useState } from "react";
import "./Step3Payment.css";
import metamaskIcon from "../../../assets/icon/metamask.png";
import { getMyWallets, addWallet } from "../../../services/walletService";

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

  const shortenAddress = (address) => {
    if (!address) return "";
    return `${address.substring(0, 10)}...${address.slice(-4)}`;
  };

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
      const walletList = response.data || [];

      setWallets(walletList);

      if (!paymentDetails.walletAddress && walletList.length > 0) {
        const defaultWallet =
          walletList.find((wallet) => wallet.isDefault) || walletList[0];

        setPaymentDetails((prev) => ({
          ...prev,
          walletAddress: defaultWallet.address,
        }));
      }
    } catch (error) {
      showNotify(
        error.response?.data?.message || "Could not load your saved wallets"
      );
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
    if (!window.ethereum) {
      showNotify("Please install MetaMask to use this feature!");
      return;
    }

    try {
      setConnectingWallet(true);

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      const walletAddress = accounts?.[0];

      if (!walletAddress) {
        showNotify("Could not get wallet address from MetaMask");
        return;
      }

      const walletData = {
        name: "MetaMask",
        address: walletAddress,
        network: "sepolia",
        isDefault: wallets.length === 0,
      };

      try {
        await addWallet(walletData);
      } catch (error) {
        if (error.response?.status !== 409) {
          throw error;
        }
      }

      setPaymentDetails((prev) => ({
        ...prev,
        walletAddress,
      }));

      await loadWallets();
      showNotify("MetaMask connected successfully");
    } catch (error) {
      if (error.code === 4001) {
        showNotify("User denied MetaMask connection");
        return;
      }

      showNotify(error.response?.data?.message || "Could not connect MetaMask");
    } finally {
      setConnectingWallet(false);
    }
  };

  return (
    <div className="payment-selection">
      <h2>Payment & Contact Information</h2>

      <div className="payment-grid">
        <div
          className={`payment-card ${paymentMethod === "cash" ? "active" : ""}`}
          onClick={() => setPaymentMethod("cash")}
        >
          <div className="payment-icon">💵</div>
          <div className="payment-info">
            <h3>Cash Payment</h3>
            <p>Pay at showroom</p>
          </div>
        </div>

        <div
          className={`payment-card ${
            paymentMethod === "blockchain" ? "active" : ""
          }`}
          onClick={() => setPaymentMethod("blockchain")}
        >
          <div className="payment-icon">⛓️</div>
          <div className="payment-info">
            <h3>Blockchain</h3>
            <p>Smart Contract</p>
          </div>
        </div>
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
                <span>Pay 100% total amount</span>
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
                <span>Secure with a small fee</span>
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
            <div className="wallet-section-header">
              <div>
                <h3>Wallet</h3>
                <p>Ví mặc định đã được chọn sẵn. Bấm ví khác nếu muốn đổi.</p>
              </div>
            </div>

            {loadingWallets ? (
              <p className="wallet-loading-text">Loading your wallets...</p>
            ) : wallets.length > 0 ? (
              <div className="wallet-card-list">
                {wallets.map((wallet) => {
                  const selected =
                    wallet.address?.toLowerCase() ===
                    paymentDetails.walletAddress?.toLowerCase();

                  return (
                    <button
                      key={wallet._id}
                      type="button"
                      className={`checkout-wallet-card ${
                        selected ? "selected" : ""
                      }`}
                      onClick={() => handleSelectWallet(wallet.address)}
                    >
                      <div className="checkout-wallet-main">
                        <span className="checkout-wallet-name">
                          {wallet.name || "Wallet"}
                        </span>
                        <code>{shortenAddress(wallet.address)}</code>
                      </div>

                      <div className="checkout-wallet-meta">
                        <span>{wallet.network || "sepolia"}</span>

                        {wallet.isDefault && (
                          <span className="checkout-wallet-default">
                            Mặc định
                          </span>
                        )}

                        {selected && (
                          <span className="checkout-wallet-selected">
                            Đang chọn
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
                  <strong>Chưa có ví</strong>
                  <p>Kết nối MetaMask để thêm ví và tiếp tục thanh toán.</p>
                </div>

                <button
                  type="button"
                  className="connect-btn"
                  onClick={connectWallet}
                  disabled={connectingWallet}
                >
                  <img
                    className="metamask-icon"
                    src={metamaskIcon}
                    alt=""
                    aria-hidden="true"
                  />
                  {connectingWallet ? "Connecting..." : "Connect MetaMask"}
                </button>
              </div>
            )}

            {paymentDetails.walletAddress && (
              <div className="wallet-info">
                <span>Selected wallet: </span>
                <code>{shortenAddress(paymentDetails.walletAddress)}</code>
              </div>
            )}

            <p className="note">
              Note:{" "}
              {paymentType === "deposit"
                ? "You chose to Pay Deposit."
                : "You chose to Pay Full Amount."}{" "}
              Confirm in the next step.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Step3Payment;