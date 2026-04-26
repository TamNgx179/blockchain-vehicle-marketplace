import React, { useState } from "react";
import "./Footer.css";
import facebookIcon from "../../assets/icon/facebook.png";
import xIcon from "../../assets/icon/X.png";
import instagramIcon from "../../assets/icon/instagram.png";
import { Link } from "react-router-dom";

function Footer() {
  const [openSection, setOpenSection] = useState(null);

  const toggleSection = (section) => {
    setOpenSection(openSection === section ? null : section);
  };

  return (
    <footer className="footer">
      <div className="footer-container">

        {/* Logo */}
        <div className="footer-avata">
          <img
            className="footer-logo-img"
            src="../images/LogoWeb-removebg-preview.webp"
            alt="Saigon Speed Logo"
          />
        </div>

        {/* Content */}
        <div className="footer-content">

          {/* Information */}
          <div className="footer-column">
            <button
              className="footer-toggle"
              onClick={() => toggleSection("info")}
            >
              Infomation
              <span>{openSection === "info" ? "−" : "+"}</span>
            </button>

            <ul
              className={`footer-links footer-dropdown ${
                openSection === "info" ? "open" : ""
              }`}
            >
              <li><Link to="/">Home</Link></li>
              <li><Link to="/about">About</Link></li>
              <li><Link to="/cars">Cars and reviews</Link></li>
            </ul>
          </div>

          {/* Helpful Links */}
          <div className="footer-column">
            <button
              className="footer-toggle"
              onClick={() => toggleSection("help")}
            >
              Helpful Links
              <span>{openSection === "help" ? "−" : "+"}</span>
            </button>

            <ul
              className={`footer-links footer-dropdown ${
                openSection === "help" ? "open" : ""
              }`}
            >
              <li><a href="/html/services">Services</a></li>
              <li><a href="/html/contact_us">Supports</a></li>
              <li><a href="#">Terms & Condition</a></li>
              <li><a href="#">Privacy Policy</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="footer-column">
            <button
              className="footer-toggle"
              onClick={() => toggleSection("contact")}
            >
              Contact us
              <span>{openSection === "contact" ? "−" : "+"}</span>
            </button>

            <div
              className={`footer-dropdown ${
                openSection === "contact" ? "open" : ""
              }`}
            >
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
      </div>

      <hr className="footer-divider" />

      <div className="footer-bottom">
        <p>© 2025 SAIGON SPEED | All Rights Reserved</p>
      </div>
    </footer>
  );
}

export default Footer;