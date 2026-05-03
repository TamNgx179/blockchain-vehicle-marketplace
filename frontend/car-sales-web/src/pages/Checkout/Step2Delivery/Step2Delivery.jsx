import React from "react";
import {
  Building2,
  CalendarDays,
  CheckCircle,
  Clock3,
  MapPin,
  Truck,
} from "lucide-react";
import "./Step2Delivery.css";

function Step2Delivery({
  deliveryMethod,
  setDeliveryMethod,
  paymentDetails,
  setPaymentDetails,
}) {
  const methods = [
    {
      id: "pickup",
      title: "Showroom pickup",
      description:
        "Reserve a handover appointment, inspect the vehicle, and finish documents at the showroom.",
      fee: "Free",
      icon: <Building2 size={24} />,
    },
    {
      id: "delivery",
      title: "Home delivery",
      description:
        "A premium transport team delivers the vehicle to your preferred address after showroom approval.",
      fee: "$50 service fee",
      icon: <Truck size={24} />,
    },
  ];

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setPaymentDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="handover-selection">
      <div className="checkout-section-heading">
        <span>Step 2</span>
        <h2>Plan the handover</h2>
        <p>
          Choose how you want to receive the vehicle after the deposit is
          verified and the showroom confirms availability.
        </p>
      </div>

      <div className="handover-options">
        {methods.map((method) => {
          const selected = deliveryMethod === method.id;

          return (
            <button
              type="button"
              key={method.id}
              className={`handover-card ${selected ? "selected" : ""}`}
              onClick={() => setDeliveryMethod(method.id)}
            >
              <div className="handover-icon">{method.icon}</div>
              <div className="handover-copy">
                <div>
                  <h3>{method.title}</h3>
                  <span>{method.fee}</span>
                </div>
                <p>{method.description}</p>
              </div>
              <div className="handover-check">
                {selected && <CheckCircle size={18} />}
              </div>
            </button>
          );
        })}
      </div>

      <div className="handover-details-panel">
        {deliveryMethod === "pickup" ? (
          <div className="handover-form-grid">
            <label className="handover-field">
              <span>
                <CalendarDays size={16} />
                Pickup date
              </span>
              <input
                type="date"
                name="pickupDate"
                value={paymentDetails.pickupDate || ""}
                onChange={handleInputChange}
                min={new Date().toISOString().split("T")[0]}
              />
            </label>

            <div className="handover-note">
              <Clock3 size={17} />
              <div>
                <strong>Showroom hours</strong>
                <p>Appointments are available from 8:00 AM to 6:00 PM.</p>
              </div>
            </div>
          </div>
        ) : (
          <label className="handover-field">
            <span>
              <MapPin size={16} />
              Delivery address
            </span>
            <textarea
              name="address"
              placeholder="Enter your full street address, city, and zip code..."
              value={paymentDetails.address || ""}
              onChange={handleInputChange}
            />
          </label>
        )}
      </div>
    </div>
  );
}

export default Step2Delivery;
