import React, { useState, useRef, useMemo } from 'react';
import { useCart } from '../../context/CartContext';
import Navbar from '../../components/Navbar/Navbar';
import './Checkout.css';
import Step1CarSelection from './Step1CarSelection/Step1CarSelection';
import OrderSummary from './OrderSummary/OrderSummary';
import Notification from '../../components/Notification/Notification'
import Step2Delivery from './Step2Delivery/Step2Delivery';
import Step3Payment from './Step3Payment/Step3Payment';
import Step4Confirmation from './Step4Confirmation/Step4Confirmation';
import { ethers } from 'ethers';
import contractABI from '../../config/abi.json';
import { orderService } from '../../services/orderService';

function Checkout() {
  const { cartItems, removeFromCart, updateQuantity } = useCart();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false); // Trạng thái chờ xử lý
  const notifyRef = useRef();

  const [selectedIds, setSelectedIds] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('blockchain'); // Mặc định blockchain cho đúng flow 5.2
  const [deliveryMethod, setDeliveryMethod] = useState('pickup');
  const [paymentDetails, setPaymentDetails] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    walletAddress: ''
  });

  const [finalTxHash, setFinalTxHash] = useState('');

  // Tính phí vận chuyển dùng useMemo để tối ưu
  const deliveryFee = useMemo(() => (deliveryMethod === 'home' ? 50 : 0), [deliveryMethod]);

  // Lọc sản phẩm đã chọn
  const selectedItemsForOrder = useMemo(() =>
    cartItems.filter(item => selectedIds.includes(item._id)),
    [cartItems, selectedIds]);

  /**
   * LUỒNG 5.2: XỬ LÝ THANH TOÁN BLOCKCHAIN
   */
  const handleBlockchainPayment = async (dbOrderId, blockchainOrderId, totalAmountUSD) => {
    try {
      setLoading(true);
      notifyRef.current.show("Please confirm transaction in MetaMask...");

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const network = await provider.getNetwork();
      console.log("Mạng ID hiện tại:", network.chainId.toString());
      console.log("Tên mạng:", network.name);
      // Quy đổi giá trị ETH (Trong thực tế nên lấy tỷ giá từ Backend hoặc Oracle)
      const ETH_PRICE_IN_USD = 2000000.0;
      const ethAmount = (totalAmountUSD / ETH_PRICE_IN_USD).toFixed(18);

      const contract = new ethers.Contract(
        "0xD0CF607f0bCD60B5ed02896e682450eA4dBf5BB0",
        contractABI.abi,
        signer
      );

      // Bước 3: Gọi payFull(blockchainOrderId)
      const tx = await contract.payFull(blockchainOrderId, {
        value: ethers.parseEther(ethAmount)
      });

      setFinalTxHash(tx.hash);
      notifyRef.current.show("Transaction sent! Confirming on-chain...");

      // Bước 4: Chờ transaction receipt
      const receipt = await tx.wait();

      if (receipt.status === 1) {
        // Bước 5: Gọi POST verify-full-payment
        await orderService.verifyFullPayment(dbOrderId, tx.hash);
        setStep(4);
      } else {
        throw new Error("Transaction on-chain failed");
      }
    } catch (error) {
      console.error(error);
      notifyRef.current.show("Blockchain Error: " + (error.reason || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleNextStep = async () => {
    if (selectedIds.length === 0) {
      notifyRef.current.show("Please select at least one BMW model!");
      return;
    }

    // LOGIC TẠI BƯỚC 3 (PAYMENT)
    if (step === 3) {
      const { fullName, phoneNumber, email, walletAddress } = paymentDetails;
      if (!fullName || !phoneNumber || !email) {
        notifyRef.current.show("Please fill in all contact information!");
        return;
      }

      if (paymentMethod === 'blockchain') {
        if (!walletAddress) {
          notifyRef.current.show("Please connect your wallet first!");
          return;
        }

        try {
          setLoading(true);
          // Bước 1 & 2: Tạo order trên Backend trước
          const isPickup = deliveryMethod === 'pickup';

          const orderPayload = {
            selectedItems: selectedIds.filter(id => id), // Đảm bảo mảng sạch
            paymentType: "full",
            buyerWallet: paymentDetails.walletAddress,

            // Backend yêu cầu Enum: "pickup" hoặc "delivery"
            deliveryMethod: isPickup ? "pickup" : "delivery",

            // CHỈ gửi trường tương ứng, trường còn lại để undefined hoặc null
            pickupInfo: isPickup ? {
              name: paymentDetails.fullName,
              phone: paymentDetails.phoneNumber,
              // Thêm giờ vào để thành chuẩn ISO
              pickupDate: paymentDetails.pickupDate ? new Date(paymentDetails.pickupDate).toISOString() : null
            } : undefined,

            shippingAddress: !isPickup ? {
              name: paymentDetails.fullName,
              phone: paymentDetails.phoneNumber,
              address: paymentDetails.address
            } : undefined
          };
          console.log("Order Payload:", orderPayload);
          const response = await orderService.createOrder(orderPayload);
          console.log("Order Creation Response:", response);

          // Phải truy cập vào response.data
          const orderData = response.data;

          // Sau khi backend trả về blockchainOrderId, tiến hành gọi Contract
          await handleBlockchainPayment(
            orderData._id,               // Sửa ở đây
            orderData.blockchainOrderId,  // Sửa ở đây
            orderData.totalAmount || 0    // Lưu ý: data của bạn dùng totalAmount chứ không phải totalAmountUSD
          );
        } catch (error) {
          notifyRef.current.show("Order creation failed: " + error.message);
        } finally {
          setLoading(false);
        }
        return;
      }
    }

    if (step < 4) setStep(step + 1);
  };

  const toggleSelectCar = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
    );
  };

  const renderStepContent = () => {
    switch (step) {
      case 1: return <Step1CarSelection cartItems={cartItems} removeFromCart={removeFromCart} updateQuantity={updateQuantity} selectedIds={selectedIds} toggleSelectCar={toggleSelectCar} showNotify={(msg) => notifyRef.current?.show(msg)} />;
      case 2: return <Step2Delivery deliveryMethod={deliveryMethod} setDeliveryMethod={setDeliveryMethod} paymentDetails={paymentDetails} setPaymentDetails={setPaymentDetails} showNotify={(msg) => notifyRef.current?.show(msg)} />;
      case 3: return <Step3Payment paymentMethod={paymentMethod} setPaymentMethod={setPaymentMethod} paymentDetails={paymentDetails} setPaymentDetails={setPaymentDetails} showNotify={(msg) => notifyRef.current?.show(msg)} />;
      case 4: return <Step4Confirmation paymentDetails={paymentDetails} txHash={finalTxHash} showNotify={(msg) => notifyRef.current?.show(msg)} />;
      default: return null;
    }
  };

  return (
    <>
      <Navbar />
      <Notification ref={notifyRef} />
      <div className="checkout-page">
        <div id="purchasing-progress">
          <ol id="step-purchasing">
            {[1, 2, 3, 4].map((num) => (
              <li key={num} className={`step ${step >= num ? 'active' : ''}`}>
                <span className="dot">{num}</span>
                <span className="step-label">
                  {num === 1 && "Selection"} {num === 2 && "Delivery"} {num === 3 && "Payment"} {num === 4 && "Confirmation"}
                </span>
              </li>
            ))}
          </ol>
        </div>

        <div id="main-content">
          <div id="Choosing-method">
            {renderStepContent()}
            <div id="button-block">
              {step > 1 && step < 4 && (
                <button type="button" className="back-step" onClick={() => setStep(step - 1)} disabled={loading}>
                  Back
                </button>
              )}
              <button
                type="button"
                className="next-step"
                onClick={handleNextStep}
                disabled={loading}
              >
                {loading ? "Processing..." : (step === 4 ? "Finish" : "Next")}
              </button>
            </div>
          </div>
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