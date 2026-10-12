import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { api, errorMessage } from '../services/api';
import { money } from '../utils/format';

const empty = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  postalCode: '',
};

export default function Checkout() {
  const { items, clear } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(empty);
  const [code, setCode] = useState('');
  const [quote, setQuote] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [method, setMethod] = useState('cod');

  useEffect(() => {
    document.title = 'Checkout — VELORA';
  }, []);

  useEffect(() => {
    if (!user) return;
    const saved = user.addresses?.[0];
    setForm((current) => ({
      ...current,
      email: user.email || current.email,
      firstName: saved?.firstName || current.firstName,
      lastName: saved?.lastName || current.lastName,
      phone: saved?.phone || user.phone || current.phone,
      address: saved?.address || current.address,
      city: saved?.city || current.city,
      postalCode: saved?.postalCode || current.postalCode,
    }));
  }, [user]);

  useEffect(() => {
    if (!items.length) return undefined;
    const timer = setTimeout(() => {
      api
        .post('/orders/quote', {
          items: items.map(({ product, size, color, qty }) => ({ product, size, color, qty })),
          couponCode: code || undefined,
        })
        .then((res) => {
          setQuote(res.data);
          setError('');
        })
        .catch((err) => {
          setQuote(null);
          if (code) setError(errorMessage(err));
        });
    }, 250);
    return () => clearTimeout(timer);
  }, [items, code]);

  if (!items.length) {
    return (
      <div className="container">
        <p className="muted">
          Your cart is empty. <Link to="/shop">Return to the shop.</Link>
        </p>
      </div>
    );
  }

  const set = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  return (
    <div className="container checkout-page">
      <header className="page-head">
        <p className="eyebrow">Checkout</p>
        <h1>Delivery</h1>
      </header>
      <form
        className="checkout-layout"
        onSubmit={async (event) => {
          event.preventDefault();
          setLoading(true);
          setError('');
          try {
            const { data } = await api.post('/orders', {
              items: items.map(({ product, size, color, qty }) => ({ product, size, color, qty })),
              shippingAddress: form,
              paymentMethod: method,
              couponCode: code || undefined,
            });
            clear();
            navigate(`/order-success/${data._id}`, { state: { order: data } });
          } catch (err) {
            setError(errorMessage(err));
          } finally {
            setLoading(false);
          }
        }}
      >
        <div className="checkout-fields">
          {error && <p className="form-error">{error}</p>}
          <div className="split">
            <label className="field">
              First name
              <input required value={form.firstName} onChange={set('firstName')} />
            </label>
            <label className="field">
              Last name
              <input required value={form.lastName} onChange={set('lastName')} />
            </label>
          </div>
          <label className="field">
            Email
            <input type="email" required value={form.email} onChange={set('email')} />
          </label>
          <label className="field">
            Phone
            <input required value={form.phone} onChange={set('phone')} />
          </label>
          <label className="field">
            Address
            <input required value={form.address} onChange={set('address')} />
          </label>
          <div className="split">
            <label className="field">
              City
              <input required value={form.city} onChange={set('city')} />
            </label>
            <label className="field">
              Postal code
              <input required value={form.postalCode} onChange={set('postalCode')} />
            </label>
          </div>
          <fieldset className="pay-box">
            <legend>Payment</legend>
            <label className="pay-option">
              <input type="radio" name="pay" checked={method === 'cod'} onChange={() => setMethod('cod')} />
              <span>
                <strong>Cash on Delivery</strong>
                <small>Pay when the pair arrives. Other gateways can be added later.</small>
              </span>
            </label>
          </fieldset>
        </div>
        <aside className="summary">
          <h2>Order summary</h2>
          {items.map((item) => (
            <p key={`${item.product}-${item.size}-${item.color}`}>
              <span>
                {item.name} · {item.size}
              </span>
              <span>{money(item.price * item.qty)}</span>
            </p>
          ))}
          <label className="field">
            Discount code
            <input value={code} onChange={(event) => setCode(event.target.value.toUpperCase())} placeholder="WELCOME10" />
          </label>
          <p>
            <span>Subtotal</span>
            <span>{money(quote?.itemsPrice ?? items.reduce((sum, item) => sum + item.price * item.qty, 0))}</span>
          </p>
          <p>
            <span>Shipping</span>
            <span>{quote ? (quote.shippingPrice === 0 ? 'Free' : money(quote.shippingPrice)) : '—'}</span>
          </p>
          <p>
            <span>Discount</span>
            <span>{money(quote?.discount || 0)}</span>
          </p>
          <p className="total">
            <span>Total</span>
            <span>{money(quote?.totalPrice || 0)}</span>
          </p>
          <button className="btn btn-orange" type="submit" disabled={loading}>
            {loading ? 'Placing order…' : 'Place Order'}
          </button>
        </aside>
      </form>
    </div>
  );
}
