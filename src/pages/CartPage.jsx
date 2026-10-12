import { Link, useNavigate } from 'react-router-dom'
import EmptyState from '../components/EmptyState'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { money, shippingFor } from '../utils/format'
import { useTitle } from '../hooks/useUi'

export default function CartPage() {
  useTitle('Cart')
  const { items, subtotal, updateQty, removeItem } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()
  const shipping = shippingFor(subtotal)
  const total = subtotal + shipping

  if (!items.length) {
    return (
      <div className="page">
        <EmptyState title="Your cart is empty" text="The collection is waiting." action="Shop footwear" />
      </div>
    )
  }

  const checkout = () => {
    if (!user) navigate('/login?next=/checkout')
    else navigate('/checkout')
  }

  return (
    <div className="page cart-page">
      <p className="eyebrow">Cart</p>
      <h1>Your selection.</h1>
      <div className="split">
        <div className="cart-list">
          {items.map((item) => (
            <article key={`${item.productId}-${item.size}-${item.color}`}>
              <Link to={`/product/${item.slug}`}>
                <img src={item.image} alt={item.name} />
              </Link>
              <div>
                <h2>
                  <Link to={`/product/${item.slug}`}>{item.name}</Link>
                </h2>
                <p>
                  Size {item.size} · {item.color}
                </p>
                <strong>{money(item.price)}</strong>
              </div>
              <div className="qty">
                <button type="button" onClick={() => updateQty(item, item.qty - 1)}>
                  −
                </button>
                <span>{item.qty}</span>
                <button type="button" onClick={() => updateQty(item, item.qty + 1)}>
                  +
                </button>
              </div>
              <button type="button" className="text-btn" onClick={() => removeItem(item)}>
                Remove
              </button>
            </article>
          ))}
        </div>
        <aside className="summary">
          <h2>Summary</h2>
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
            <span>{money(0)}</span>
          </p>
          <p className="total">
            <span>Total</span>
            <span>{money(total)}</span>
          </p>
          <button type="button" className="btn btn-dark full" onClick={checkout}>
            Proceed to Checkout
          </button>
          {!user && <p className="muted">Sign in to place the order and track it later.</p>}
        </aside>
      </div>
    </div>
  )
}
