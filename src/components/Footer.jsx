import { Link } from 'react-router-dom';

const iconProps = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
};

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      {/* Call to action */}
      <div className="container footer-top">
        <div>
          <p className="eyebrow">VELORA</p>
          <h3>Move Different.</h3>
        </div>
        <Link to="/shop" className="btn btn-line">
          Shop the collection
        </Link>
      </div>

      {/* Links */}
      <div className="container footer-grid">
        <div className="footer-brand">
          <Link to="/" className="logo" aria-label="VELORA home">
            <span>VELORA</span>
          </Link>
          <p>Premium men&apos;s footwear, designed for everyday movement.</p>
          <div className="footer-social">
            <a href="https://www.instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram">
              <svg {...iconProps}>
                <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" />
              </svg>
            </a>
            <a href="https://www.pinterest.com" target="_blank" rel="noreferrer" aria-label="Pinterest">
              <svg {...iconProps}>
                <circle cx="12" cy="12" r="9" />
                <path d="M10.6 20.2 12.4 11.6M9.2 11.4c0-1.9 1.4-3.2 3.2-3.2 1.7 0 2.9 1.1 2.9 2.7 0 2.1-1.3 3.6-3 3.6-.8 0-1.4-.4-1.6-1" />
              </svg>
            </a>
          </div>
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
          <Link to="/shipping">Shipping &amp; returns</Link>
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

      {/* Big wordmark */}
      <div className="container footer-mark" aria-hidden="true">
        VELORA
      </div>

      {/* Bottom bar */}
      <div className="container footer-base">
        <span>© {year} VELORA. All rights reserved.</span>
        <span className="footer-base-links">
          <Link to="/privacy">Privacy</Link>
          <Link to="/terms">Terms</Link>
        </span>
        <button
          type="button"
          className="footer-up"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          Back to top
          <svg {...iconProps} width="14" height="14">
            <path d="M12 19V5M5 12l7-7 7 7" />
          </svg>
        </button>
      </div>
    </footer>
  );
}
