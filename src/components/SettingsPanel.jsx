import { useState } from 'react'
import { Settings, Eye, EyeOff, ChevronDown, ChevronUp, Save, Check, Zap } from 'lucide-react'

const s = {
  label: { fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px', display: 'block' },
  input: {
    width: '100%', padding: '10px 12px', borderRadius: '8px',
    border: '1px solid #d1d5db', fontSize: '14px', outline: 'none',
    transition: 'border-color 0.2s', fontFamily: 'inherit',
  },
  header: { display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', userSelect: 'none' },
  title: { fontSize: '16px', fontWeight: '700', color: '#312e81', flex: 1 },
}

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
  const [ttl, setTtl] = useState(30) // days, null = forever

  const isDirty = draft !== apiKey

  function handleSave() {
    setApiKey(draft, ttl)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  // pretty-print model id
  const modelLabel = activeModel
    ? activeModel.split('/').pop().replace(':free', '').replace(/-/g, ' ')
    : null

  return (
    <div>
      <div style={s.header} onClick={() => setOpen(o => !o)}>
        <Settings size={18} color="#4f46e5" />
        <span style={s.title}>Ρυθμίσεις API</span>

        {/* Active model badge */}
        {activeModel && (
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', borderRadius: '20px', padding: '2px 10px', fontWeight: '700' }}>
            <Zap size={10} /> {modelLabel}
          </span>
        )}

        <span style={{ fontSize: '12px', color: apiKey ? '#16a34a' : '#b45309' }}>
          {apiKey ? '✓ Key αποθηκευμένο' : '⚠ Απαιτείται API Key'}
        </span>
        {open ? <ChevronUp size={18} color="#6b7280" /> : <ChevronDown size={18} color="#6b7280" />}
      </div>

      {open && (
        <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={s.label}>OpenRouter API Key</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showKey ? 'text' : 'password'}
                placeholder="sk-or-v1-..."
                value={draft}
                onChange={e => { setDraft(e.target.value); setSaved(false) }}
                onKeyDown={e => e.key === 'Enter' && handleSave()}
                style={{
                  ...s.input, paddingRight: '40px',
                  border: isDirty ? '1px solid #f59e0b' : saved ? '1px solid #22c55e' : '1px solid #d1d5db',
                }}
              />
              <button onClick={() => setShowKey(v => !v)} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
                {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <p style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px' }}>
              Αποθηκεύεται τοπικά.{' '}
              <a href="https://openrouter.ai/keys" target="_blank" rel="noreferrer" style={{ color: '#4f46e5' }}>openrouter.ai/keys</a>
              {' '}— Χρησιμοποιεί αυτόματα δωρεάν μοντέλα.
            </p>
          </div>

          <div>
            <label style={s.label}>Διάρκεια αποθήκευσης</label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {TTL_OPTIONS.map(opt => (
                <button
                  key={opt.label}
                  onClick={() => setTtl(opt.days)}
                  style={{
                    padding: '6px 14px', borderRadius: '20px', fontSize: '13px',
                    fontWeight: '600', cursor: 'pointer', transition: 'all 0.15s',
                    border: '1.5px solid',
                    borderColor: ttl === opt.days ? '#4f46e5' : '#e5e7eb',
                    background: ttl === opt.days ? '#ede9fe' : 'white',
                    color: ttl === opt.days ? '#4f46e5' : '#6b7280',
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={handleSave}
              disabled={!draft}
              style={{
                display: 'flex', alignItems: 'center', gap: '7px',
                padding: '9px 20px', borderRadius: '8px', fontWeight: '600',
                fontSize: '14px', cursor: draft ? 'pointer' : 'not-allowed',
                border: 'none', transition: 'all 0.2s',
                background: saved ? '#22c55e' : isDirty ? '#4f46e5' : '#e0e7ff',
                color: saved || isDirty ? 'white' : '#6366f1',
              }}
            >
              {saved ? <Check size={15} /> : <Save size={15} />}
              {saved ? 'Αποθηκεύτηκε!' : 'Αποθήκευση'}
            </button>
            {isDirty && !saved && (
              <span style={{ fontSize: '12px', color: '#b45309' }}>Πάτα Αποθήκευση ή Enter</span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
