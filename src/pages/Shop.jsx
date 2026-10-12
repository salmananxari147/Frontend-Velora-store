import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import Reveal from '../components/Reveal';
import { EmptyState, ProductSkeleton } from '../components/ui';
import { api, errorMessage } from '../services/api';

const sorts = [
  { id: 'newest', label: 'Newest' },
  { id: 'price-asc', label: 'Price: Low to High' },
  { id: 'price-desc', label: 'Price: High to Low' },
  { id: 'popular', label: 'Popular' },
  { id: 'rating', label: 'Rating' },
];

export default function Shop() {
  const [params, setParams] = useSearchParams();
  const [data, setData] = useState(null);
  const [meta, setMeta] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [draftPrice, setDraftPrice] = useState({ min: params.get('minPrice') || '', max: params.get('maxPrice') || '' });

  const category = params.get('category') || '';
  const sort = params.get('sort') || 'newest';
  const page = params.get('page') || '1';
  const q = params.get('q') || '';

  useEffect(() => {
    document.title = 'Shop — VELORA';
    api.get('/products/meta').then((res) => setMeta(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    setError('');
    api
      .get('/products', {
        params: {
          category: category || undefined,
          sort,
          page,
          search: q || undefined,
          minPrice: params.get('minPrice') || undefined,
          maxPrice: params.get('maxPrice') || undefined,
          size: params.get('size') || undefined,
          color: params.get('color') || undefined,
          rating: params.get('rating') || undefined,
          limit: 12,
        },
      })
      .then((res) => setData(res.data))
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setLoading(false));
  }, [params, category, sort, page, q]);

  const update = (patch, resetPage = true) => {
    const next = new URLSearchParams(params);
    Object.entries(patch).forEach(([key, value]) => {
      if (value === '' || value == null) next.delete(key);
      else next.set(key, value);
    });
    if (resetPage) next.delete('page');
    setParams(next);
    setFiltersOpen(false);
  };

  return (
    <div className="container shop-page">
      <Reveal>
      <header className="page-head">
        <p className="eyebrow">The collection</p>
        <h1>{category ? meta?.categories?.find((item) => item.slug === category)?.name || category : q ? `Results for “${q}”` : 'All footwear'}</h1>
        <p>{data ? `${data.total} pairs` : 'Men’s shoes, edited.'}</p>
      </header>
      </Reveal>

      <div className="shop-layout">
        <aside className={`filters ${filtersOpen ? 'open' : ''}`}>
          <div className="filters-head">
            <strong>Filter</strong>
            <button type="button" onClick={() => setFiltersOpen(false)}>
              Close
            </button>
          </div>
          <label className="field">
            Search
            <input value={q} onChange={(event) => update({ q: event.target.value })} placeholder="Name" />
          </label>
          <div className="filter-block">
            <p>Category</p>
            <button type="button" className={!category ? 'on' : ''} onClick={() => update({ category: '' })}>
              All
            </button>
            {['sneakers', 'running', 'casual', 'formal', 'boots', 'loafers', 'slides'].map((item) => (
              <button key={item} type="button" className={category === item ? 'on' : ''} onClick={() => update({ category: item })}>
                {item}
              </button>
            ))}
          </div>
          <form
            className="filter-block"
            onSubmit={(event) => {
              event.preventDefault();
              update({ minPrice: draftPrice.min, maxPrice: draftPrice.max });
            }}
          >
            <p>Price</p>
            <div className="price-row">
              <input
                inputMode="numeric"
                placeholder="Min"
                value={draftPrice.min}
                onChange={(event) => setDraftPrice((prev) => ({ ...prev, min: event.target.value }))}
              />
              <input
                inputMode="numeric"
                placeholder="Max"
                value={draftPrice.max}
                onChange={(event) => setDraftPrice((prev) => ({ ...prev, max: event.target.value }))}
              />
            </div>
            <button className="btn btn-dark btn-small" type="submit">
              Apply
            </button>
          </form>
          <div className="filter-block">
            <p>Size</p>
            <div className="chip-row">
              {(meta?.sizes || ['7', '8', '9', '10', '11', '12']).map((size) => (
                <button
                  key={size}
                  type="button"
                  className={params.get('size') === size ? 'on' : ''}
                  onClick={() => update({ size: params.get('size') === size ? '' : size })}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
          <div className="filter-block">
            <p>Color</p>
            <div className="chip-row colors">
              {meta?.colors?.map((color) => (
                <button
                  key={color.name}
                  type="button"
                  title={color.name}
                  className={params.get('color') === color.name ? 'on' : ''}
                  onClick={() => update({ color: params.get('color') === color.name ? '' : color.name })}
                >
                  <i style={{ background: color.hex }} />
                  {color.name}
                </button>
              ))}
            </div>
          </div>
          <div className="filter-block">
            <p>Rating</p>
            {[4, 3].map((rating) => (
              <button
                key={rating}
                type="button"
                className={params.get('rating') === String(rating) ? 'on' : ''}
                onClick={() => update({ rating: params.get('rating') === String(rating) ? '' : String(rating) })}
              >
                {rating}+ stars
              </button>
            ))}
          </div>
          <button
            type="button"
            className="text-link"
            onClick={() => {
              setDraftPrice({ min: '', max: '' });
              setParams(new URLSearchParams());
            }}
          >
            Clear filters
          </button>
        </aside>

        <div className="shop-results">
          <div className="shop-toolbar">
            <button type="button" className="btn btn-line btn-small filter-toggle" onClick={() => setFiltersOpen(true)}>
              Filters
            </button>
            <label>
              Sort
              <select value={sort} onChange={(event) => update({ sort: event.target.value })}>
                {sorts.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          {loading && <ProductSkeleton count={8} />}
          {error && <p className="form-error">{error}</p>}
          {!loading && data?.products.length === 0 && (
            <EmptyState
              title="No pairs match"
              text="Try another size, color, or clear the filters."
              action={
                <button type="button" className="btn btn-dark" onClick={() => setParams(new URLSearchParams())}>
                  Clear filters
                </button>
              }
            />
          )}
          {!loading && data && (
            <>
              <div className="product-grid">
                {data.products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
              {data.pages > 1 && (
                <div className="pager">
                  <button type="button" disabled={data.page <= 1} onClick={() => update({ page: String(data.page - 1) }, false)}>
                    Previous
                  </button>
                  <span>
                    {data.page} / {data.pages}
                  </span>
                  <button
                    type="button"
                    disabled={data.page >= data.pages}
                    onClick={() => update({ page: String(data.page + 1) }, false)}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
