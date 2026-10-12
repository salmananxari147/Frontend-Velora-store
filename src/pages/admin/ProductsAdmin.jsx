import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, errorMessage } from '../../services/api';
import { money } from '../../utils/format';

export default function ProductsAdmin() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');

  const load = () => {
    api
      .get('/products', { params: { search, category: category || undefined, limit: 48 } })
      .then((res) => setProducts(res.data.products))
      .catch((err) => setError(errorMessage(err)));
  };

  useEffect(() => {
    api.get('/categories').then((res) => setCategories(res.data));
  }, []);

  useEffect(() => {
    const timer = setTimeout(load, 200);
    return () => clearTimeout(timer);
  }, [search, category]);

  return (
    <div>
      <header className="page-head row">
        <div>
          <p className="eyebrow">Catalog</p>
          <h1>Products</h1>
        </div>
        <Link to="/admin/products/new" className="btn btn-orange">
          Add product
        </Link>
      </header>
      {error && <p className="form-error">{error}</p>}
      <div className="admin-tools">
        <input placeholder="Search products" value={search} onChange={(event) => setSearch(event.target.value)} />
        <select value={category} onChange={(event) => setCategory(event.target.value)}>
          <option value="">All categories</option>
          {categories.map((item) => (
            <option key={item._id} value={item.slug}>
              {item.name}
            </option>
          ))}
        </select>
      </div>
      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product._id}>
                <td className="product-cell">
                  <img src={product.images[0]} alt="" />
                  {product.name}
                </td>
                <td>{product.category?.name}</td>
                <td>{money(product.price)}</td>
                <td>
                  <input
                    className="stock-input"
                    type="number"
                    min="0"
                    defaultValue={product.stock}
                    onBlur={async (event) => {
                      const stock = Number(event.target.value);
                      if (stock === product.stock) return;
                      await api.patch(`/products/${product._id}/stock`, { stock });
                      load();
                    }}
                  />
                </td>
                <td className="row-actions">
                  <Link to={`/admin/products/${product._id}/edit`}>Edit</Link>
                  <button
                    type="button"
                    onClick={async () => {
                      if (!window.confirm(`Delete ${product.name}?`)) return;
                      await api.delete(`/products/${product._id}`);
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
