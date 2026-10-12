import { useEffect, useState } from 'react';
import { api, errorMessage } from '../../services/api';
import { formatDate } from '../../utils/format';

export default function ManageAdmin({ section }) {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');
  const [form, setForm] = useState(defaultForm(section));

  const load = () => {
    const path = { customers: '/users', categories: '/categories', coupons: '/coupons', reviews: '/reviews' }[section];
    api.get(path).then((res) => setRows(res.data)).catch((err) => setError(errorMessage(err)));
  };

  useEffect(() => {
    setForm(defaultForm(section));
    load();
  }, [section]);

  return (
    <div>
      <header className="page-head">
        <p className="eyebrow">Studio</p>
        <h1>{section}</h1>
      </header>
      {error && <p className="form-error">{error}</p>}

      {section === 'categories' && (
        <form
          className="panel inline-form"
          onSubmit={async (event) => {
            event.preventDefault();
            await api.post('/categories', form);
            setForm(defaultForm(section));
            load();
          }}
        >
          <input required placeholder="Name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
          <input placeholder="Image URL" value={form.image} onChange={(event) => setForm({ ...form, image: event.target.value })} />
          <button className="btn btn-dark" type="submit">
            Add category
          </button>
        </form>
      )}

      {section === 'coupons' && (
        <form
          className="panel inline-form"
          onSubmit={async (event) => {
            event.preventDefault();
            await api.post('/coupons', { ...form, value: Number(form.value), minOrder: Number(form.minOrder) || 0 });
            setForm(defaultForm(section));
            load();
          }}
        >
          <input required placeholder="CODE" value={form.code} onChange={(event) => setForm({ ...form, code: event.target.value })} />
          <select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })}>
            <option value="percent">Percent</option>
            <option value="fixed">Fixed</option>
          </select>
          <input required type="number" placeholder="Value" value={form.value} onChange={(event) => setForm({ ...form, value: event.target.value })} />
          <input type="date" value={form.expiresAt} onChange={(event) => setForm({ ...form, expiresAt: event.target.value })} />
          <button className="btn btn-dark" type="submit">
            Create coupon
          </button>
        </form>
      )}

      <div className="table-wrap">
        <table className="data">
          <tbody>
            {section === 'customers' &&
              rows.map((user) => (
                <tr key={user._id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>{formatDate(user.createdAt)}</td>
                </tr>
              ))}
            {section === 'categories' &&
              rows.map((category) => (
                <tr key={category._id}>
                  <td>{category.name}</td>
                  <td>{category.slug}</td>
                  <td>
                    <button
                      type="button"
                      onClick={async () => {
                        const name = window.prompt('Category name', category.name);
                        if (!name) return;
                        await api.put(`/categories/${category._id}`, { name });
                        load();
                      }}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        if (!window.confirm('Delete category?')) return;
                        try {
                          await api.delete(`/categories/${category._id}`);
                          load();
                        } catch (err) {
                          setError(errorMessage(err));
                        }
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            {section === 'coupons' &&
              rows.map((coupon) => (
                <tr key={coupon._id}>
                  <td>{coupon.code}</td>
                  <td>
                    {coupon.type === 'percent' ? `${coupon.value}%` : `$${coupon.value}`}
                  </td>
                  <td>{coupon.active ? 'Active' : 'Inactive'}</td>
                  <td>
                    <button
                      type="button"
                      onClick={async () => {
                        await api.put(`/coupons/${coupon._id}`, { active: !coupon.active });
                        load();
                      }}
                    >
                      {coupon.active ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        await api.delete(`/coupons/${coupon._id}`);
                        load();
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            {section === 'reviews' &&
              rows.map((review) => (
                <tr key={review._id}>
                  <td>{review.product?.name}</td>
                  <td>{review.name}</td>
                  <td>{review.rating}</td>
                  <td>{review.comment}</td>
                  <td>
                    <button
                      type="button"
                      onClick={async () => {
                        await api.delete(`/reviews/${review._id}`);
                        load();
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function defaultForm(section) {
  if (section === 'coupons') return { code: '', type: 'percent', value: '', minOrder: '', expiresAt: '' };
  return { name: '', image: '' };
}
