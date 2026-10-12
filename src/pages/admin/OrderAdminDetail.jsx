import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '../../services/api'
import { money, ORDER_STATUSES } from '../../utils/format'

export default function OrderAdminDetail() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api(`/orders/${id}`)
      .then(setOrder)
      .catch((err) => setError(err.message))
  }, [id])

  const updateStatus = async (status) => {
    const saved = await api(`/orders/${id}/status`, { method: 'PUT', body: { status } })
    setOrder(saved)
  }

  if (error) return <p className="form-error">{error}</p>
  if (!order) return <p>Loading order…</p>
  const address = order.shippingAddress || {}

  return (
    <div className="admin-page">
      <h1>{order.orderNumber}</h1>
      <label>
        Status
        <select value={order.status} onChange={(event) => updateStatus(event.target.value)}>
          {ORDER_STATUSES.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
      </label>
      <p>
        {address.firstName} {address.lastName} · {address.email} · {address.phone}
      </p>
      <p>
        {address.address}, {address.city} {address.postalCode}
      </p>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Size</th>
              <th>Color</th>
              <th>Qty</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item, index) => (
              <tr key={`${item.name}-${index}`}>
                <td>{item.name}</td>
                <td>{item.size}</td>
                <td>{item.color}</td>
                <td>{item.qty}</td>
                <td>{money(item.price)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p>Subtotal {money(order.itemsPrice)}</p>
      <p>Shipping {money(order.shippingPrice)}</p>
      <p>Discount {money(order.discount)}</p>
      <p>
        <strong>Total {money(order.totalPrice)}</strong>
      </p>
    </div>
  )
}
