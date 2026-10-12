import { useEffect, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { Heart, Star } from 'lucide-react'
import ProductCard from '../components/ProductCard'
import EmptyState from '../components/EmptyState'
import { PageSkeleton } from '../components/Skeleton'
import { api } from '../services/api'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'
import { useWishlist } from '../context/WishlistContext'
import { useAuth } from '../context/AuthContext'
import { discountPercent, money, SIZE_GUIDE } from '../utils/format'
import { useNavigate } from 'react-router-dom'
import { useTitle } from '../hooks/useUi'

export default function ProductPage() {
  const { slug } = useParams()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { addItem } = useCart()
  const { push } = useToast()
  const { toggle, has } = useWishlist()
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [image, setImage] = useState(0)
  const [size, setSize] = useState(params.get('size') || '')
  const [color, setColor] = useState('')
  const [qty, setQty] = useState(1)
  const [sizeError, setSizeError] = useState('')
  const [guide, setGuide] = useState(false)
  const [review, setReview] = useState({ rating: 5, comment: '' })

  useTitle(data?.product?.name || 'Product')

  useEffect(() => {
    let ignore = false
    setLoading(true)
    setError('')
    api(`/products/${slug}`)
      .then((result) => {
        if (ignore) return
        setData(result)
        setImage(0)
        setColor(result.product.colors?.[0]?.name || '')
        setSize(params.get('size') || '')
        setQty(1)
      })
      .catch((err) => {
        if (!ignore) setError(err.message)
      })
      .finally(() => {
        if (!ignore) setLoading(false)
      })
    return () => {
      ignore = true
    }
  }, [slug])

  if (loading) return <PageSkeleton />
  if (error || !data?.product) {
    return (
      <div className="page">
        <EmptyState title="Product not found" text="This pair is no longer in the collection." action="Back to shop" />
      </div>
    )
  }

  const { product, reviews, related } = data
  const off = discountPercent(product.price, product.comparePrice)
  const soldOut = product.stock < 1

  const requireSize = () => {
    if (!size) {
      setSizeError('Select a size to continue')
      return false
    }
    setSizeError('')
    return true
  }

  const add = () => {
    if (!requireSize()) return
    const result = addItem(product, { size, color, qty })
    push(result.ok ? 'Added to cart' : result.message)
    return result.ok
  }

  const buyNow = () => {
    if (add()) navigate('/checkout')
  }

  const sendReview = async (event) => {
    event.preventDefault()
    try {
      await api('/reviews', { method: 'POST', body: { productId: product._id, ...review } })
      const fresh = await api(`/products/${slug}`)
      setData(fresh)
      setReview({ rating: 5, comment: '' })
      push('Review published')
    } catch (err) {
      push(err.message)
    }
  }

  return (
    <div className="page product-page">
      <div className="pdp">
        <div className="gallery">
          <div className="gallery-main">
            <img src={product.images?.[image]} alt={product.name} />
          </div>
          {product.images?.length > 1 && (
            <div className="thumbs">
              {product.images.map((src, index) => (
                <button key={src} type="button" className={index === image ? 'is-on' : ''} onClick={() => setImage(index)}>
                  <img src={src} alt="" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="pdp-info">
          <p className="eyebrow">{product.category?.name}</p>
          <h1>{product.name}</h1>
          <p className="brand-line">{product.brand}</p>
          <div className="pdp-price">
            <strong>{money(product.price)}</strong>
            {off > 0 && (
              <>
                <s>{money(product.comparePrice)}</s>
                <em>-{off}%</em>
              </>
            )}
          </div>
          <p className="rating-line">
            <Star size={14} fill="currentColor" /> {Number(product.rating || 0).toFixed(1)} · {product.numReviews} reviews
          </p>
          <p className="desc">{product.description}</p>

          <div className="option-block">
            <div className="option-label">
              <span>Color</span>
              <strong>{color}</strong>
            </div>
            <div className="chip-row colors">
              {product.colors.map((item) => (
                <button
                  key={item.name}
                  type="button"
                  className={color === item.name ? 'is-on' : ''}
                  onClick={() => setColor(item.name)}
                >
                  <i style={{ background: item.hex }} />
                  {item.name}
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
            <div className="chip-row">
              {product.sizes.map((item) => (
                <button
                  key={item}
                  type="button"
                  className={size === item ? 'is-on' : ''}
                  onClick={() => {
                    setSize(item)
                    setSizeError('')
                  }}
                >
                  {item}
                </button>
              ))}
            </div>
            {sizeError && <p className="form-error">{sizeError}</p>}
          </div>

          <div className="option-block">
            <div className="option-label">
              <span>Quantity</span>
              <strong className={soldOut ? 'bad' : 'good'}>{soldOut ? 'Out of stock' : `${product.stock} in stock`}</strong>
            </div>
            <div className="qty">
              <button type="button" onClick={() => setQty((value) => Math.max(1, value - 1))} disabled={soldOut}>
                −
              </button>
              <span>{qty}</span>
              <button
                type="button"
                onClick={() => setQty((value) => Math.min(product.stock, value + 1))}
                disabled={soldOut || qty >= product.stock}
              >
                +
              </button>
            </div>
          </div>

          <div className="pdp-actions">
            <button type="button" className="btn btn-dark" disabled={soldOut} onClick={add}>
              Add to Cart
            </button>
            <button type="button" className="btn btn-orange" disabled={soldOut} onClick={buyNow}>
              Buy Now
            </button>
            <button
              type="button"
              className={`icon-btn wish-lg ${has(product._id) ? 'is-on' : ''}`}
              aria-label="Wishlist"
              onClick={() => toggle(product).then((on) => push(on ? 'Saved to wishlist' : 'Removed from wishlist'))}
            >
              <Heart size={18} fill={has(product._id) ? 'currentColor' : 'none'} />
            </button>
          </div>
        </div>
      </div>

      <section className="reviews">
        <h2>Reviews</h2>
        {reviews.length === 0 && <p className="muted">No reviews yet.</p>}
        <div className="review-list">
          {reviews.map((item) => (
            <article key={item._id}>
              <strong>{item.name}</strong>
              <span>{'★'.repeat(item.rating)}</span>
              <p>{item.comment}</p>
            </article>
          ))}
        </div>
        {user ? (
          <form className="review-form" onSubmit={sendReview}>
            <h3>Write a review</h3>
            <select
              value={review.rating}
              onChange={(event) => setReview({ ...review, rating: Number(event.target.value) })}
              aria-label="Rating"
            >
              {[5, 4, 3, 2, 1].map((value) => (
                <option key={value} value={value}>
                  {value} stars
                </option>
              ))}
            </select>
            <textarea
              required
              value={review.comment}
              onChange={(event) => setReview({ ...review, comment: event.target.value })}
              placeholder="How does it fit and feel?"
            />
            <button className="btn btn-dark" type="submit">
              Publish
            </button>
          </form>
        ) : (
          <p>
            <Link to={`/login?next=/product/${product.slug}`}>Sign in</Link> to review this pair.
          </p>
        )}
      </section>

      {related?.length > 0 && (
        <section className="section tight">
          <div className="section-head">
            <h2>You may also like</h2>
          </div>
          <div className="product-grid">
            {related.map((item) => (
              <ProductCard key={item._id} product={item} />
            ))}
          </div>
        </section>
      )}

      {guide && (
        <div className="modal">
          <button type="button" className="drawer-backdrop" aria-label="Close size guide" onClick={() => setGuide(false)} />
          <div className="modal-card">
            <h2>Men's size guide</h2>
            <p>Measure your foot in the evening and match the length to the closest size.</p>
            <table>
              <thead>
                <tr>
                  <th>US</th>
                  <th>UK</th>
                  <th>EU</th>
                  <th>CM</th>
                </tr>
              </thead>
              <tbody>
                {SIZE_GUIDE.map((row) => (
                  <tr key={row.us}>
                    <td>{row.us}</td>
                    <td>{row.uk}</td>
                    <td>{row.eu}</td>
                    <td>{row.cm}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button type="button" className="btn btn-dark" onClick={() => setGuide(false)}>
              Close
            </button>
          </div>
        </div>
      )}

      {!soldOut && (
        <div className="mobile-buy">
          <div>
            <strong>{money(product.price)}</strong>
            <span>{size ? `Size ${size}` : 'Select a size'}</span>
          </div>
          <button type="button" className="btn btn-dark" onClick={add}>
            Add to Cart
          </button>
        </div>
      )}
    </div>
  )
}
