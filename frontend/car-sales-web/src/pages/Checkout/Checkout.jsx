import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, LoaderCircle } from "lucide-react";
import { useCart } from "../../context/CartContext";
import Navbar from "../../components/Navbar/Navbar";
import "./Checkout.css";
import Step1CarSelection from "./Step1CarSelection/Step1CarSelection";
import OrderSummary from "./OrderSummary/OrderSummary";
import Step2Delivery from "./Step2Delivery/Step2Delivery";
import Step3Payment from "./Step3Payment/Step3Payment";
import Step4Confirmation from "./Step4Confirmation/Step4Confirmation";
import { orderService } from "../../services/orderService";
import {
  ensureSelectedWalletReady,
  getMarketplaceContract,
  getPositiveWeiValue,
} from "../../utils/blockchainClient";

const CHECKOUT_STEPS = [
  {
    number: 1,
    label: "Vehicle",
    title: "Select vehicle",
    description: "Choose the car you want to reserve.",
  },
  {
    number: 2,
    label: "Handover",
    title: "Plan handover",
    description: "Pick showroom pickup or delivery.",
  },
  {
    number: 3,
    label: "Deposit",
    title: "Secure deposit",
    description: "Pay with your MetaMask wallet.",
  },
  {
    number: 4,
    label: "Done",
    title: "Confirmation",
    description: "Track your purchase order.",
  },
];

const getCheckoutErrorMessage = (error) => {
  const raw = String(
    error?.response?.data?.message ||
      error?.reason ||
      error?.shortMessage ||
      error?.info?.error?.message ||
      error?.message ||
      ""
  );
  const normalized = raw.toLowerCase();

  if (!raw) return "Payment could not be completed. Please try again.";
  if (error?.code === "ACTION_REJECTED" || normalized.includes("user rejected")) {
    return "You rejected the transaction in MetaMask.";
  }
  if (
    error?.code === "INSUFFICIENT_FUNDS" ||
    normalized.includes("insufficient funds")
  ) {
    return "Your wallet does not have enough Sepolia ETH for this payment and gas fee.";
  }
  if (normalized.includes("network") || normalized.includes("chain")) {
    return "Please switch MetaMask to the Sepolia network and try again.";
  }
  if (
    normalized.includes("execution reverted") ||
    normalized.includes("missing revert data")
  ) {
    if (normalized.includes("not buyer")) {
      return "The active MetaMask account is not the selected buyer wallet. Please switch MetaMask to the selected wallet and try again.";
    }
    if (
      normalized.includes("incorrect full amount") ||
      normalized.includes("incorrect deposit amount")
    ) {
      return "The payment amount does not match the amount stored in the smart contract. Please refresh checkout and create the order again.";
    }
    if (
      normalized.includes("not full payment order") ||
      normalized.includes("not deposit order")
    ) {
      return "The selected payment plan does not match this blockchain order. Please go back and try checkout again.";
    }
    if (normalized.includes("invalid status")) {
      return "This blockchain order is no longer waiting for payment. Please refresh checkout and try again.";
    }
    if (normalized.includes("order not found")) {
      return "This order was not found on the smart contract. Please refresh checkout and try again.";
    }

    return "The smart contract rejected this payment. Please check your wallet, amount, and network.";
  }
  if (normalized.includes("metamask")) {
    return "MetaMask could not complete the transaction.";
  }

  return raw.length > 140
    ? "Payment could not be completed. Please check MetaMask and try again."
    : raw;
};

const normalizeOrderData = (response) => response?.data || response;

