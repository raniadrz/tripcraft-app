import { useState } from 'react'
import {
  updateProfile,
  updateEmail,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from 'firebase/auth'
import { auth } from '../firebase'
import { useAuth } from '../context/AuthContext'
import { User, Mail, Lock, Check, AlertCircle, Eye, EyeOff, ShieldCheck } from 'lucide-react'

const s = {
  card: {
    background: 'white', borderRadius: '16px',
    boxShadow: '0 4px 24px rgba(79,70,229,0.08)',
    border: '1px solid #e0e7ff', padding: '28px', marginBottom: '20px',
  },
  label: { fontSize: '13px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '6px' },
  input: {
    width: '100%', padding: '10px 12px', borderRadius: '8px',
    border: '1px solid #d1d5db', fontSize: '14px', outline: 'none',
    boxSizing: 'border-box', fontFamily: 'inherit',
  },
  btn: {
    display: 'flex', alignItems: 'center', gap: '7px',
    padding: '10px 20px', borderRadius: '8px', fontWeight: '600',
    fontSize: '14px', cursor: 'pointer', border: 'none', transition: 'all 0.2s',
  },
  sectionTitle: {
    fontSize: '15px', fontWeight: '700', color: '#312e81',
    display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px',
  },
  success: {
    background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px',
    padding: '10px 14px', color: '#166534', display: 'flex',
    alignItems: 'center', gap: '8px', fontSize: '13px', marginTop: '12px',
  },
  error: {
    background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px',
    padding: '10px 14px', color: '#991b1b', display: 'flex',
    alignItems: 'center', gap: '8px', fontSize: '13px', marginTop: '12px',
  },
}

function StatusMsg({ ok, msg }) {
  if (!msg) return null
  return (
    <div style={ok ? s.success : s.error}>
      {ok ? <Check size={14} /> : <AlertCircle size={14} />}
      {msg}
    </div>
  )
}

// Re-auth modal — needed before changing email or password
function ReauthModal({ onConfirm, onCancel, loading }) {
  const [pass, setPass] = useState('')
  const [show, setShow] = useState(false)
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)',
      zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
    }}>
      <div style={{
        background: 'white', borderRadius: '16px', padding: '28px',
        maxWidth: '380px', width: '100%',
        boxShadow: '0 8px 40px rgba(79,70,229,0.15)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <ShieldCheck size={20} color="#4f46e5" />
          <span style={{ fontWeight: '700', fontSize: '16px', color: '#1e1b4b' }}>Επιβεβαίωση ταυτότητας</span>
        </div>
        <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '14px' }}>
          Για να αλλάξεις email ή κωδικό, πληκτρολόγησε τον τρέχοντα κωδικό σου.
        </p>
        <div style={{ position: 'relative', marginBottom: '16px' }}>
          <input
            autoFocus
            type={show ? 'text' : 'password'}
            placeholder="Τρέχων κωδικός"
            value={pass}
            onChange={e => setPass(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && pass && onConfirm(pass)}
            style={{ ...s.input, paddingRight: '38px' }}
          />
          <button onClick={() => setShow(v => !v)} style={{
            position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
            background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af',
          }}>
            {show ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => onConfirm(pass)}
            disabled={!pass || loading}
            style={{
              ...s.btn,
              background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
              color: 'white', opacity: (!pass || loading) ? 0.6 : 1, flex: 1,
            }}
          >
            {loading ? 'Έλεγχος...' : 'Επιβεβαίωση'}
          </button>
          <button onClick={onCancel} style={{ ...s.btn, background: '#f3f4f6', color: '#374151' }}>
            Ακύρωση
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AccountSettings() {
  const user = useAuth()

  // Display name
  const [displayName, setDisplayName] = useState(user?.displayName || '')
  const [nameStatus, setNameStatus] = useState({ ok: null, msg: '' })
  const [savingName, setSavingName] = useState(false)

  // Email
  const [newEmail, setNewEmail] = useState(user?.email || '')
  const [emailStatus, setEmailStatus] = useState({ ok: null, msg: '' })
  const [savingEmail, setSavingEmail] = useState(false)

  // Password
  const [newPass, setNewPass] = useState('')
  const [confirmPass, setConfirmPass] = useState('')
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [passStatus, setPassStatus] = useState({ ok: null, msg: '' })
  const [savingPass, setSavingPass] = useState(false)

  // Re-auth modal
  const [reauth, setReauth] = useState(null) // null | { action: 'email' | 'password', loading: false }

  // ── helpers ──────────────────────────────────────────
  async function reAuthenticate(currentPassword) {
    const credential = EmailAuthProvider.credential(user.email, currentPassword)
    await reauthenticateWithCredential(user, credential)
  }

  // ── display name ─────────────────────────────────────
  async function handleSaveName() {
    setSavingName(true)
    setNameStatus({ ok: null, msg: '' })
    try {
      await updateProfile(auth.currentUser, { displayName: displayName.trim() || null })
      setNameStatus({ ok: true, msg: 'Το όνομα αποθηκεύτηκε!' })
    } catch (e) {
      setNameStatus({ ok: false, msg: friendlyError(e.code) })
    } finally {
      setSavingName(false)
    }
  }

  // ── email — needs re-auth ─────────────────────────────
  function requestEmailChange() {
    if (!newEmail || newEmail === user.email) return
    setReauth({ action: 'email', loading: false })
  }

  async function confirmEmailChange(currentPassword) {
    setReauth(r => ({ ...r, loading: true }))
    setEmailStatus({ ok: null, msg: '' })
    try {
      await reAuthenticate(currentPassword)
      await updateEmail(auth.currentUser, newEmail.trim())
      setReauth(null)
      setEmailStatus({ ok: true, msg: 'Το email ενημερώθηκε!' })
    } catch (e) {
      setReauth(null)
      setEmailStatus({ ok: false, msg: friendlyError(e.code) })
    }
  }

  // ── password — needs re-auth ──────────────────────────
  function requestPasswordChange() {
    if (!newPass || newPass !== confirmPass) {
      setPassStatus({ ok: false, msg: 'Οι κωδικοί δεν ταιριάζουν.' })
      return
    }
    if (newPass.length < 6) {
      setPassStatus({ ok: false, msg: 'Ο κωδικός πρέπει να έχει τουλάχιστον 6 χαρακτήρες.' })
      return
    }
    setPassStatus({ ok: null, msg: '' })
    setReauth({ action: 'password', loading: false })
  }

  async function confirmPasswordChange(currentPassword) {
    setReauth(r => ({ ...r, loading: true }))
    setPassStatus({ ok: null, msg: '' })
    try {
      await reAuthenticate(currentPassword)
      await updatePassword(auth.currentUser, newPass)
      setReauth(null)
      setNewPass('')
      setConfirmPass('')
      setPassStatus({ ok: true, msg: 'Ο κωδικός άλλαξε επιτυχώς!' })
    } catch (e) {
      setReauth(null)
      setPassStatus({ ok: false, msg: friendlyError(e.code) })
    }
  }

  function handleReauthConfirm(pass) {
    if (reauth?.action === 'email') confirmEmailChange(pass)
    else if (reauth?.action === 'password') confirmPasswordChange(pass)
  }

  // ── render ────────────────────────────────────────────
  return (
    <div style={{ maxWidth: '560px' }}>

      {reauth && (
        <ReauthModal
          loading={reauth.loading}
          onConfirm={handleReauthConfirm}
          onCancel={() => setReauth(null)}
        />
      )}

      {/* Display Name */}
      <div style={s.card}>
        <div style={s.sectionTitle}>
          <User size={17} color="#4f46e5" />
          Εμφανιζόμενο Όνομα
        </div>
        <div>
          <label style={s.label}>Όνομα</label>
          <input
            type="text"
            placeholder="π.χ. Γιώργος Παπαδόπουλος"
            value={displayName}
            onChange={e => { setDisplayName(e.target.value); setNameStatus({ ok: null, msg: '' }) }}
            onKeyDown={e => e.key === 'Enter' && handleSaveName()}
            style={s.input}
          />
        </div>
        <div style={{ marginTop: '14px' }}>
          <button
            onClick={handleSaveName}
            disabled={savingName || !displayName.trim()}
            style={{
              ...s.btn,
              background: nameStatus.ok ? '#22c55e' : 'linear-gradient(135deg, #4f46e5, #7c3aed)',
              color: 'white',
              opacity: (savingName || !displayName.trim()) ? 0.6 : 1,
            }}
          >
            {nameStatus.ok ? <Check size={15} /> : <User size={15} />}
            {savingName ? 'Αποθήκευση...' : nameStatus.ok ? 'Αποθηκεύτηκε!' : 'Αποθήκευση ονόματος'}
          </button>
        </div>
        <StatusMsg {...nameStatus} />
      </div>

      {/* Email */}
      <div style={s.card}>
        <div style={s.sectionTitle}>
          <Mail size={17} color="#4f46e5" />
          Διεύθυνση Email
        </div>
        <div>
          <label style={s.label}>Νέο Email</label>
          <input
            type="email"
            value={newEmail}
            onChange={e => { setNewEmail(e.target.value); setEmailStatus({ ok: null, msg: '' }) }}
            onKeyDown={e => e.key === 'Enter' && requestEmailChange()}
            style={s.input}
          />
        </div>
        <div style={{ marginTop: '14px' }}>
          <button
            onClick={requestEmailChange}
            disabled={!newEmail || newEmail === user?.email}
            style={{
              ...s.btn,
              background: emailStatus.ok ? '#22c55e' : 'linear-gradient(135deg, #4f46e5, #7c3aed)',
              color: 'white',
              opacity: (!newEmail || newEmail === user?.email) ? 0.4 : 1,
            }}
          >
            {emailStatus.ok ? <Check size={15} /> : <Mail size={15} />}
            {emailStatus.ok ? 'Αποθηκεύτηκε!' : 'Αλλαγή Email'}
          </button>
        </div>
        <StatusMsg {...emailStatus} />
      </div>

      {/* Password */}
      <div style={s.card}>
        <div style={s.sectionTitle}>
          <Lock size={17} color="#4f46e5" />
          Αλλαγή Κωδικού
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={s.label}>Νέος Κωδικός</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showNew ? 'text' : 'password'}
                placeholder="Τουλάχιστον 6 χαρακτήρες"
                value={newPass}
                onChange={e => { setNewPass(e.target.value); setPassStatus({ ok: null, msg: '' }) }}
                style={{ ...s.input, paddingRight: '38px' }}
              />
              <button onClick={() => setShowNew(v => !v)} style={{
                position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af',
              }}>
                {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>
          <div>
            <label style={s.label}>Επιβεβαίωση Κωδικού</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showConfirm ? 'text' : 'password'}
                placeholder="Επανάληψη νέου κωδικού"
                value={confirmPass}
                onChange={e => { setConfirmPass(e.target.value); setPassStatus({ ok: null, msg: '' }) }}
                onKeyDown={e => e.key === 'Enter' && requestPasswordChange()}
                style={{
                  ...s.input, paddingRight: '38px',
                  borderColor: confirmPass && newPass !== confirmPass ? '#f87171' : '#d1d5db',
                }}
              />
              <button onClick={() => setShowConfirm(v => !v)} style={{
                position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af',
              }}>
                {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {confirmPass && newPass !== confirmPass && (
              <p style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px' }}>Οι κωδικοί δεν ταιριάζουν</p>
            )}
          </div>
        </div>
        <div style={{ marginTop: '14px' }}>
          <button
            onClick={requestPasswordChange}
            disabled={savingPass || !newPass || !confirmPass}
            style={{
              ...s.btn,
              background: passStatus.ok ? '#22c55e' : 'linear-gradient(135deg, #4f46e5, #7c3aed)',
              color: 'white',
              opacity: (savingPass || !newPass || !confirmPass) ? 0.5 : 1,
            }}
          >
            {passStatus.ok ? <Check size={15} /> : <Lock size={15} />}
            {savingPass ? 'Αλλαγή...' : passStatus.ok ? 'Άλλαξε!' : 'Αλλαγή Κωδικού'}
          </button>
        </div>
        <StatusMsg {...passStatus} />
      </div>

    </div>
  )
}

function friendlyError(code) {
  const map = {
    'auth/wrong-password': 'Λάθος τρέχων κωδικός.',
    'auth/invalid-credential': 'Λάθος τρέχων κωδικός.',
    'auth/email-already-in-use': 'Το email χρησιμοποιείται ήδη από άλλον λογαριασμό.',
    'auth/invalid-email': 'Μη έγκυρη μορφή email.',
    'auth/weak-password': 'Ο κωδικός πρέπει να έχει τουλάχιστον 6 χαρακτήρες.',
    'auth/too-many-requests': 'Πολλές αποτυχημένες προσπάθειες. Δοκίμασε αργότερα.',
    'auth/requires-recent-login': 'Απαιτείται πρόσφατη σύνδεση. Αποσυνδέσου και ξανά-συνδέσου.',
    'auth/operation-not-allowed': 'Η ενέργεια δεν επιτρέπεται.',
  }
  return map[code] || `Σφάλμα: ${code}`
}
