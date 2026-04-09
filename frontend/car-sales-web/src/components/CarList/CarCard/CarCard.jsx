import React from 'react';
import { Link } from 'react-router-dom';
import './CarCard.css';
function CarCard({ car, delay }) {
  return (
    <div
      className="car-card reveal-up active"
      style={{ "--reveal-delay": `${delay}s` }}
    >
      <img
        className="thumb-img"
        src={car.display}
        alt={car.name}
        loading="lazy"
        decoding="async"
        width="400"
        height="230"
      />
      <div className="body">
        <h3>{car.name}</h3>
        {/* Navigate to the SPA product detail route */}
        <Link className="cta" to={`/product/${car.id}`}>
          Shop now
        </Link>
      </div>
    </div>
  );
}

export default CarCard;
