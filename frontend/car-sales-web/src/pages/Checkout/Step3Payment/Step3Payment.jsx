import React from 'react';
import './Step3Payment.css';

function Step3Payment({ paymentMethod, setPaymentMethod, paymentDetails, setPaymentDetails, showNotify }) {

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPaymentDetails(prev => ({ ...prev, [name]: value }));
  };

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setPaymentDetails(prev => ({ ...prev, walletAddress: accounts[0] }));
      } catch (error) {
        showNotify("User denied account access or error occurred");
      }
    } else {
      showNotify("Please install MetaMask to use this feature!");
    }
  };

  return (
    <div className="payment-selection">
      <h2>Payment & Contact Information</h2>

      {/* 1. Chọn phương thức */}
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

      <div className="details-form">
        {/* 2. Phần thông tin chung cho cả 2 phương thức */}
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
            <p className="note">Note: Deposit will be processed in the next step.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Step3Payment;