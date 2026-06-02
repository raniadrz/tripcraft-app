import { useState } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import LoginForm from './components/Auth/LoginForm'
import Layout from './components/Layout'
import SplashScreen from './components/SplashScreen'
import { Plane } from 'lucide-react'
import './index.css'

function AppInner() {
  const user = useAuth()
  const [splashDone, setSplashDone] = useState(false)

  if (!splashDone) return <SplashScreen onDone={() => setSplashDone(true)} />

  if (user === undefined) {
    return (
      <div style={{
        minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center',
        background:'linear-gradient(135deg, #03000d 0%, #0d0829 45%, #0a1628 100%)',
      }}>
        <style>{`@keyframes spin { to { transform:rotate(360deg) } }`}</style>
        <div style={{ textAlign:'center' }}>
          <div style={{
            width:'44px', height:'44px',
            border:'3px solid rgba(124,58,237,.25)',
            borderTopColor:'#7c3aed',
            borderRadius:'50%',
            animation:'spin .8s linear infinite',
            margin:'0 auto 14px',
          }} />
          <div style={{ color:'rgba(167,139,250,.8)', fontSize:'13px', letterSpacing:'1px' }}>Loading…</div>
        </div>
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
