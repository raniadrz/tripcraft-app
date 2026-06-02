import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import SettingsPanel from './SettingsPanel'
import DestinationBuilder from './DestinationBuilder'
import ItineraryView from './ItineraryView'
import { callOpenRouter } from '../utils/openrouter'
import { exportToWord } from '../utils/exportWord'
import { addTrip, extractSummary } from '../utils/db'
import {
  Sparkles, Download, AlertCircle, Save, Check,
  User, X, ChevronDown,
} from 'lucide-react'

const D = {
  card: {
    background: 'rgba(255,255,255,.04)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: '1px solid rgba(124,58,237,.15)',
    borderRadius: '18px',
    padding: '28px',
    marginBottom: '22px',
  },
}

export default function TripPlanner({ customers = [], onGoToCRM }) {
  const user = useAuth()

  const [apiKey, setApiKey] = useState(() => {
    try {
      const raw = localStorage.getItem('or_apikey')
      if (!raw) return ''
      const { key, expires } = JSON.parse(raw)
      if (expires && Date.now() > expires) { localStorage.removeItem('or_apikey'); return '' }
      return key || ''
    } catch { return localStorage.getItem('or_apikey') || '' }
  })
  const [activeModel, setActiveModel] = useState('')

  const [destinations, setDestinations] = useState([{ city: 'Αθήνα', country: 'Ελλάδα', days: 3 }])
  const [startDate, setStartDate] = useState('')
  const [travelers, setTravelers] = useState(2)
  const [budget, setBudget] = useState('μέτριο')
  const [originCity, setOriginCity] = useState('Θεσσαλονίκη')

  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [showCustomerPicker, setShowCustomerPicker] = useState(false)

  const [itinerary, setItinerary] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [error, setError] = useState('')
  const [tripTitle, setTripTitle] = useState('')

  const [savedToCustomer, setSavedToCustomer] = useState(false)
  const [saving, setSaving] = useState(false)

  function saveApiKey(key, ttlDays) {
    setApiKey(key)
    const expires = ttlDays ? Date.now() + ttlDays * 86_400_000 : null
    localStorage.setItem('or_apikey', JSON.stringify({ key, expires }))
  }

  function buildPrompt() {
    const segments = destinations.map((d, i) => {
      let date = ''
      if (startDate) {
        const dt = new Date(startDate)
        const offset = destinations.slice(0, i).reduce((s, d) => s + d.days, 0)
        dt.setDate(dt.getDate() + offset)
        date = ` (από ${dt.toLocaleDateString('el-GR', { day: '2-digit', month: 'long', year: 'numeric' })})`
      }
      return `- ${d.city}, ${d.country}: ${d.days} ημέρες${date}`
    })
    const totalDays = destinations.reduce((s, d) => s + d.days, 0)
    const title = destinations.map(d => d.city).join(' → ')
    setTripTitle(title)

    return `Είσαι έμπειρος travel planner. Φτιάξε μια ΠΛΗΡΗ και ΛΕΠΤΟΜΕΡΗ ατζέντα ταξιδιού για ${travelers} άτομο/α με προϋπολογισμό: ${budget}.

## Δεδομένα ταξιδιού
- Αναχώρηση από: **${originCity}**
- Συνολικές μέρες: **${totalDays}**
- Προορισμοί:
${segments.join('\n')}

---

Δόμησε την απάντηση ΑΠΟΚΛΕΙΣΤΙΚΑ σε Markdown με τις παρακάτω ενότητες για ΚΑΘΕ προορισμό:

## ✈️ Μεταφορά: [Προηγούμενος] → [Τρέχων Προορισμός]
- Αεροπορικά: εταιρείες που εξυπηρετούν τη διαδρομή, εκτιμώμενο κόστος ανά άτομο (€), διάρκεια πτήσης
- Εναλλακτικές (αν υπάρχουν): πλοίο / τρένο / λεωφορείο με κόστος και διάρκεια
- Συμβουλές κράτησης

## 🏠 Διαμονή: [Πόλη] ([Χ] νύχτες)
- Airbnb: 3 προτεινόμενες περιοχές για αναζήτηση με εκτιμώμενες τιμές ανά νύχτα (€)
- Ξενοδοχεία: εναλλακτικές επιλογές με εκτιμώμενο εύρος τιμών
- Καλύτερες γειτονιές για τουρίστες

## 🗓️ Ημερήσιο Πρόγραμμα: [Πόλη]
Για κάθε μέρα (Μέρα 1, Μέρα 2, κλπ.):
### Μέρα X — [Θέμα/Τίτλος]
**Πρωί (09:00–13:00)**
- Δραστηριότητα με σύντομη περιγραφή

**Απόγευμα (13:00–19:00)**
- Δραστηριότητες, μεσημεριανό (εκτ. κόστος €/άτομο)

**Βράδυ (19:00–23:00)**
- Βραδινό, ψυχαγωγία (εκτ. κόστος €/άτομο)

## 🚌 Τοπικές Μεταφορές: [Πόλη]
- Μέσα Μαζικής Μεταφοράς, Taxi/Ride-share, Ποδήλατο/Πεζοπορία

## 🏛️ Αξιοθέατα & Μουσεία: [Πόλη]
| Αξιοθέατο | Τύπος | Τιμή Εισόδου | Διάρκεια | Ώρες |
|---|---|---|---|---|

## 💰 Συνολικός Εκτιμώμενος Προϋπολογισμός
| Κατηγορία | Κόστος (€/άτομο) |
|---|---|
| Αεροπορικά | |
| Διαμονή | |
| Τοπικές μεταφορές | |
| Φαγητό | |
| Αξιοθέατα/Δραστηριότητες | |
| **ΣΥΝΟΛΟ** | |

---

ΣΗΜΑΝΤΙΚΟ: Γράψε ΟΛΟΚΛΗΡΗ την ατζέντα χωρίς καμία περικοπή. Κάλυψε ΚΑΘΕ μέρα για ΚΑΘΕ προορισμό. Χρησιμοποίησε πραγματικές τιμές. Γράψε στα **Ελληνικά**.`
  }

  async function generate() {
    if (!apiKey) { setError('Παρακαλώ εισήγαγε το OpenRouter API Key στις ρυθμίσεις.'); return }
    if (destinations.length === 0) { setError('Πρόσθεσε τουλάχιστον έναν προορισμό.'); return }
    setError('')
    setItinerary('')
    setSavedToCustomer(false)
    setStreaming(true)
    try {
      await callOpenRouter(
        apiKey, null,
        [{ role: 'user', content: buildPrompt() }],
        (_, full) => setItinerary(full),
        setActiveModel,
      )
    } catch (e) {
      setError(e.message)
    } finally {
      setStreaming(false)
    }
  }

  async function handleSaveToCustomer() {
    if (!selectedCustomer || !itinerary) return
    setSaving(true)
    try {
      await addTrip(user.uid, selectedCustomer.id, {
        title: destinations.map(d => `${d.city} (${d.days}μ)`).join(' → '),
        destinations: destinations.map(d => d.city).join(', '),
        originCity, travelers, budget, startDate,
        summary: extractSummary(itinerary),
        fullItinerary: itinerary,
      })
      setSavedToCustomer(true)
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleExport() {
    if (!itinerary) return
    await exportToWord(itinerary, `Ταξίδι: ${tripTitle || destinations.map(d => d.city).join(' - ')}`)
  }

  return (
    <div style={{ animation: 'pageEnter .5s ease both' }}>
      <style>{`
        @keyframes pageEnter {
          from { opacity:0; transform:translateY(18px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes cardStagger {
          from { opacity:0; transform:translateY(14px); }
          to   { opacity:1; transform:translateY(0); }
        }
        .tp-card { animation: cardStagger .45s ease both; }
        .tp-card:nth-child(1) { animation-delay:.05s; }
        .tp-card:nth-child(2) { animation-delay:.12s; }
        .tp-card:nth-child(3) { animation-delay:.19s; }
        .tp-card:nth-child(4) { animation-delay:.26s; }
        .tp-btn-main:hover { filter:brightness(1.12); transform:translateY(-1px); box-shadow:0 8px 24px rgba(124,58,237,.45) !important; }
        .tp-btn-main { transition:all .18s ease; }
        .tp-btn-sec:hover { filter:brightness(1.1); transform:translateY(-1px); }
        .tp-btn-sec { transition:all .18s ease; }
        .cust-row:hover { border-color:rgba(124,58,237,.5) !important; background:rgba(124,58,237,.08) !important; }
        .cust-row { transition:all .15s ease; }
      `}</style>

      {/* Settings */}
      <div className="tp-card" style={D.card}>
        <SettingsPanel apiKey={apiKey} setApiKey={saveApiKey} activeModel={streaming ? activeModel : ''} />
      </div>

      {/* Customer picker */}
      <div className="tp-card" style={D.card}>
        <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom: selectedCustomer || showCustomerPicker ? '16px' : 0 }}>
          <User size={18} color="#a78bfa" />
          <span style={{
            fontSize:'16px', fontWeight:'700', flex:1,
            background:'linear-gradient(135deg,#fff 30%,#a78bfa 100%)',
            WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
          }}>Πελάτης</span>
          {selectedCustomer ? (
            <button onClick={() => setSelectedCustomer(null)} style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(148,163,184,.6)', display:'flex', padding:'2px' }}>
              <X size={15} />
            </button>
          ) : (
            <button
              onClick={() => setShowCustomerPicker(v => !v)}
              style={{
                display:'flex', alignItems:'center', gap:'5px',
                background:'rgba(124,58,237,.15)', color:'#a78bfa',
                border:'1px solid rgba(124,58,237,.3)', borderRadius:'8px',
                padding:'6px 14px', cursor:'pointer', fontSize:'13px', fontWeight:'600',
              }}
            >
              {showCustomerPicker ? 'Κλείσιμο' : 'Επιλογή πελάτη'}
              <ChevronDown size={13} />
            </button>
          )}
        </div>

        {selectedCustomer ? (
          <div style={{
            display:'flex', alignItems:'center', gap:'12px',
            background:'rgba(16,185,129,.1)', border:'1px solid rgba(16,185,129,.25)',
            borderRadius:'12px', padding:'12px 16px',
          }}>
            <div style={{
              width:'36px', height:'36px', borderRadius:'50%', flexShrink:0,
              background:'linear-gradient(135deg,#7c3aed,#ec4899)',
              display:'flex', alignItems:'center', justifyContent:'center',
              color:'white', fontWeight:'700', fontSize:'15px',
              boxShadow:'0 0 12px rgba(124,58,237,.4)',
            }}>
              {(selectedCustomer.name || '?')[0].toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight:'700', color:'#6ee7b7' }}>{selectedCustomer.name}</div>
              {selectedCustomer.email && <div style={{ fontSize:'12px', color:'rgba(110,231,183,.6)' }}>{selectedCustomer.email}</div>}
            </div>
            <Check size={16} color="#6ee7b7" style={{ marginLeft:'auto' }} />
          </div>
        ) : showCustomerPicker && (
          <div style={{
            border:'1px solid rgba(124,58,237,.2)', borderRadius:'12px',
            overflow:'hidden', maxHeight:'220px', overflowY:'auto',
            background:'rgba(0,0,0,.2)',
          }}>
            {customers.length === 0 ? (
              <div style={{ padding:'20px', textAlign:'center', color:'rgba(148,163,184,.6)', fontSize:'14px' }}>
                Δεν υπάρχουν πελάτες.{' '}
                <button onClick={onGoToCRM} style={{ background:'none', border:'none', color:'#a78bfa', fontWeight:'600', cursor:'pointer' }}>
                  Πρόσθεσε από το CRM →
                </button>
              </div>
            ) : customers.map(c => (
              <div
                key={c.id}
                className="cust-row"
                onClick={() => { setSelectedCustomer(c); setShowCustomerPicker(false) }}
                style={{
                  display:'flex', alignItems:'center', gap:'10px',
                  padding:'10px 14px', cursor:'pointer',
                  borderBottom:'1px solid rgba(255,255,255,.05)',
                }}
              >
                <div style={{
                  width:'30px', height:'30px', borderRadius:'50%', flexShrink:0,
                  background:'linear-gradient(135deg,#7c3aed,#ec4899)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  color:'white', fontWeight:'700', fontSize:'13px',
                }}>
                  {(c.name || '?')[0].toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight:'600', color:'#f1f5f9', fontSize:'14px' }}>{c.name}</div>
                  {c.email && <div style={{ fontSize:'12px', color:'rgba(148,163,184,.6)' }}>{c.email}</div>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Trip Details */}
      <div className="tp-card" style={D.card}>
        <DestinationBuilder
          destinations={destinations} setDestinations={setDestinations}
          startDate={startDate} setStartDate={setStartDate}
          travelers={travelers} setTravelers={setTravelers}
          budget={budget} setBudget={setBudget}
          originCity={originCity} setOriginCity={setOriginCity}
        />
      </div>

      {/* Error */}
      {error && (
        <div style={{
          background:'rgba(220,38,38,.12)', border:'1px solid rgba(220,38,38,.3)',
          borderRadius:'12px', padding:'13px 16px', color:'#fca5a5',
          display:'flex', alignItems:'center', gap:'9px',
          marginBottom:'18px', fontSize:'14px',
        }}>
          <AlertCircle size={16} />{error}
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ display:'flex', gap:'10px', marginBottom:'24px', flexWrap:'wrap' }}>
        <button
          className="tp-btn-main"
          style={{
            display:'flex', alignItems:'center', gap:'8px',
            padding:'12px 24px', borderRadius:'12px', fontWeight:'700',
            fontSize:'14px', cursor: streaming ? 'not-allowed' : 'pointer',
            border:'none', opacity: streaming ? 0.7 : 1,
            background:'linear-gradient(135deg,#7c3aed,#a855f7,#ec4899)',
            color:'white',
            boxShadow:'0 4px 20px rgba(124,58,237,.4)',
          }}
          onClick={generate} disabled={streaming}
        >
          <Sparkles size={17} />
          {streaming ? 'Δημιουργία...' : 'Δημιούργησε Ατζέντα'}
        </button>

        {itinerary && !streaming && (
          <>
            <button
              className="tp-btn-sec"
              style={{
                display:'flex', alignItems:'center', gap:'8px',
                padding:'12px 20px', borderRadius:'12px', fontWeight:'600',
                fontSize:'14px', cursor:'pointer',
                background:'rgba(16,185,129,.1)', color:'#6ee7b7',
                border:'1px solid rgba(16,185,129,.25)',
              }}
              onClick={handleExport}
            >
              <Download size={17} />
              Λήψη Word
            </button>

            {selectedCustomer && (
              <button
                className="tp-btn-sec"
                style={{
                  display:'flex', alignItems:'center', gap:'8px',
                  padding:'12px 20px', borderRadius:'12px', fontWeight:'600',
                  fontSize:'14px', cursor: saving || savedToCustomer ? 'not-allowed' : 'pointer',
                  border:'1px solid',
                  borderColor: savedToCustomer ? 'rgba(16,185,129,.3)' : 'rgba(251,191,36,.3)',
                  background: savedToCustomer ? 'rgba(16,185,129,.1)' : 'rgba(251,191,36,.08)',
                  color: savedToCustomer ? '#6ee7b7' : '#fbbf24',
                  opacity: saving ? 0.7 : 1,
                }}
                onClick={handleSaveToCustomer} disabled={saving || savedToCustomer}
              >
                {savedToCustomer ? <Check size={17} /> : <Save size={17} />}
                {savedToCustomer ? `Αποθηκεύτηκε στον ${selectedCustomer.name}` : saving ? 'Αποθήκευση...' : `Αποθήκευση στον ${selectedCustomer.name}`}
              </button>
            )}
          </>
        )}
      </div>

      {/* Itinerary Result */}
      {itinerary && (
        <div className="tp-card" style={D.card}>
          <ItineraryView text={itinerary} streaming={streaming} />
        </div>
      )}
    </div>
  )
}
