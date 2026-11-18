import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { money } from '../utils/format';

const EASE = [0.22, 1, 0.36, 1];

// text block: soft staggered fade-up (one gentle motion, no double animation)
const group = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
  exit: { opacity: 0, transition: { duration: 0.18 } },
};
const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
};

function blurb(text) {
  const clean = String(text || '').replace(/\s+/g, ' ').trim();
  if (clean.length <= 140) return clean;
  return `${clean.slice(0, 137).trim()}…`;
}

export default function Hero({ products }) {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const stageRef = useRef(null);
  const drag = useRef(null);
  const list = products || [];
  const count = list.length;
  const product = list[index];

  useEffect(() => {
    if (index >= count) setIndex(0);
  }, [count, index]);

  // autoplay: slower, and stops while the user is hovering the hero
  useEffect(() => {
    if (reduce || paused || count < 2) return undefined;
    const timer = setInterval(() => setIndex((c) => (c + 1) % count), 6000);
    return () => clearInterval(timer);
  }, [count, reduce, paused]);

  const go = (step) => {
    if (count < 2) return;
    setIndex((c) => (c + step + count) % count);
  };

  const onMove = (event) => {
    if (reduce || !stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: py * -5, y: px * 7 });
  };

  const accent = product?.accentColor || '#A56B45';

  return (
    <section
      className="hero"
      style={{ '--accent': accent }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => {
        setPaused(false);
        setTilt({ x: 0, y: 0 });
      }}
    >
      <div className="studio">
        {/* ---------- LEFT : TEXT ---------- */}
        <div className="studio-copy">
          <div className="studio-copy-inner">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={product?._id || 'empty'}
                className="studio-copy-body"
                variants={group}
                initial={reduce ? false : 'hidden'}
                animate="show"
                exit={reduce ? undefined : 'exit'}
              >
                {product ? (
                  <>
                    <motion.p variants={item} className="eyebrow">
                      {product.category?.name || 'VELORA'}
                    </motion.p>
                    <motion.h1 variants={item}>{product.name}</motion.h1>
                    <motion.p variants={item} className="hero-price">
                      {money(product.price)}
                    </motion.p>
                    <motion.p variants={item} className="lede">
                      {blurb(product.description)}
                    </motion.p>
                  </>
                ) : (
                  <>
                    <motion.p variants={item} className="eyebrow">VELORA</motion.p>
                    <motion.h1 variants={item}>Built to move.</motion.h1>
                    <motion.p variants={item} className="lede">
                      Premium men&apos;s footwear designed for everyday movement.
                    </motion.p>
                  </>
                )}

                <motion.div variants={item} className="hero-cta">
                  <Link
                    to={product ? `/product/${product.slug}` : '/shop'}
                    className="btn btn-orange"
                  >
                    Shop this pair
                  </Link>
                  <Link to="/shop" className="btn btn-line">
                    All footwear
                  </Link>
                </motion.div>

                {product?.sizes?.length > 0 && (
                  <motion.div variants={item} className="studio-sizes">
                    <p>Sizes</p>
                    <div>
                      {product.sizes.slice(0, 8).map((size) => (
                        <Link key={size} to={`/product/${product.slug}`}>
                          {size}
                        </Link>
                      ))}
                    </div>
                  </motion.div>
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
              transition={{ type: 'spring', stiffness: 90, damping: 20, mass: 0.8 }}
            >
              <AnimatePresence initial={false} mode="popLayout">
                <motion.img
                  key={product._id}
                  src={product.images?.[0]}
                  alt={product.name}
                  initial={reduce ? false : { opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={reduce ? undefined : { opacity: 0 }}
                  transition={{ duration: 0.7, ease: EASE }}
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
