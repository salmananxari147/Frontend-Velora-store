import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const links = [
  ['/admin', 'Dashboard', true],
  ['/admin/products', 'Products'],
  ['/admin/orders', 'Orders'],
  ['/admin/customers', 'Customers'],
  ['/admin/categories', 'Categories'],
  ['/admin/coupons', 'Coupons'],
  ['/admin/reviews', 'Reviews'],
];

const titles = {
  '/admin': 'Dashboard',
  '/admin/products': 'Products',
  '/admin/products/new': 'New product',
  '/admin/orders': 'Orders',
  '/admin/customers': 'Customers',
  '/admin/categories': 'Categories',
  '/admin/coupons': 'Coupons',
  '/admin/reviews': 'Reviews',
};

function Icon({ name }) {
  const paths = {
    dashboard: 'M4 4h7v7H4zM13 4h7v4h-7zM13 10h7v10h-7zM4 13h7v7H4z',
    products: 'M4 7l8-3 8 3-8 3-8-3zm0 4l8 3 8-3M4 15l8 3 8-3',
    orders: 'M6 6h12v14H6zM9 6V4h6v2',
    customers: 'M12 12a3.5 3.5 0 1 0-3.5-3.5A3.5 3.5 0 0 0 12 12zm-6 8a6 6 0 0 1 12 0',
    categories: 'M4 6h7v6H4zM13 6h7v4h-7zM13 12h7v6h-7zM4 14h7v4H4z',
    coupons: 'M4 8h16v4a2 2 0 0 0 0 4v4H4v-4a2 2 0 0 0 0-4z',
    reviews: 'M12 4l2.2 4.6L19 9.2l-3.5 3.4.8 4.9L12 15.8 7.7 17.5l.8-4.9L5 9.2l4.8-.6z',
    menu: 'M4 7h16M4 12h16M4 17h16',
    close: 'M6 6l12 12M18 6L6 18',
  };
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d={paths[name]} />
    </svg>
  );
}

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const title = titles[pathname] || (pathname.includes('/products/') ? 'Product' : pathname.includes('/orders/') ? 'Order' : 'Studio');

  useEffect(() => {
    const guard = () => {
      if (!localStorage.getItem('velora_token')) navigate('/login', { replace: true });
    };
    window.addEventListener('pageshow', guard);
    return () => window.removeEventListener('pageshow', guard);
  }, [navigate]);

  const signOut = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="admin">
      {open && <button type="button" className="admin-backdrop" aria-label="Close menu" onClick={() => setOpen(false)} />}
      <aside className={open ? 'open' : ''}>
        <div className="admin-brand">
          <NavLink to="/" className="logo" onClick={() => setOpen(false)}>
            <span>VELORA</span>
            <small>Studio</small>
          </NavLink>
          <button type="button" className="admin-close" aria-label="Close menu" onClick={() => setOpen(false)}>
            <Icon name="close" />
          </button>
        </div>
        <nav>
          {links.map(([to, label, end]) => (
            <NavLink key={to} to={to} end={end} onClick={() => setOpen(false)}>
              <Icon name={label.toLowerCase()} />
              {label}
            </NavLink>
          ))}
        </nav>
        <button type="button" className="admin-logout" onClick={signOut}>
          Logout
        </button>
      </aside>
      <div className="admin-body">
        <header className="admin-top">
          <button type="button" className="admin-menu" aria-label="Open menu" onClick={() => setOpen(true)}>
            <Icon name="menu" />
          </button>
          <div className="admin-crumb">
            <span>Studio</span>
            <strong>{title}</strong>
          </div>
          <div className="admin-user">
            <span>{user?.name || 'Admin'}</span>
            <button type="button" onClick={signOut}>
              Logout
            </button>
          </div>
        </header>
        <div className="admin-main">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
