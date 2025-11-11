import { useEffect, useMemo, useState } from 'react'
import AccountService from '../services/accountService'
import { clearToken } from '../services/auth'
import Toast from '../components/UI/Toast'
import styles from './profile.module.css'

export default function Profile() {
  const [me, setMe] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [toast, setToast] = useState({ open: false, message: '', type: 'success' })

  const [form, setForm] = useState({ name: '', phone: '' })
  const [saving, setSaving] = useState(false)

  const [pwd, setPwd] = useState({ currentPassword: '', newPassword: '', confirm: '' })
  const [changing, setChanging] = useState(false)

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await AccountService.getMe()
      setMe(data)
      setForm({ name: data?.name || '', phone: data?.phone || '' })
    } catch (e) {
      const data = e?.response?.data
      setError(data?.message || data?.error || 'Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const initials = useMemo(() => {
    const src = me?.name || me?.email || ''
    const parts = src.trim().split(/\s+/)
    const letters = parts.length >= 2 ? (parts[0][0] + parts[1][0]) : (src[0] || '?')
    return letters.toUpperCase()
  }, [me])

  const onSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = { name: form.name }
      if (form.phone) payload.phone = form.phone
      const res = await AccountService.updateMe(payload)
      const updated = res?.data || res
      setToast({ open: true, message: 'Profile updated', type: 'success' })
      if (updated) setMe(updated)
    } catch (e) {
      const status = e?.response?.status
      const data = e?.response?.data
      const notSupported = status === 404 || status === 405
      const msg = notSupported ? 'Profile update is not enabled on the server' : (data?.message || data?.error || 'Failed to update profile')
      setToast({ open: true, message: msg, type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  const onChangePassword = async (e) => {
    e.preventDefault()
    if (!pwd.newPassword || pwd.newPassword !== pwd.confirm) {
      setToast({ open: true, message: 'Passwords do not match', type: 'error' })
      return
    }
    setChanging(true)
    try {
      await AccountService.changePassword({ currentPassword: pwd.currentPassword, newPassword: pwd.newPassword })
      setToast({ open: true, message: 'Password changed', type: 'success' })
      setPwd({ currentPassword: '', newPassword: '', confirm: '' })
    } catch (e) {
      const status = e?.response?.status
      const data = e?.response?.data
      const notSupported = status === 404 || status === 405
      const msg = notSupported ? 'Change password is not enabled on the server' : (data?.message || data?.error || 'Failed to change password')
      setToast({ open: true, message: msg, type: 'error' })
    } finally {
      setChanging(false)
    }
  }

  const logout = () => {
    clearToken()
    window.location.href = '/login'
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <div className={styles.user}>
          <div className={styles.avatar}>{initials}</div>
          <div>
            <div className={styles.name}>{me?.name || '—'}</div>
            <div className={styles.meta}>{me?.email}</div>
          </div>
        </div>
        <button onClick={logout} className={styles.logout}>Logout</button>
      </div>

      {loading && <div>Loading…</div>}
      {error && <div className={styles.error}>{error}</div>}

      {!loading && !error && (
        <div className={styles.grid}>
          <div className={styles.card}>
            <div className={styles.cardTitle}>Profile</div>
            <form onSubmit={onSave}>
              <div className={styles.formRow}>
                <div className={styles.field}>
                  <label>Name</label>
                  <input className={styles.input} value={form.name} onChange={(e) => setForm(s => ({ ...s, name: e.target.value }))} required />
                </div>
                <div className={styles.field}>
                  <label>Phone</label>
                  <input className={styles.input} value={form.phone} onChange={(e) => setForm(s => ({ ...s, phone: e.target.value }))} placeholder="Optional" />
                </div>
                <div className={styles.field}>
                  <label>Role</label>
                  <input className={styles.input} value={me?.role || ''} readOnly />
                </div>
              </div>
              <div className={styles.actions}>
                <button className={styles.button} disabled={saving}>{saving ? 'Saving…' : 'Save Changes'}</button>
              </div>
            </form>
          </div>

          <div className={styles.card}>
            <div className={styles.cardTitle}>Change Password</div>
            <form onSubmit={onChangePassword}>
              <div className={styles.formRow}>
                <div className={styles.field}>
                  <label>Current Password</label>
                  <input className={styles.input} type="password" value={pwd.currentPassword} onChange={(e) => setPwd(s => ({ ...s, currentPassword: e.target.value }))} />
                </div>
                <div className={styles.field}>
                  <label>New Password</label>
                  <input className={styles.input} type="password" value={pwd.newPassword} onChange={(e) => setPwd(s => ({ ...s, newPassword: e.target.value }))} />
                </div>
                <div className={styles.field}>
                  <label>Confirm Password</label>
                  <input className={styles.input} type="password" value={pwd.confirm} onChange={(e) => setPwd(s => ({ ...s, confirm: e.target.value }))} />
                </div>
              </div>
              <div className={styles.actions}>
                <button className={styles.button} disabled={changing}>{changing ? 'Saving…' : 'Change Password'}</button>
              </div>
            </form>
            <div className={styles.hint}>If your server does not support password changes, a helpful message will be shown.</div>
          </div>
        </div>
      )}

      <Toast open={toast.open} message={toast.message} type={toast.type} onClose={() => setToast(s => ({ ...s, open: false }))} />
    </div>
  )
}
