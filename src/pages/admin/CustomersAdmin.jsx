import { useEffect, useState } from 'react'
import { api } from '../../services/api'

export default function CustomersAdmin() {
  const [customers, setCustomers] = useState([])
  const [search, setSearch] = useState('')

  const load = () => {
    api(`/users?search=${encodeURIComponent(search)}`)
      .then(setCustomers)
      .catch(() => {})
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <div className="admin-page">
      <h1>Customers</h1>
      <div className="admin-tools">
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search customers" />
        <button type="button" onClick={load}>
          Search
        </button>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Joined</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <tr key={customer._id}>
                <td>{customer.name}</td>
                <td>{customer.email}</td>
                <td>{customer.phone || '—'}</td>
                <td>{new Date(customer.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
