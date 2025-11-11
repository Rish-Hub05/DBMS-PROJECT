import { useEffect, useMemo, useState } from 'react'
import CleaningService from '../../services/cleaningService'
import Toast from '../../components/UI/Toast'
import styles from './cleaning.module.css'

const badgeClass = (status) => {
  switch (status) {
    case 'PENDING': return styles['badge-pending']
    case 'ASSIGNED': return styles['badge-assigned']
    case 'IN_PROGRESS': return styles['badge-progress']
    case 'COMPLETED': return styles['badge-completed']
    case 'CANCELLED': return styles['badge-cancelled']
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

export default function AdminCleaning() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [toast, setToast] = useState({ open: false, message: '', type: 'success' })

  const [status, setStatus] = useState('')
  const [building, setBuilding] = useState('')
  const [cleanerId, setCleanerId] = useState('')
  const [cleaners, setCleaners] = useState([])

  const [modalOpen, setModalOpen] = useState(false)
  const [selected, setSelected] = useState(null)
  const [updateForm, setUpdateForm] = useState({ status: 'ASSIGNED', cleanerId: '' })
  const [updating, setUpdating] = useState(false)

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const params = {}
      if (status) params.status = status
      if (building) params.building = building
      if (cleanerId) params.cleanerId = cleanerId
      const data = await CleaningService.getRequests(params)
      setRequests(data)
    } catch (e) {
      const data = e?.response?.data
      setError(data?.message || data?.error || 'Failed to load requests')
    } finally {
      setLoading(false)
    }
  }

  const loadCleaners = async () => {
    try {
      const res = await CleaningService.getCleaners()
      const arr = res?.data || []
      setCleaners(arr)
    } catch (e) {
      // non-blocking
    }
  }

  useEffect(() => { load(); loadCleaners() }, [])
  useEffect(() => { load() }, [status, building, cleanerId])

  const openUpdate = (req) => {
    setSelected(req)
    setUpdateForm({ status: req.status || 'ASSIGNED', cleanerId: req.cleaner?.id || '' })
    setModalOpen(true)
  }

  const onUpdate = async (e) => {
    e.preventDefault()
    if (!selected) return
    setUpdating(true)
    try {
      const payload = {}
      if (updateForm.status) payload.status = updateForm.status
      if (updateForm.cleanerId) payload.cleanerId = Number(updateForm.cleanerId)
      await CleaningService.updateRequestStatus(selected.id, payload)
      setToast({ open: true, message: 'Request updated', type: 'success' })
      setModalOpen(false)
      setSelected(null)
      load()
    } catch (e) {
      const data = e?.response?.data
      const msgArr = Array.isArray(data?.error) ? data.error.map(x => x.message) : null
      setToast({ open: true, message: (msgArr && msgArr.join(', ')) || data?.message || data?.error || 'Failed to update', type: 'error' })
    } finally {
      setUpdating(false)
    }
  }

  const list = useMemo(() => requests, [requests])

  return (
    <div className={styles.wrap}>
      <h2>Cleaning Management</h2>

      <div className={styles.actions}>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className={styles.input}>
          <option value="">All statuses</option>
          {['PENDING','ASSIGNED','IN_PROGRESS','COMPLETED','CANCELLED'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <input value={building} onChange={(e) => setBuilding(e.target.value)} placeholder="Filter building" className={styles.input} />
        <select value={cleanerId} onChange={(e) => setCleanerId(e.target.value)} className={styles.input}>
          <option value="">Any cleaner</option>
          {cleaners.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <button onClick={load} className={styles.button}>Refresh</button>
      </div>

      {loading && <div>Loading…</div>}
      {error && <div className={styles.error}>{error}</div>}

      {!loading && !error && (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead className={styles.thead}>
              <tr>
                <th>When</th>
                <th>Student</th>
                <th>Location</th>
                <th>Type</th>
                <th>Cleaner</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.map(req => (
                <tr key={req.id}>
                  <td className={styles.td}>{new Date(req.scheduledDate).toLocaleString()}</td>
                  <td className={styles.td}>{req.student?.name}</td>
                  <td className={styles.td}>{req.building}, Room {req.room}</td>
                  <td className={styles.td}>{req.cleaningType}</td>
                  <td className={styles.td}>{req.cleaner?.name || '—'}</td>
                  <td className={styles.td}><span className={`${styles.badge} ${badgeClass(req.status)}`}>{req.status}</span></td>
                  <td className={styles.td}>
                    <button onClick={() => openUpdate(req)} className={styles.button}>Details</button>
                  </td>
                </tr>
              ))}
              {list.length === 0 && (
                <tr>
                  <td colSpan={7} className={styles.td} style={{ textAlign: 'center' }}><span className={styles.muted}>No requests</span></td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Request Details">
        {selected && (
          <div>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontWeight: 600, fontSize: 16 }}>{selected.cleaningType} Cleaning</div>
              <div className={styles.muted}>{selected.building}, Room {selected.room}</div>
              <div className={styles.meta}>Scheduled: {new Date(selected.scheduledDate).toLocaleString()}</div>
              <div className={styles.meta}>Student: {selected.student?.name} ({selected.student?.roomNo})</div>
            </div>
            <form onSubmit={onUpdate}>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <div style={{ minWidth: 200, flex: 1 }}>
                  <label>Status</label>
                  <select value={updateForm.status} onChange={(e) => setUpdateForm(s => ({ ...s, status: e.target.value }))} className={styles.input} style={{ width: '100%' }}>
                    {['PENDING','ASSIGNED','IN_PROGRESS','COMPLETED','CANCELLED'].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div style={{ minWidth: 200, flex: 1 }}>
                  <label>Assign Cleaner</label>
                  <select value={updateForm.cleanerId} onChange={(e) => setUpdateForm(s => ({ ...s, cleanerId: e.target.value }))} className={styles.input} style={{ width: '100%' }}>
                    <option value="">Unassigned</option>
                    {cleaners.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ marginTop: 12, textAlign: 'right' }}>
                <button disabled={updating} className={styles.button}>{updating ? 'Saving…' : 'Save'}</button>
              </div>
            </form>
          </div>
        )}
      </Modal>

      <Toast open={toast.open} message={toast.message} type={toast.type} onClose={() => setToast(s => ({ ...s, open: false }))} />
    </div>
  )
}
