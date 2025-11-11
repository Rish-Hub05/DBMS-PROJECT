import { useEffect, useState } from 'react'
import WaterService from '../../services/waterService'
import Toast from '../../components/UI/Toast'
import styles from './water.module.css'

const badgeClass = (status) => {
  switch (status) {
    case 'PENDING': return styles['badge-open']
    case 'IN_PROGRESS': return styles['badge-progress']
    case 'RESOLVED': return styles['badge-success']
    case 'CANCELLED': return styles['badge-danger']
    default: return ''
  }
}

export default function StudentWater() {
  const [issues, setIssues] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [toast, setToast] = useState({ open: false, message: '', type: 'success' })

  const [form, setForm] = useState({
    title: '',
    description: '',
    location: '',
    priority: 'MEDIUM',
    images: '', // comma separated URLs
  })
  const [submitting, setSubmitting] = useState(false)

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await WaterService.getIssues()
      setIssues(data)
    } catch (e) {
      const data = e?.response?.data
      setError(data?.message || data?.error || 'Failed to load issues')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const onSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const payload = {
        title: form.title,
        description: form.description,
        location: form.location,
        priority: form.priority,
      }
      const imgs = form.images.split(',').map(s => s.trim()).filter(Boolean)
      if (imgs.length) payload.images = imgs
      await WaterService.reportIssue(payload)
      setToast({ open: true, message: 'Issue reported', type: 'success' })
      setForm({ title: '', description: '', location: '', priority: 'MEDIUM', images: '' })
      load()
    } catch (e) {
      const data = e?.response?.data
      const msgArr = Array.isArray(data?.error) ? data.error.map(x => x.message) : null
      setToast({ open: true, message: (msgArr && msgArr.join(', ')) || data?.message || data?.error || 'Failed to report issue', type: 'error' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={styles.wrap}>
      <h2>Water Issues</h2>

      <div className={styles.card} style={{ marginBottom: 16 }}>
        <h3 style={{ marginTop: 0 }}>Report an Issue</h3>
        <form onSubmit={onSubmit}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 240 }}>
              <label>Title</label>
              <input className={styles.input} value={form.title} onChange={(e) => setForm(s => ({ ...s, title: e.target.value }))} style={{ width: '100%' }} required />
            </div>
            <div style={{ flex: 1, minWidth: 240 }}>
              <label>Location</label>
              <input className={styles.input} value={form.location} onChange={(e) => setForm(s => ({ ...s, location: e.target.value }))} style={{ width: '100%' }} required />
            </div>
            <div style={{ width: 180 }}>
              <label>Priority</label>
              <select className={styles.input} value={form.priority} onChange={(e) => setForm(s => ({ ...s, priority: e.target.value }))} style={{ width: '100%' }}>
                {['LOW','MEDIUM','HIGH','URGENT'].map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div style={{ marginTop: 12 }}>
            <label>Description</label>
            <textarea className={styles.input} value={form.description} onChange={(e) => setForm(s => ({ ...s, description: e.target.value }))} rows={3} style={{ width: '100%' }} required />
          </div>
          <div style={{ marginTop: 12 }}>
            <button disabled={submitting} className={styles.button}>{submitting ? 'Submitting…' : 'Report Issue'}</button>
          </div>
        </form>
      </div>

      {loading && <div>Loading…</div>}
      {error && <div className={styles.error}>{error}</div>}

      {!loading && !error && (
        <div className={styles.grid}>
          {issues.map(issue => (
            <div key={issue.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <div style={{ fontWeight: 600 }}>{issue.title}</div>
                <span className={`${styles.badge} ${badgeClass(issue.status)}`}>{issue.status}</span>
              </div>
              <div className={styles.muted} style={{ marginTop: 6 }}>{issue.description}</div>
              <div className={styles.meta} style={{ marginTop: 6 }}>Location: {issue.location}</div>
              {Array.isArray(issue.images) && issue.images.length > 0 && (
                <div className={styles.meta} style={{ marginTop: 8, fontSize: 12 }}>Images: {issue.images.length}</div>
              )}
              <div className={styles.meta} style={{ marginTop: 8 }}>Reported: {new Date(issue.createdAt).toLocaleString()}</div>
            </div>
          ))}
          {issues.length === 0 && (
            <div className={styles.muted}>No issues reported yet.</div>
          )}
        </div>
      )}

      <Toast open={toast.open} message={toast.message} type={toast.type} onClose={() => setToast(s => ({ ...s, open: false }))} />
    </div>
  )
}
