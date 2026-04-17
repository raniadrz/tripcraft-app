import { useState } from 'react'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from 'firebase/auth'
import { auth } from '../../firebase'
import { Plane, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react'

export default function LoginForm() {
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (mode === 'login') {
        await signInWithEmailAndPassword(auth, email, password)
      } else {
        await createUserWithEmailAndPassword(auth, email, password)
      }
    } catch (err) {
      setError(friendlyError(err.code))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #eff6ff 0%, #eef2ff 50%, #faf5ff 100%)',
      padding: '20px',
    }}>
      <div style={{
        background: 'white', borderRadius: '20px',
        boxShadow: '0 8px 40px rgba(79,70,229,0.12)',
        padding: '40px', width: '100%', maxWidth: '400px',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
            borderRadius: '16px', width: '56px', height: '56px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 12px',
          }}>
            <Plane color="white" size={26} />
          </div>
          <div style={{ fontSize: '22px', fontWeight: '800', color: '#1e1b4b' }}>TripCraft AI</div>
          <div style={{ fontSize: '13px', color: '#6366f1', marginTop: '4px' }}>
            {mode === 'login' ? 'Σύνδεση στον λογαριασμό σου' : 'Δημιουργία νέου λογαριασμού'}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Email */}
          <div>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '6px' }}>
              Email
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} color="#9ca3af" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="email" required
                value={email} onChange={e => setEmail(e.target.value)}
                placeholder="name@example.com"
                style={{
                  width: '100%', padding: '10px 12px 10px 38px',
                  borderRadius: '8px', border: '1px solid #d1d5db',
                  fontSize: '14px', outline: 'none', boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '6px' }}>
              Κωδικός
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} color="#9ca3af" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type={showPass ? 'text' : 'password'} required minLength={6}
                value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Τουλάχιστον 6 χαρακτήρες"
                style={{
                  width: '100%', padding: '10px 38px 10px 38px',
                  borderRadius: '8px', border: '1px solid #d1d5db',
                  fontSize: '14px', outline: 'none', boxSizing: 'border-box',
                }}
              />
              <button type="button" onClick={() => setShowPass(v => !v)} style={{
                position: 'absolute', right: '12px', top: '50%',
                transform: 'translateY(-50%)', background: 'none', border: 'none',
                cursor: 'pointer', color: '#9ca3af', padding: 0,
              }}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              background: '#fef2f2', border: '1px solid #fecaca',
              borderRadius: '8px', padding: '10px 12px',
              display: 'flex', alignItems: 'center', gap: '8px',
              fontSize: '13px', color: '#dc2626',
            }}>
              <AlertCircle size={14} />
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit" disabled={loading}
            style={{
              background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
              color: 'white', border: 'none', borderRadius: '10px',
              padding: '12px', fontSize: '15px', fontWeight: '700',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1, marginTop: '4px',
            }}
          >
            {loading ? '...' : mode === 'login' ? 'Σύνδεση' : 'Εγγραφή'}
          </button>
        </form>

        {/* Toggle */}
        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '13px', color: '#6b7280' }}>
          {mode === 'login' ? 'Δεν έχεις λογαριασμό;' : 'Έχεις ήδη λογαριασμό;'}{' '}
          <button
            onClick={() => { setMode(m => m === 'login' ? 'register' : 'login'); setError('') }}
            style={{ background: 'none', border: 'none', color: '#4f46e5', fontWeight: '600', cursor: 'pointer', padding: 0 }}
          >
            {mode === 'login' ? 'Εγγραφή' : 'Σύνδεση'}
          </button>
        </div>
      </div>
    </div>
  )
}

function friendlyError(code) {
  const map = {
    'auth/user-not-found': 'Δεν βρέθηκε χρήστης με αυτό το email.',
    'auth/wrong-password': 'Λάθος κωδικός.',
    'auth/invalid-credential': 'Λάθος email ή κωδικός.',
    'auth/email-already-in-use': 'Το email χρησιμοποιείται ήδη.',
    'auth/weak-password': 'Ο κωδικός πρέπει να έχει τουλάχιστον 6 χαρακτήρες.',
    'auth/invalid-email': 'Μη έγκυρο email.',
    'auth/too-many-requests': 'Πολλές αποτυχημένες προσπάθειες. Δοκίμασε αργότερα.',
  }
  return map[code] || `Σφάλμα: ${code}`
}
