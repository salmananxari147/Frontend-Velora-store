import { Link } from 'react-router-dom';
import { EmptyState } from '../components/ui';
import { useCart } from '../context/CartContext';
import { money } from '../utils/format';

export default function Cart() {
  const { items, updateQty, removeItem, subtotal } = useCart();
  const shipping = subtotal === 0 || subtotal >= 200 ? 0 : 18;

  if (!items.length) {
    return (
      <div className="container">
        <EmptyState
          title="Your cart is empty"
          text="The collection is ready when you are."
          action={
            <Link to="/shop" className="btn btn-dark">
              Shop footwear
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="container cart-page">
      <header className="page-head">
        <p className="eyebrow">Cart</p>
        <h1>Your selection</h1>
      </header>
      <div className="cart-layout">
        <div className="cart-items">
          {items.map((item) => (
            <article key={`${item.product}-${item.size}-${item.color}`}>
              <Link to={`/product/${item.slug}`}>
                <img src={item.image} alt="" />
              </Link>
              <div>
                <Link to={`/product/${item.slug}`}>
                  <strong>{item.name}</strong>
                </Link>
                <p>
                  Size {item.size} · {item.color}
                </p>
                <div className="qty">
                  <button type="button" onClick={() => updateQty(item.product, item.size, item.color, item.qty - 1)} aria-label="Decrease">
                    −
                  </button>
                  <span>{item.qty}</span>
                  <button type="button" onClick={() => updateQty(item.product, item.size, item.color, item.qty + 1)} aria-label="Increase">
                    +
                  </button>
                </div>
              </div>
              <div className="cart-side">
                <strong>{money(item.price * item.qty)}</strong>
                <button type="button" className="text-link" onClick={() => removeItem(item.product, item.size, item.color)}>
                  Remove
                </button>
              </div>
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
            <span>{money(subtotal + shipping)}</span>
          </p>
          <Link to="/checkout" className="btn btn-orange">
            Proceed to Checkout
          </Link>
          <small>Free shipping from $200. Add a code at checkout.</small>
        </aside>
      </div>
    </div>
  );
}
