import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api, errorMessage } from '../../services/api';

const allSizes = ['7', '8', '9', '10', '11', '12', '13'];
const blank = {
  name: '',
  slug: '',
  description: '',
  category: '',
  price: '',
  comparePrice: '',
  images: '',
  colors: [{ name: 'Black', hex: '#111111' }],
  sizes: ['8', '9', '10', '11'],
  stock: 10,
  featured: false,
  newArrival: true,
  trending: false,
  accentColor: '#A56B45',
  featuredOrder: 99,
  showInHero: false,
  heroOrder: 1,
};

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(blank);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');
  const [uploadNote, setUploadNote] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/categories').then((res) => {
      setCategories(res.data);
      if (!id) setForm((prev) => ({ ...prev, category: res.data[0]?._id || '' }));
    });
    if (!id) return;
    api.get(`/products/id/${id}`).then((res) => {
      const product = res.data;
      setForm({
        ...product,
        category: product.category?._id || product.category,
        images: product.images.join('\n'),
        price: product.price,
        comparePrice: product.comparePrice || '',
      });
    });
  }, [id]);

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <form
      className="panel product-form"
      onSubmit={async (event) => {
        event.preventDefault();
        setSaving(true);
        setError('');
        const payload = {
          ...form,
          price: Number(form.price),
          comparePrice: Number(form.comparePrice) || 0,
          stock: Number(form.stock),
          images: String(form.images)
            .split('\n')
            .map((line) => line.trim())
            .filter(Boolean),
        };
        try {
          if (id) await api.put(`/products/${id}`, payload);
          else await api.post('/products', payload);
          navigate('/admin/products');
        } catch (err) {
          setError(errorMessage(err));
        } finally {
          setSaving(false);
        }
      }}
    >
      <header className="page-head">
        <p className="eyebrow">Catalog</p>
        <h1>{id ? 'Edit product' : 'Add product'}</h1>
      </header>
      {error && <p className="form-error">{error}</p>}
      <label className="field">
        Name
        <input required value={form.name} onChange={(event) => set('name', event.target.value)} />
      </label>
      <label className="field">
        Slug
        <input value={form.slug || ''} onChange={(event) => set('slug', event.target.value)} placeholder="Generated from the name if empty" />
      </label>
      <label className="field">
        Description
        <textarea required value={form.description} onChange={(event) => set('description', event.target.value)} />
      </label>
      <div className="split">
        <label className="field">
          Category
          <select value={form.category} onChange={(event) => set('category', event.target.value)}>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          Stock
          <input type="number" min="0" value={form.stock} onChange={(event) => set('stock', event.target.value)} />
        </label>
      </div>
      <div className="split">
        <label className="field">
          Price
          <input type="number" min="0" required value={form.price} onChange={(event) => set('price', event.target.value)} />
        </label>
        <label className="field">
          Original price
          <input type="number" min="0" value={form.comparePrice} onChange={(event) => set('comparePrice', event.target.value)} />
        </label>
      </div>
      <p className="fine">Customers pay Price. Set a higher original price to show the pair on sale.</p>
      <label className="field">
        Images
        <textarea value={form.images} onChange={(event) => set('images', event.target.value)} placeholder="One image URL per line" />
      </label>
      <label className="field">
        Upload images
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={async (event) => {
            const files = [...event.target.files];
            if (!files.length) return;
            const body = new FormData();
            files.forEach((file) => body.append('images', file));
            try {
              const { data } = await api.post('/upload', body);
              set('images', [form.images, ...data.urls].filter(Boolean).join('\n'));
              setUploadNote('Uploaded.');
            } catch (err) {
              setUploadNote(errorMessage(err));
            }
          }}
        />
      </label>
      {uploadNote && <p className="fine">{uploadNote}</p>}
      <div className="filter-block">
        <p>Sizes</p>
        <div className="chip-row">
          {allSizes.map((size) => (
            <button
              key={size}
              type="button"
              className={form.sizes.includes(size) ? 'on' : ''}
              onClick={() =>
                set(
                  'sizes',
                  form.sizes.includes(size) ? form.sizes.filter((item) => item !== size) : [...form.sizes, size]
                )
              }
            >
              {size}
            </button>
          ))}
        </div>
      </div>
      <div className="color-editor">
        <p>Colors</p>
        {form.colors.map((color, index) => (
          <div key={index} className="split">
            <input
              value={color.name}
              placeholder="Name"
              onChange={(event) => {
                const colors = [...form.colors];
                colors[index] = { ...color, name: event.target.value };
                set('colors', colors);
              }}
            />
            <input
              type="color"
              value={color.hex}
              onChange={(event) => {
                const colors = [...form.colors];
                colors[index] = { ...color, hex: event.target.value };
                set('colors', colors);
              }}
            />
          </div>
        ))}
        <button type="button" className="text-link" onClick={() => set('colors', [...form.colors, { name: '', hex: '#111111' }])}>
          Add color
        </button>
      </div>
      <label className="field">
        Hero accent color
        <input type="color" value={form.accentColor || '#A56B45'} onChange={(event) => set('accentColor', event.target.value)} />
      </label>
      <label className="hero-toggle">
        <input type="checkbox" checked={Boolean(form.showInHero)} onChange={(event) => set('showInHero', event.target.checked)} />
        <span>
          <strong>Show in Hero</strong>
          <small>{form.showInHero ? 'On — this pair can appear in the homepage hero.' : 'Off — this pair stays out of the hero.'}</small>
        </span>
      </label>
      <label className="field">
        Hero display order
        <input type="number" min="1" value={form.heroOrder ?? 99} onChange={(event) => set('heroOrder', Number(event.target.value))} />
      </label>
      <div className="check-row">
        {[
          ['featured', 'Featured'],
          ['newArrival', 'New arrival'],
          ['trending', 'Best seller'],
        ].map(([key, label]) => (
          <label key={key}>
            <input type="checkbox" checked={Boolean(form[key])} onChange={(event) => set(key, event.target.checked)} />
            {label}
          </label>
        ))}
      </div>
      <button className="btn btn-dark" type="submit" disabled={saving}>
        {saving ? 'Saving…' : 'Save product'}
      </button>
    </form>
  );
}
