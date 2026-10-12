import { useEffect, useState } from 'react'
import { api } from '../../services/api'

const EMPTY = { name: '', slug: '', image: '', description: '' }

export default function CategoriesAdmin() {
  const [categories, setCategories] = useState([])
  const [form, setForm] = useState(EMPTY)
  const [editing, setEditing] = useState(null)
  const [error, setError] = useState('')

  const load = () => api('/categories').then(setCategories).catch((err) => setError(err.message))
  useEffect(() => {
    load()
  }, [])

  const submit = async (event) => {
    event.preventDefault()
    try {
      if (editing) await api(`/categories/${editing}`, { method: 'PUT', body: form })
      else await api('/categories', { method: 'POST', body: form })
      setForm(EMPTY)
      setEditing(null)
      load()
    } catch (err) {
      setError(err.message)
    }
  }

  const remove = async (category) => {
    if (!window.confirm(`Delete ${category.name}?`)) return
    try {
      await api(`/categories/${category._id}`, { method: 'DELETE' })
      load()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="admin-page">
      <h1>Categories</h1>
      {error && <p className="form-error">{error}</p>}
      <form className="stack admin-form" onSubmit={submit}>
        <label>
          Name
          <input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
        </label>
        <label>
          Slug
          <input value={form.slug} onChange={(event) => setForm({ ...form, slug: event.target.value })} />
        </label>
        <label>
          Image URL
          <input value={form.image} onChange={(event) => setForm({ ...form, image: event.target.value })} />
        </label>
        <label>
          Description
          <input value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
        </label>
        <button className="btn btn-dark">{editing ? 'Update category' : 'Add category'}</button>
      </form>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Slug</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category._id}>
                <td>{category.name}</td>
                <td>{category.slug}</td>
                <td className="row-actions">
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(category._id)
                      setForm({
                        name: category.name,
                        slug: category.slug,
                        image: category.image,
                        description: category.description,
                      })
                    }}
                  >
                    Edit
                  </button>
                  <button type="button" onClick={() => remove(category)}>
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
