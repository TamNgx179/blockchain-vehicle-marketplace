import signin from '../../assets/icon/signin.png';
import trolley from '../../assets/icon/trolley.png';
import { NavLink, useNavigate } from "react-router-dom";
import { useMemo, useSyncExternalStore } from "react";
import { useCart } from "../../context/CartContext";
import "./Navbar.css";

const subscribeAuthStore = (callback) => {
  const handler = () => callback();
  window.addEventListener("storage", handler);
  window.addEventListener("auth-change", handler);
  return () => {
    window.removeEventListener("storage", handler);
    window.removeEventListener("auth-change", handler);
  };
};

const getAuthTokenSnapshot = () => localStorage.getItem("authToken") || "";
const getAuthUsernameSnapshot = () => localStorage.getItem("authUsername") || "";

function Navbar() {
  const { cartItems } = useCart();
  const navigate = useNavigate();
  const authToken = useSyncExternalStore(subscribeAuthStore, getAuthTokenSnapshot);
  const authUsername = useSyncExternalStore(subscribeAuthStore, getAuthUsernameSnapshot);
  const isAuthed = useMemo(() => Boolean(authToken), [authToken]);

  const onLogout = (e) => {
    e.preventDefault();
    localStorage.removeItem("authToken");
    localStorage.removeItem("authEmail");
    localStorage.removeItem("authUsername");
    window.dispatchEvent(new Event("auth-change"));
    navigate("/", { replace: true });
  };

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
        <NavLink
          to="/checkout"
          className={({ isActive }) => (isActive ? "trolley active" : "trolley")}
        >
          <img src={trolley} alt="Trolley icon" />
          <span className="counter">{cartItems.length}</span>
        </NavLink>
        {/* Auth shortcut */}
        <div className="popup-login">
          <NavLink to={isAuthed ? "/" : "/login"} onClick={isAuthed ? onLogout : undefined}>
            <img
              src={signin}
              alt="Signin"
              loading="lazy"
            />
            <span>{isAuthed ? (authUsername ? `Logout (${authUsername})` : "Logout") : "Sign in"}</span>
          </NavLink>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
