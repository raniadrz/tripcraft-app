import { Plus, Trash2, MapPin, GripVertical, CalendarDays, Users, Wallet, PlaneTakeoff } from 'lucide-react'

const s = {
  label: { fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px', display: 'block' },
  input: {
    width: '100%', padding: '9px 12px', borderRadius: '8px',
    border: '1px solid #d1d5db', fontSize: '14px', outline: 'none',
    fontFamily: 'inherit', background: 'white',
  },
  select: {
    padding: '9px 12px', borderRadius: '8px',
    border: '1px solid #d1d5db', fontSize: '14px', outline: 'none',
    background: 'white', fontFamily: 'inherit', cursor: 'pointer',
  },
  destCard: {
    background: '#f8f7ff', border: '1px solid #e0e7ff', borderRadius: '12px',
    padding: '16px', display: 'grid',
    gridTemplateColumns: '24px 1fr 1fr 80px 36px',
    gap: '10px', alignItems: 'center', marginBottom: '10px',
  },
  numInput: {
    width: '70px', padding: '9px 8px', borderRadius: '8px',
    border: '1px solid #d1d5db', fontSize: '14px', textAlign: 'center',
    fontFamily: 'inherit',
  },
  addBtn: {
    display: 'flex', alignItems: 'center', gap: '6px',
    background: '#eef2ff', color: '#4f46e5', border: '1px dashed #a5b4fc',
    borderRadius: '10px', padding: '10px 16px', cursor: 'pointer',
    fontSize: '14px', fontWeight: '600', width: '100%',
    justifyContent: 'center', transition: 'background 0.15s',
  },
  sectionTitle: {
    fontSize: '16px', fontWeight: '700', color: '#312e81',
    display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px',
  },
  metaGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '14px', marginBottom: '24px',
  },
}

const BUDGETS = ['οικονομικό', 'μέτριο', 'άνετο', 'πολυτελές']

export default function DestinationBuilder({
  destinations, setDestinations,
  startDate, setStartDate,
  travelers, setTravelers,
  budget, setBudget,
  originCity, setOriginCity,
}) {
  function addDest() {
    setDestinations(d => [...d, { city: '', country: '', days: 3 }])
  }

  function removeDest(i) {
    setDestinations(d => d.filter((_, idx) => idx !== i))
  }

  function updateDest(i, field, val) {
    setDestinations(d => d.map((dest, idx) => idx === i ? { ...dest, [field]: val } : dest))
  }

  const totalDays = destinations.reduce((s, d) => s + (Number(d.days) || 0), 0)

  return (
    <div>
      {/* Meta info */}
      <div style={s.sectionTitle}>
        <CalendarDays size={18} color="#4f46e5" />
        Λεπτομέρειες Ταξιδιού
      </div>
      <div style={s.metaGrid}>
        <div>
          <label style={s.label}><PlaneTakeoff size={13} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />Πόλη Αναχώρησης</label>
          <input
            style={s.input}
            placeholder="π.χ. Αθήνα"
            value={originCity}
            onChange={e => setOriginCity(e.target.value)}
          />
        </div>
        <div>
          <label style={s.label}><CalendarDays size={13} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />Ημερομηνία Έναρξης</label>
          <input
            type="date"
            style={s.input}
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
          />
        </div>
        <div>
          <label style={s.label}><Users size={13} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />Ταξιδιώτες</label>
          <input
            type="number" min="1" max="20"
            style={s.input}
            value={travelers}
            onChange={e => setTravelers(Number(e.target.value))}
          />
        </div>
        <div>
          <label style={s.label}><Wallet size={13} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />Προϋπολογισμός</label>
          <select style={{ ...s.input, cursor: 'pointer' }} value={budget} onChange={e => setBudget(e.target.value)}>
            {BUDGETS.map(b => <option key={b} value={b}>{b.charAt(0).toUpperCase() + b.slice(1)}</option>)}
          </select>
        </div>
      </div>

      {/* Destinations */}
      <div style={{ ...s.sectionTitle, marginTop: '8px' }}>
        <MapPin size={18} color="#4f46e5" />
        Προορισμοί
        <span style={{ fontSize: '13px', fontWeight: '400', color: '#6b7280', marginLeft: '4px' }}>
          — σύνολο {totalDays} ημερών
        </span>
      </div>

      {/* Column headers */}
      <div style={{
        display: 'grid', gridTemplateColumns: '24px 1fr 1fr 80px 36px',
        gap: '10px', padding: '0 0 6px 0', marginBottom: '4px',
      }}>
        <div />
        <div style={{ fontSize: '11px', fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Πόλη</div>
        <div style={{ fontSize: '11px', fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Χώρα</div>
        <div style={{ fontSize: '11px', fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Μέρες</div>
        <div />
      </div>

      {destinations.map((dest, i) => (
        <div key={i} style={s.destCard}>
          <div style={{ color: '#9ca3af', display: 'flex', alignItems: 'center' }}>
            <GripVertical size={16} />
          </div>
          <input
            style={s.input}
            placeholder="π.χ. Σεούλ"
            value={dest.city}
            onChange={e => updateDest(i, 'city', e.target.value)}
          />
          <input
            style={s.input}
            placeholder="π.χ. Νότια Κορέα"
            value={dest.country}
            onChange={e => updateDest(i, 'country', e.target.value)}
          />
          <input
            type="number" min="1" max="60"
            style={s.numInput}
            value={dest.days}
            onChange={e => updateDest(i, 'days', Number(e.target.value))}
          />
          <button
            onClick={() => removeDest(i)}
            disabled={destinations.length === 1}
            style={{
              background: 'none', border: 'none', cursor: destinations.length === 1 ? 'not-allowed' : 'pointer',
              color: destinations.length === 1 ? '#d1d5db' : '#ef4444', display: 'flex', padding: '4px',
            }}
          >
            <Trash2 size={16} />
          </button>
        </div>
      ))}

      <button style={s.addBtn} onClick={addDest}>
        <Plus size={16} /> Πρόσθεσε Προορισμό
      </button>
    </div>
  )
}
