import { useEffect, useState } from 'react'
import NetworkService from '../../services/networkService'
import Toast from '../../components/UI/Toast'
import styles from './network.module.css'

const badgeClass = (status) => {
  switch (status) {
    case 'OPEN': return styles['badge-open']
    case 'IN_PROGRESS': return styles['badge-progress']
    case 'RESOLVED': return styles['badge-success']
    case 'CANCELLED': return styles['badge-danger']
    default: return ''
  }
}

const CommentCard = ({ c }) => (
  <div className={styles.commentCard}>
    <div className={styles.commentText}>{c.content}</div>
    <div className={styles.commentMeta}>{new Date(c.createdAt).toLocaleString()} • {c.author?.name || ''}</div>
  </div>
)

export default function StudentNetwork() {
  const [issues, setIssues] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [toast, setToast] = useState({ open: false, message: '', type: 'success' })

  const [form, setForm] = useState({
    title: '',
    description: '',
    issueType: 'CONNECTIVITY',
    priority: 'MEDIUM',
    ipAddress: '',
    macAddress: '',
    location: '', // UI only, appended into description
    device: '',   // UI only
  })
  const [submitting, setSubmitting] = useState(false)

  const [comments, setComments] = useState({}) // id -> array
  const [newComment, setNewComment] = useState({}) // id -> text
  const [loadingComments, setLoadingComments] = useState({}) // id -> boolean
  const [addingComment, setAddingComment] = useState({}) // id -> boolean

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await NetworkService.getIssues()
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
      let desc = form.description
      const extras = []
      if (form.location) extras.push(`Location: ${form.location}`)
      if (form.device) extras.push(`Device: ${form.device}`)
      if (extras.length) desc = `${desc}\n\n${extras.join(' | ')}`
      const payload = {
        title: form.title,
        description: desc,
        issueType: form.issueType,
        priority: form.priority,
        ipAddress: form.ipAddress || undefined,
        macAddress: form.macAddress || undefined,
      }
      await NetworkService.reportIssue(payload)
      setToast({ open: true, message: 'Issue reported', type: 'success' })
      setForm({ title: '', description: '', issueType: 'CONNECTIVITY', priority: 'MEDIUM', ipAddress: '', macAddress: '', location: '', device: '' })
      load()
    } catch (e) {
      const data = e?.response?.data
      const msgArr = Array.isArray(data?.error) ? data.error.map(x => x.message) : null
      setToast({ open: true, message: (msgArr && msgArr.join(', ')) || data?.message || data?.error || 'Failed to report issue', type: 'error' })
    } finally {
      setSubmitting(false)
    }
  }

  const fetchComments = async (id) => {
    setLoadingComments(s => ({ ...s, [id]: true }))
    try {
      const data = await NetworkService.getComments(id)
      setComments(s => ({ ...s, [id]: data }))
    } catch (e) {
      // ignore per-card error, can toast if desired
    } finally {
      setLoadingComments(s => ({ ...s, [id]: false }))
    }
  }

  const addComment = async (id) => {
    const content = (newComment[id] || '').trim()
    if (!content) return
    setAddingComment(s => ({ ...s, [id]: true }))
    try {
      await NetworkService.addComment(id, { content })
      setNewComment(s => ({ ...s, [id]: '' }))
      fetchComments(id)
    } catch (e) {
      const data = e?.response?.data
      setToast({ open: true, message: data?.message || data?.error || 'Failed to add comment', type: 'error' })
    } finally {
      setAddingComment(s => ({ ...s, [id]: false }))
    }
  }

  return (
    <div className={styles.wrap}>
      <h2>Network Issues</h2>

      <div className={styles.card} style={{ marginBottom: 16 }}>
        <h3 style={{ marginTop: 0 }}>Report an Issue</h3>
        <form onSubmit={onSubmit}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ minWidth: 240, flex: 1 }}>
              <label>Title</label>
              <input className={styles.input} value={form.title} onChange={(e) => setForm(s => ({ ...s, title: e.target.value }))} style={{ width: '100%' }} required />
            </div>
            <div style={{ width: 220 }}>
              <label>Type</label>
              <select className={styles.input} value={form.issueType} onChange={(e) => setForm(s => ({ ...s, issueType: e.target.value }))} style={{ width: '100%' }}>
                {['CONNECTIVITY','SPEED','AUTHENTICATION','OTHER'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div style={{ width: 180 }}>
              <label>Priority</label>
              <select className={styles.input} value={form.priority} onChange={(e) => setForm(s => ({ ...s, priority: e.target.value }))} style={{ width: '100%' }}>
                {['LOW','MEDIUM','HIGH','CRITICAL'].map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div style={{ marginTop: 12 }}>
            <label>Description</label>
            <textarea className={styles.input} value={form.description} onChange={(e) => setForm(s => ({ ...s, description: e.target.value }))} rows={3} style={{ width: '100%' }} required />
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 12 }}>
            <div style={{ width: 200 }}>
              <label>Location (optional)</label>
              <input className={styles.input} value={form.location} onChange={(e) => setForm(s => ({ ...s, location: e.target.value }))} style={{ width: '100%' }} />
            </div>
            <div style={{ width: 200 }}>
              <label>Device (optional)</label>
              <input className={styles.input} value={form.device} onChange={(e) => setForm(s => ({ ...s, device: e.target.value }))} style={{ width: '100%' }} />
            </div>
            <div style={{ width: 180 }}>
              <label>IP (optional)</label>
              <input className={styles.input} value={form.ipAddress} onChange={(e) => setForm(s => ({ ...s, ipAddress: e.target.value }))} style={{ width: '100%' }} placeholder="192.168.0.10" />
            </div>
            <div style={{ width: 220 }}>
              <label>MAC (optional)</label>
              <input className={styles.input} value={form.macAddress} onChange={(e) => setForm(s => ({ ...s, macAddress: e.target.value }))} style={{ width: '100%' }} placeholder="AA:BB:CC:DD:EE:FF" />
            </div>
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
              <div className={styles.muted}>{issue.description}</div>
              <div className={styles.meta}>Reported: {new Date(issue.createdAt).toLocaleString()}</div>

              <div style={{ marginTop: 6 }}>
                <div style={{ fontWeight: 600, marginBottom: 6 }}>Comments</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {(comments[issue.id] || []).map(c => (
                    <CommentCard key={c.id} c={c} />
                  ))}
                  {!comments[issue.id] && (
                    <button onClick={() => fetchComments(issue.id)} className={styles.button} style={{ alignSelf: 'start' }}>
                      {loadingComments[issue.id] ? 'Loading…' : 'Load comments'}
                    </button>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                <input className={styles.input}
                  value={newComment[issue.id] || ''}
                  onChange={(e) => setNewComment(s => ({ ...s, [issue.id]: e.target.value }))}
                  placeholder="Add a comment"
                  style={{ flex: 1 }}
                />
                <button onClick={() => addComment(issue.id)} disabled={addingComment[issue.id]} className={styles.button}>
                  {addingComment[issue.id] ? 'Adding…' : 'Add'}
                </button>
              </div>
            </div>
          ))}
          {issues.length === 0 && (
            <div className={styles.muted}>No issues yet.</div>
          )}
        </div>
      )}

      <Toast open={toast.open} message={toast.message} type={toast.type} onClose={() => setToast(s => ({ ...s, open: false }))} />
    </div>
  )
}
