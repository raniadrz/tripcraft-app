import { AuthProvider, useAuth } from './context/AuthContext'
import LoginForm from './components/Auth/LoginForm'
import Layout from './components/Layout'
import './index.css'

function AppInner() {
  const user = useAuth()

  // Still loading auth state
  if (user === undefined) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #eff6ff, #eef2ff, #faf5ff)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid #e0e7ff', borderTopColor: '#4f46e5', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
          <div style={{ color: '#6366f1', fontSize: '14px' }}>Φόρτωση...</div>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  if (!user) return <LoginForm />

  return <Layout />
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  )
}
