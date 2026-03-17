import React from 'react';
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
        <a
          className="cta"
          href={`car.html?brand=${car.brandId}&id=${car.id}`}
        >
          Shop now
        </a>
      </div>
    </div>
  );
}

export default CarCard;