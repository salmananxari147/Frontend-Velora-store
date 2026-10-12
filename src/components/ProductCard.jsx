import { motion, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { IconHeart } from './Icons';
import { Rating } from './ui';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { useWishlist } from '../context/WishlistContext';
import { money } from '../utils/format';

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const { toggle, has } = useWishlist();
  const toast = useToast();
  const reduce = useReducedMotion();
  const saved = has(product._id);
  const soldOut = product.stock === 0;
  const image = product.images?.[0];
  const alt = product.images?.[1];

  const add = (event, size) => {
    event.preventDefault();
    event.stopPropagation();
    if (soldOut) return;
    addItem(product, { size, color: product.colors?.[0]?.name || 'Default', qty: 1 });
    toast.push(`${product.name} added · size ${size}`);
  };

  return (
    <motion.div
      className="pcard-reveal"
      initial={reduce ? false : { opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    >
    <article className="pcard">
      <Link to={`/product/${product.slug}`} className="pcard-media">
        {soldOut && <span className="sold-tag">Sold out</span>}
        {!soldOut && product.comparePrice > product.price && <span className="sale-tag">Sale</span>}
        {!soldOut && product.newArrival && <span className="arrival-tag">New</span>}
        <img src={image} alt={product.name} loading="lazy" />
        {alt && <img className="alt" src={alt} alt="" loading="lazy" />}
        <button
          type="button"
          className={`wish ${saved ? 'on' : ''}`}
          aria-label={saved ? 'Remove from wishlist' : 'Add to wishlist'}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            toggle(product);
            toast.push(saved ? 'Removed from wishlist' : 'Saved to wishlist');
          }}
        >
          <IconHeart filled={saved} />
        </button>
        {!soldOut && (
          <div className="quick-add">
            <span>Add size</span>
            <div>
              {(product.sizes || []).slice(0, 6).map((size) => (
                <button key={size} type="button" onClick={(event) => add(event, size)}>
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}
      </Link>
      <div className="pcard-body">
        <div className="pcard-top">
          <p>{product.category?.name}</p>
          {product.numReviews > 0 ? <Rating value={product.rating} /> : <span className="new-tag">New</span>}
        </div>
        <Link to={`/product/${product.slug}`}>{product.name}</Link>
        <div className="pcard-price">
          <strong>{money(product.price)}</strong>
          {product.comparePrice > product.price && <s>{money(product.comparePrice)}</s>}
          <span className="dots">
            {product.colors?.slice(0, 4).map((color) => (
              <i key={color.name} style={{ background: color.hex }} title={color.name} />
            ))}
          </span>
        </div>
      </div>
    </article>
    </motion.div>
  );
}
