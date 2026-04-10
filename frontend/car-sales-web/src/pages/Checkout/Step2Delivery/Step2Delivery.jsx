import React from 'react';
import './Step2Delivery.css';

function Step2Delivery({ deliveryMethod, setDeliveryMethod }) {
  const methods = [
    {
      id: 'pickup',
      title: 'Showroom Pickup',
      description: 'Visit our nearest Showroom to pick up your car. (Free)',
      icon: '🏢'
    },
    {
      id: 'home',
      title: 'Home Delivery',
      description: 'Premium transport service right to your doorstep. ($50.00)',
      icon: '🚚'
    }
  ];

  return (
    <div className="delivery-selection">
      <h2>Select Delivery Method</h2>
      <div className="delivery-options">
        {methods.map((method) => (
          <div
            key={method.id}
            className={`delivery-card ${deliveryMethod === method.id ? 'selected' : ''}`}
            onClick={() => setDeliveryMethod(method.id)}
          >
            <div className="method-icon">{method.icon}</div>
            <div className="method-info">
              <h3>{method.title}</h3>
              <p>{method.description}</p>
            </div>
            <div className="radio-circle">
              {deliveryMethod === method.id && <div className="inner-circle" />}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Step2Delivery;