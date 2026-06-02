import { useState } from 'react'
import { Plus, Trash2, GripVertical, Save, X, Settings2 } from 'lucide-react'

export default function FieldTemplateManager({ templates, onSave, saving }) {
  const [fields, setFields] = useState(templates)
  const [newLabel, setNewLabel] = useState('')
  const [adding, setAdding] = useState(false)
  const isDirty = JSON.stringify(fields) !== JSON.stringify(templates)

  function addField() {
    const label = newLabel.trim()
    if (!label || fields.find(f => f.label === label)) return
    const key = label.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
    setFields(f => [...f, { key: key || `field_${Date.now()}`, label }])
    setNewLabel('')
    setAdding(false)
  }

  function removeField(i) { setFields(f => f.filter((_, idx) => idx !== i)) }

  return (
    <div>
      <style>{`
        .ftm-input:focus { border-color:rgba(124,58,237,.6) !important; box-shadow:0 0 0 3px rgba(124,58,237,.15) !important; }
        ::placeholder { color:rgba(148,163,184,.35) !important; }
      `}</style>
      <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'16px' }}>
        <Settings2 size={16} color="#a78bfa" />
        <span style={{
          fontSize:'14px', fontWeight:'700',
          background:'linear-gradient(135deg,#fff 30%,#a78bfa 100%)',
          WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
        }}>
          Κοινά Πεδία Πελατών
        </span>
        <span style={{ fontSize:'12px', color:'rgba(148,163,184,.5)' }}>
          — εμφανίζονται σε όλους τους πελάτες
        </span>
      </div>

      {fields.length === 0 ? (
        <div style={{ fontSize:'13px', color:'rgba(148,163,184,.4)', marginBottom:'12px', fontStyle:'italic' }}>
          Δεν υπάρχουν κοινά πεδία ακόμα.
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:'6px', marginBottom:'12px' }}>
          {fields.map((f, i) => (
            <div key={i} style={{
              display:'flex', alignItems:'center', gap:'8px',
              background:'rgba(124,58,237,.08)', border:'1px solid rgba(124,58,237,.2)',
              borderRadius:'10px', padding:'9px 14px',
            }}>
              <GripVertical size={14} color="rgba(124,58,237,.4)" />
              <span style={{ flex:1, fontSize:'14px', color:'#f1f5f9', fontWeight:'500' }}>{f.label}</span>
              <span style={{ fontSize:'11px', color:'rgba(148,163,184,.4)', fontFamily:'monospace' }}>{f.key}</span>
              <button
                onClick={() => removeField(i)}
                style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(148,163,184,.3)', padding:'2px', display:'flex', transition:'color .15s' }}
                onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(148,163,184,.3)'}
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {adding ? (
        <div style={{ display:'flex', gap:'8px', marginBottom:'12px', alignItems:'center' }}>
          <input
            autoFocus className="ftm-input"
            type="text"
            placeholder="Όνομα πεδίου (π.χ. Διαβατήριο)"
            value={newLabel}
            onChange={e => setNewLabel(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') addField(); if (e.key === 'Escape') setAdding(false) }}
            style={{
              flex:1, padding:'9px 12px', borderRadius:'10px',
              border:'1px solid rgba(124,58,237,.4)',
              background:'rgba(255,255,255,.06)', color:'#f1f5f9',
              fontSize:'14px', outline:'none', fontFamily:'inherit',
            }}
          />
          <button onClick={addField} style={{
            background:'linear-gradient(135deg,#7c3aed,#ec4899)', color:'white',
            border:'none', borderRadius:'8px', padding:'9px 16px',
            cursor:'pointer', fontWeight:'700', fontSize:'13px', whiteSpace:'nowrap',
          }}>
            Προσθήκη
          </button>
          <button onClick={() => { setAdding(false); setNewLabel('') }} style={{
            background:'rgba(255,255,255,.06)', border:'1px solid rgba(255,255,255,.1)',
            borderRadius:'8px', padding:'9px', cursor:'pointer',
            display:'flex', color:'rgba(148,163,184,.6)',
          }}>
            <X size={15} />
          </button>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          style={{
            display:'flex', alignItems:'center', gap:'6px',
            background:'rgba(124,58,237,.08)', color:'#a78bfa',
            border:'1px dashed rgba(124,58,237,.3)', borderRadius:'10px',
            padding:'8px 14px', cursor:'pointer',
            fontSize:'13px', fontWeight:'600', marginBottom:'12px',
            transition:'all .15s',
          }}
        >
          <Plus size={13} /> Νέο πεδίο
        </button>
      )}

      {isDirty && (
        <button
          onClick={() => onSave(fields)}
          disabled={saving}
          style={{
            display:'flex', alignItems:'center', gap:'7px',
            background:'linear-gradient(135deg,#7c3aed,#ec4899)', color:'white',
            border:'none', borderRadius:'10px', padding:'9px 20px',
            cursor:'pointer', fontWeight:'700', fontSize:'13px',
            opacity: saving ? 0.7 : 1,
            boxShadow:'0 4px 14px rgba(124,58,237,.4)',
          }}
        >
          <Save size={14} />
          {saving ? 'Αποθήκευση...' : 'Αποθήκευση αλλαγών'}
        </button>
      )}
    </div>
  )
}
