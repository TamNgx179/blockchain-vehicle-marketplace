import trolley from '../../assets/icon/trolley.png';
import signin from '../../assets/icon/signin.png';
import "./Navbar.css";
function Navbar() {

  return (
    <nav className="navbar">
      {/* Logo */}
      <a href="/" id="Logo">
        <img
          src="/images/LogoWeb-removebg-preview.webp"
          alt="LogoWeb"
          loading="lazy"
        />
      </a>

      {/* Menu */}
      <ul className="nav_block2">
        <li><a href="/" className="active">Home</a></li>
        <li><a href="/about">About us</a></li>
        <li><a href="/cars">Cars and reviews</a></li>
        <li><a href="/contact">Contact</a></li>
      </ul>

      {/* Right */}
      <div className="nav-right">
        {/* Cart */}
        <a href="/cart" className="trolley">
          <img
            src={trolley}
            alt="Trolley"
            loading="lazy"
          />
          <span className="counter">1</span>
        </a>

        {/* Login */}
        <div className="popup-login">
          <a href="/auth">
            <img
              src={signin}
              alt="Signin"
              loading="lazy"
            />
            <span>Sign in</span>
          </a>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;