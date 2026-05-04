import signin from "../../assets/icon/Signin.png";
import trolley from "../../assets/icon/trolley.png";
import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useSyncExternalStore, useState } from "react";
import { Heart, LogOut, PackageCheck, Pencil, UserRound, X } from "lucide-react";
import { useCart } from "../../context/CartContext";
import AccountService from "../../services/accountService";
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
const getAuthEmailSnapshot = () => localStorage.getItem("authEmail") || "";

function Navbar() {
  const { cartCount = 0 } = useCart();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [userPanelOpen, setUserPanelOpen] = useState(false);

  const authToken = useSyncExternalStore(
    subscribeAuthStore,
    getAuthTokenSnapshot
  );

  const authUsername = useSyncExternalStore(
    subscribeAuthStore,
    getAuthUsernameSnapshot
  );

  const authEmail = useSyncExternalStore(
    subscribeAuthStore,
    getAuthEmailSnapshot
  );

  const isAuthed = useMemo(() => Boolean(authToken), [authToken]);

  const closeMenu = () => setMenuOpen(false);
  const closeUserPanel = () => setUserPanelOpen(false);

  const closeNavigation = () => {
    closeMenu();
    closeUserPanel();
  };

  useEffect(() => {
    if (!userPanelOpen) return;

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        closeUserPanel();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [userPanelOpen]);

  const onLogout = async (e) => {
    e.preventDefault();

    try {
      await AccountService.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      closeNavigation();
      navigate("/", { replace: true });
    }
  };

  return (
    <nav className="navbar">
      <NavLink to="/" id="Logo" onClick={closeMenu}>
        <img
          src="/images/LogoWeb-removebg-preview.webp"
          alt="LogoWeb"
          loading="lazy"
        />
      </NavLink>

      <div
        className={`menu-toggle ${menuOpen ? "active" : ""}`}
        onClick={() => {
          closeUserPanel();
          setMenuOpen(!menuOpen);
        }}
      >
        <span></span>
        <span></span>
        <span></span>
      </div>

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

      <div className="nav-right">
        <NavLink
          to="/checkout"
          onClick={closeNavigation}
          className={({ isActive }) =>
            isActive ? "trolley active" : "trolley"
          }
        >
          <img src={trolley} alt="Trolley icon" />
          <span className="counter">{isAuthed ? cartCount : 0}</span>
        </NavLink>

        {isAuthed ? (
          <>
            <button
              type="button"
              className={`user-menu-button ${userPanelOpen ? "active" : ""}`}
              onClick={() => {
                closeMenu();
                setUserPanelOpen((open) => !open);
              }}
              aria-label="Open user menu"
              aria-expanded={userPanelOpen}
            >
              <UserRound size={20} />
            </button>

            <button
              type="button"
              className={`user-sidebar-backdrop ${userPanelOpen ? "open" : ""}`}
              onClick={closeUserPanel}
              aria-label="Close user menu"
              tabIndex={userPanelOpen ? 0 : -1}
            />

            <aside
              className={`user-sidebar ${userPanelOpen ? "open" : ""}`}
              aria-hidden={!userPanelOpen}
            >
              <div className="user-sidebar-header">
                <div className="user-avatar">
                  <UserRound size={24} />
                </div>

                <button type="button" onClick={closeUserPanel} aria-label="Close user menu">
                  <X size={20} />
                </button>
              </div>

              <div className="user-sidebar-profile">
                <span>Signed in as</span>
                <strong>{authUsername || "Customer"}</strong>
                {authEmail && <p>{authEmail}</p>}
              </div>

              <div className="user-sidebar-links">
                <NavLink
                  to="/profile"
                  onClick={closeNavigation}
                  className={({ isActive }) =>
                    isActive ? "user-sidebar-link active" : "user-sidebar-link"
                  }
                >
                  <Pencil size={18} />
                  Profile
                </NavLink>

                <NavLink
                  to="/wishlist"
                  onClick={closeNavigation}
                  className={({ isActive }) =>
                    isActive ? "user-sidebar-link active" : "user-sidebar-link"
                  }
                >
                  <Heart size={18} />
                  Wishlist
                </NavLink>

                <NavLink
                  to="/orders"
                  onClick={closeNavigation}
                  className={({ isActive }) =>
                    isActive ? "user-sidebar-link active" : "user-sidebar-link"
                  }
                >
                  <PackageCheck size={18} />
                  My orders
                </NavLink>
              </div>

              <button type="button" className="user-sidebar-logout" onClick={onLogout}>
                <LogOut size={18} />
                Logout
              </button>
            </aside>
          </>
        ) : (
          <div className="popup-login">
            <NavLink to="/login" onClick={closeNavigation}>
              <img
                src={signin}
                alt="Signin"
                loading="lazy"
              />
              <span>Sign in</span>
            </NavLink>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;