import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { EmptyState, Modal, ProductSkeleton, Rating } from '../components/ui';
import { IconHeart } from '../components/Icons';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { useWishlist } from '../context/WishlistContext';
import { api, errorMessage } from '../services/api';
import { money } from '../utils/format';

const sizeGuide = [
  ['7', '6', '40', '25.0'],
  ['8', '7', '41', '26.0'],
  ['9', '8', '42', '27.0'],
  ['10', '9', '43', '28.0'],
  ['11', '10', '44', '29.0'],
  ['12', '11', '45', '30.0'],
  ['13', '12', '46', '31.0'],
];

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addItem } = useCart();
  const { toggle, has } = useWishlist();
  const toast = useToast();
  const [data, setData] = useState(null);
  const [related, setRelated] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [image, setImage] = useState(0);
  const [size, setSize] = useState('');
  const [color, setColor] = useState('');
  const [qty, setQty] = useState(1);
  const [sizeError, setSizeError] = useState('');
  const [guide, setGuide] = useState(false);
  const [review, setReview] = useState({ rating: 5, comment: '' });

  useEffect(() => {
    setLoading(true);
    setSize('');
    setQty(1);
    setImage(0);
    api
      .get(`/products/${slug}`)
      .then((res) => {
        setData(res.data);
        setColor(res.data.product.colors[0]?.name || '');
        document.title = `${res.data.product.name} — VELORA`;
        return api.get('/products', {
          params: { category: res.data.product.category?.slug, limit: 4 },
        });
      })
      .then((res) => setRelated(res.data.products))
      .catch((err) => setError(errorMessage(err, 'This pair could not be found.')))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="container product-page">
        <ProductSkeleton count={2} />
      </div>
    );
  }
  if (error || !data) {
    return (
      <div className="container">
        <EmptyState title="Pair not found" text={error || 'This shoe is no longer available.'} action={<Link to="/shop" className="btn btn-dark">Back to shop</Link>} />
      </div>
    );
  }

  const { product, reviews } = data;
  const soldOut = product.stock === 0;
  const saved = has(product._id);
  const off = product.comparePrice > product.price ? Math.round((1 - product.price / product.comparePrice) * 100) : 0;

  const requireSize = () => {
    if (!size) {
      setSizeError('Select a size to continue.');
      return false;
    }
    setSizeError('');
    return true;
  };

  const add = (buyNow = false) => {
    if (soldOut || !requireSize()) return;
    addItem(product, { size, color, qty });
    if (buyNow) navigate('/checkout');
    else toast.push('Added to cart');
  };

  return (
    <div className="container product-page">
      <div className="product-hero">
        <div className="gallery">
          <div className="gallery-main">
            <img src={product.images[image]} alt={product.name} />
          </div>
          {product.images.length > 1 && (
            <div className="thumbs">
              {product.images.map((src, index) => (
                <button key={src} type="button" className={index === image ? 'on' : ''} onClick={() => setImage(index)}>
                  <img src={src} alt="" />
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="product-info">
          <p className="eyebrow">{product.category?.name}</p>
          <h1>{product.name}</h1>
          <p className="brand-line">VELORA</p>
          <div className="price-line">
            <strong>{money(product.price)}</strong>
            {off > 0 && (
              <>
                <s>{money(product.comparePrice)}</s>
                <em>{off}% off</em>
              </>
            )}
          </div>
          {product.numReviews > 0 && (
            <p className="rating-line">
              <Rating value={product.rating} /> {product.rating} · {product.numReviews} reviews
            </p>
          )}
          <p className="description">{product.description}</p>

          <div className="option-block">
            <div className="option-label">
              <span>Color</span>
              <strong>{color}</strong>
            </div>
            <div className="color-picks">
              {product.colors.map((item) => (
                <button
                  key={item.name}
                  type="button"
                  className={color === item.name ? 'on' : ''}
                  aria-label={item.name}
                  onClick={() => setColor(item.name)}
                >
                  <i style={{ background: item.hex }} />
                </button>
              ))}
            </div>
          </div>

          <div className="option-block">
            <div className="option-label">
              <span>Size</span>
              <button type="button" className="text-link" onClick={() => setGuide(true)}>
                Size guide
              </button>
            </div>
            <div className="size-picks">
              {product.sizes.map((item) => (
                <button key={item} type="button" className={size === item ? 'on' : ''} onClick={() => { setSize(item); setSizeError(''); }}>
                  {item}
                </button>
              ))}
            </div>
            {sizeError && <p className="form-error">{sizeError}</p>}
          </div>

          <div className="buy-row">
            <div className="qty">
              <button type="button" onClick={() => setQty((value) => Math.max(1, value - 1))} aria-label="Decrease quantity">
                −
              </button>
              <span>{qty}</span>
              <button
                type="button"
                onClick={() => setQty((value) => Math.min(product.stock || 1, value + 1))}
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
            <button type="button" className="btn btn-dark" disabled={soldOut} onClick={() => add(false)}>
              {soldOut ? 'Out of stock' : 'Add to Cart'}
            </button>
            <button type="button" className="btn btn-orange" disabled={soldOut} onClick={() => add(true)}>
              Buy Now
            </button>
            <button
              type="button"
              className={`icon-btn ${saved ? 'on' : ''}`}
              aria-label="Wishlist"
              onClick={() => {
                toggle(product);
                toast.push(saved ? 'Removed from wishlist' : 'Saved to wishlist');
              }}
            >
              <IconHeart filled={saved} />
            </button>
          </div>
          <p className="stock-line">{soldOut ? 'Currently unavailable.' : product.stock <= 5 ? `Only ${product.stock} left.` : 'In stock and ready to ship.'}</p>
        </div>
      </div>

      <section className="reviews">
        <h2>Reviews</h2>
        {reviews.length === 0 && <p className="muted">No reviews yet.</p>}
        <div className="review-list">
          {reviews.map((item) => (
            <article key={item._id}>
              <Rating value={item.rating} />
              <strong>{item.name}</strong>
              <p>{item.comment}</p>
            </article>
          ))}
        </div>
        {user ? (
          <form
            className="review-form"
            onSubmit={async (event) => {
              event.preventDefault();
              try {
                await api.post(`/products/${product._id}/reviews`, review);
                const refreshed = await api.get(`/products/${slug}`);
                setData(refreshed.data);
                setReview({ rating: 5, comment: '' });
                toast.push('Review posted');
              } catch (err) {
                toast.push(errorMessage(err));
              }
            }}
          >
            <label>
              Your rating
              <select value={review.rating} onChange={(event) => setReview((prev) => ({ ...prev, rating: Number(event.target.value) }))}>
                {[5, 4, 3, 2, 1].map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Review
              <textarea
                required
                minLength={4}
                value={review.comment}
                onChange={(event) => setReview((prev) => ({ ...prev, comment: event.target.value }))}
              />
            </label>
            <button className="btn btn-dark" type="submit">
              Submit review
            </button>
          </form>
        ) : (
          <p className="muted">
            <Link to="/login">Sign in</Link> to review this pair.
          </p>
        )}
      </section>

      <section className="section">
        <div className="section-head">
          <h2>You may also like</h2>
        </div>
        <div className="product-grid">
          {related
            .filter((item) => item._id !== product._id)
            .slice(0, 4)
            .map((item) => (
              <ProductCard key={item._id} product={item} />
            ))}
        </div>
      </section>

      <Modal open={guide} title="Men's size guide" onClose={() => setGuide(false)}>
        <p className="size-note">
          VELORA sizes are US men&apos;s. Shoe shops in Pakistan usually quote UK sizes — match your usual UK size to the column below, then choose that US size.
        </p>
        <div className="table-wrap">
          <table className="size-table">
            <thead>
              <tr>
                <th>UK</th>
                <th>US</th>
                <th>EU</th>
                <th>Foot (cm)</th>
              </tr>
            </thead>
            <tbody>
              {sizeGuide.map((row) => (
                <tr key={row[1]}>
                  <td>{row[1]}</td>
                  <td>{row[0]}</td>
                  <td>{row[2]}</td>
                  <td>{row[3]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="muted">Most men here wear UK 7–10. If you are between sizes, take the larger one. Wide feet should go up half a size.</p>
      </Modal>
    </div>
  );
}
