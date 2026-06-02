import { useEffect, useState, useMemo } from 'react'
import { Plane } from 'lucide-react'

export default function SplashScreen({ onDone }) {
  const [phase, setPhase] = useState('in')

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('out'), 2300)
    const t2 = setTimeout(() => onDone?.(), 2800)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [onDone])

  const stars = useMemo(() => Array.from({ length: 70 }, (_, i) => ({
    id: i,
    left: ((i * 17.3 + 7.1) % 100).toFixed(2),
    top: ((i * 13.7 + 3.3) % 100).toFixed(2),
    size: (i % 3) + 1,
    dur: (1.5 + (i % 5) * 0.4).toFixed(1),
    delay: ((i * 0.17) % 2.5).toFixed(2),
  })), [])

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999, overflow: 'hidden',
      background: 'linear-gradient(135deg, #03000d 0%, #0d0829 45%, #0a1628 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      transition: 'opacity 0.5s ease',
      opacity: phase === 'out' ? 0 : 1,
    }}>
      <style>{`
        @keyframes twinkle {
          0%,100% { opacity:.15; transform:scale(1); }
          50%      { opacity:1;   transform:scale(1.4); }
        }
        @keyframes flyPlane {
          0%   { transform:translateX(-220px) translateY(50px) rotate(-10deg); opacity:0; }
          10%  { opacity:1; }
          90%  { opacity:1; }
          100% { transform:translateX(calc(100vw + 220px)) translateY(-90px) rotate(10deg); opacity:0; }
        }
        @keyframes trailGrow {
          0%   { opacity:0; transform:scaleX(0); }
          20%  { opacity:0.7; }
          80%  { opacity:0.5; }
          100% { opacity:0; transform:scaleX(1); }
        }
        @keyframes splashFadeUp {
          0%   { opacity:0; transform:translateY(22px); }
          100% { opacity:1; transform:translateY(0); }
        }
        @keyframes pulseGlow {
          0%,100% { box-shadow:0 0 40px rgba(124,58,237,.5),0 0 80px rgba(236,72,153,.25); }
          50%      { box-shadow:0 0 60px rgba(124,58,237,.8),0 0 120px rgba(236,72,153,.45); }
        }
        .s-plane  { animation: flyPlane 2s cubic-bezier(.25,.1,.35,1) 0.35s both; }
        .s-trail  { animation: trailGrow 2s ease-in-out 0.35s both; transform-origin:left center; }
        .s-logo   { animation: splashFadeUp .8s ease .15s both; }
        .s-title  { animation: splashFadeUp .8s ease .3s both; }
        .s-sub    { animation: splashFadeUp .8s ease .55s both; }
        .s-icon   { animation: pulseGlow 2s ease-in-out infinite; }
      `}</style>

      {/* Stars */}
      {stars.map(s => (
        <div key={s.id} style={{
          position: 'absolute',
          left: `${s.left}%`, top: `${s.top}%`,
          width: `${s.size}px`, height: `${s.size}px`,
          borderRadius: '50%', background: 'white',
          animation: `twinkle ${s.dur}s ease-in-out ${s.delay}s infinite`,
        }} />
      ))}

      {/* Nebula glow blobs */}
      <div style={{
        position:'absolute', width:'500px', height:'500px',
        top:'-100px', right:'-100px', borderRadius:'50%',
        background:'radial-gradient(circle, rgba(124,58,237,.18) 0%, transparent 70%)',
        filter:'blur(40px)',
      }} />
      <div style={{
        position:'absolute', width:'400px', height:'400px',
        bottom:'-80px', left:'-80px', borderRadius:'50%',
        background:'radial-gradient(circle, rgba(236,72,153,.15) 0%, transparent 70%)',
        filter:'blur(40px)',
      }} />

      {/* Airplane flight path */}
      <div style={{ position:'absolute', top:'42%', left:0, right:0, height:'60px', pointerEvents:'none' }}>
        {/* Contrail */}
        <div className="s-trail" style={{
          position:'absolute', top:'28px', left:'8%', right:'8%', height:'1.5px',
          background:'linear-gradient(90deg, transparent, rgba(167,139,250,.7) 30%, rgba(236,72,153,.5) 70%, transparent)',
        }} />
        {/* Plane */}
        <div className="s-plane" style={{
          position:'absolute', top:'4px',
          color:'#a78bfa',
          filter:'drop-shadow(0 0 14px #7c3aed) drop-shadow(0 0 28px rgba(236,72,153,.6))',
        }}>
          <Plane size={52} fill="#a78bfa" />
        </div>
      </div>

      {/* Center branding */}
      <div className="s-logo" style={{ textAlign:'center', position:'relative', zIndex:2 }}>
        {/* Glow orb */}
        <div style={{
          position:'absolute', top:'50%', left:'50%',
          transform:'translate(-50%,-50%)',
          width:'240px', height:'240px',
          background:'radial-gradient(circle, rgba(124,58,237,.25) 0%, transparent 70%)',
          borderRadius:'50%', filter:'blur(24px)',
          pointerEvents:'none',
        }} />

        {/* Logo icon */}
        <div className="s-icon" style={{
          background:'linear-gradient(135deg, #7c3aed, #ec4899)',
          borderRadius:'28px', width:'90px', height:'90px',
          display:'flex', alignItems:'center', justifyContent:'center',
          margin:'0 auto 22px',
        }}>
          <Plane color="white" size={44} />
        </div>

        <div className="s-title" style={{
          fontSize:'42px', fontWeight:'900', letterSpacing:'-1.5px',
          background:'linear-gradient(135deg, #ffffff 20%, #a78bfa 60%, #ec4899 100%)',
          WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
        }}>
          TripCraft AI
        </div>

        <div className="s-sub" style={{
          fontSize:'13px', color:'rgba(167,139,250,.75)',
          marginTop:'10px', letterSpacing:'3px', textTransform:'uppercase',
          fontWeight:'500',
        }}>
          Your intelligent travel companion
        </div>
      </div>
    </div>
  )
}
