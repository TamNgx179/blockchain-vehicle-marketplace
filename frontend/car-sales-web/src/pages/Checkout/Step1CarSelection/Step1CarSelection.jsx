import React from 'react';
import './Step1CarSelection.css';
import { Link } from 'react-router-dom';
import trashcan from '../../../assets/icon/trashcan.png';
import weight from '../../../assets/icon/weight.png';
import engine from '../../../assets/icon/engine.png';
import energy from '../../../assets/icon/energy.png';
import add from '../../../assets/icon/add.png';

function Step1CarSelection({ cartItems, removeFromCart, updateQuantity, selectedIds, toggleSelectCar }) {
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
            const isSelected = selectedIds.includes(item.id);
            return (
              <div
                className={`carform ${isSelected ? 'selected-outline' : ''}`}
                key={item.id}
                onClick={() => toggleSelectCar(item.id)} // Click để chọn
                style={{ cursor: 'pointer' }}
              >
                <img className="img-car" src={item.display} alt={item.name} />
                <hr className="line" />
                <div className="car-infomation">
                  <div className="car-and-close">
                    <h4 className="car-name">{item.name}</h4>
                    <img
                      className="icon trash-icon"
                      src={trashcan}
                      onClick={(e) => {
                        e.stopPropagation(); // Không cho kích hoạt toggleSelectCar
                        removeFromCart(item.id);
                      }}
                      alt="remove"
                    />
                  </div>
                  <div className="info-line">
                    <div className="info-item">
                      <img className="icon" src={weight} alt="" />
                      <span>{item.specs?.Weight || 'N/A'}</span>
                    </div>
                    <div className="info-item">
                      <img className="icon" src={engine} alt="" />
                      <span>{item.specs?.Power || 'N/A'}</span>
                    </div>
                    <div className="info-item">
                      <img className="icon" src={energy} alt="" />
                      <span>{item.specs?.["Top Speed"] || 'N/A'}</span>
                    </div>
                  </div>
                  <div className="car-quantity">
                    <button
                      type="button"
                      className="qty-btn"
                      onClick={(e) => { e.stopPropagation(); updateQuantity(item.id, -1); }}
                    >-</button>
                    <input type="number" value={item.quantity} readOnly className="qty-input" onClick={(e) => e.stopPropagation()} />
                    <button
                      type="button"
                      className="qty-btn"
                      onClick={(e) => { e.stopPropagation(); updateQuantity(item.id, 1); }}
                    >+</button>
                  </div>
                  <h3 className="car-price">${(item.priceUSD * item.quantity).toLocaleString()}</h3>
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