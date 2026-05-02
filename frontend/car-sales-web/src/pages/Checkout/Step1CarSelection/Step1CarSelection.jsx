import React from 'react';
import './Step1CarSelection.css';
import { Link } from 'react-router-dom';
import trashcan from '../../../assets/icon/trashcan.png';
import weight from '../../../assets/icon/weight.png';
import engine from '../../../assets/icon/engine.png';
import energy from '../../../assets/icon/energy.png';
import add from '../../../assets/icon/add.png';

function Step1CarSelection({
  cartItems = [],
  removeFromCart,
  updateQuantity,
  selectedIds = [],
  toggleSelectCar,
  actionLoading = {}
}) {
  return (
    <div className="step-1-wrapper">
      <h2 id="header">Selection of cars for inspection</h2>
      <hr id="cross-line" />
      <p id="paragraph">
        <strong>We want you to get the best cars possible...</strong>
      </p>

      <div className="display-carform">
        <p id="title-display-carform">Cars for inspection</p>

        {cartItems.length > 0 ? (
          cartItems.map((item) => {
            const product = item.productId;
            const cartItemId = item._id;
            const productId = product?._id;

            const quantity = Number(item.quantity || 1);
            const price = Number(item.price || product?.price || 0);
            const specs = product?.specifications || {};
            const isSelected = selectedIds.includes(cartItemId);
            const isLoading = Boolean(actionLoading[cartItemId]);

            return (
              <div
                className={`carform ${isSelected ? 'selected-outline' : ''}`}
                key={cartItemId}
                onClick={() => {
                  if (!isLoading) toggleSelectCar(cartItemId);
                }}
                style={{ cursor: isLoading ? 'not-allowed' : 'pointer' }}
              >
                <img
                  className="img-car"
                  src={product?.thumbnailImage || ''}
                  alt={product?.name || 'car'}
                />

                <hr className="line" />

                <div className="car-infomation">
                  <div className="car-and-close">
                    <h4 className="car-name">
                      {product?.name || 'Unnamed car'}
                    </h4>

                    <img
                      className="icon trash-icon"
                      src={trashcan}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();

                        if (isLoading || !productId) return;

                        removeFromCart({
                          cartItemId,
                          productId
                        });
                      }}
                      alt="remove"
                      style={{
                        opacity: isLoading ? 0.5 : 1,
                        pointerEvents: isLoading ? 'none' : 'auto'
                      }}
                    />
                  </div>

                  <div className="info-line">
                    <div className="info-item">
                      <img className="icon" src={weight} alt="" />
                      <span>{specs.weight ? `${specs.weight} kg` : 'N/A'}</span>
                    </div>

                    <div className="info-item">
                      <img className="icon" src={engine} alt="" />
                      <span>{specs.power ? `${specs.power} HP` : 'N/A'}</span>
                    </div>

                    <div className="info-item">
                      <img className="icon" src={energy} alt="" />
                      <span>{specs.topSpeed ? `${specs.topSpeed} km/h` : 'N/A'}</span>
                    </div>
                  </div>

                  <div className="car-quantity">
                    <button
                      type="button"
                      className="qty-btn"
                      disabled={quantity <= 1 || isLoading || !productId}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();

                        if (quantity <= 1 || isLoading || !productId) return;

                        updateQuantity({
                          cartItemId,
                          productId,
                          quantity: quantity - 1
                        });
                      }}
                    >
                      -
                    </button>

                    <input
                      type="number"
                      value={quantity}
                      readOnly
                      className="qty-input"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                    />

                    <button
                      type="button"
                      className="qty-btn"
                      disabled={isLoading || !productId}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();

                        if (isLoading || !productId) return;

                        updateQuantity({
                          cartItemId,
                          productId,
                          quantity: quantity + 1
                        });
                      }}
                    >
                      +
                    </button>
                  </div>

                  <h3 className="car-price">
                    ${(price * quantity).toLocaleString()}
                  </h3>
                </div>
              </div>
            );
          })
        ) : (
          <p>Your cart is empty.</p>
        )}

        <Link to="/cars" id="addanother" style={{ textDecoration: 'none' }}>
          <img className="icon" src={add} alt="" />
          <p>Add another car</p>
        </Link>
      </div>
    </div>
  );
}

export default Step1CarSelection;