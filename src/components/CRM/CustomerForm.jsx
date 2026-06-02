import { useState } from 'react'
import { Plus, Trash2, Save, X } from 'lucide-react'

const FIXED_FIELDS = [
  { key: 'name',  label: 'Ονοματεπώνυμο', type: 'text',  required: true },
  { key: 'email', label: 'Email',          type: 'email', required: false },
  { key: 'phone', label: 'Τηλέφωνο',       type: 'tel',   required: false },
  { key: 'city',  label: 'Πόλη',           type: 'text',  required: false },
]

const inp = {
  width: '100%', padding: '10px 12px', borderRadius: '10px',
  border: '1px solid rgba(255,255,255,.1)',
  background: 'rgba(255,255,255,.06)',
  color: '#f1f5f9',
  fontSize: '14px', outline: 'none',
  fontFamily: 'inherit', boxSizing: 'border-box',
  transition: 'border .2s, box-shadow .2s',
}
const lbl = {
  fontSize: '11px', fontWeight: '600',
  color: 'rgba(167,139,250,.85)',
  display: 'block', marginBottom: '6px',
  letterSpacing: '0.5px', textTransform: 'uppercase',
}

export default function CustomerForm({ initial = {}, templates = [], onSave, onCancel, saving }) {
  const initFixed = {}
  FIXED_FIELDS.forEach(f => { initFixed[f.key] = initial[f.key] || '' })
  const [fixed, setFixed] = useState(initFixed)
  const [notes, setNotes] = useState(initial.notes || '')

  const initTemplateValues = {}
  templates.forEach(t => { initTemplateValues[t.key] = initial.customFields?.[t.key] || '' })
  const [templateValues, setTemplateValues] = useState(initTemplateValues)

  const templateKeys = new Set(templates.map(t => t.key))
  const initExtra = Object.entries(initial.customFields || {})
    .filter(([k]) => !templateKeys.has(k))
    .map(([k, v]) => ({ key: k, label: k.replace(/_/g, ' '), value: v }))
  const [extraFields, setExtraFields] = useState(initExtra)
  const [newLabel, setNewLabel] = useState('')
  const [addingField, setAddingField] = useState(false)

  function addExtraField() {
    const label = newLabel.trim()
    if (!label) return
    const key = label.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '') || `field_${Date.now()}`
    setExtraFields(f => [...f, { key, label, value: '' }])
    setNewLabel('')
    setAddingField(false)
  }

  function handleSave() {
    const customFields = { ...templateValues }
    extraFields.forEach(f => { customFields[f.key] = f.value })
    onSave({ ...fixed, notes, customFields })
  }

  return (
    <div>
      <style>{`
        .cf-input:focus { border-color:rgba(124,58,237,.6) !important; box-shadow:0 0 0 3px rgba(124,58,237,.15) !important; }
        ::placeholder { color:rgba(148,163,184,.35) !important; }
      `}</style>

      {/* Fixed fields */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px', marginBottom:'14px' }}>
        {FIXED_FIELDS.map(f => (
          <div key={f.key}>
            <label style={lbl}>{f.label}{f.required && ' *'}</label>
            <input
              className="cf-input"
              type={f.type}
              value={fixed[f.key]}
              onChange={e => setFixed(s => ({ ...s, [f.key]: e.target.value }))}
              required={f.required}
              style={inp}
            />
          </div>
        ))}
      </div>

      {/* Notes */}
      <div style={{ marginBottom:'16px' }}>
        <label style={lbl}>Σημειώσεις</label>
        <textarea
          className="cf-input"
          value={notes}
          onChange={e => setNotes(e.target.value)}
          rows={3}
          style={{ ...inp, resize:'vertical' }}
        />
      </div>

      {/* Template fields */}
      {templates.length > 0 && (
        <div style={{ marginBottom:'16px' }}>
          <div style={{ fontSize:'11px', fontWeight:'700', color:'#a78bfa', marginBottom:'10px', textTransform:'uppercase', letterSpacing:'0.06em', display:'flex', alignItems:'center', gap:'6px' }}>
            <span style={{ width:'6px', height:'6px', borderRadius:'50%', background:'linear-gradient(135deg,#7c3aed,#ec4899)', display:'inline-block' }} />
            Κοινά Πεδία
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
            {templates.map(t => (
              <div key={t.key}>
                <label style={{ ...lbl, color:'rgba(167,139,250,.9)' }}>{t.label}</label>
                <input
                  className="cf-input"
                  type="text"
                  value={templateValues[t.key] || ''}
                  onChange={e => setTemplateValues(v => ({ ...v, [t.key]: e.target.value }))}
                  style={{ ...inp, borderColor:'rgba(124,58,237,.25)' }}
                  placeholder={`${t.label}...`}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Extra fields */}
      {extraFields.length > 0 && (
        <div style={{ marginBottom:'14px' }}>
          <div style={{ fontSize:'11px', fontWeight:'700', color:'rgba(148,163,184,.5)', marginBottom:'10px', textTransform:'uppercase', letterSpacing:'0.06em' }}>
            Επιπλέον Πεδία
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
            {extraFields.map((f, i) => (
              <div key={i} style={{ display:'grid', gridTemplateColumns:'140px 1fr 32px', gap:'8px', alignItems:'center' }}>
                <div style={{
                  fontSize:'13px', fontWeight:'600', color:'rgba(167,139,250,.8)',
                  background:'rgba(124,58,237,.1)', border:'1px solid rgba(124,58,237,.2)',
                  padding:'9px 10px', borderRadius:'8px',
                  overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
                }}>
                  {f.label}
                </div>
                <input
                  className="cf-input"
                  type="text"
                  value={f.value}
                  onChange={e => setExtraFields(ef => ef.map((x, idx) => idx === i ? { ...x, value: e.target.value } : x))}
                  style={inp}
                />
                <button
                  onClick={() => setExtraFields(ef => ef.filter((_, idx) => idx !== i))}
                  style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(148,163,184,.3)', padding:'4px', display:'flex', transition:'color .15s' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                  onMouseLeave={e => e.currentTarget.style.color = 'rgba(148,163,184,.3)'}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add extra field */}
      <div style={{ marginBottom:'22px' }}>
        {addingField ? (
          <div style={{ display:'flex', gap:'8px', alignItems:'center' }}>
            <input
              autoFocus className="cf-input"
              type="text"
              placeholder="Όνομα πεδίου (μόνο για αυτόν τον πελάτη)"
              value={newLabel}
              onChange={e => setNewLabel(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') addExtraField(); else if (e.key === 'Escape') setAddingField(false) }}
              style={{ ...inp, flex:1 }}
            />
            <button onClick={addExtraField} style={{ background:'linear-gradient(135deg,#7c3aed,#ec4899)', color:'white', border:'none', borderRadius:'8px', padding:'10px 16px', cursor:'pointer', fontWeight:'700', fontSize:'13px' }}>
              OK
            </button>
            <button onClick={() => setAddingField(false)} style={{ background:'rgba(255,255,255,.08)', border:'1px solid rgba(255,255,255,.1)', borderRadius:'8px', padding:'10px', cursor:'pointer', display:'flex', color:'rgba(148,163,184,.6)' }}>
              <X size={15} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setAddingField(true)}
            style={{
              display:'flex', alignItems:'center', gap:'6px',
              background:'rgba(124,58,237,.08)', color:'#a78bfa',
              border:'1px dashed rgba(124,58,237,.3)', borderRadius:'10px',
              padding:'8px 16px', cursor:'pointer', fontSize:'13px', fontWeight:'600',
              transition:'all .15s',
            }}
          >
            <Plus size={14} /> Προσθήκη πεδίου (μόνο αυτός)
          </button>
        )}
      </div>

      {/* Actions */}
      <div style={{ display:'flex', gap:'10px', justifyContent:'flex-end' }}>
        {onCancel && (
          <button onClick={onCancel} style={{
            background:'rgba(255,255,255,.06)', color:'rgba(148,163,184,.8)',
            border:'1px solid rgba(255,255,255,.1)', borderRadius:'10px',
            padding:'10px 20px', cursor:'pointer', fontWeight:'600', fontSize:'14px',
          }}>
            Άκυρο
          </button>
        )}
        <button
          onClick={handleSave}
          disabled={saving || !fixed.name}
          style={{
            display:'flex', alignItems:'center', gap:'7px',
            background: saving || !fixed.name ? 'rgba(124,58,237,.2)' : 'linear-gradient(135deg,#7c3aed,#ec4899)',
            color: saving || !fixed.name ? 'rgba(167,139,250,.4)' : 'white',
            border:'none', borderRadius:'10px',
            padding:'10px 24px',
            cursor: saving || !fixed.name ? 'not-allowed' : 'pointer',
            fontWeight:'700', fontSize:'14px',
            boxShadow: saving || !fixed.name ? 'none' : '0 4px 16px rgba(124,58,237,.4)',
          }}
        >
          <Save size={15} />
          {saving ? 'Αποθήκευση...' : 'Αποθήκευση'}
        </button>
      </div>
    </div>
  )
}
