import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, errorMessage } from '../../services/api';
import { formatDate, money } from '../../utils/format';

const statuses = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

export default function OrdersAdmin() {
  const { id } = useParams();
  const [orders, setOrders] = useState([]);
  const [order, setOrder] = useState(null);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  const load = () => {
    api
      .get('/orders', { params: { search: search || undefined, status: status || undefined } })
      .then((res) => setOrders(res.data))
      .catch((err) => setError(errorMessage(err)));
  };

  useEffect(() => {
    const timer = setTimeout(load, 200);
    return () => clearTimeout(timer);
  }, [search, status]);

  useEffect(() => {
    if (!id) {
      setOrder(null);
      return;
    }
    api.get(`/orders/${id}`).then((res) => setOrder(res.data)).catch((err) => setError(errorMessage(err)));
  }, [id]);

  return (
    <div>
      <header className="page-head">
        <p className="eyebrow">Orders</p>
        <h1>{order ? order.orderNumber : 'All orders'}</h1>
      </header>
      {error && <p className="form-error">{error}</p>}
      {order ? (
        <div className="panel">
          <p className={`status ${order.status.toLowerCase()}`}>{order.status}</p>
          <p>
            {order.shippingAddress.firstName} {order.shippingAddress.lastName} · {order.shippingAddress.email}
          </p>
          <p>
            {order.shippingAddress.address}, {order.shippingAddress.city} {order.shippingAddress.postalCode}
          </p>
          <ul className="plain-list">
            {order.items.map((item, index) => (
              <li key={index}>
                {item.name} · size {item.size} · {item.color} × {item.qty} — {money(item.price * item.qty)}
              </li>
            ))}
          </ul>
          <p>
            <strong>Total {money(order.totalPrice)}</strong>
          </p>
          <label className="field">
            Status
            <select
              value={order.status}
              onChange={async (event) => {
                const { data } = await api.patch(`/orders/${order._id}/status`, { status: event.target.value });
                setOrder(data);
                load();
              }}
            >
              {statuses.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <Link to="/admin/orders" className="text-link">
            Back to orders
          </Link>
        </div>
      ) : (
        <>
          <div className="admin-tools">
            <input placeholder="Search order, email, or name" value={search} onChange={(event) => setSearch(event.target.value)} />
            <select value={status} onChange={(event) => setStatus(event.target.value)}>
              <option value="">All statuses</option>
              {statuses.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </div>
          <div className="table-wrap">
            <table className="data">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((item) => (
                  <tr key={item._id}>
                    <td>
                      <Link to={`/admin/orders/${item._id}`}>{item.orderNumber}</Link>
                    </td>
                    <td>{item.shippingAddress?.email}</td>
                    <td>{formatDate(item.createdAt)}</td>
                    <td>{money(item.totalPrice)}</td>
                    <td>{item.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
