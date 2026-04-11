import React from 'react';

function OrderSummary({ cartItems, deliveryFee, step }) {
  const subtotal = cartItems.reduce((acc, item) => acc + (item.priceUSD * item.quantity), 0);
  const total = subtotal + deliveryFee;

  return (
    <div id="Order-summary">
      <h2>Order summary</h2>
      <div id="summary">
        <div className="car-selected">
          <label>Items ({cartItems.length})</label>
          <ol className="list-car-selected">
            {cartItems.map((item) => (
              <li key={item.id}>
                {item.name} (x{item.quantity})
                <span> ${(item.priceUSD * item.quantity).toLocaleString()}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="fee">
          <label>Delivery Fee</label>
          <label id="delivery-fee">${deliveryFee}</label>
        </div>

        <hr id="cross-line" />
        <div className="fee total-row">
          <label><strong>Total</strong></label>
          <label id="total-fee"><strong>${total.toLocaleString()}</strong></label>
        </div>

        {step === 4 && <button type="submit" id="Purchase" className="btn-purchase">Purchase</button>}
      </div>
    </div>
  );
}

export default OrderSummary;