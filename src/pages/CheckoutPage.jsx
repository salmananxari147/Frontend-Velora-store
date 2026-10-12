import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { api } from '../services/api'
import { money, shippingFor } from '../utils/format'
import { useTitle } from '../hooks/useUi'
import EmptyState from '../components/EmptyState'

const METHODS = [{ id: 'cod', label: 'Cash on Delivery', note: 'Pay when the pair arrives.' }]

const EMPTY = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  postalCode: '',
}

export default function CheckoutPage() {
  useTitle('Checkout')
  const { user } = useAuth()
  const { items, subtotal, clear } = useCart()
  const navigate = useNavigate()
  const [form, setForm] = useState(EMPTY)
  const [method, setMethod] = useState('cod')
  const [coupon, setCoupon] = useState('')
  const [discount, setDiscount] = useState(0)
  const [couponNote, setCouponNote] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!user) return
    const [firstName, ...rest] = (user.name || '').split(' ')
    const saved = user.addresses?.find((item) => item.isDefault) || user.addresses?.[0]
    setForm({
      firstName: saved?.firstName || firstName || '',
      lastName: saved?.lastName || rest.join(' ') || '',
      email: user.email || '',
      phone: saved?.phone || user.phone || '',
      address: saved?.address || '',
      city: saved?.city || '',
      postalCode: saved?.postalCode || '',
    })
  }, [user])

  if (!user) {
    return (
      <div className="page">
        <EmptyState
          title="Sign in to checkout"
          text="Your cart is saved. Log in to place the order."
          action="Login"
          to="/login?next=/checkout"
        />
      </div>
    )
  }

  if (!items.length) {
    return (
      <div className="page">
        <EmptyState title="Nothing to checkout" text="Add a pair before placing an order." action="Shop footwear" />
      </div>
    )
  }

  const shipping = shippingFor(subtotal)
  const total = Math.max(0, subtotal + shipping - discount)

  const set = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }))

  const applyCoupon = async () => {
    try {
      const data = await api('/coupons/apply', { method: 'POST', body: { code: coupon, subtotal }, auth: false })
      setDiscount(data.discount)
      setCouponNote(`${data.code} applied`)
      setError('')
    } catch (err) {
      setDiscount(0)
      setCouponNote('')
      setError(err.message)
    }
  }

  const placeOrder = async (event) => {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      const order = await api('/orders', {
        method: 'POST',
        body: {
          items: items.map((item) => ({
            productId: item.productId,
            size: item.size,
            color: item.color,
            qty: item.qty,
          })),
          shippingAddress: form,
          paymentMethod: method,
          couponCode: discount ? coupon : '',
        },
      })
      clear()
      navigate(`/order/${order._id}/success`, { state: { order } })
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="page">
      <p className="eyebrow">Checkout</p>
      <h1>Delivery details.</h1>
      <form className="split checkout" onSubmit={placeOrder}>
        <div className="stack">
          <div className="form-grid">
            {[
              ['firstName', 'First Name'],
              ['lastName', 'Last Name'],
              ['email', 'Email'],
              ['phone', 'Phone'],
              ['address', 'Address'],
              ['city', 'City'],
              ['postalCode', 'Postal Code'],
            ].map(([key, label]) => (
              <label key={key} className={key === 'address' ? 'wide' : ''}>
                {label}
                <input required value={form[key]} onChange={set(key)} type={key === 'email' ? 'email' : 'text'} />
              </label>
            ))}
          </div>
          <fieldset className="pay-methods">
            <legend>Payment</legend>
            {METHODS.map((item) => (
              <label key={item.id} className={method === item.id ? 'is-on' : ''}>
                <input
                  type="radio"
                  name="payment"
                  checked={method === item.id}
                  onChange={() => setMethod(item.id)}
                />
                <span>
                  <strong>{item.label}</strong>
                  <em>{item.note}</em>
                </span>
              </label>
            ))}
          </fieldset>
          {user.addresses?.length > 0 && (
            <div className="saved-addresses">
              <p>Saved addresses</p>
              {user.addresses.map((item) => (
                <button
                  type="button"
                  key={item._id}
                  onClick={() =>
                    setForm((current) => ({
                      ...current,
                      firstName: item.firstName,
                      lastName: item.lastName,
                      phone: item.phone || current.phone,
                      address: item.address,
                      city: item.city,
                      postalCode: item.postalCode,
                    }))
                  }
                >
                  {item.label}: {item.address}, {item.city}
                </button>
              ))}
            </div>
          )}
        </div>
        <aside className="summary">
          <h2>Order summary</h2>
          {items.map((item) => (
            <p key={`${item.productId}-${item.size}`}>
              <span>
                {item.name} · {item.size} × {item.qty}
              </span>
              <span>{money(item.price * item.qty)}</span>
            </p>
          ))}
          <div className="coupon-row">
            <input value={coupon} onChange={(event) => setCoupon(event.target.value)} placeholder="Coupon" aria-label="Coupon" />
            <button type="button" onClick={applyCoupon}>
              Apply
            </button>
          </div>
          {couponNote && <p className="form-note">{couponNote}</p>}
          <p>
            <span>Subtotal</span>
            <span>{money(subtotal)}</span>
          </p>
          <p>
            <span>Shipping</span>
            <span>{shipping === 0 ? 'Free' : money(shipping)}</span>
          </p>
          <p>
            <span>Discount</span>
            <span>-{money(discount)}</span>
          </p>
          <p className="total">
            <span>Total</span>
            <span>{money(total)}</span>
          </p>
          {error && <p className="form-error">{error}</p>}
          <button className="btn btn-orange full" disabled={busy} type="submit">
            {busy ? 'Placing order…' : 'Place Order'}
          </button>
          <Link to="/cart" className="text-link">
            Return to cart
          </Link>
        </aside>
      </form>
    </div>
  )
}
