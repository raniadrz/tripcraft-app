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

  function removeField(i) {
    setFields(f => f.filter((_, idx) => idx !== i))
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <Settings2 size={16} color="#6366f1" />
        <span style={{ fontSize: '14px', fontWeight: '700', color: '#312e81' }}>
          Κοινά Πεδία Πελατών
        </span>
        <span style={{ fontSize: '12px', color: '#9ca3af' }}>
          — εμφανίζονται σε όλους τους πελάτες
        </span>
      </div>

      {/* Existing fields */}
      {fields.length === 0 ? (
        <div style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '12px', fontStyle: 'italic' }}>
          Δεν υπάρχουν κοινά πεδία ακόμα.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px' }}>
          {fields.map((f, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: '#f8f7ff', border: '1px solid #e0e7ff',
              borderRadius: '8px', padding: '8px 12px',
            }}>
              <GripVertical size={14} color="#c7d2fe" />
              <span style={{ flex: 1, fontSize: '14px', color: '#1e1b4b', fontWeight: '500' }}>
                {f.label}
              </span>
              <span style={{ fontSize: '11px', color: '#9ca3af', fontFamily: 'monospace' }}>
                {f.key}
              </span>
              <button
                onClick={() => removeField(i)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#d1d5db', padding: '2px', display: 'flex' }}
                onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                onMouseLeave={e => e.currentTarget.style.color = '#d1d5db'}
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add field */}
      {adding ? (
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', alignItems: 'center' }}>
          <input
            autoFocus
            type="text"
            placeholder="Όνομα πεδίου (π.χ. Διαβατήριο)"
            value={newLabel}
            onChange={e => setNewLabel(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') addField(); if (e.key === 'Escape') setAdding(false) }}
            style={{
              flex: 1, padding: '8px 12px', borderRadius: '8px',
              border: '1px solid #a5b4fc', fontSize: '14px',
              outline: 'none', fontFamily: 'inherit',
            }}
          />
          <button onClick={addField} style={{ background: '#4f46e5', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 14px', cursor: 'pointer', fontWeight: '600', fontSize: '13px', whiteSpace: 'nowrap' }}>
            Προσθήκη
          </button>
          <button onClick={() => { setAdding(false); setNewLabel('') }} style={{ background: '#f3f4f6', border: 'none', borderRadius: '8px', padding: '8px', cursor: 'pointer', display: 'flex', color: '#6b7280' }}>
            <X size={15} />
          </button>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: 'none', color: '#6366f1',
            border: '1px dashed #a5b4fc', borderRadius: '8px',
            padding: '7px 14px', cursor: 'pointer',
            fontSize: '13px', fontWeight: '600', marginBottom: '12px',
          }}
        >
          <Plus size={13} /> Νέο πεδίο
        </button>
      )}

      {/* Save */}
      {isDirty && (
        <button
          onClick={() => onSave(fields)}
          disabled={saving}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: '#4f46e5', color: 'white', border: 'none',
            borderRadius: '8px', padding: '8px 18px', cursor: 'pointer',
            fontWeight: '700', fontSize: '13px', opacity: saving ? 0.7 : 1,
          }}
        >
          <Save size={14} />
          {saving ? 'Αποθήκευση...' : 'Αποθήκευση αλλαγών'}
        </button>
      )}
    </div>
  )
}
