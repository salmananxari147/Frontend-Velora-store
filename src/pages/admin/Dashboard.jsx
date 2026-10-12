import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, errorMessage } from '../../services/api';
import { formatDate, money } from '../../utils/format';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    document.title = 'Admin — VELORA';
    api.get('/orders/stats').then((res) => setStats(res.data)).catch((err) => setError(errorMessage(err)));
  }, []);

  if (error) return <p className="form-error">{error}</p>;
  if (!stats) return <p>Loading studio…</p>;
  const max = Math.max(...stats.sales.map((item) => item.total), 1);

  return (
    <div>
      <header className="page-head">
        <p className="eyebrow">Overview</p>
        <h1>Studio</h1>
      </header>
      <div className="stat-grid">
        <article>
          <span>Products</span>
          <strong>{stats.totalProducts}</strong>
        </article>
        <article>
          <span>Orders</span>
          <strong>{stats.totalOrders}</strong>
        </article>
        <article>
          <span>Customers</span>
          <strong>{stats.totalCustomers}</strong>
        </article>
        <article>
          <span>Pending</span>
          <strong>{stats.pendingOrders}</strong>
        </article>
        <article>
          <span>Confirmed</span>
          <strong>{stats.confirmedOrders}</strong>
        </article>
        <article>
          <span>Revenue</span>
          <strong>{money(stats.revenue)}</strong>
        </article>
      </div>
      <div className="admin-charts">
        <section className="panel">
          <h2>Sales overview</h2>
          <div className="bars">
            {stats.sales.map((item) => (
              <div key={item.label}>
                <div style={{ height: `${Math.max(8, (item.total / max) * 140)}px` }} />
                <span>{item.label}</span>
                <small>{money(item.total)}</small>
              </div>
            ))}
          </div>
        </section>
        <section className="panel">
          <h2>Orders overview</h2>
          {stats.statuses.map((item) => (
            <p key={item.status} className="status-row">
              <span>{item.status}</span>
              <span className="bar">
                <i style={{ width: `${stats.totalOrders ? (item.count / stats.totalOrders) * 100 : 0}%` }} />
              </span>
              <strong>{item.count}</strong>
            </p>
          ))}
        </section>
      </div>
      <div className="recent-grid">
        <section className="panel">
          <h2>Recent orders</h2>
          <div className="recent-list">
            {(stats.recentOrders || []).map((order) => (
              <Link key={order._id} to={`/admin/orders/${order._id}`}>
                <span className="recent-copy">
                  <strong>{order.orderNumber}</strong>
                  <span>{order.customer || 'Customer'}</span>
                </span>
                <span>
                  {order.status} · {money(order.totalPrice)}
                </span>
              </Link>
            ))}
            {!stats.recentOrders?.length && <p className="muted">No orders yet.</p>}
          </div>
          <p className="fine">{stats.recentOrders?.[0] ? formatDate(stats.recentOrders[0].createdAt) : ''}</p>
        </section>
        <section className="panel">
          <h2>Recent products</h2>
          <div className="recent-list">
            {(stats.recentProducts || []).map((product) => (
              <Link key={product._id} to={`/admin/products/${product._id}/edit`}>
                <img src={product.image} alt="" />
                <span className="recent-copy">
                  <strong>{product.name}</strong>
                  <span>Stock {product.stock}</span>
                </span>
                <strong>{money(product.price)}</strong>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
