import { useEffect, useState } from 'react'
import { api } from '../../services/api'

const EMPTY = { code: '', type: 'percent', value: 10, expiresAt: '2027-12-31', active: true, minOrder: 0 }

export default function CouponsAdmin() {
  const [coupons, setCoupons] = useState([])
  const [form, setForm] = useState(EMPTY)
  const [error, setError] = useState('')

  const load = () => api('/coupons').then(setCoupons).catch((err) => setError(err.message))
  useEffect(() => {
    load()
  }, [])

  const submit = async (event) => {
    event.preventDefault()
    try {
      await api('/coupons', { method: 'POST', body: form })
      setForm(EMPTY)
      load()
    } catch (err) {
      setError(err.message)
    }
  }

  const toggle = async (coupon) => {
    await api(`/coupons/${coupon._id}`, { method: 'PUT', body: { active: !coupon.active } })
    load()
  }

  const remove = async (coupon) => {
    await api(`/coupons/${coupon._id}`, { method: 'DELETE' })
    load()
  }

  return (
    <div className="admin-page">
      <h1>Coupons</h1>
      {error && <p className="form-error">{error}</p>}
      <form className="form-grid admin-form" onSubmit={submit}>
        <label>
          Code
          <input required value={form.code} onChange={(event) => setForm({ ...form, code: event.target.value })} />
        </label>
        <label>
          Type
          <select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })}>
            <option value="percent">Percentage</option>
            <option value="fixed">Fixed</option>
          </select>
        </label>
        <label>
          Value
          <input type="number" required value={form.value} onChange={(event) => setForm({ ...form, value: Number(event.target.value) })} />
        </label>
        <label>
          Expiry
          <input type="date" required value={form.expiresAt} onChange={(event) => setForm({ ...form, expiresAt: event.target.value })} />
        </label>
        <label>
          Minimum order
          <input type="number" value={form.minOrder} onChange={(event) => setForm({ ...form, minOrder: Number(event.target.value) })} />
        </label>
        <label className="check-line">
          <input type="checkbox" checked={form.active} onChange={(event) => setForm({ ...form, active: event.target.checked })} />
          Active
        </label>
        <button className="btn btn-dark">Create coupon</button>
      </form>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Code</th>
              <th>Discount</th>
              <th>Expires</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((coupon) => (
              <tr key={coupon._id}>
                <td>{coupon.code}</td>
                <td>{coupon.type === 'percent' ? `${coupon.value}%` : `$${coupon.value}`}</td>
                <td>{new Date(coupon.expiresAt).toLocaleDateString()}</td>
                <td>{coupon.active ? 'Active' : 'Inactive'}</td>
                <td className="row-actions">
                  <button type="button" onClick={() => toggle(coupon)}>
                    {coupon.active ? 'Deactivate' : 'Activate'}
                  </button>
                  <button type="button" onClick={() => remove(coupon)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
