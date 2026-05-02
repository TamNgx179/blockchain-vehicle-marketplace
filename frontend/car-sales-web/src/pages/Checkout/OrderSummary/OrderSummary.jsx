import React from 'react';
import './OrderSummary.css';

function OrderSummary({ cartItems = [], deliveryFee = 0 }) {
  const subtotal = cartItems.reduce((acc, item) => {
    const product = item.productId || item.product || item;
    const price = Number(item.price || product?.price || 0);
    const quantity = Number(item.quantity || 1);

    return acc + price * quantity;
  }, 0);

  const total = subtotal + Number(deliveryFee || 0);

  return (
    <div id="Order-summary">
      <h2>Order summary</h2>

      <div id="summary">
        <div className="car-selected">
          <label>Items ({cartItems.length})</label>

          <ol className="list-car-selected">
            {cartItems.map((item) => {
              const product = item.productId || item.product || item;
              const name = product?.name || item.name || 'Unnamed car';
              const price = Number(item.price || product?.price || 0);
              const quantity = Number(item.quantity || 1);

              return (
                <li key={item._id}>
                  {name} (x{quantity})
                  <span> ${(price * quantity).toLocaleString()}</span>
                </li>
              );
            })}
          </ol>
        </div>

        <div className="fee">
          <label>Delivery Fee</label>
          <label id="delivery-fee">
            ${Number(deliveryFee || 0).toLocaleString()}
          </label>
        </div>

        <hr id="cross-line" />

        <div className="fee total-row">
          <label>
            <strong>Total</strong>
          </label>
          <label id="total-fee">
            <strong>${total.toLocaleString()}</strong>
          </label>
        </div>
      </div>
    </div>
  );
}

export default OrderSummary;