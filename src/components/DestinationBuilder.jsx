import { Plus, Trash2, MapPin, GripVertical, CalendarDays, Users, Wallet, PlaneTakeoff } from 'lucide-react'

const D = {
  label: {
    fontSize: '11px', fontWeight: '600',
    color: 'rgba(167,139,250,.85)',
    marginBottom: '6px', display: 'block',
    letterSpacing: '0.6px', textTransform: 'uppercase',
  },
  input: {
    width: '100%', padding: '10px 12px', borderRadius: '10px',
    border: '1px solid rgba(255,255,255,.1)',
    background: 'rgba(255,255,255,.06)',
    color: '#f1f5f9',
    fontSize: '14px', outline: 'none',
    fontFamily: 'inherit',
    transition: 'border .2s, box-shadow .2s',
  },
  numInput: {
    width: '70px', padding: '10px 8px', borderRadius: '10px',
    border: '1px solid rgba(255,255,255,.1)',
    background: 'rgba(255,255,255,.06)',
    color: '#f1f5f9',
    fontSize: '14px', textAlign: 'center',
    fontFamily: 'inherit', outline: 'none',
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
  function addDest() { setDestinations(d => [...d, { city: '', country: '', days: 3 }]) }
  function removeDest(i) { setDestinations(d => d.filter((_, idx) => idx !== i)) }
  function updateDest(i, field, val) {
    setDestinations(d => d.map((dest, idx) => idx === i ? { ...dest, [field]: val } : dest))
  }

  const totalDays = destinations.reduce((s, d) => s + (Number(d.days) || 0), 0)

  return (
    <div>
      <style>{`
        .dest-input:focus {
          border-color: rgba(124,58,237,.6) !important;
          box-shadow: 0 0 0 3px rgba(124,58,237,.15) !important;
        }
        .dest-row { transition: border-color .15s, background .15s; }
        .dest-row:hover { border-color: rgba(124,58,237,.3) !important; }
        .dest-add:hover { background: rgba(124,58,237,.2) !important; border-color: rgba(124,58,237,.5) !important; }
        .dest-add { transition: all .15s ease; }
        .budget-pill:hover { border-color: rgba(124,58,237,.5) !important; }
        .budget-pill { transition: all .15s ease; }
        ::placeholder { color: rgba(148,163,184,.35) !important; }
        input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(.7); }
      `}</style>

      {/* Meta Section Title */}
      <div style={{
        fontSize: '16px', fontWeight: '700',
        display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px',
        background: 'linear-gradient(135deg,#fff 30%,#a78bfa 100%)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
      }}>
        <CalendarDays size={18} color="#a78bfa" style={{ WebkitTextFillColor: 'initial', flexShrink: 0 }} />
        Λεπτομέρειες Ταξιδιού
      </div>

      {/* Meta grid */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))',
        gap: '16px', marginBottom: '28px',
      }}>
        <div>
          <label style={D.label}>
            <PlaneTakeoff size={11} style={{ display:'inline', verticalAlign:'middle', marginRight:'4px' }} />
            Πόλη Αναχώρησης
          </label>
          <input className="dest-input" style={D.input} placeholder="π.χ. Αθήνα" value={originCity} onChange={e => setOriginCity(e.target.value)} />
        </div>
        <div>
          <label style={D.label}>
            <CalendarDays size={11} style={{ display:'inline', verticalAlign:'middle', marginRight:'4px' }} />
            Ημερομηνία Έναρξης
          </label>
          <input className="dest-input" type="date" style={D.input} value={startDate} onChange={e => setStartDate(e.target.value)} />
        </div>
        <div>
          <label style={D.label}>
            <Users size={11} style={{ display:'inline', verticalAlign:'middle', marginRight:'4px' }} />
            Ταξιδιώτες
          </label>
          <input className="dest-input" type="number" min="1" max="20" style={D.input} value={travelers} onChange={e => setTravelers(Number(e.target.value))} />
        </div>
        <div>
          <label style={D.label}>
            <Wallet size={11} style={{ display:'inline', verticalAlign:'middle', marginRight:'4px' }} />
            Προϋπολογισμός
          </label>
          <select
            className="dest-input"
            style={{ ...D.input, cursor:'pointer', colorScheme:'dark' }}
            value={budget} onChange={e => setBudget(e.target.value)}
          >
            {BUDGETS.map(b => <option key={b} value={b}>{b.charAt(0).toUpperCase() + b.slice(1)}</option>)}
          </select>
        </div>
      </div>

      {/* Destinations title */}
      <div style={{
        fontSize: '16px', fontWeight: '700',
        display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', marginTop: '8px',
        background: 'linear-gradient(135deg,#fff 30%,#a78bfa 100%)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
      }}>
        <MapPin size={18} color="#a78bfa" style={{ WebkitTextFillColor: 'initial', flexShrink: 0 }} />
        Προορισμοί
        <span style={{ fontSize: '13px', fontWeight: '400', color: 'rgba(148,163,184,.6)', WebkitTextFillColor: 'rgba(148,163,184,.6)', marginLeft: '2px' }}>
          — σύνολο {totalDays} ημερών
        </span>
      </div>

      {/* Column headers */}
      <div style={{
        display: 'grid', gridTemplateColumns: '24px 1fr 1fr 80px 36px',
        gap: '10px', padding: '0 16px 8px',
      }}>
        <div />
        {['Πόλη', 'Χώρα', 'Μέρες', ''].map((h, i) => (
          <div key={i} style={{ fontSize: '10px', fontWeight: '700', color: 'rgba(148,163,184,.5)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>{h}</div>
        ))}
      </div>

      {destinations.map((dest, i) => (
        <div key={i} className="dest-row" style={{
          background: 'rgba(124,58,237,.06)', border: '1px solid rgba(124,58,237,.15)',
          borderRadius: '12px', padding: '12px 16px',
          display: 'grid', gridTemplateColumns: '24px 1fr 1fr 80px 36px',
          gap: '10px', alignItems: 'center', marginBottom: '10px',
        }}>
          <div style={{ color: 'rgba(148,163,184,.4)', display: 'flex', alignItems: 'center' }}>
            <GripVertical size={16} />
          </div>
          <input className="dest-input" style={D.input} placeholder="π.χ. Σεούλ" value={dest.city} onChange={e => updateDest(i, 'city', e.target.value)} />
          <input className="dest-input" style={D.input} placeholder="π.χ. Νότια Κορέα" value={dest.country} onChange={e => updateDest(i, 'country', e.target.value)} />
          <input className="dest-input" type="number" min="1" max="60" style={D.numInput} value={dest.days} onChange={e => updateDest(i, 'days', Number(e.target.value))} />
          <button
            onClick={() => removeDest(i)}
            disabled={destinations.length === 1}
            style={{
              background: 'none', border: 'none',
              cursor: destinations.length === 1 ? 'not-allowed' : 'pointer',
              color: destinations.length === 1 ? 'rgba(148,163,184,.2)' : 'rgba(239,68,68,.6)',
              display: 'flex', padding: '4px',
              transition: 'color .15s',
            }}
            onMouseEnter={e => { if (destinations.length > 1) e.currentTarget.style.color = '#ef4444' }}
            onMouseLeave={e => { if (destinations.length > 1) e.currentTarget.style.color = 'rgba(239,68,68,.6)' }}
          >
            <Trash2 size={16} />
          </button>
        </div>
      ))}

      <button className="dest-add" onClick={addDest} style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        background: 'rgba(124,58,237,.08)', color: '#a78bfa',
        border: '1px dashed rgba(124,58,237,.35)',
        borderRadius: '12px', padding: '11px 16px', cursor: 'pointer',
        fontSize: '14px', fontWeight: '600', width: '100%',
        justifyContent: 'center',
      }}>
        <Plus size={16} /> Πρόσθεσε Προορισμό
      </button>
    </div>
  )
}
