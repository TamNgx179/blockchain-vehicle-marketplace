import React, { useEffect, useState } from "react";
import "./WalletManagement.css";
import metamaskIcon from "../../../assets/icon/metamask.png";
import {
  getMyWallets,
  addWallet,
  updateWallet,
  deleteWallet,
} from "../../../services/walletService";

function WalletManagement() {
  const [wallets, setWallets] = useState([]);
  const [loadingWallets, setLoadingWallets] = useState(false);
  const [connectingWallet, setConnectingWallet] = useState(false);
  const [updatingWalletId, setUpdatingWalletId] = useState(null);
  const [deletingWalletId, setDeletingWalletId] = useState(null);
  const [editingWalletId, setEditingWalletId] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    network: "sepolia",
    isDefault: false,
  });
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

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

  const getWalletId = (wallet) => wallet._id || wallet.id;

  const loadWallets = async () => {
    try {
      setLoadingWallets(true);
      setErrorMessage("");

      const response = await getMyWallets();
      const walletList = normalizeWalletResponse(response);

      setWallets(walletList);
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || "Could not load your saved wallets"
      );
    } finally {
      setLoadingWallets(false);
    }
  };

  useEffect(() => {
    loadWallets();
  }, []);

  const connectWallet = async () => {
    if (!window.ethereum) {
      setErrorMessage("Please install MetaMask to use this feature!");
      return;
    }

    try {
      setConnectingWallet(true);
      setErrorMessage("");
      setMessage("");

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      const walletAddress = accounts?.[0];

      if (!walletAddress) {
        setErrorMessage("Could not get wallet address from MetaMask");
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
        setMessage("MetaMask connected successfully");
      } catch (error) {
        if (error.response?.status === 409) {
          setMessage("This wallet is already saved");
        } else {
          throw error;
        }
      }

      await loadWallets();
    } catch (error) {
      if (error.code === 4001) {
        setErrorMessage("User denied MetaMask connection");
        return;
      }

      setErrorMessage(
        error.response?.data?.message || "Could not connect MetaMask"
      );
    } finally {
      setConnectingWallet(false);
    }
  };

  const startEditWallet = (wallet) => {
    const walletId = getWalletId(wallet);

    setEditingWalletId(walletId);
    setEditForm({
      name: wallet.name || "",
      network: wallet.network || "sepolia",
      isDefault: Boolean(wallet.isDefault),
    });
    setMessage("");
    setErrorMessage("");
  };

  const cancelEditWallet = () => {
    setEditingWalletId(null);
    setEditForm({
      name: "",
      network: "sepolia",
      isDefault: false,
    });
  };

  const handleEditFormChange = (e) => {
    const { name, value, checked, type } = e.target;

    setEditForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const saveWallet = async (walletId) => {
    if (!walletId) {
      setErrorMessage("Wallet id is missing");
      return;
    }

    try {
      setUpdatingWalletId(walletId);
      setErrorMessage("");
      setMessage("");

      await updateWallet(walletId, {
        name: editForm.name.trim() || "MetaMask",
        network: editForm.network,
        isDefault: editForm.isDefault,
      });

      setMessage("Wallet updated successfully");
      setEditingWalletId(null);
      await loadWallets();
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || "Could not update wallet"
      );
    } finally {
      setUpdatingWalletId(null);
    }
  };

  const setDefaultWallet = async (wallet) => {
    const walletId = getWalletId(wallet);

    if (!walletId) {
      setErrorMessage("Wallet id is missing");
      return;
    }

    try {
      setUpdatingWalletId(walletId);
      setErrorMessage("");
      setMessage("");

      await updateWallet(walletId, {
        name: wallet.name || "MetaMask",
        network: wallet.network || "sepolia",
        isDefault: true,
      });

      setMessage("Default wallet updated");
      await loadWallets();
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || "Could not set default wallet"
      );
    } finally {
      setUpdatingWalletId(null);
    }
  };

  const removeWallet = async (walletId) => {
    if (!walletId) {
      setErrorMessage("Wallet id is missing");
      return;
    }

    const confirmed = window.confirm("Bạn có chắc muốn xóa ví này không?");
    if (!confirmed) return;

    try {
      setDeletingWalletId(walletId);
      setErrorMessage("");
      setMessage("");

      await deleteWallet(walletId);

      setMessage("Wallet deleted successfully");

      if (editingWalletId === walletId) {
        cancelEditWallet();
      }

      await loadWallets();
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || "Could not delete wallet"
      );
    } finally {
      setDeletingWalletId(null);
    }
  };

  return (
    <div className="wallet-management">
      <div className="wallet-section-header">
        <div>
          <h3>Wallet Management</h3>
          <p>Quản lý ví MetaMask đã lưu trong tài khoản của bạn.</p>
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

      {message && <p className="wallet-success-text">{message}</p>}
      {errorMessage && <p className="wallet-error-text">{errorMessage}</p>}

      {loadingWallets ? (
        <p className="wallet-loading-text">Loading your wallets...</p>
      ) : wallets.length > 0 ? (
        <div className="wallet-card-list">
          {wallets.map((wallet) => {
            const walletId = getWalletId(wallet);
            const isEditing = editingWalletId === walletId;
            const isUpdating = updatingWalletId === walletId;
            const isDeleting = deletingWalletId === walletId;

            return (
              <div
                key={walletId || wallet.address}
                className={`checkout-wallet-card ${
                  wallet.isDefault ? "is-default" : ""
                }`}
              >
                <div className="wallet-card-left">
                  <div className="wallet-avatar">
                    <img src={metamaskIcon} alt="MetaMask" />
                  </div>

                  <div className="checkout-wallet-main">
                    {isEditing ? (
                      <div className="wallet-edit-form">
                        <div className="wallet-form-group">
                          <label>Wallet name</label>
                          <input
                            type="text"
                            name="name"
                            value={editForm.name}
                            onChange={handleEditFormChange}
                            placeholder="MetaMask"
                          />
                        </div>

                        <div className="wallet-form-group">
                          <label>Network</label>
                          <select
                            name="network"
                            value={editForm.network}
                            onChange={handleEditFormChange}
                          >
                            <option value="sepolia">Sepolia</option>
                            <option value="ethereum">Ethereum</option>
                            <option value="polygon">Polygon</option>
                            <option value="bsc">BSC</option>
                          </select>
                        </div>

                        <label className="wallet-checkbox">
                          <input
                            type="checkbox"
                            name="isDefault"
                            checked={editForm.isDefault}
                            onChange={handleEditFormChange}
                          />
                          Đặt làm ví mặc định
                        </label>
                      </div>
                    ) : (
                      <>
                        <div className="wallet-title-row">
                          <span className="checkout-wallet-name">
                            {wallet.name || "Wallet"}
                          </span>

                          {wallet.isDefault && (
                            <span className="checkout-wallet-default">
                              Mặc định
                            </span>
                          )}
                        </div>

                        <code>{shortenAddress(wallet.address)}</code>
                      </>
                    )}
                  </div>
                </div>

                <div className="checkout-wallet-meta">
                  {!isEditing && (
                    <div className="wallet-meta-top">
                      <span className="wallet-network-badge">
                        {wallet.network || "sepolia"}
                      </span>

                      {!wallet.isDefault && (
                        <button
                          type="button"
                          className="wallet-action-btn wallet-action-soft"
                          onClick={() => setDefaultWallet(wallet)}
                          disabled={isUpdating || isDeleting}
                        >
                          {isUpdating ? "Saving..." : "Set default"}
                        </button>
                      )}
                    </div>
                  )}

                  {isEditing ? (
                    <div className="wallet-row-actions">
                      <button
                        type="button"
                        className="wallet-action-btn"
                        onClick={() => saveWallet(walletId)}
                        disabled={isUpdating}
                      >
                        {isUpdating ? "Saving..." : "Save"}
                      </button>

                      <button
                        type="button"
                        className="wallet-action-btn wallet-action-secondary"
                        onClick={cancelEditWallet}
                        disabled={isUpdating}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="wallet-row-actions">
                      <button
                        type="button"
                        className="wallet-action-btn wallet-action-secondary"
                        onClick={() => startEditWallet(wallet)}
                        disabled={isUpdating || isDeleting}
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        className="wallet-action-btn wallet-action-danger"
                        onClick={() => removeWallet(walletId)}
                        disabled={isDeleting || isUpdating}
                      >
                        {isDeleting ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="no-wallet-box">
          <div className="wallet-avatar">
            <img src={metamaskIcon} alt="MetaMask" />
          </div>

          <div>
            <strong>Chưa có ví</strong>
            <p>Kết nối MetaMask để thêm ví vào tài khoản.</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default WalletManagement;