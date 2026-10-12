import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-mark" aria-hidden="true">
        VELORA
      </div>
      <div className="container footer-grid">
        <div>
          <Link to="/" className="logo">
            <span>VELORA</span>
          </Link>
          <p>Premium men&apos;s footwear. Move Different.</p>
        </div>
        <div>
          <h4>Shop</h4>
          <Link to="/shop">All footwear</Link>
          <Link to="/shop?category=sneakers">Sneakers</Link>
          <Link to="/shop?category=running">Running</Link>
          <Link to="/shop?category=formal">Formal</Link>
          <Link to="/shop?category=boots">Boots</Link>
        </div>
        <div>
          <h4>Support</h4>
          <Link to="/account?tab=orders">My orders</Link>
          <Link to="/shipping">Shipping & returns</Link>
          <Link to="/about">About</Link>
        </div>
        <div>
          <h4>Company</h4>
          <Link to="/privacy">Privacy policy</Link>
          <Link to="/terms">Terms</Link>
          <a href="https://www.instagram.com" target="_blank" rel="noreferrer">
            Instagram
          </a>
          <a href="https://www.pinterest.com" target="_blank" rel="noreferrer">
            Pinterest
          </a>
        </div>
      </div>
      <div className="container footer-base">
        <span>© {new Date().getFullYear()} VELORA</span>
        <span>Designed for everyday movement.</span>
      </div>
    </footer>
  );
}
