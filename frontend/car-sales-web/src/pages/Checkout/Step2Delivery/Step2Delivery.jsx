import React from 'react';
import './Step2Delivery.css';

function Step2Delivery({ deliveryMethod, setDeliveryMethod, paymentDetails, setPaymentDetails }) {
  const methods = [
    {
      id: 'pickup',
      title: 'Showroom Pickup',
      description: 'Visit our nearest Showroom to pick up your car. (Free)',
      icon: '🏢'
    },
    {
      id: 'delivery',
      title: 'Home Delivery',
      description: 'Premium transport service right to your doorstep. ($50.00)',
      icon: '🚚'
    }
  ];

  // Hàm handle thay đổi input chung
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPaymentDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

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

      {/* Phần hiển thị thêm dựa trên phương thức đã chọn */}
      <div className="delivery-details-form">
        {deliveryMethod === 'pickup' && (
          <div className="form-group slide-in">
            <label>Select Pickup Date</label>
            <input
              type="date"
              name="pickupDate"
              className="detail-input"
              value={paymentDetails.pickupDate || ''}
              onChange={handleInputChange}
              min={new Date().toISOString().split('T')[0]} // Không cho chọn ngày quá khứ
            />
            <small>Showroom hours: 8:00 AM - 6:00 PM</small>
          </div>
        )}

        {deliveryMethod === 'delivery' && (
          <div className="form-group slide-in">
            <label>🏠 Delivery Address</label>
            <textarea
              name="address"
              className="detail-input textarea"
              placeholder="Enter your full street address, city, and zip code..."
              value={paymentDetails.address || ''}
              onChange={handleInputChange}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default Step2Delivery;