import { useState } from 'react'
import { Plus, Trash2, Save, X } from 'lucide-react'

const FIXED_FIELDS = [
  { key: 'name',  label: 'Ονοματεπώνυμο', type: 'text',  required: true },
  { key: 'email', label: 'Email',          type: 'email', required: false },
  { key: 'phone', label: 'Τηλέφωνο',       type: 'tel',   required: false },
  { key: 'city',  label: 'Πόλη',           type: 'text',  required: false },
]

const inp = {
  width: '100%', padding: '9px 12px', borderRadius: '8px',
  border: '1px solid #d1d5db', fontSize: '14px', outline: 'none',
  fontFamily: 'inherit', boxSizing: 'border-box',
}
const lbl = {
  fontSize: '13px', fontWeight: '600', color: '#374151',
  display: 'block', marginBottom: '5px',
}

// templates: [{ key, label }] — shared across all customers
export default function CustomerForm({ initial = {}, templates = [], onSave, onCancel, saving }) {
  const initFixed = {}
  FIXED_FIELDS.forEach(f => { initFixed[f.key] = initial[f.key] || '' })
  const [fixed, setFixed] = useState(initFixed)
  const [notes, setNotes] = useState(initial.notes || '')

  // Template fields: pre-populated from templates, values from customer data
  const initTemplateValues = {}
  templates.forEach(t => {
    initTemplateValues[t.key] = initial.customFields?.[t.key] || ''
  })
  const [templateValues, setTemplateValues] = useState(initTemplateValues)

  // Extra fields: customer-specific fields NOT in templates
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
      {/* Fixed fields */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
        {FIXED_FIELDS.map(f => (
          <div key={f.key}>
            <label style={lbl}>{f.label}{f.required && ' *'}</label>
            <input
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
      <div style={{ marginBottom: '16px' }}>
        <label style={lbl}>Σημειώσεις</label>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          rows={3}
          style={{ ...inp, resize: 'vertical' }}
        />
      </div>

      {/* Template fields (shared schema) */}
      {templates.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: '#6366f1', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#6366f1', display: 'inline-block' }} />
            Κοινά Πεδία
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {templates.map(t => (
              <div key={t.key}>
                <label style={{ ...lbl, color: '#4f46e5' }}>{t.label}</label>
                <input
                  type="text"
                  value={templateValues[t.key] || ''}
                  onChange={e => setTemplateValues(v => ({ ...v, [t.key]: e.target.value }))}
                  style={{ ...inp, borderColor: '#c7d2fe' }}
                  placeholder={`${t.label}...`}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Extra customer-specific fields */}
      {extraFields.length > 0 && (
        <div style={{ marginBottom: '14px' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: '#9ca3af', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Επιπλέον Πεδία
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {extraFields.map((f, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '140px 1fr 32px', gap: '8px', alignItems: 'center' }}>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#374151', background: '#f3f4f6', padding: '9px 10px', borderRadius: '8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {f.label}
                </div>
                <input
                  type="text"
                  value={f.value}
                  onChange={e => setExtraFields(ef => ef.map((x, idx) => idx === i ? { ...x, value: e.target.value } : x))}
                  style={inp}
                />
                <button
                  onClick={() => setExtraFields(ef => ef.filter((_, idx) => idx !== i))}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#d1d5db', padding: '4px', display: 'flex' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                  onMouseLeave={e => e.currentTarget.style.color = '#d1d5db'}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add extra field */}
      <div style={{ marginBottom: '20px' }}>
        {addingField ? (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input
              autoFocus
              type="text"
              placeholder="Όνομα πεδίου (μόνο για αυτόν τον πελάτη)"
              value={newLabel}
              onChange={e => setNewLabel(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { addExtraField() } else if (e.key === 'Escape') { setAddingField(false) } }}
              style={{ ...inp, flex: 1 }}
            />
            <button onClick={addExtraField} style={{ background: '#4f46e5', color: 'white', border: 'none', borderRadius: '8px', padding: '9px 14px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>
              OK
            </button>
            <button onClick={() => setAddingField(false)} style={{ background: '#f3f4f6', border: 'none', borderRadius: '8px', padding: '9px', cursor: 'pointer', display: 'flex', color: '#6b7280' }}>
              <X size={15} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setAddingField(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#eef2ff', color: '#4f46e5', border: '1px dashed #a5b4fc', borderRadius: '8px', padding: '8px 14px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}
          >
            <Plus size={14} /> Προσθήκη πεδίου (μόνο αυτός)
          </button>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
        {onCancel && (
          <button onClick={onCancel} style={{ background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '8px', padding: '10px 20px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}>
            Άκυρο
          </button>
        )}
        <button
          onClick={handleSave}
          disabled={saving || !fixed.name}
          style={{
            display: 'flex', alignItems: 'center', gap: '7px',
            background: saving || !fixed.name ? '#c7d2fe' : 'linear-gradient(135deg, #4f46e5, #7c3aed)',
            color: 'white', border: 'none', borderRadius: '8px',
            padding: '10px 22px', cursor: saving || !fixed.name ? 'not-allowed' : 'pointer',
            fontWeight: '700', fontSize: '14px',
          }}
        >
          <Save size={15} />
          {saving ? 'Αποθήκευση...' : 'Αποθήκευση'}
        </button>
      </div>
    </div>
  )
}
