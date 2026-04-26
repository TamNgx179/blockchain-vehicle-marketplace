import signin from "../../assets/icon/signin.png";
import trolley from "../../assets/icon/trolley.png";
import insurance from "../../assets/icon/insurance.png";
import { NavLink, useNavigate } from "react-router-dom";
import { useMemo, useSyncExternalStore, useState } from "react";
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

  const [menuOpen, setMenuOpen] = useState(false);

  const authToken = useSyncExternalStore(
    subscribeAuthStore,
    getAuthTokenSnapshot
  );

  const authUsername = useSyncExternalStore(
    subscribeAuthStore,
    getAuthUsernameSnapshot
  );

  const isAuthed = useMemo(() => Boolean(authToken), [authToken]);

  const closeMenu = () => setMenuOpen(false);

  const onLogout = (e) => {
    e.preventDefault();

    localStorage.removeItem("authToken");
    localStorage.removeItem("authEmail");
    localStorage.removeItem("authUsername");

    window.dispatchEvent(new Event("auth-change"));

    closeMenu();
    navigate("/", { replace: true });
  };

  return (
    <nav className="navbar">
      {/* Logo */}
      <NavLink to="/" id="Logo" onClick={closeMenu}>
        <img
          src="/images/LogoWeb-removebg-preview.webp"
          alt="LogoWeb"
          loading="lazy"
        />
      </NavLink>

      {/* Hamburger */}
      <div
        className={`menu-toggle ${menuOpen ? "active" : ""}`}
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <span></span>
        <span></span>
        <span></span>
      </div>

      {/* Main Menu */}
      <ul className={`nav_block2 ${menuOpen ? "open" : ""}`}>
        <li>
          <NavLink to="/" onClick={closeMenu}>
            Home
          </NavLink>
        </li>

        <li>
          <NavLink to="/about" onClick={closeMenu}>
            About us
          </NavLink>
        </li>

        <li>
          <NavLink to="/cars" onClick={closeMenu}>
            Cars and reviews
          </NavLink>
        </li>

        <li>
          <NavLink to="/contact" onClick={closeMenu}>
            Contact
          </NavLink>
        </li>
      </ul>

      {/* Right side */}
      <div className="nav-right">
        <NavLink
          to="/checkout"
          onClick={closeMenu}
          className={({ isActive }) =>
            isActive ? "trolley active" : "trolley"
          }
        >
          <img src={trolley} alt="Trolley icon" />
          <span className="counter">{cartItems.length}</span>
        </NavLink>

        <div className="popup-login">
          {isAuthed ? (
            <>
              <NavLink to="/reset-password" onClick={closeMenu}>
                <img src={insurance} alt="Reset password" loading="lazy" />
                <span>Reset password</span>
              </NavLink>
              <NavLink to="/" onClick={onLogout}>
                <img
                  src={signin}
                  alt="Signin"
                  loading="lazy"
                />
                <span>{authUsername ? `Logout (${authUsername})` : "Logout"}</span>
              </NavLink>
            </>
          ) : (
            <NavLink to="/login" onClick={closeMenu}>
              <img
                src={signin}
                alt="Signin"
                loading="lazy"
              />
              <span>Sign in</span>
            </NavLink>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
