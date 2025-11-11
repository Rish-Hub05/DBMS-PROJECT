import { useEffect, useState } from 'react'
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

export default function StudentCleaning() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [toast, setToast] = useState({ open: false, message: '', type: 'success' })

  const [form, setForm] = useState({
    room: '',
    building: '',
    cleaningType: 'REGULAR',
    scheduledDate: '',
    startTime: '',
    endTime: '',
    specialInstructions: '',
  })
  const [submitting, setSubmitting] = useState(false)

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await CleaningService.getMyRequests()
      setRequests(data)
    } catch (e) {
      const data = e?.response?.data
      setError(data?.message || data?.error || 'Failed to load requests')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const onSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const isoDateRe = /^\d{4}-\d{2}-\d{2}$/
      if (!isoDateRe.test(form.scheduledDate)) {
        throw { response: { data: { message: 'Date must be YYYY-MM-DD' } } }
      }
      const timeRe = /^\d{2}:\d{2}$/
      if (!timeRe.test(form.startTime) || !timeRe.test(form.endTime)) {
        throw { response: { data: { message: 'Please select valid start and end times (HH:MM)' } } }
      }
      if (form.endTime <= form.startTime) {
        throw { response: { data: { message: 'End time must be after start time' } } }
      }
      const timeSlot = `${form.startTime}-${form.endTime}`
      const payload = {
        room: form.room,
        building: form.building,
        cleaningType: form.cleaningType,
        scheduledDate: `${form.scheduledDate}T00:00:00.000Z`,
        timeSlot,
        specialInstructions: form.specialInstructions || undefined,
      }
      await CleaningService.createRequest(payload)
      setToast({ open: true, message: 'Cleaning request submitted', type: 'success' })
      setForm({ room: '', building: '', cleaningType: 'REGULAR', scheduledDate: '', startTime: '', endTime: '', specialInstructions: '' })
      load()
    } catch (e) {
      const data = e?.response?.data
      const msgs = Array.isArray(data?.error) ? data.error.map(x => x.message).join(', ') : (data?.message || data?.error || 'Failed to submit request')
      setToast({ open: true, message: msgs, type: 'error' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={styles.wrap}>
      <h2>Cleaning Requests</h2>

      <div className={styles.card} style={{ marginBottom: 16 }}>
        <h3 style={{ marginTop: 0 }}>Request Cleaning</h3>
        <form onSubmit={onSubmit}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <label>Room</label>
              <input className={styles.input} value={form.room} onChange={(e) => setForm(s => ({ ...s, room: e.target.value }))} style={{ width: '100%' }} required />
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <label>Building</label>
              <input className={styles.input} value={form.building} onChange={(e) => setForm(s => ({ ...s, building: e.target.value }))} style={{ width: '100%' }} required />
            </div>
            <div style={{ width: 200 }}>
              <label>Type</label>
              <select className={styles.input} value={form.cleaningType} onChange={(e) => setForm(s => ({ ...s, cleaningType: e.target.value }))} style={{ width: '100%' }}>
                {['REGULAR','DEEP','SPECIAL'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 12 }}>
            <div style={{ width: 200 }}>
              <label>Date</label>
              <input type="date" className={styles.input} value={form.scheduledDate} onChange={(e) => setForm(s => ({ ...s, scheduledDate: e.target.value }))} style={{ width: '100%' }} required />
            </div>
            <div style={{ width: 160 }}>
              <label>Start Time</label>
              <input type="time" className={styles.input} value={form.startTime} onChange={(e) => setForm(s => ({ ...s, startTime: e.target.value }))} style={{ width: '100%' }} required />
            </div>
            <div style={{ width: 160 }}>
              <label>End Time</label>
              <input type="time" className={styles.input} value={form.endTime} onChange={(e) => setForm(s => ({ ...s, endTime: e.target.value }))} style={{ width: '100%' }} required />
            </div>
            <div style={{ flex: 1, minWidth: 260 }}>
              <label>Special Instructions</label>
              <input className={styles.input} value={form.specialInstructions} onChange={(e) => setForm(s => ({ ...s, specialInstructions: e.target.value }))} style={{ width: '100%' }} placeholder="Optional" />
            </div>
          </div>
          <div style={{ marginTop: 12 }}>
            <button disabled={submitting} className={styles.button}>{submitting ? 'Submitting…' : 'Submit Request'}</button>
          </div>
        </form>
      </div>

      {loading && <div>Loading…</div>}
      {error && <div className={styles.error}>{error}</div>}

      {!loading && !error && (
        <div className={styles.grid}>
          {requests.map(req => (
            <div key={req.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <div style={{ fontWeight: 600 }}>{req.cleaningType} Cleaning</div>
                <span className={`${styles.badge} ${badgeClass(req.status)}`}>{req.status}</span>
              </div>
              <div className={styles.muted} style={{ marginTop: 6 }}>{req.building}, Room {req.room}</div>
              <div className={styles.meta} style={{ marginTop: 6 }}>Scheduled: {new Date(req.scheduledDate).toLocaleString()}</div>
              {req.timeSlot && (
                <div className={styles.meta} style={{ marginTop: 2 }}>Time: {req.timeSlot}</div>
              )}
              {req.cleaner && (
                <div className={styles.meta} style={{ marginTop: 4 }}>Cleaner: {req.cleaner?.name}</div>
              )}
            </div>
          ))}
          {requests.length === 0 && (
            <div className={styles.muted}>No requests yet.</div>
          )}
        </div>
      )}

      <Toast open={toast.open} message={toast.message} type={toast.type} onClose={() => setToast(s => ({ ...s, open: false }))} />
    </div>
  )
}