function Checkout({ notifyRef }) {
  const navigate = useNavigate();

  const {
    cartItems,
    fetchCart,
    updateQuantity,
    removeFromCart,
    removePurchasedItems,
    loading: cartLoading,
  } = useCart();

  const [cartActionLoading, setCartActionLoading] = useState({});
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [paymentType, setPaymentType] = useState("deposit");
  const [selectedIds, setSelectedIds] = useState([]);
  const [confirmedItems, setConfirmedItems] = useState([]);
  const [deliveryMethod, setDeliveryMethod] = useState("pickup");
  const [paymentDetails, setPaymentDetails] = useState({
    fullName: "",
    phoneNumber: "",
    email: "",
    walletAddress: "",
  });
  const [finalTxHash, setFinalTxHash] = useState("");

  const showMessage = useCallback(
    (message) => {
      notifyRef?.current?.show?.(message);
    },
    [notifyRef]
  );

  useEffect(() => {
    fetchCart?.();
  }, [fetchCart]);

  const checkoutCartItems = useMemo(() => cartItems || [], [cartItems]);
  const deliveryFee = useMemo(
    () => (deliveryMethod === "delivery" ? 50 : 0),
    [deliveryMethod]
  );

  const selectedItemsForOrder = useMemo(
    () => checkoutCartItems.filter((item) => selectedIds.includes(item._id)),
    [checkoutCartItems, selectedIds]
  );

  const summaryItems =
    step === 4 && confirmedItems.length > 0
      ? confirmedItems
      : selectedItemsForOrder;

  const handleBlockchainPayment = async (
    dbOrderId,
    blockchainOrderId,
    totalAmountWei,
    buyerWallet
  ) => {
    showMessage("Please confirm the full payment in MetaMask...");

    const contract = await getMarketplaceContract(buyerWallet);
    const tx = await contract.payFull(blockchainOrderId, {
      value: await getPositiveWeiValue(totalAmountWei),
    });

    setFinalTxHash(tx.hash);
    showMessage("Transaction sent. Waiting for blockchain confirmation...");

    const receipt = await tx.wait();

    if (receipt.status !== 1) {
      throw new Error("Transaction failed on-chain.");
    }

    await orderService.verifyFullPayment(dbOrderId, tx.hash);
    return tx.hash;
  };

  const handleDepositPayment = async (
    dbOrderId,
    blockchainOrderId,
    depositAmountWei,
    buyerWallet
  ) => {
    showMessage("Please confirm the deposit in MetaMask...");

    const contract = await getMarketplaceContract(buyerWallet);
    const tx = await contract.payDeposit(blockchainOrderId, {
      value: await getPositiveWeiValue(depositAmountWei),
    });

    setFinalTxHash(tx.hash);
    showMessage("Deposit transaction sent. Waiting for blockchain confirmation...");

    const receipt = await tx.wait();

    if (receipt.status !== 1) {
      throw new Error("Deposit transaction failed on-chain.");
    }

    await orderService.verifyDeposit(dbOrderId, tx.hash);
    return tx.hash;
  };

  const validateDeliveryStep = () => {
    if (deliveryMethod === "pickup" && !paymentDetails.pickupDate) {
      showMessage("Please select a pickup date.");
      return false;
    }

    if (deliveryMethod !== "pickup" && !paymentDetails.address) {
      showMessage("Please enter your delivery address.");
      return false;
    }

    return true;
  };

  const validatePaymentStep = () => {
    const { fullName, phoneNumber, email, walletAddress } = paymentDetails;

    if (!fullName || !phoneNumber || !email) {
      showMessage("Please fill in all contact information.");
      return false;
    }

    if (!walletAddress) {
      showMessage("Please connect your MetaMask wallet first.");
      return false;
    }

    return true;
  };

  const buildOrderPayload = () => {
    const isPickup = deliveryMethod === "pickup";

    return {
      selectedItems: selectedItemsForOrder.map((item) => item.productId._id),
      paymentType,
      buyerWallet: paymentDetails.walletAddress,
      deliveryMethod: isPickup ? "pickup" : "delivery",
      pickupInfo: isPickup
        ? {
            name: paymentDetails.fullName,
            phone: paymentDetails.phoneNumber,
            pickupDate: new Date(paymentDetails.pickupDate).toISOString(),
          }
        : undefined,
      shippingAddress: !isPickup
        ? {
            name: paymentDetails.fullName,
            phone: paymentDetails.phoneNumber,
            address: paymentDetails.address,
          }
        : undefined,
    };
  };

  const discardUnpaidOrder = async (orderId, error) => {
    try {
      await orderService.discardUnpaidOrder(orderId);
      showMessage(
        `${getCheckoutErrorMessage(
          error
        )} No order was saved, and your cart is unchanged.`
      );
    } catch (discardError) {
      console.error("Failed to discard unpaid order:", discardError);
      showMessage(
        `${getCheckoutErrorMessage(
          error
        )} The order is still waiting for payment in My Orders.`
      );
    }
  };

  const handleNextStep = async () => {
    if (step === 4) {
      navigate("/orders");
      return;
    }

    if (selectedIds.length === 0) {
      showMessage("Please select at least one vehicle.");
      return;
    }

    if (step === 2 && !validateDeliveryStep()) {
      return;
    }

    if (step !== 3) {
      setStep(step + 1);
      return;
    }

    if (!validatePaymentStep()) {
      return;
    }

    let orderData = null;
    let paymentCompleted = false;

    try {
      setLoading(true);
      setFinalTxHash("");

      await ensureSelectedWalletReady(paymentDetails.walletAddress);

      const response = await orderService.createOrder(buildOrderPayload());
      orderData = normalizeOrderData(response);

      if (!orderData?._id || !orderData?.blockchainOrderId) {
        throw new Error("Order data from server is invalid.");
      }

      const txHash =
        paymentType === "deposit"
          ? await handleDepositPayment(
              orderData._id,
              orderData.blockchainOrderId,
              orderData.depositAmountWei,
              paymentDetails.walletAddress
            )
          : await handleBlockchainPayment(
              orderData._id,
              orderData.blockchainOrderId,
              orderData.totalAmountWei,
              paymentDetails.walletAddress
            );

      paymentCompleted = true;
      setFinalTxHash(txHash);
      setConfirmedItems(selectedItemsForOrder);
      removePurchasedItems(selectedIds);
      setSelectedIds([]);
      setStep(4);
    } catch (error) {
      console.error("Checkout payment failed:", error);

      if (paymentCompleted) {
        showMessage(
          "Payment completed. Please open My Orders if the confirmation screen did not update."
        );
        setStep(4);
      } else if (orderData?._id) {
        await discardUnpaidOrder(orderData._id, error);
      } else {
        showMessage("Order failed: " + getCheckoutErrorMessage(error));
      }
    } finally {
      setLoading(false);
    }
  };

  const setItemActionLoading = (cartItemId, value) => {
    setCartActionLoading((prev) => ({
      ...prev,
      [cartItemId]: value,
    }));
  };

  const handleRemoveFromCart = async ({ cartItemId, productId }) => {
    if (!cartItemId || !productId) return;

    try {
      setItemActionLoading(cartItemId, true);
      setSelectedIds((prev) => prev.filter((id) => id !== cartItemId));

      await removeFromCart(productId);
    } catch (error) {
      console.error("Remove cart item failed:", error);
      showMessage(
        error?.response?.data?.message || "Could not remove item from cart."
      );
    } finally {
      setItemActionLoading(cartItemId, false);
    }
  };

  const handleUpdateQuantity = async ({ cartItemId, productId, quantity }) => {
    if (!cartItemId || !productId || quantity < 1) return;

    try {
      setItemActionLoading(cartItemId, true);

      await updateQuantity(productId, quantity);
    } catch (error) {
      console.error("Update cart quantity failed:", error);
      showMessage(
        error?.response?.data?.message || "Could not update quantity."
      );
    } finally {
      setItemActionLoading(cartItemId, false);
    }
  };

  const toggleSelectCar = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((itemId) => itemId !== id)
        : [...prev, id]
    );
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <Step1CarSelection
            cartItems={checkoutCartItems}
            removeFromCart={handleRemoveFromCart}
            updateQuantity={handleUpdateQuantity}
            selectedIds={selectedIds}
            toggleSelectCar={toggleSelectCar}
            actionLoading={cartActionLoading}
            showNotify={showMessage}
          />
        );
      case 2:
        return (
          <Step2Delivery
            deliveryMethod={deliveryMethod}
            setDeliveryMethod={setDeliveryMethod}
            paymentDetails={paymentDetails}
            setPaymentDetails={setPaymentDetails}
            showNotify={showMessage}
          />
        );
      case 3:
        return (
          <Step3Payment
            paymentType={paymentType}
            setPaymentType={setPaymentType}
            paymentDetails={paymentDetails}
            setPaymentDetails={setPaymentDetails}
            showNotify={showMessage}
          />
        );
      case 4:
        return (
          <Step4Confirmation
            paymentDetails={paymentDetails}
            orderedItems={confirmedItems}
            txHash={finalTxHash}
            paymentType={paymentType}
          />
        );
      default:
        return null;
    }
  };

  const getPrimaryLabel = () => {
    if (loading) return "Processing...";
    if (step === 1) return "Continue to handover";
    if (step === 2) return "Continue to deposit";
    if (step === 3) {
      return paymentType === "deposit"
        ? "Pay deposit with MetaMask"
        : "Pay full amount with MetaMask";
    }
    return "View My Orders";
  };

  return (
    <>
      <Navbar />

      <main className="checkout-page">
        <section className="checkout-hero" aria-labelledby="checkout-title">
          <div>
            <span className="checkout-eyebrow">Secure vehicle checkout</span>
            <h1 id="checkout-title">Reserve your next car</h1>
            <p>
              Review your selected vehicle, schedule handover, and secure the
              order through a MetaMask escrow payment.
            </p>
          </div>
        </section>

        <nav className="checkout-progress" aria-label="Checkout progress">
          <ol>
            {CHECKOUT_STEPS.map((item) => (
              <li
                key={item.number}
                className={`checkout-step ${
                  step === item.number ? "current" : ""
                } ${step > item.number ? "complete" : ""}`}
              >
                <span className="checkout-step-dot">{item.number}</span>
                <span>
                  <strong>{item.label}</strong>
                  <small>{item.title}</small>
                </span>
              </li>
            ))}
          </ol>
        </nav>

        <div className="checkout-layout">
          <section className="checkout-workspace">
            {cartLoading && step === 1 ? (
              <div className="checkout-loading">
                <LoaderCircle className="checkout-spin" size={22} />
                Loading your garage...
              </div>
            ) : (
              renderStepContent()
            )}

            <div className="checkout-actions">
              {step > 1 && step < 4 && (
                <button
                  type="button"
                  className="checkout-action-secondary"
                  onClick={() => setStep(step - 1)}
                  disabled={loading}
                >
                  <ArrowLeft size={17} />
                  Back
                </button>
              )}

              <button
                type="button"
                className="checkout-action-primary"
                onClick={handleNextStep}
                disabled={loading || cartLoading}
              >
                {loading ? (
                  <LoaderCircle className="checkout-spin" size={17} />
                ) : (
                  <ArrowRight size={17} />
                )}
                {getPrimaryLabel()}
              </button>
            </div>
          </section>

          <OrderSummary
            cartItems={summaryItems}
            deliveryFee={summaryItems.length > 0 ? deliveryFee : 0}
            paymentType={paymentType}
            step={step}
          />
        </div>
      </main>
    </>
  );
}

export default Checkout;
