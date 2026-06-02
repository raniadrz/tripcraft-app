import { useState } from 'react'
import { Settings, Eye, EyeOff, ChevronDown, ChevronUp, Save, Check, Zap } from 'lucide-react'

const TTL_OPTIONS = [
  { label: '7 ημέρες', days: 7 },
  { label: '30 ημέρες', days: 30 },
  { label: '1 χρόνο', days: 365 },
  { label: 'Για πάντα', days: null },
]

export default function SettingsPanel({ apiKey, setApiKey, activeModel }) {
  const [draft, setDraft] = useState(apiKey)
  const [showKey, setShowKey] = useState(false)
  const [open, setOpen] = useState(!apiKey)
  const [saved, setSaved] = useState(false)
  const [ttl, setTtl] = useState(30)

  const isDirty = draft !== apiKey

  function handleSave() {
    setApiKey(draft, ttl)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const modelLabel = activeModel
    ? activeModel.split('/').pop().replace(':free', '').replace(/-/g, ' ')
    : null

  return (
    <div>
      <style>{`
        .sp-input:focus {
          border-color: rgba(124,58,237,.6) !important;
          box-shadow: 0 0 0 3px rgba(124,58,237,.15) !important;
        }
        .sp-input { transition: border .2s, box-shadow .2s; }
        .sp-header:hover .sp-title { opacity:.85; }
        ::placeholder { color: rgba(148,163,184,.35) !important; }
      `}</style>

      <div className="sp-header" style={{ display:'flex', alignItems:'center', gap:'8px', cursor:'pointer', userSelect:'none' }} onClick={() => setOpen(o => !o)}>
        <Settings size={18} color="#a78bfa" />
        <span className="sp-title" style={{
          fontSize: '16px', fontWeight: '700', flex: 1,
          background: 'linear-gradient(135deg,#fff 30%,#a78bfa 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          transition: 'opacity .15s',
        }}>
          Ρυθμίσεις API
        </span>

        {activeModel && (
          <span style={{
            display:'flex', alignItems:'center', gap:'4px',
            fontSize:'11px',
            background:'rgba(16,185,129,.12)', color:'#6ee7b7',
            border:'1px solid rgba(16,185,129,.25)',
            borderRadius:'20px', padding:'2px 10px', fontWeight:'700',
          }}>
            <Zap size={10} /> {modelLabel}
          </span>
        )}

        <span style={{ fontSize:'12px', color: apiKey ? '#6ee7b7' : '#fbbf24', fontWeight:'600' }}>
          {apiKey ? '✓ Key αποθηκευμένο' : '⚠ Απαιτείται API Key'}
        </span>
        {open ? <ChevronUp size={18} color="rgba(148,163,184,.5)" /> : <ChevronDown size={18} color="rgba(148,163,184,.5)" />}
      </div>

      {open && (
        <div style={{ marginTop:'22px', display:'flex', flexDirection:'column', gap:'16px' }}>
          <div>
            <label style={{ fontSize:'11px', fontWeight:'600', color:'rgba(167,139,250,.85)', display:'block', marginBottom:'7px', letterSpacing:'0.6px', textTransform:'uppercase' }}>
              OpenRouter API Key
            </label>
            <div style={{ position:'relative' }}>
              <input
                className="sp-input"
                type={showKey ? 'text' : 'password'}
                placeholder="sk-or-v1-..."
                value={draft}
                onChange={e => { setDraft(e.target.value); setSaved(false) }}
                onKeyDown={e => e.key === 'Enter' && handleSave()}
                style={{
                  width:'100%', padding:'10px 42px 10px 14px', borderRadius:'10px',
                  border: isDirty ? '1px solid rgba(251,191,36,.5)' : saved ? '1px solid rgba(16,185,129,.5)' : '1px solid rgba(255,255,255,.1)',
                  background:'rgba(255,255,255,.06)', color:'#f1f5f9',
                  fontSize:'14px', outline:'none', fontFamily:'inherit', boxSizing:'border-box',
                }}
              />
              <button onClick={() => setShowKey(v => !v)} style={{
                position:'absolute', right:'12px', top:'50%', transform:'translateY(-50%)',
                background:'none', border:'none', cursor:'pointer',
                color:'rgba(148,163,184,.5)', padding:0,
              }}>
                {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <p style={{ fontSize:'11px', color:'rgba(148,163,184,.5)', marginTop:'5px' }}>
              Αποθηκεύεται τοπικά.{' '}
              <a href="https://openrouter.ai/keys" target="_blank" rel="noreferrer" style={{ color:'#a78bfa' }}>openrouter.ai/keys</a>
              {' '}— Χρησιμοποιεί αυτόματα δωρεάν μοντέλα.
            </p>
          </div>

          <div>
            <label style={{ fontSize:'11px', fontWeight:'600', color:'rgba(167,139,250,.85)', display:'block', marginBottom:'9px', letterSpacing:'0.6px', textTransform:'uppercase' }}>
              Διάρκεια αποθήκευσης
            </label>
            <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
              {TTL_OPTIONS.map(opt => (
                <button
                  key={opt.label}
                  onClick={() => setTtl(opt.days)}
                  style={{
                    padding:'6px 14px', borderRadius:'20px', fontSize:'13px',
                    fontWeight:'600', cursor:'pointer',
                    border:'1.5px solid',
                    borderColor: ttl === opt.days ? '#7c3aed' : 'rgba(255,255,255,.1)',
                    background: ttl === opt.days ? 'rgba(124,58,237,.2)' : 'rgba(255,255,255,.04)',
                    color: ttl === opt.days ? '#a78bfa' : 'rgba(148,163,184,.6)',
                    transition: 'all .15s ease',
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
            <button
              onClick={handleSave}
              disabled={!draft}
              style={{
                display:'flex', alignItems:'center', gap:'7px',
                padding:'10px 22px', borderRadius:'10px', fontWeight:'700',
                fontSize:'14px', cursor: draft ? 'pointer' : 'not-allowed',
                border:'none',
                background: saved ? 'rgba(16,185,129,.8)' : isDirty ? 'linear-gradient(135deg,#7c3aed,#ec4899)' : 'rgba(124,58,237,.2)',
                color: saved || isDirty ? 'white' : '#a78bfa',
                boxShadow: isDirty && !saved ? '0 4px 16px rgba(124,58,237,.4)' : 'none',
                transition: 'all .2s',
              }}
            >
              {saved ? <Check size={15} /> : <Save size={15} />}
              {saved ? 'Αποθηκεύτηκε!' : 'Αποθήκευση'}
            </button>
            {isDirty && !saved && (
              <span style={{ fontSize:'12px', color:'rgba(251,191,36,.8)' }}>Πάτα Αποθήκευση ή Enter</span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
