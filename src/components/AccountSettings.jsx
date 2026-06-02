import { useState } from 'react'
import {
  updateProfile, updateEmail, updatePassword,
  reauthenticateWithCredential, EmailAuthProvider,
} from 'firebase/auth'
import { auth } from '../firebase'
import { useAuth } from '../context/AuthContext'
import { User, Mail, Lock, Check, AlertCircle, Eye, EyeOff, ShieldCheck } from 'lucide-react'

const D = {
  card: {
    background: 'rgba(255,255,255,.04)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: '1px solid rgba(124,58,237,.15)',
    borderRadius: '18px',
    padding: '28px',
    marginBottom: '20px',
  },
  label: {
    fontSize: '11px', fontWeight: '600',
    color: 'rgba(167,139,250,.85)',
    display: 'block', marginBottom: '7px',
    letterSpacing: '0.6px', textTransform: 'uppercase',
  },
  input: {
    width: '100%', padding: '11px 14px', borderRadius: '10px',
    border: '1px solid rgba(255,255,255,.1)',
    background: 'rgba(255,255,255,.06)',
    color: '#f1f5f9',
    fontSize: '14px', outline: 'none',
    boxSizing: 'border-box', fontFamily: 'inherit',
    transition: 'border .2s, box-shadow .2s',
  },
  sectionTitle: {
    fontSize: '15px', fontWeight: '700',
    display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px',
    background: 'linear-gradient(135deg,#fff 30%,#a78bfa 100%)',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
  },
}

function StatusMsg({ ok, msg }) {
  if (!msg) return null
  return (
    <div style={{
      background: ok ? 'rgba(16,185,129,.12)' : 'rgba(220,38,38,.12)',
      border: `1px solid ${ok ? 'rgba(16,185,129,.3)' : 'rgba(220,38,38,.3)'}`,
      borderRadius: '10px', padding: '10px 14px',
      color: ok ? '#6ee7b7' : '#fca5a5',
      display: 'flex', alignItems: 'center', gap: '8px',
      fontSize: '13px', marginTop: '12px',
    }}>
      {ok ? <Check size={14} /> : <AlertCircle size={14} />}
      {msg}
    </div>
  )
}

