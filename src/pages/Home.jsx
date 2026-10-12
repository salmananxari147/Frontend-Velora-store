import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Hero from '../components/Hero';
import Reveal from '../components/Reveal';
import ProductCard from '../components/ProductCard';
import { ProductSkeleton } from '../components/ui';
import { api, errorMessage } from '../services/api';

const reasons = [
  { title: 'Premium materials', text: 'Leathers, meshes, and soles chosen to wear in, not wear out.' },
  { title: 'Modern design', text: 'Quiet shapes with a sharp last. Nothing extra on the shoe.' },
  { title: 'Comfort first', text: 'Cushion where you land. Structure where you need it.' },
  { title: 'Fast delivery', text: 'Free shipping on orders over $200. Easy returns within 30 days.' },
];

export default function Home() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    document.title = 'VELORA — Move Different.';
    api
      .get('/products/home')
      .then((res) => setData(res.data))
      .catch((err) => setError(errorMessage(err, 'The collection could not be loaded.')));
  }, []);

  const categoryOrder = ['sneakers', 'running', 'casual', 'formal', 'boots', 'loafers'];
  const categories = categoryOrder
    .map((slug) => data?.categories?.find((category) => category.slug === slug))
    .filter(Boolean);

  return (
    <>
      {error && (
        <div className="container">
          <p className="form-error">{error}</p>
        </div>
      )}
      {!data && !error && (
        <div className="container hero-fallback">
          <ProductSkeleton count={4} />
        </div>
      )}
      {data && <Hero products={data.hero} />}

      <section className="section category-section">
        <div className="container">
        <Reveal>
        <SectionHead eyebrow="Categories" title="Shop by silhouette" />
        </Reveal>
        <div className="cat-grid">
          {categories.map((category, index) => (
            <motion.div
              key={category._id}
              className={index === 0 ? 'cat-span' : undefined}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: index * 0.06, duration: 0.5 }}
            >
            <Link to={`/shop?category=${category.slug}`} className="cat-tile">
              <img src={category.image} alt="" />
              <span>
                <small>Shop</small>
                {category.name}
              </span>
            </Link>
            </motion.div>
          ))}
        </div>
        </div>
      </section>

      <section className="section container">
        <Reveal>
        <SectionHead eyebrow="Just landed" title="New arrivals" link="/shop?sort=newest" />
        </Reveal>
        {data ? (
          <div className="product-grid">
            {data.newArrivals.slice(0, 8).map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <ProductSkeleton count={4} />
        )}
      </section>

      <section className="section container">
        <Reveal>
        <SectionHead eyebrow="Most wanted" title="Best sellers" link="/shop?sort=popular" />
        </Reveal>
        <div className="product-grid">
          {(data?.trending || []).map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </section>

      <Reveal>
      <section className="promo">
        {data?.trending?.[0]?.images?.[0] && (
          <div className="promo-media">
            <img src={data.trending[0].images[0]} alt={data.trending[0].name} />
          </div>
        )}
        <div className="promo-copy">
          <p className="eyebrow light">The house</p>
          <h2>Designed for every step.</h2>
          <p>
            VELORA makes men&apos;s footwear for people who move between rooms, cities, and weather without changing who they
            are. Materials stay honest. The last stays sharp.
          </p>
          <Link to="/shop" className="btn btn-orange">
            Explore Collection
          </Link>
        </div>
      </section>
      </Reveal>

      <section className="section band">
        <div className="container">
        <Reveal>
        <SectionHead eyebrow="Why VELORA" title="Less noise. Better shoes." />
        </Reveal>
        <div className="why-grid">
          {reasons.map((reason, index) => (
            <motion.article
              key={reason.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: index * 0.05, duration: 0.45 }}
            >
              <span>0{index + 1}</span>
              <h3>{reason.title}</h3>
              <p>{reason.text}</p>
            </motion.article>
          ))}
        </div>
        </div>
      </section>

      <Reveal>
      <section className="newsletter">
        <div className="container">
          <p className="eyebrow">Newsletter</p>
          <h2>Get the latest drops</h2>
          <form
            onSubmit={async (event) => {
              event.preventDefault();
              setNote('');
              try {
                const { data } = await api.post('/newsletter', { email });
                setNote(data.message);
                setEmail('');
              } catch (err) {
                setNote(errorMessage(err));
              }
            }}
          >
            <input
              type="email"
              required
              placeholder="Email address"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              aria-label="Email address"
            />
            <button className="btn btn-dark" type="submit">
              Subscribe
            </button>
          </form>
          {note && <p className="fine">{note}</p>}
        </div>
      </section>
      </Reveal>
    </>
  );
}

function SectionHead({ eyebrow, title, link }) {
  return (
    <div className="section-head">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
      </div>
      {link && (
        <Link to={link} className="text-link">
          View all
        </Link>
      )}
    </div>
  );
}
