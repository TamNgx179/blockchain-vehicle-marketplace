import React from "react";
import "./OrderSummary.css";

const DEPOSIT_RATE = 0.005;
const USD_PER_ETH = Number(import.meta.env.VITE_USD_PER_ETH || 2000000);

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const formatEth = (usdValue) => {
  const ethValue = Number(usdValue || 0) / USD_PER_ETH;

  return `${new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 8,
  }).format(ethValue)} ETH`;
};

const formatEthWithUsd = (usdValue) =>
  `${formatEth(usdValue)} (${formatCurrency(usdValue)})`;

function OrderSummary({
  cartItems = [],
  deliveryFee = 0,
  paymentType = "deposit",
}) {
  const subtotal = cartItems.reduce((acc, item) => {
    const product = item.productId || item.product || item;
    const price = Number(item.price || product?.price || 0);
    const quantity = Number(item.quantity || 1);

    return acc + price * quantity;
  }, 0);

  const total = subtotal + Number(deliveryFee || 0);
  const depositAmount = subtotal > 0 ? subtotal * DEPOSIT_RATE : 0;
  const dueToday = paymentType === "deposit" ? depositAmount : subtotal;
  const balanceLater = paymentType === "deposit" ? subtotal - depositAmount : 0;

  return (
    <aside id="Order-summary" aria-label="Order summary">
      <div className="summary-header">
        <div>
          <span>Checkout summary</span>
          <h2>Vehicle order</h2>
        </div>
      </div>

      <div className="summary-vehicle-list">
        {cartItems.length > 0 ? (
          cartItems.map((item) => {
            const product = item.productId || item.product || item;
            const name = product?.name || item.name || "Unnamed vehicle";
            const price = Number(item.price || product?.price || 0);
            const quantity = Number(item.quantity || 1);

            return (
              <div className="summary-vehicle-row" key={item._id || name}>
                <img src={product?.thumbnailImage || ""} alt={name} />
                <div>
                  <strong>{name}</strong>
                  <span>
                    {quantity} x {formatEthWithUsd(price)}
                  </span>
                </div>
                <b>{formatEthWithUsd(price * quantity)}</b>
              </div>
            );
          })
        ) : (
          <p className="summary-empty">Select a vehicle to see pricing.</p>
        )}
      </div>

      <div className="summary-lines">
        <div>
          <span>Vehicle subtotal</span>
          <strong>{formatEthWithUsd(subtotal)}</strong>
        </div>
        <div>
          <span>Handover service</span>
          <strong>{formatEthWithUsd(deliveryFee)}</strong>
        </div>
        <div>
          <span>Purchase total</span>
          <strong>{formatEthWithUsd(total)}</strong>
        </div>
      </div>

      <div className="summary-due-card">
        <span>
          {paymentType === "deposit" ? "Due today as deposit" : "Due today"}
        </span>
        <strong>{formatEth(dueToday)}</strong>
        <em>({formatCurrency(dueToday)})</em>
        <p>
          {paymentType === "deposit"
            ? `${formatEthWithUsd(
                balanceLater
              )} is paid only when you receive the vehicle.`
            : "The full vehicle amount will be paid through MetaMask."}
        </p>
      </div>
    </aside>
  );
}

export default OrderSummary;