function ReauthModal({ onConfirm, onCancel, loading }) {
  const [pass, setPass] = useState('')
  const [show, setShow] = useState(false)
  return (
    <div style={{
      position:'fixed', inset:0,
      background:'rgba(0,0,0,.7)', backdropFilter:'blur(8px)',
      zIndex:100, display:'flex', alignItems:'center', justifyContent:'center', padding:'20px',
    }}>
      <div style={{
        background:'rgba(13,8,41,.95)',
        border:'1px solid rgba(124,58,237,.3)',
        borderRadius:'20px', padding:'32px',
        maxWidth:'380px', width:'100%',
        boxShadow:'0 24px 60px rgba(0,0,0,.6)',
        animation:'pageEnter .3s ease both',
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'14px' }}>
          <ShieldCheck size={20} color="#a78bfa" />
          <span style={{
            fontWeight:'700', fontSize:'16px',
            background:'linear-gradient(135deg,#fff 30%,#a78bfa 100%)',
            WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
          }}>
            Επιβεβαίωση ταυτότητας
          </span>
        </div>
        <p style={{ fontSize:'13px', color:'rgba(148,163,184,.7)', marginBottom:'18px' }}>
          Για να αλλάξεις email ή κωδικό, πληκτρολόγησε τον τρέχοντα κωδικό σου.
        </p>
        <div style={{ position:'relative', marginBottom:'18px' }}>
          <input
            autoFocus
            type={show ? 'text' : 'password'}
            placeholder="Τρέχων κωδικός"
            value={pass}
            onChange={e => setPass(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && pass && onConfirm(pass)}
            style={{ ...D.input, paddingRight:'42px' }}
          />
          <button onClick={() => setShow(v => !v)} style={{
            position:'absolute', right:'12px', top:'50%', transform:'translateY(-50%)',
            background:'none', border:'none', cursor:'pointer', color:'rgba(148,163,184,.5)',
          }}>
            {show ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
        <div style={{ display:'flex', gap:'10px' }}>
          <button
            onClick={() => onConfirm(pass)}
            disabled={!pass || loading}
            style={{
              display:'flex', alignItems:'center', gap:'7px',
              padding:'11px 20px', borderRadius:'10px', fontWeight:'700',
              fontSize:'14px', cursor: (!pass || loading) ? 'not-allowed' : 'pointer',
              border:'none', flex:1,
              background:'linear-gradient(135deg,#7c3aed,#ec4899)',
              color:'white', opacity: (!pass || loading) ? 0.55 : 1,
              boxShadow:'0 4px 16px rgba(124,58,237,.4)',
            }}
          >
            {loading ? 'Έλεγχος...' : 'Επιβεβαίωση'}
          </button>
          <button onClick={onCancel} style={{
            display:'flex', alignItems:'center', padding:'11px 18px',
            borderRadius:'10px', fontWeight:'600', fontSize:'14px', cursor:'pointer',
            background:'rgba(255,255,255,.06)', color:'rgba(148,163,184,.8)',
            border:'1px solid rgba(255,255,255,.1)',
          }}>
            Ακύρωση
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AccountSettings() {
  const user = useAuth()

  const [displayName, setDisplayName] = useState(user?.displayName || '')
  const [nameStatus, setNameStatus] = useState({ ok: null, msg: '' })
  const [savingName, setSavingName] = useState(false)

  const [newEmail, setNewEmail] = useState(user?.email || '')
  const [emailStatus, setEmailStatus] = useState({ ok: null, msg: '' })

  const [newPass, setNewPass] = useState('')
  const [confirmPass, setConfirmPass] = useState('')
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [passStatus, setPassStatus] = useState({ ok: null, msg: '' })
  const [savingPass, setSavingPass] = useState(false)

  const [reauth, setReauth] = useState(null)

  async function reAuthenticate(currentPassword) {
    const credential = EmailAuthProvider.credential(user.email, currentPassword)
    await reauthenticateWithCredential(user, credential)
  }

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

  function requestPasswordChange() {
    if (!newPass || newPass !== confirmPass) {
      setPassStatus({ ok: false, msg: 'Οι κωδικοί δεν ταιριάζουν.' }); return
    }
    if (newPass.length < 6) {
      setPassStatus({ ok: false, msg: 'Ο κωδικός πρέπει να έχει τουλάχιστον 6 χαρακτήρες.' }); return
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
      setNewPass(''); setConfirmPass('')
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

  const saveBtn = (disabled, ok, label, loadingLabel) => ({
    display: 'flex', alignItems: 'center', gap: '8px',
    padding: '11px 22px', borderRadius: '10px', fontWeight: '700',
    fontSize: '14px', cursor: disabled ? 'not-allowed' : 'pointer',
    border: 'none',
    background: ok ? 'rgba(16,185,129,.8)' : 'linear-gradient(135deg,#7c3aed,#ec4899)',
    color: 'white',
    opacity: disabled ? 0.5 : 1,
    boxShadow: disabled ? 'none' : '0 4px 16px rgba(124,58,237,.35)',
    transition: 'all .18s ease',
  })

  return (
    <div style={{ maxWidth:'560px', animation:'pageEnter .5s ease both' }}>
      <style>{`
        @keyframes pageEnter { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .acc-input:focus { border-color:rgba(124,58,237,.6) !important; box-shadow:0 0 0 3px rgba(124,58,237,.15) !important; }
        .acc-card { animation:pageEnter .4s ease both; }
        .acc-card:nth-child(1) { animation-delay:.05s; }
        .acc-card:nth-child(2) { animation-delay:.12s; }
        .acc-card:nth-child(3) { animation-delay:.19s; }
        .save-btn:hover { filter:brightness(1.1); transform:translateY(-1px); }
        .save-btn { transition:all .18s ease; }
        ::placeholder { color:rgba(148,163,184,.35) !important; }
      `}</style>

      {reauth && (
        <ReauthModal
          loading={reauth.loading}
          onConfirm={handleReauthConfirm}
          onCancel={() => setReauth(null)}
        />
      )}

      {/* Display Name */}
      <div className="acc-card" style={D.card}>
        <div style={D.sectionTitle}>
          <User size={17} color="#a78bfa" style={{ WebkitTextFillColor:'initial', flexShrink:0 }} />
          Εμφανιζόμενο Όνομα
        </div>
        <div>
          <label style={D.label}>Όνομα</label>
          <input
            className="acc-input"
            type="text"
            placeholder="π.χ. Γιώργος Παπαδόπουλος"
            value={displayName}
            onChange={e => { setDisplayName(e.target.value); setNameStatus({ ok: null, msg: '' }) }}
            onKeyDown={e => e.key === 'Enter' && handleSaveName()}
            style={D.input}
          />
        </div>
        <div style={{ marginTop:'16px' }}>
          <button
            className="save-btn"
            onClick={handleSaveName}
            disabled={savingName || !displayName.trim()}
            style={saveBtn(savingName || !displayName.trim(), nameStatus.ok)}
          >
            {nameStatus.ok ? <Check size={15} /> : <User size={15} />}
            {savingName ? 'Αποθήκευση...' : nameStatus.ok ? 'Αποθηκεύτηκε!' : 'Αποθήκευση ονόματος'}
          </button>
        </div>
        <StatusMsg {...nameStatus} />
      </div>

      {/* Email */}
      <div className="acc-card" style={D.card}>
        <div style={D.sectionTitle}>
          <Mail size={17} color="#a78bfa" style={{ WebkitTextFillColor:'initial', flexShrink:0 }} />
          Διεύθυνση Email
        </div>
        <div>
          <label style={D.label}>Νέο Email</label>
          <input
            className="acc-input"
            type="email"
            value={newEmail}
            onChange={e => { setNewEmail(e.target.value); setEmailStatus({ ok: null, msg: '' }) }}
            onKeyDown={e => e.key === 'Enter' && requestEmailChange()}
            style={D.input}
          />
        </div>
        <div style={{ marginTop:'16px' }}>
          <button
            className="save-btn"
            onClick={requestEmailChange}
            disabled={!newEmail || newEmail === user?.email}
            style={saveBtn(!newEmail || newEmail === user?.email, emailStatus.ok)}
          >
            {emailStatus.ok ? <Check size={15} /> : <Mail size={15} />}
            {emailStatus.ok ? 'Αποθηκεύτηκε!' : 'Αλλαγή Email'}
          </button>
        </div>
        <StatusMsg {...emailStatus} />
      </div>

      {/* Password */}
      <div className="acc-card" style={D.card}>
        <div style={D.sectionTitle}>
          <Lock size={17} color="#a78bfa" style={{ WebkitTextFillColor:'initial', flexShrink:0 }} />
          Αλλαγή Κωδικού
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
          <div>
            <label style={D.label}>Νέος Κωδικός</label>
            <div style={{ position:'relative' }}>
              <input
                className="acc-input"
                type={showNew ? 'text' : 'password'}
                placeholder="Τουλάχιστον 6 χαρακτήρες"
                value={newPass}
                onChange={e => { setNewPass(e.target.value); setPassStatus({ ok: null, msg: '' }) }}
                style={{ ...D.input, paddingRight:'42px' }}
              />
              <button onClick={() => setShowNew(v => !v)} style={{
                position:'absolute', right:'12px', top:'50%', transform:'translateY(-50%)',
                background:'none', border:'none', cursor:'pointer', color:'rgba(148,163,184,.5)',
              }}>
                {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>
          <div>
            <label style={D.label}>Επιβεβαίωση Κωδικού</label>
            <div style={{ position:'relative' }}>
              <input
                className="acc-input"
                type={showConfirm ? 'text' : 'password'}
                placeholder="Επανάληψη νέου κωδικού"
                value={confirmPass}
                onChange={e => { setConfirmPass(e.target.value); setPassStatus({ ok: null, msg: '' }) }}
                onKeyDown={e => e.key === 'Enter' && requestPasswordChange()}
                style={{
                  ...D.input, paddingRight:'42px',
                  borderColor: confirmPass && newPass !== confirmPass ? 'rgba(239,68,68,.5)' : undefined,
                }}
              />
              <button onClick={() => setShowConfirm(v => !v)} style={{
                position:'absolute', right:'12px', top:'50%', transform:'translateY(-50%)',
                background:'none', border:'none', cursor:'pointer', color:'rgba(148,163,184,.5)',
              }}>
                {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {confirmPass && newPass !== confirmPass && (
              <p style={{ fontSize:'12px', color:'rgba(239,68,68,.8)', marginTop:'5px' }}>Οι κωδικοί δεν ταιριάζουν</p>
            )}
          </div>
        </div>
        <div style={{ marginTop:'16px' }}>
          <button
            className="save-btn"
            onClick={requestPasswordChange}
            disabled={savingPass || !newPass || !confirmPass}
            style={saveBtn(savingPass || !newPass || !confirmPass, passStatus.ok)}
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
    'auth/requires-recent-login': 'Απαιτείται πρόσφατη σύνδεση.',
    'auth/operation-not-allowed': 'Η ενέργεια δεν επιτρέπεται.',
  }
  return map[code] || `Σφάλμα: ${code}`
}
