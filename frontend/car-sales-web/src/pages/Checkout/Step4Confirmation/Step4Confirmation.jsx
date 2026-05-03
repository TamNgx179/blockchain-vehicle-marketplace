import React from "react";
import { CheckCircle, PackageCheck, Wallet } from "lucide-react";
import "./Step4Confirmation.css";

const getItemName = (item) =>
  item?.productId?.name || item?.product?.name || item?.name || "vehicle";

const getOrderLabel = (items = []) => {
  if (!items.length) return "vehicle order";

  const labels = items.map((item) => {
    const name = getItemName(item);
    return item.quantity > 1 ? `${name} x${item.quantity}` : name;
  });

  if (labels.length === 1) return labels[0];
  if (labels.length === 2) return `${labels[0]} and ${labels[1]}`;

  return `${labels.slice(0, -1).join(", ")}, and ${
    labels[labels.length - 1]
  }`;
};

const shortenText = (value, start = 10, end = 8) => {
  if (!value) return "Not available";
  if (value.length <= start + end) return value;
  return `${value.slice(0, start)}...${value.slice(-end)}`;
};

function Step4Confirmation({
  paymentDetails,
  orderedItems = [],
  txHash,
  paymentType,
}) {
  const orderLabel = getOrderLabel(orderedItems);

  return (
    <div className="confirmation-container">
      <div className="confirmation-hero">
        <div className="confirmation-icon" aria-hidden="true">
          <CheckCircle size={38} />
        </div>

        <span>Reservation secured</span>
        <h2>Order placed successfully</h2>
        <p>
          Thank you, <strong>{paymentDetails.fullName || "customer"}</strong>.
          Your <strong>{orderLabel}</strong> order is now waiting for showroom
          review and next-step coordination.
        </p>
      </div>

      <div className="confirmation-grid">
        <section className="confirmation-panel">
          <PackageCheck size={22} />
          <div>
            <span>Next step</span>
            <h3>Track showroom processing</h3>
            <p>
              Open My Orders to follow deposit verification, seller
              confirmation, delivery progress, and final handover status.
            </p>
          </div>
        </section>

        <section className="confirmation-panel">
          <Wallet size={22} />
          <div>
            <span>
              {paymentType === "deposit" ? "Deposit transaction" : "Payment transaction"}
            </span>
            <h3>{shortenText(txHash)}</h3>
            {txHash ? (
              <a
                href={`https://sepolia.etherscan.io/tx/${txHash}`}
                target="_blank"
                rel="noreferrer"
              >
                View on Etherscan
              </a>
            ) : (
              <p>Transaction details will appear in My Orders.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default Step4Confirmation;
