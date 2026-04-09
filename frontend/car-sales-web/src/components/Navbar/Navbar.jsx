import signin from '../../assets/icon/signin.png';
import { NavLink } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  return (
    <nav className="navbar">
      {/* Use NavLink to prevent full page reloads */}
      {/* Logo */}
      <NavLink to="/" id="Logo">
        <img
          src="/images/LogoWeb-removebg-preview.webp"
          alt="LogoWeb"
          loading="lazy"
        />
      </NavLink>

      {/* Main navigation */}
      <ul className="nav_block2">
        <li>
          <NavLink to="/" className={({ isActive }) => (isActive ? "active" : "")}>
            Home
          </NavLink>
        </li>
        <li>
          <NavLink to="/about" className={({ isActive }) => (isActive ? "active" : "")}>
            About us
          </NavLink>
        </li>
        <li>
          <NavLink to="/cars" className={({ isActive }) => (isActive ? "active" : "")}>
            Cars and reviews
          </NavLink>
        </li>
        <li>
          <NavLink to="/contact" className={({ isActive }) => (isActive ? "active" : "")}>
            Contact
          </NavLink>
        </li>
      </ul>

      {/* Right side actions */}
      <div className="nav-right">
        {/* Auth shortcut */}
        <div className="popup-login">
          <NavLink to="/auth">
            <img
              src={signin}
              alt="Signin"
              loading="lazy"
            />
            <span>Sign in</span>
          </NavLink>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
