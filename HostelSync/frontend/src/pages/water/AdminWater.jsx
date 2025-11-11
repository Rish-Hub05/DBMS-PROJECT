import { useEffect, useMemo, useState } from 'react'
import WaterService from '../../services/waterService'
import Toast from '../../components/UI/Toast'
import { getRole } from '../../services/auth'
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

export default function AdminWater() {
  const [issues, setIssues] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [toast, setToast] = useState({ open: false, message: '', type: 'success' })

  const [statusFilter, setStatusFilter] = useState('')

  const [modalOpen, setModalOpen] = useState(false)
  const [selected, setSelected] = useState(null)
  const [updateForm, setUpdateForm] = useState({ status: 'IN_PROGRESS', plumberId: '' })
  const [updating, setUpdating] = useState(false)
  const [plumbers, setPlumbers] = useState([])
  const role = (getRole() || '').toLowerCase()

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const params = {}
      if (statusFilter) params.status = statusFilter
      const data = await WaterService.getIssues(params)
      setIssues(data)
    } catch (e) {
      const data = e?.response?.data
      setError(data?.message || data?.error || 'Failed to load issues')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [statusFilter])

  useEffect(() => {
    // Admin only: load plumbers list for assignment
    if (role === 'admin') {
      (async () => {
        try {
          const list = await WaterService.getPlumbers()
          setPlumbers(list)
        } catch {}
      })()
    }
  }, [role])

  const openUpdate = (issue) => {
    setSelected(issue)
    setUpdateForm({ status: issue.status || 'IN_PROGRESS', plumberId: issue.plumberId || '' })
    setModalOpen(true)
  }

  const onUpdate = async (e) => {
    e.preventDefault()
    if (!selected) return
    setUpdating(true)
    try {
      const payload = { status: updateForm.status }
      if (updateForm.plumberId) payload.plumberId = Number(updateForm.plumberId)
      await WaterService.updateIssueStatus(selected.id, payload)
      setToast({ open: true, message: 'Issue updated', type: 'success' })
      setModalOpen(false)
      setSelected(null)
      load()
    } catch (e) {
      const data = e?.response?.data
      const msgArr = Array.isArray(data?.error) ? data.error.map(x => x.message) : null
      setToast({ open: true, message: (msgArr && msgArr.join(', ')) || data?.message || data?.error || 'Failed to update issue', type: 'error' })
    } finally {
      setUpdating(false)
    }
  }

  const list = useMemo(() => issues, [issues])

  return (
    <div className={styles.wrap}>
      <h2>Water Issues Management</h2>

      <div className={styles.actions}>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={styles.input}>
          <option value="">All statuses</option>
          {['PENDING','IN_PROGRESS','RESOLVED','CANCELLED'].map(s => <option key={s} value={s}>{s}</option>)}
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
              <div className={styles.muted} style={{ marginTop: 6 }}>{issue.description}</div>
              <div className={styles.meta} style={{ marginTop: 6 }}>Location: {issue.location}</div>
              <div className={styles.meta} style={{ marginTop: 4 }}>Reported by: {issue.reportedBy?.name || '—'}</div>
              <div className={styles.meta} style={{ marginTop: 2 }}>Assigned to: {issue.assignedTo?.name || (issue.plumberId ? `#${issue.plumberId}` : 'Not assigned')}</div>
              <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
                <button onClick={() => openUpdate(issue)} className={styles.button}>Update</button>
              </div>
            </div>
          ))}
          {list.length === 0 && (
            <div className={styles.muted}>No issues found.</div>
          )}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Update Issue">
        <form onSubmit={onUpdate}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ minWidth: 200, flex: 1 }}>
              <label>Status</label>
              <select value={updateForm.status} onChange={(e) => setUpdateForm(s => ({ ...s, status: e.target.value }))} className={styles.input} style={{ width: '100%' }}>
                {['PENDING','IN_PROGRESS','RESOLVED','CANCELLED'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            {role === 'admin' && (
              <div style={{ minWidth: 200, flex: 1 }}>
                <label>Assign plumber</label>
                <select value={updateForm.plumberId} onChange={(e) => setUpdateForm(s => ({ ...s, plumberId: e.target.value }))} className={styles.input} style={{ width: '100%' }}>
                  <option value="">Not assigned</option>
                  {plumbers.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.email})</option>
                  ))}
                </select>
              </div>
            )}
          </div>
          <div style={{ marginTop: 12, textAlign: 'right' }}>
            <button disabled={updating} className={styles.button}>{updating ? 'Saving…' : 'Save'}</button>
          </div>
        </form>
      </Modal>

      <Toast open={toast.open} message={toast.message} type={toast.type} onClose={() => setToast(s => ({ ...s, open: false }))} />
    </div>
  )
}
