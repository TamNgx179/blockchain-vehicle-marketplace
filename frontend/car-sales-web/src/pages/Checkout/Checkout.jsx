import React, { useState, useRef } from 'react';
import { useCart } from '../../context/CartContext';
import Navbar from '../../components/Navbar/Navbar';
import './Checkout.css';
import Step1CarSelection from './Step1CarSelection/Step1CarSelection';
import OrderSummary from './OrderSummary/OrderSummary';
import Notification from '../../components/Notification/Notification'
import Step2Delivery from './Step2Delivery/Step2Delivery';
function Checkout() {
  const { cartItems, removeFromCart, updateQuantity } = useCart();
  const [step, setStep] = useState(1);
  let deliveryFee = 50;
  const notifyRef = useRef();
  // 1. Quản lý danh sách ID xe được chọn (mặc định rỗng)
  const [selectedIds, setSelectedIds] = useState([]);

  const handleNextStep = () => {
    if (selectedIds.length === 0) {
      // Thay alert bằng Toast
      notifyRef.current.show("Please select at least one BMW model to continue!");
      return;
    }

    if (step < 4) {
      setStep(step + 1);
    } else {
      notifyRef.current.show("Thank you for your purchase! Your order has been confirmed.");
    }
  };
  // 2. Hàm toggle chọn/bỏ chọn xe
  const toggleSelectCar = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
    );
  };

  // 3. Lọc ra danh sách xe thực tế để đưa vào OrderSummary
  const selectedItemsForOrder = cartItems.filter(item => selectedIds.includes(item.id));
  // Step2.1. Thêm State cho phương thức vận chuyển (mặc định là pickup)
  const [deliveryMethod, setDeliveryMethod] = useState('pickup');

  // Tính toán phí vận chuyển dựa trên lựa chọn
  deliveryFee = deliveryMethod === 'home' ? 50 : 0;
  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <Step1CarSelection
            cartItems={cartItems}
            removeFromCart={removeFromCart}
            updateQuantity={updateQuantity}
            // Truyền thêm props mới
            selectedIds={selectedIds}
            toggleSelectCar={toggleSelectCar}
          />
        );
      case 2: return (
        <Step2Delivery
          deliveryMethod={deliveryMethod}
          setDeliveryMethod={setDeliveryMethod}
        />
      );
      case 3: return <div>Delivery Service Component</div>;
      case 4: return <div>Confirmation Component</div>;
      default: return null;
    }
  };

  return (
    <>
      <Navbar />
      <Notification ref={notifyRef} />
      <div className="checkout-page">
        <div id="purchasing-progress">
          <ol id="step-purchasing" className="progress">
            {[1, 2, 3, 4].map((num) => (
              <li key={num} className={`step ${step >= num ? 'active' : ''}`}>
                <span className="dot">{num}</span>
                <span className="step-label">
                  {num === 1 && "Car selection"}
                  {num === 2 && "Delivery service"}
                  {num === 3 && "Payment method"}
                  {num === 4 && "Order confirmation"}
                </span>
              </li>
            ))}
          </ol>
        </div>

        <div id="main-content">
          <div id="Choosing-method">
            {renderStepContent()}

            <div id="button-block">
              {step > 1 && <button type="button" className="back-step" onClick={() => setStep(step - 1)}>Back</button>}
              <button
                type="button"
                className="next-step"
                onClick={handleNextStep}
              >
                {step === 4 ? "Finish" : "Next"}
              </button>
            </div>
          </div>

          {/* CHỈ truyền những xe đã được tick chọn vào OrderSummary */}
          <OrderSummary
            cartItems={selectedItemsForOrder}
            deliveryFee={selectedIds.length > 0 ? deliveryFee : 0}
            step={step}
          />
        </div>
      </div>
    </>
  );
}

export default Checkout;