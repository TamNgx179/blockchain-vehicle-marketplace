import React from 'react';
import './Footer.css';
import facebookIcon from "../../assets/icon/facebook.png";
import xIcon from "../../assets/icon/X.png";
import instagramIcon from "../../assets/icon/instagram.png";
import { Link } from 'react-router-dom';
function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Logo Section */}
        <div className="footer-avata">
          <img
            className="footer-logo-img"
            src="../images/LogoWeb-removebg-preview.webp"
            alt="Saigon Speed Logo"
          />
        </div>

        {/* Content Sections */}
        <div className="footer-content">
          {/* Information */}
          <div className="footer-column">
            <h3 className="footer-heading">Infomation</h3>
            <ul className="footer-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/about">About</Link></li>
              <li><Link to="/cars">Cars and reviews</Link></li>
            </ul>
          </div>

          {/* Helpful Links */}
          <div className="footer-column">
            <h3 className="footer-heading">Helpful Links</h3>
            <ul className="footer-links">
              <li><a href="/html/services">Services</a></li>
              <li><a href="/html/contact_us">Supports</a></li>
              <li><a href="#">Terms & Condition</a></li>
              <li><a href="#">Privacy Policy</a></li>
            </ul>
          </div>

          {/* Contact Us */}
          <div className="footer-column">
            <h3 className="footer-heading">Contact us</h3>
            <ul className="footer-contact">
              <li><span className="icon">💬</span> Chat with sale</li>
              <li><span className="icon">☎️</span> (84) 000000000</li>
              <li><span className="icon">✉️</span> email</li>
            </ul>
            <div className="social-icons">
              <a href="#"><img src={facebookIcon} alt="Facebook" /></a>
              <a href="#"><img src={xIcon} alt="X" /></a>
              <a href="#"><img src={instagramIcon} alt="Instagram" /></a>
            </div>
          </div>
        </div>
      </div>

      <hr className="footer-divider" />

      <div className="footer-bottom">
        <p>© 2025 SAIGON SPEED | All Rights Reserved</p>
      </div>
    </footer>
  );
}

export default Footer;