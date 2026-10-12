import { useEffect, useState } from 'react'
import { api } from '../../services/api'

export default function ReviewsAdmin() {
  const [reviews, setReviews] = useState([])
  const [error, setError] = useState('')

  const load = () => api('/reviews').then(setReviews).catch((err) => setError(err.message))
  useEffect(() => {
    load()
  }, [])

  const remove = async (review) => {
    await api(`/reviews/${review._id}`, { method: 'DELETE' })
    load()
  }

  return (
    <div className="admin-page">
      <h1>Reviews</h1>
      {error && <p className="form-error">{error}</p>}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Customer</th>
              <th>Rating</th>
              <th>Comment</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {reviews.map((review) => (
              <tr key={review._id}>
                <td>{review.product?.name}</td>
                <td>{review.name}</td>
                <td>{review.rating}</td>
                <td>{review.comment}</td>
                <td>
                  <button type="button" onClick={() => remove(review)}>
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
