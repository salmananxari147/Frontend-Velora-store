import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { money } from '../utils/format';

function blurb(text) {
  const clean = String(text || '').replace(/\s+/g, ' ').trim();
  if (clean.length <= 140) return clean;
  return `${clean.slice(0, 137).trim()}…`;
}

export default function Hero({ products }) {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const stageRef = useRef(null);
  const drag = useRef(null);
  const list = products || [];
  const count = list.length;
  const product = list[index];

  useEffect(() => {
    if (index >= count) setIndex(0);
  }, [count, index]);

  useEffect(() => {
    if (reduce || count < 2) return undefined;
    const timer = setInterval(() => setIndex((c) => (c + 1) % count), 4500);
    return () => clearInterval(timer);
  }, [count, reduce]);

  const go = (step) => {
    if (count < 2) return;
    setIndex((c) => (c + step + count) % count);
  };

  const onMove = (event) => {
    if (reduce || !stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: py * -8, y: px * 12 });
  };

  const accent = product?.accentColor || '#A56B45';

  return (
    <section
      className="hero"
      style={{ '--accent': accent }}
      onMouseLeave={() => setTilt({ x: 0, y: 0 })}
    >
      <div className="studio">
        {/* ---------- LEFT : TEXT ---------- */}
        <div className="studio-copy">
          <div className="studio-copy-inner">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={product?._id || 'empty'}
                initial={reduce ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? undefined : { opacity: 0, y: -10 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                {product ? (
                  <>
                    <p className="eyebrow">{product.category?.name || 'VELORA'}</p>
                    <h1>{product.name}</h1>
                    <p className="hero-price">{money(product.price)}</p>
                    <p className="lede">{blurb(product.description)}</p>
                  </>
                ) : (
                  <>
                    <p className="eyebrow">VELORA</p>
                    <h1>Built to move.</h1>
                    <p className="lede">
                      Premium men&apos;s footwear designed for everyday movement.
                    </p>
                  </>
                )}

                <div className="hero-cta">
                  <Link
                    to={product ? `/product/${product.slug}` : '/shop'}
                    className="btn btn-orange"
                  >
                    Shop this pair
                  </Link>
                  <Link to="/shop" className="btn btn-line">
                    All footwear
                  </Link>
                </div>

                {product?.sizes?.length > 0 && (
                  <div className="studio-sizes">
                    <p>Sizes</p>
                    <div>
                      {product.sizes.slice(0, 8).map((size) => (
                        <Link key={size} to={`/product/${product.slug}`}>
                          {size}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* ---------- RIGHT : STAGE ---------- */}
        <div
          className="studio-stage"
          ref={stageRef}
          onMouseMove={onMove}
          onPointerDown={(event) => {
            drag.current = event.clientX;
            event.currentTarget.setPointerCapture(event.pointerId);
          }}
          onPointerUp={(event) => {
            if (drag.current == null) return;
            const delta = event.clientX - drag.current;
            drag.current = null;
            if (delta > 48) go(-1);
            else if (delta < -48) go(1);
          }}
        >
          {product ? (
            <motion.div
              className="studio-plate"
              animate={{ rotateX: tilt.x, rotateY: tilt.y }}
              transition={{ type: 'spring', stiffness: 180, damping: 18, mass: 0.6 }}
            >
              <AnimatePresence initial={false} mode="popLayout">
                <motion.img
                  key={product._id}
                  src={product.images?.[0]}
                  alt={product.name}
                  initial={reduce ? false : { opacity: 0, x: '30%' }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={reduce ? undefined : { opacity: 0, x: '-30%' }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  draggable={false}
                />
              </AnimatePresence>

              <div className="studio-colors">
                {(product.colors || []).slice(0, 5).map((color) => (
                  <Link
                    key={color.name}
                    to={`/product/${product.slug}`}
                    title={color.name}
                    style={{ background: color.hex }}
                  />
                ))}
              </div>
            </motion.div>
          ) : (
            <p className="hero-empty">Choose pairs in the studio to feature them here.</p>
          )}

          {count > 1 && (
            <p className="studio-hint">Hover to tilt · drag sideways to change pair</p>
          )}
        </div>

        {/* ---------- RAIL ---------- */}
        {count > 0 && (
          <div className="studio-rail" role="tablist" aria-label="Featured pairs">
            {list.map((item, itemIndex) => (
              <button
                key={item._id}
                type="button"
                role="tab"
                aria-selected={itemIndex === index}
                className={itemIndex === index ? 'on' : ''}
                onClick={() => setIndex(itemIndex)}
              >
                <img src={item.images?.[0]} alt="" />
                <small>{item.name}</small>
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}