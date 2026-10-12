import { Link, NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const LINKS = [
  ['Overview', '/admin'],
  ['Products', '/admin/products'],
  ['Orders', '/admin/orders'],
  ['Customers', '/admin/customers'],
  ['Categories', '/admin/categories'],
  ['Coupons', '/admin/coupons'],
  ['Reviews', '/admin/reviews'],
]

export default function AdminLayout() {
  const { user, logout } = useAuth()

  return (
    <div className="admin-shell">
      <aside className="admin-side">
        <Link to="/" className="logo light">
          <span className="logo-mark" /> VELORA
        </Link>
        <p className="admin-label">Studio</p>
        <nav>
          {LINKS.map(([label, to]) => (
            <NavLink key={to} to={to} end={to === '/admin'}>
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="admin-main">
        <header>
          <span>{user?.name}</span>
          <div>
            <Link to="/">View store</Link>
            <button type="button" onClick={logout}>
              Logout
            </button>
          </div>
        </header>
        <Outlet />
      </div>
    </div>
  )
}
