import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { api } from '../services/api';
import { money } from '../utils/format';

export default function OrderSuccess() {
  const { id } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState(location.state?.order || null);

  useEffect(() => {
    document.title = 'Order placed — VELORA';
    if (!order) {
      api.get(`/orders/${id}`).then((res) => setOrder(res.data)).catch(() => {});
    }
  }, [id, order]);

  if (!order) return <div className="container page-head"><h1>Loading order…</h1></div>;
  const address = order.shippingAddress;

  return (
    <div className="container success">
      <p className="eyebrow">VELORA</p>
      <h1>Order placed</h1>
      <p className="lede">We&apos;re preparing your pair. A confirmation is tied to this order number.</p>
      <div className="success-card">
        <p>
          <span>Order number</span>
          <strong>{order.orderNumber}</strong>
        </p>
        <p>
          <span>Total</span>
          <strong>{money(order.totalPrice)}</strong>
        </p>
        <p>
          <span>Delivering to</span>
          <strong>
            {address.firstName} {address.lastName}, {address.address}, {address.city} {address.postalCode}
          </strong>
        </p>
        <p>
          <span>Payment</span>
          <strong>Cash on Delivery</strong>
        </p>
      </div>
      <Link to="/account?tab=orders" className="btn btn-dark">
        View My Orders
      </Link>
    </div>
  );
}
