import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { EmptyState } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { api, errorMessage } from '../services/api';
import { formatDate, money } from '../utils/format';

const tabs = [
  { id: 'profile', label: 'Profile' },
  { id: 'orders', label: 'My Orders' },
  { id: 'wishlist', label: 'Wishlist' },
  { id: 'addresses', label: 'Saved Addresses' },
];

export default function Account() {
  const { user, setUser, logout } = useAuth();
  const { items } = useWishlist();
  const [params, setParams] = useSearchParams();
  const tab = params.get('tab') || 'profile';
  const [orders, setOrders] = useState(null);
  const [profile, setProfile] = useState({ name: user.name, phone: user.phone || '' });
  const [password, setPassword] = useState({ currentPassword: '', password: '' });
  const [address, setAddress] = useState({ label: 'Home', firstName: '', lastName: '', phone: '', address: '', city: '', postalCode: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    document.title = 'Account — VELORA';
    api.get('/orders/mine').then((res) => setOrders(res.data)).catch(() => {});
  }, []);

  const saveProfile = async (event) => {
    event.preventDefault();
    setError('');
    try {
      const { data } = await api.put('/users/profile', profile);
      setUser(data);
      setMessage('Profile updated');
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  return (
    <div className="container account-page">
      <header className="page-head">
        <p className="eyebrow">Account</p>
        <h1>{user.name}</h1>
        <button
          type="button"
          className="text-link"
          onClick={() => {
            logout();
            window.location.href = '/';
          }}
        >
          Log out
        </button>
      </header>
      <div className="tabs">
        {tabs.map((item) => (
          <button key={item.id} type="button" className={tab === item.id ? 'on' : ''} onClick={() => setParams({ tab: item.id })}>
            {item.label}
          </button>
        ))}
        {user.role === 'admin' && (
          <Link to="/admin" className="btn btn-line btn-small">
            Admin
          </Link>
        )}
      </div>
      {message && <p className="fine">{message}</p>}
      {error && <p className="form-error">{error}</p>}

      {tab === 'profile' && (
        <div className="account-grid">
          <form onSubmit={saveProfile} className="panel">
            <h2>Profile</h2>
            <label className="field">
              Name
              <input value={profile.name} onChange={(event) => setProfile({ ...profile, name: event.target.value })} />
            </label>
            <label className="field">
              Phone
              <input value={profile.phone} onChange={(event) => setProfile({ ...profile, phone: event.target.value })} />
            </label>
            <p className="muted">{user.email}</p>
            <button className="btn btn-dark" type="submit">
              Save profile
            </button>
          </form>
          <form
            className="panel"
            onSubmit={async (event) => {
              event.preventDefault();
              setError('');
              try {
                await api.put('/users/password', password);
                setPassword({ currentPassword: '', password: '' });
                setMessage('Password updated');
              } catch (err) {
                setError(errorMessage(err));
              }
            }}
          >
            <h2>Password</h2>
            <label className="field">
              Current password
              <input type="password" required value={password.currentPassword} onChange={(event) => setPassword({ ...password, currentPassword: event.target.value })} />
            </label>
            <label className="field">
              New password
              <input type="password" required minLength={6} value={password.password} onChange={(event) => setPassword({ ...password, password: event.target.value })} />
            </label>
            <button className="btn btn-line" type="submit">
              Update password
            </button>
          </form>
        </div>
      )}

      {tab === 'orders' && (
        <div className="order-list">
          {orders === null && <p className="muted">Loading orders…</p>}
          {orders?.length === 0 && <EmptyState title="No orders yet" text="When you check out, your orders will live here." action={<Link to="/shop" className="btn btn-dark">Shop now</Link>} />}
          {orders?.map((order) => (
            <article key={order._id} className="order-card">
              <header>
                <strong>{order.orderNumber}</strong>
                <span className={`status ${order.status.toLowerCase()}`}>{order.status}</span>
              </header>
              <p>{formatDate(order.createdAt)}</p>
              <ul>
                {order.items.map((item, index) => (
                  <li key={`${item.name}-${index}`}>
                    {item.name} · size {item.size} · {item.color} × {item.qty}
                  </li>
                ))}
              </ul>
              <strong>{money(order.totalPrice)}</strong>
            </article>
          ))}
        </div>
      )}

      {tab === 'wishlist' && (
        items.length === 0 ? (
          <EmptyState title="Nothing saved" text="Tap the heart on a pair to keep it here." action={<Link to="/shop" className="btn btn-dark">Browse the shop</Link>} />
        ) : (
          <div className="product-grid">
            {items.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )
      )}

      {tab === 'addresses' && (
        <div className="account-grid">
          <div className="panel">
            <h2>Saved</h2>
            {(user.addresses || []).length === 0 && <p className="muted">No addresses yet.</p>}
            {(user.addresses || []).map((item) => (
              <article key={item._id} className="address-card">
                <strong>{item.label}</strong>
                <p>
                  {item.firstName} {item.lastName}
                  <br />
                  {item.address}
                  <br />
                  {item.city} {item.postalCode}
                </p>
                <button
                  type="button"
                  className="text-link"
                  onClick={async () => {
                    const addresses = user.addresses.filter((entry) => entry._id !== item._id);
                    const { data } = await api.put('/users/profile', { addresses });
                    setUser(data);
                  }}
                >
                  Remove
                </button>
              </article>
            ))}
          </div>
          <form
            className="panel"
            onSubmit={async (event) => {
              event.preventDefault();
              const { data } = await api.put('/users/profile', { addresses: [...(user.addresses || []), address] });
              setUser(data);
              setAddress({ label: 'Home', firstName: '', lastName: '', phone: '', address: '', city: '', postalCode: '' });
              setMessage('Address saved');
            }}
          >
            <h2>Add address</h2>
            {['label', 'firstName', 'lastName', 'phone', 'address', 'city', 'postalCode'].map((key) => (
              <label key={key} className="field">
                {key}
                <input required value={address[key]} onChange={(event) => setAddress({ ...address, [key]: event.target.value })} />
              </label>
            ))}
            <button className="btn btn-dark" type="submit">
              Save address
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
