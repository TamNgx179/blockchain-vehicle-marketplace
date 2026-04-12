import React from 'react';
import './Step4Confirmation.css';
function Step4Confirmation({ paymentDetails, txHash }) {
  return (
    <div className="confirmation-container" style={{ textAlign: 'center', padding: '40px' }}>
      <h2>✅Order Placed Successfully!</h2>
      <p>Thank you, <strong>{paymentDetails.fullName}</strong>. Your BMW order is being processed.</p>

      {txHash && (
        <div className="tx-box" style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px', marginTop: '20px' }}>
          <p style={{ margin: 0, fontSize: '14px' }}>Transaction Hash:</p>
          <a
            href={`https://sepolia.etherscan.io/tx/${txHash}`}
            target="_blank"
            rel="noreferrer"
            style={{ wordBreak: 'break-all', color: '#007bff' }}
          >
            {txHash}
          </a>
        </div>
      )}

      <button
        onClick={() => window.location.href = '/'}
        style={{ marginTop: '30px', padding: '10px 25px', cursor: 'pointer' }}
        className="home-button"
      >
        Back to Home
      </button>
    </div>
  );
}

export default Step4Confirmation;