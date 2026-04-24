import React from 'react';
import './Step3Payment.css';

function Step3Payment({
  paymentMethod,
  setPaymentMethod,
  paymentType, // Nhận từ cha
  setPaymentType, // Nhận từ cha
  paymentDetails,
  setPaymentDetails,
  showNotify
}) {

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPaymentDetails(prev => ({ ...prev, [name]: value }));
  };

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setPaymentDetails(prev => ({ ...prev, walletAddress: accounts[0] }));
      } catch {
        showNotify("User denied account access or error occurred");
      }
    } else {
      showNotify("Please install MetaMask to use this feature!");
    }
  };

  return (
    <div className="payment-selection">
      <h2>Payment & Contact Information</h2>

      {/* 1. Chọn phương thức thanh toán tổng quát */}
      <div className="payment-grid">
        <div
          className={`payment-card ${paymentMethod === 'cash' ? 'active' : ''}`}
          onClick={() => setPaymentMethod('cash')}
        >
          <div className="payment-icon">💵</div>
          <div className="payment-info">
            <h3>Cash Payment</h3>
            <p>Pay at showroom</p>
          </div>
        </div>

        <div
          className={`payment-card ${paymentMethod === 'blockchain' ? 'active' : ''}`}
          onClick={() => setPaymentMethod('blockchain')}
        >
          <div className="payment-icon">⛓️</div>
          <div className="payment-info">
            <h3>Blockchain</h3>
            <p>Smart Contract</p>
          </div>
        </div>
      </div>

      {/* 2. CHỌN LOẠI THANH TOÁN (Chỉ hiện khi chọn Blockchain) */}
      {paymentMethod === 'blockchain' && (
        <div className="payment-type-selection">
          <h3>Select Payment Plan</h3>
          <div className="type-grid">
            <label className={`type-option ${paymentType === 'full' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="paymentType"
                value="full"
                checked={paymentType === 'full'}
                onChange={() => setPaymentType('full')}
              />
              <div className="type-content">
                <strong>Full Payment</strong>
                <span>Pay 100% total amount</span>
              </div>
            </label>

            <label className={`type-option ${paymentType === 'deposit' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="paymentType"
                value="deposit"
                checked={paymentType === 'deposit'}
                onChange={() => setPaymentType('deposit')}
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
            type="text" name="fullName" placeholder="Full Name"
            value={paymentDetails.fullName} onChange={handleInputChange}
          />
          <input
            type="text" name="phoneNumber" placeholder="Phone Number"
            value={paymentDetails.phoneNumber} onChange={handleInputChange}
          />
        </div>
        <input
          type="email" name="email" placeholder="Email Address"
          className="full-width-input"
          value={paymentDetails.email} onChange={handleInputChange}
        />

        {/* 3. Phần riêng cho Blockchain */}
        {paymentMethod === 'blockchain' && (
          <div className="blockchain-section">
            <h3>Wallet Connection</h3>
            {!paymentDetails.walletAddress ? (
              <button type="button" className="connect-btn" onClick={connectWallet}>
                Connect MetaMask
              </button>
            ) : (
              <div className="wallet-info">
                <span>Connected: </span>
                <code>{paymentDetails.walletAddress.substring(0, 10)}...{paymentDetails.walletAddress.slice(-4)}</code>
              </div>
            )}
            <p className="note">
              Note: {paymentType === 'deposit' ? "You chose to Pay Deposit." : "You chose to Pay Full Amount."}
              Confirm in the next step.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Step3Payment;
