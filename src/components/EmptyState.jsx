import { Link } from 'react-router-dom'

export default function EmptyState({ title, text, action, to = '/shop' }) {
  return (
    <div className="empty">
      <p className="eyebrow">VELORA</p>
      <h2>{title}</h2>
      <p>{text}</p>
      {action && (
        <Link className="btn btn-dark" to={to}>
          {action}
        </Link>
      )}
    </div>
  )
}
