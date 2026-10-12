import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useScroll, useSpring } from 'framer-motion';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { IconBag, IconClose, IconHeart, IconMenu, IconSearch, IconUser } from './Icons';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { api } from '../services/api';

const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/shop', label: 'Shop' },
  { to: '/shop?category=sneakers', label: 'Sneakers' },
  { to: '/shop?category=casual', label: 'Casual' },
  { to: '/shop?category=formal', label: 'Formal' },
  { to: '/shop?category=boots', label: 'Boots' },
  { to: '/about', label: 'About' },
];

export default function Navbar() {
  const { count } = useCart();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 28, mass: 0.2 });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open || searchOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open, searchOpen]);

  return (
    <header className={`nav ${scrolled ? 'scrolled' : ''}`}>
      <motion.div className="scroll-progress" style={{ scaleX }} />
      <div className="nav-inner">
        <Link to="/" className="logo" aria-label="VELORA home">
          <span>VELORA</span>
          <small>Move Different</small>
        </Link>
        <nav className="nav-links">
          {links.map((link) =>
            link.end || link.to === '/about' || link.to === '/shop' ? (
              <NavLink key={link.label} to={link.to} end={link.end}>
                {link.label}
              </NavLink>
            ) : (
              <Link key={link.label} to={link.to}>
                {link.label}
              </Link>
            )
          )}
        </nav>
        <div className="nav-tools">
          <button type="button" aria-label="Search" onClick={() => setSearchOpen(true)}>
            <IconSearch />
          </button>
          <Link to={user?.role === 'admin' ? '/admin' : user ? '/account' : '/login'} aria-label="Account" className="desktop-only">
            <IconUser />
          </Link>
          <Link to="/account?tab=wishlist" aria-label="Wishlist" className="desktop-only">
            <IconHeart />
          </Link>
          <Link to="/cart" className="bag" aria-label={`Cart, ${count} items`}>
            <IconBag />
            {count > 0 && (
              <motion.span key={count} initial={{ scale: 0.7 }} animate={{ scale: 1 }}>
                {count}
              </motion.span>
            )}
          </Link>
          <button type="button" className="menu-btn" aria-label="Open menu" onClick={() => setOpen(true)}>
            <IconMenu />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div className="drawer-root" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <button type="button" className="drawer-backdrop" aria-label="Close menu" onClick={() => setOpen(false)} />
            <motion.aside
              className="drawer"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="drawer-head">
                <strong>VELORA</strong>
                <button type="button" aria-label="Close menu" onClick={() => setOpen(false)}>
                  <IconClose />
                </button>
              </div>
              {links.map((link) => (
                <Link key={link.label} to={link.to} onClick={() => setOpen(false)}>
                  {link.label}
                </Link>
              ))}
              <Link to={user ? '/account' : '/login'} onClick={() => setOpen(false)}>
                {user ? 'Account' : 'Sign in'}
              </Link>
              <Link to="/account?tab=wishlist" onClick={() => setOpen(false)}>
                Wishlist
              </Link>
              {user?.role === 'admin' && (
                <Link to="/admin" onClick={() => setOpen(false)}>
                  Admin
                </Link>
              )}
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
      {searchOpen && <SearchModal onClose={() => setSearchOpen(false)} />}
    </header>
  );
}

function SearchModal({ onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return undefined;
    }
    const timer = setTimeout(() => {
      api
        .get('/products', { params: { search: query, limit: 6 } })
        .then((res) => setResults(res.data.products))
        .catch(() => setResults([]));
    }, 250);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="search-root" onClick={onClose}>
      <form
        className="search-panel"
        onClick={(event) => event.stopPropagation()}
        onSubmit={(event) => {
          event.preventDefault();
          onClose();
          navigate(`/shop?q=${encodeURIComponent(query)}`);
        }}
      >
        <input autoFocus placeholder="Search footwear" value={query} onChange={(event) => setQuery(event.target.value)} />
        <button type="submit" className="btn btn-dark">
          Search
        </button>
        <div className="search-results">
          {results.map((product) => (
            <Link key={product._id} to={`/product/${product.slug}`} onClick={onClose}>
              <img src={product.images[0]} alt="" />
              <span>
                <strong>{product.name}</strong>
                <small>{product.category?.name}</small>
              </span>
            </Link>
          ))}
        </div>
      </form>
    </div>
  );
}
