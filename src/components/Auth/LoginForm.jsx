import { useState, useMemo } from 'react'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from 'firebase/auth'
import { auth } from '../../firebase'
import { Plane, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react'

export default function LoginForm() {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [focusedField, setFocusedField] = useState(null)

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

  const stars = useMemo(() => Array.from({ length: 50 }, (_, i) => ({
    id: i,
    left: ((i * 19.1 + 5.3) % 100).toFixed(2),
    top: ((i * 13.9 + 8.1) % 100).toFixed(2),
    size: (i % 3) + 1,
    dur: (1.8 + (i % 4) * 0.5).toFixed(1),
    delay: ((i * 0.21) % 3).toFixed(2),
  })), [])

  const inputStyle = (field) => ({
    width:'100%',
    padding:'12px 14px 12px 42px',
    borderRadius:'12px',
    border:`1px solid ${focusedField === field ? 'rgba(124,58,237,.7)' : 'rgba(255,255,255,.1)'}`,
    background:'rgba(255,255,255,.06)',
    color:'white',
    fontSize:'14px',
    outline:'none',
    boxSizing:'border-box',
    transition:'border .2s, box-shadow .2s',
    boxShadow: focusedField === field ? '0 0 0 3px rgba(124,58,237,.25), inset 0 0 12px rgba(124,58,237,.08)' : 'none',
    backdropFilter:'blur(8px)',
  })

  return (
    <div style={{
      minHeight:'100vh',
      display:'flex', alignItems:'center', justifyContent:'center',
      background:'linear-gradient(135deg, #03000d 0%, #0d0829 45%, #0a1628 100%)',
      padding:'20px', position:'relative', overflow:'hidden',
    }}>
      <style>{`
        @keyframes twinkle {
          0%,100% { opacity:.12; transform:scale(1); }
          50%      { opacity:.9;  transform:scale(1.5); }
        }
        @keyframes meshFloat1 {
          0%,100% { transform:translate(0,0) scale(1); }
          50%      { transform:translate(30px,-20px) scale(1.1); }
        }
        @keyframes meshFloat2 {
          0%,100% { transform:translate(0,0) scale(1); }
          50%      { transform:translate(-20px,30px) scale(1.08); }
        }
        @keyframes cardIn {
          0%   { opacity:0; transform:translateY(24px) scale(.97); }
          100% { opacity:1; transform:translateY(0) scale(1); }
        }
        @keyframes btnShine {
          0%   { background-position:200% center; }
          100% { background-position:-200% center; }
        }
        .login-card { animation:cardIn .6s ease both; }
        .login-btn:hover { filter:brightness(1.1); transform:translateY(-1px); }
        .login-btn:active { transform:translateY(0); }
        .login-btn { transition:all .18s ease; }
        .toggle-link:hover { color:#ec4899 !important; }
        .toggle-link { transition:color .15s; }
        ::placeholder { color:rgba(148,163,184,.45) !important; }
      `}</style>

      {/* Stars */}
      {stars.map(s => (
        <div key={s.id} style={{
          position:'absolute',
          left:`${s.left}%`, top:`${s.top}%`,
          width:`${s.size}px`, height:`${s.size}px`,
          borderRadius:'50%', background:'white',
          animation:`twinkle ${s.dur}s ease-in-out ${s.delay}s infinite`,
          pointerEvents:'none',
        }} />
      ))}

      {/* Ambient glows */}
      <div style={{
        position:'absolute', width:'600px', height:'600px',
        top:'-200px', right:'-150px', borderRadius:'50%',
        background:'radial-gradient(circle, rgba(124,58,237,.2) 0%, transparent 70%)',
        filter:'blur(50px)', animation:'meshFloat1 8s ease-in-out infinite', pointerEvents:'none',
      }} />
      <div style={{
        position:'absolute', width:'500px', height:'500px',
        bottom:'-150px', left:'-100px', borderRadius:'50%',
        background:'radial-gradient(circle, rgba(236,72,153,.18) 0%, transparent 70%)',
        filter:'blur(50px)', animation:'meshFloat2 10s ease-in-out infinite', pointerEvents:'none',
      }} />

      {/* Card */}
      <div className="login-card" style={{
        background:'rgba(255,255,255,.05)',
        backdropFilter:'blur(24px)',
        WebkitBackdropFilter:'blur(24px)',
        border:'1px solid rgba(255,255,255,.1)',
        borderRadius:'24px',
        boxShadow:'0 8px 60px rgba(0,0,0,.5), inset 0 1px 0 rgba(255,255,255,.1)',
        padding:'44px 40px',
        width:'100%', maxWidth:'420px',
        position:'relative', zIndex:2,
      }}>
        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:'36px' }}>
          <div style={{
            background:'linear-gradient(135deg, #7c3aed, #ec4899)',
            borderRadius:'20px', width:'64px', height:'64px',
            display:'flex', alignItems:'center', justifyContent:'center',
            margin:'0 auto 16px',
            boxShadow:'0 0 30px rgba(124,58,237,.6), 0 0 60px rgba(236,72,153,.3)',
          }}>
            <Plane color="white" size={30} />
          </div>
          <div style={{
            fontSize:'26px', fontWeight:'900', letterSpacing:'-0.5px',
            background:'linear-gradient(135deg, #fff 30%, #a78bfa 70%, #ec4899 100%)',
            WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
          }}>
            TripCraft AI
          </div>
          <div style={{ fontSize:'13px', color:'rgba(167,139,250,.75)', marginTop:'5px', letterSpacing:'0.5px' }}>
            {mode === 'login' ? 'Καλώς ήρθες ξανά' : 'Δημιουργία λογαριασμού'}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'18px' }}>

          {/* Email */}
          <div>
            <label style={{ fontSize:'12px', fontWeight:'600', color:'rgba(167,139,250,.9)', display:'block', marginBottom:'7px', letterSpacing:'0.5px', textTransform:'uppercase' }}>
              Email
            </label>
            <div style={{ position:'relative' }}>
              <Mail size={16} color="rgba(148,163,184,.6)" style={{ position:'absolute', left:'13px', top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }} />
              <input
                type="email" required
                value={email} onChange={e => setEmail(e.target.value)}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                placeholder="name@example.com"
                style={inputStyle('email')}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label style={{ fontSize:'12px', fontWeight:'600', color:'rgba(167,139,250,.9)', display:'block', marginBottom:'7px', letterSpacing:'0.5px', textTransform:'uppercase' }}>
              Κωδικός
            </label>
            <div style={{ position:'relative' }}>
              <Lock size={16} color="rgba(148,163,184,.6)" style={{ position:'absolute', left:'13px', top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }} />
              <input
                type={showPass ? 'text' : 'password'} required minLength={6}
                value={password} onChange={e => setPassword(e.target.value)}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                placeholder="Τουλάχιστον 6 χαρακτήρες"
                style={{ ...inputStyle('password'), paddingRight:'42px' }}
              />
              <button type="button" onClick={() => setShowPass(v => !v)} style={{
                position:'absolute', right:'13px', top:'50%',
                transform:'translateY(-50%)',
                background:'none', border:'none', cursor:'pointer',
                color:'rgba(148,163,184,.6)', padding:0,
              }}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              background:'rgba(220,38,38,.12)',
              border:'1px solid rgba(220,38,38,.3)',
              borderRadius:'10px', padding:'11px 14px',
              display:'flex', alignItems:'center', gap:'9px',
              fontSize:'13px', color:'#fca5a5',
            }}>
              <AlertCircle size={14} />
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit" disabled={loading}
            className="login-btn"
            style={{
              background:'linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #ec4899 100%)',
              color:'white', border:'none', borderRadius:'12px',
              padding:'14px', fontSize:'15px', fontWeight:'700',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1, marginTop:'2px',
              boxShadow:'0 4px 20px rgba(124,58,237,.4)',
              letterSpacing:'0.3px',
            }}
          >
            {loading ? '...' : mode === 'login' ? 'Σύνδεση →' : 'Εγγραφή →'}
          </button>
        </form>

        {/* Divider */}
        <div style={{
          display:'flex', alignItems:'center', gap:'12px',
          margin:'24px 0 20px',
        }}>
          <div style={{ flex:1, height:'1px', background:'rgba(255,255,255,.08)' }} />
          <span style={{ fontSize:'12px', color:'rgba(148,163,184,.5)' }}>
            {mode === 'login' ? 'Νέος χρήστης;' : 'Έχεις ήδη λογαριασμό;'}
          </span>
          <div style={{ flex:1, height:'1px', background:'rgba(255,255,255,.08)' }} />
        </div>

        <div style={{ textAlign:'center' }}>
          <button
            className="toggle-link"
            onClick={() => { setMode(m => m === 'login' ? 'register' : 'login'); setError('') }}
            style={{
              background:'none', border:'none',
              color:'rgba(167,139,250,.9)', fontWeight:'700',
              cursor:'pointer', padding:0, fontSize:'14px',
            }}
          >
            {mode === 'login' ? 'Δημιουργία λογαριασμού' : 'Σύνδεση'}
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
