import { useEffect, useMemo, useState } from 'react'
import NetworkService from '../../services/networkService'
import Toast from '../../components/UI/Toast'
import { getRole } from '../../services/auth'
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

const Modal = ({ open, onClose, children, title }) => {
  if (!open) return null
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.modalTitle}>{title}</div>
        <div className={styles.modalBody}>{children}</div>
        <div className={styles.modalFooter}>
          <button onClick={onClose} className={styles.button}>Close</button>
        </div>
      </div>
    </div>
  )
}

export default function AdminNetwork() {
  const [issues, setIssues] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [toast, setToast] = useState({ open: false, message: '', type: 'success' })

  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')

  const [modalOpen, setModalOpen] = useState(false)
  const [selected, setSelected] = useState(null)
  const [updateForm, setUpdateForm] = useState({ status: 'IN_PROGRESS', assignedToId: '' })
  const [maintenanceNote, setMaintenanceNote] = useState('')
  const [pending, setPending] = useState(false)
  const [itStaff, setItStaff] = useState([])
  const role = (getRole() || '').toLowerCase()

  const [comments, setComments] = useState([])
  const [loadingComments, setLoadingComments] = useState(false)

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const params = {}
      if (statusFilter) params.status = statusFilter
      if (typeFilter) params.type = typeFilter
      const data = await NetworkService.getIssues(params)
      setIssues(data)
    } catch (e) {
      const data = e?.response?.data
      setError(data?.message || data?.error || 'Failed to load issues')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [statusFilter, typeFilter])

  const openUpdate = async (issue) => {
    setSelected(issue)
    setUpdateForm({ status: issue.status || 'IN_PROGRESS', assignedToId: issue.assignedToId || '' })
    setMaintenanceNote('')
    setModalOpen(true)
    setLoadingComments(true)
    try {
      const cs = await NetworkService.getComments(issue.id)
      setComments(cs)
      // Load IT staff for admin to assign
      if (role === 'admin') {
        try {
          const staff = await NetworkService.getItStaff()
          setItStaff(staff)
        } catch {}
      }
    } catch (e) { /* ignore */ } finally { setLoadingComments(false) }
  }

  const onUpdate = async (e) => {
    e.preventDefault()
    if (!selected) return
    setPending(true)
    try {
      const payload = {}
      if (updateForm.status) payload.status = updateForm.status
      if (updateForm.assignedToId) payload.assignedToId = Number(updateForm.assignedToId)
      if (Object.keys(payload).length) {
        await NetworkService.updateIssue(selected.id, payload)
      }
      if (maintenanceNote.trim()) {
        await NetworkService.addComment(selected.id, { content: maintenanceNote.trim() })
      }
      setToast({ open: true, message: 'Issue updated', type: 'success' })
      setModalOpen(false)
      setSelected(null)
      load()
    } catch (e) {
      const data = e?.response?.data
      const msgArr = Array.isArray(data?.error) ? data.error.map(x => x.message) : null
      setToast({ open: true, message: (msgArr && msgArr.join(', ')) || data?.message || data?.error || 'Failed to update', type: 'error' })
    } finally {
      setPending(false)
    }
  }

  const list = useMemo(() => issues, [issues])

  return (
    <div className={styles.wrap}>
      <h2>Network Issues Management</h2>

      <div className={styles.actions}>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={styles.input}>
          <option value="">All statuses</option>
          {['OPEN','IN_PROGRESS','RESOLVED','CANCELLED'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className={styles.input}>
          <option value="">All types</option>
          {['CONNECTIVITY','SPEED','AUTHENTICATION','OTHER'].map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <button onClick={load} className={styles.button}>Refresh</button>
      </div>

      {loading && <div>Loading…</div>}
      {error && <div className={styles.error}>{error}</div>}

      {!loading && !error && (
        <div className={styles.grid}>
          {list.map(issue => (
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
                  <button onClick={() => openUpdate(issue)} className={styles.button} style={{ alignSelf: 'start' }}>Open</button>
                </div>
              </div>
            </div>
          ))}
          {list.length === 0 && (
            <div className={styles.muted}>No issues found.</div>
          )}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={selected ? `Update: ${selected.title}` : 'Update Issue'}>
        {selected && (
          <form onSubmit={onUpdate}>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <div style={{ minWidth: 200, flex: 1 }}>
                <label>Status</label>
                <select value={updateForm.status} onChange={(e) => setUpdateForm(s => ({ ...s, status: e.target.value }))} className={styles.input} style={{ width: '100%' }}>
                  {['OPEN','IN_PROGRESS','RESOLVED','CANCELLED'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              {role === 'admin' && (
                <div style={{ minWidth: 200, flex: 1 }}>
                  <label>Assign to IT staff</label>
                  <select value={updateForm.assignedToId} onChange={(e) => setUpdateForm(s => ({ ...s, assignedToId: e.target.value }))} className={styles.input} style={{ width: '100%' }}>
                    <option value="">Not assigned</option>
                    {itStaff.map(u => (
                      <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div style={{ marginTop: 12 }}>
              <label>Maintenance Note (adds comment)</label>
              <textarea value={maintenanceNote} onChange={(e) => setMaintenanceNote(e.target.value)} rows={3} className={styles.input} style={{ width: '100%' }} placeholder="What did you check/fix?" />
            </div>

            <div style={{ marginTop: 12 }}>
              <div style={{ fontWeight: 600, marginBottom: 6 }}>Comments</div>
              {loadingComments ? (
                <div>Loading…</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 220, overflow: 'auto' }}>
                  {comments.map(c => <CommentCard key={c.id} c={c} />)}
                  {comments.length === 0 && <div className={styles.muted}>No comments yet.</div>}
                </div>
              )}
            </div>

            <div style={{ marginTop: 12, textAlign: 'right' }}>
              <button disabled={pending} className={styles.button}>{pending ? 'Saving…' : 'Save'}</button>
            </div>
          </form>
        )}
      </Modal>

      <Toast open={toast.open} message={toast.message} type={toast.type} onClose={() => setToast(s => ({ ...s, open: false }))} />
    </div>
  )
}
