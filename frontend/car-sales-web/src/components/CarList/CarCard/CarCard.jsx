import React from 'react';
import { Link } from 'react-router-dom';
import './CarCard.css';
import add from '../../../assets/icon/add.png';
import { useCart } from "../../../context/CartContext";
function CarCard({ car, delay }) {
  const { addToCart } = useCart();
  return (
    <div
      className="car-card reveal-up active"
      style={{ "--reveal-delay": `${delay}s` }}
    >
      <Link to={`/product/${car.id}`}>
        <img
          className="thumb-img"
          src={car.display}
          alt={car.name}
          loading="lazy"
          decoding="async"
          width="400"
          height="230"
        />
      </Link>
      <div className="body">
        <div className="title">
          <h3>{car.name}</h3>
          <p className="id" style={{ display: 'none' }}>{car.id}</p>
          {/* Navigate to the SPA product detail route */}
          <Link className="cta" to={`/product/${car.id}`}>
            Shop now
          </Link>
        </div>
        <button className="add-to-cart" onClick={() => addToCart(car)}>
          <img src={add} alt="Add to cart icon" />
        </button>
      </div>
    </div >
  );
}

export default CarCard;
