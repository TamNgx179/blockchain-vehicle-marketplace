import React from 'react';
import './Step4Confirmation.css';

const getOrderLabel = (items = []) => {
  if (!items.length) return "vehicle order";

  const labels = items.map((item) =>
    item.quantity > 1 ? `${item.name} x${item.quantity}` : item.name
  );

  if (labels.length === 1) return labels[0];
  if (labels.length === 2) return `${labels[0]} and ${labels[1]}`;

  return `${labels.slice(0, -1).join(", ")}, and ${labels[labels.length - 1]}`;
};

function Step4Confirmation({ paymentDetails, orderedItems = [] }) {
  const orderLabel = getOrderLabel(orderedItems);

  return (
    <div className="confirmation-container">
      <div className="confirmation-icon" aria-hidden="true">✓</div>
      <h2>Order Placed Successfully!</h2>
      <p>
        Thank you, <strong>{paymentDetails.fullName}</strong>. Your{" "}
        <strong>{orderLabel}</strong> order is being processed.
      </p>

      <div className="confirmation-next-steps">
        <h3>Track your order status</h3>
        <p>
          Open My Orders to follow payment verification, showroom confirmation,
          delivery progress, and transaction history.
        </p>
      </div>
    </div>
  );
}

export default Step4Confirmation;
