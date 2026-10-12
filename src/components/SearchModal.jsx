import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../services/api'
import { useDebounced } from '../hooks/useUi'
import { money } from '../utils/format'

export default function SearchModal({ open, onClose }) {
  const [term, setTerm] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const debounced = useDebounced(term, 280)

  useEffect(() => {
    if (!open) return undefined
    const onKey = (event) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  useEffect(() => {
    if (!open) return undefined
    if (!debounced.trim()) {
      setResults([])
      return undefined
    }
    let ignore = false
    setLoading(true)
    api(`/products?search=${encodeURIComponent(debounced)}&limit=6`)
      .then((data) => {
        if (!ignore) setResults(data.products || [])
      })
      .catch(() => {
        if (!ignore) setResults([])
      })
      .finally(() => {
        if (!ignore) setLoading(false)
      })
    return () => {
      ignore = true
    }
  }, [debounced, open])

  if (!open) return null

  return (
    <div className="search-modal">
      <button type="button" className="drawer-backdrop" aria-label="Close search" onClick={onClose} />
      <div className="search-panel">
        <input
          autoFocus
          value={term}
          onChange={(event) => setTerm(event.target.value)}
          placeholder="Search men's footwear"
          aria-label="Search products"
        />
        <div className="search-results">
          {loading && <p className="muted">Searching…</p>}
          {!loading && debounced && results.length === 0 && <p className="muted">No pairs match that search.</p>}
          {results.map((product) => (
            <Link key={product._id} to={`/product/${product.slug}`} onClick={onClose}>
              <img src={product.images?.[0]} alt="" />
              <span>
                <strong>{product.name}</strong>
                <em>{money(product.price)}</em>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
