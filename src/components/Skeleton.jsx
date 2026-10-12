export function ProductGridSkeleton({ count = 8 }) {
  return (
    <div className="product-grid" aria-hidden="true">
      {Array.from({ length: count }).map((_, index) => (
        <div className="skeleton-card" key={index}>
          <div className="skeleton media" />
          <div className="skeleton line" />
          <div className="skeleton line short" />
        </div>
      ))}
    </div>
  )
}

export function PageSkeleton() {
  return (
    <div className="page">
      <div className="skeleton line title" />
      <div className="skeleton block" />
    </div>
  )
}
