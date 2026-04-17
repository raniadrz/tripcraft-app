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

const s = {
  card: {
    background: 'white', borderRadius: '16px',
    boxShadow: '0 4px 24px rgba(79,70,229,0.08)',
    border: '1px solid #e0e7ff', padding: '28px', marginBottom: '24px',
  },
  btn: {
    display: 'flex', alignItems: 'center', gap: '8px',
    padding: '11px 22px', borderRadius: '10px', fontWeight: '600',
    fontSize: '14px', cursor: 'pointer', border: 'none', transition: 'all 0.2s',
  },
  error: {
    background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px',
    padding: '12px 16px', color: '#991b1b', display: 'flex',
    alignItems: 'center', gap: '8px', marginBottom: '16px', fontSize: '14px',
  },
}

export default function TripPlanner({ customers = [], onGoToCRM }) {
  const user = useAuth()

  // Settings
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('or_apikey') || '')
  const [activeModel, setActiveModel] = useState('')

  // Trip params
  const [destinations, setDestinations] = useState([{ city: 'Αθήνα', country: 'Ελλάδα', days: 3 }])
  const [startDate, setStartDate] = useState('')
  const [travelers, setTravelers] = useState(2)
  const [budget, setBudget] = useState('μέτριο')
  const [originCity, setOriginCity] = useState('Θεσσαλονίκη')

  // Customer link
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [showCustomerPicker, setShowCustomerPicker] = useState(false)

  // Result
  const [itinerary, setItinerary] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [error, setError] = useState('')
  const [tripTitle, setTripTitle] = useState('')

  // Save state
  const [savedToCustomer, setSavedToCustomer] = useState(false)
  const [saving, setSaving] = useState(false)

  function saveApiKey(key) { setApiKey(key); localStorage.setItem('or_apikey', key) }

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
- Μουσεία/αξιοθέατα με τιμή εισόδου (€) και ώρες λειτουργίας

**Απόγευμα (13:00–19:00)**
- Δραστηριότητες, μεσημεριανό (εκτ. κόστος €/άτομο)

**Βράδυ (19:00–23:00)**
- Βραδινό, ψυχαγωγία (εκτ. κόστος €/άτομο)

## 🚌 Τοπικές Μεταφορές: [Πόλη]
- Μέσα Μαζικής Μεταφοράς: γραμμές, εισιτήρια (τιμές €), ημερήσιο/εβδομαδιαίο pass
- Taxi/Ride-share: εκτιμώμενα κόστη
- Ποδήλατο/Πεζοπορία: επιλογές

## 🏛️ Αξιοθέατα & Μουσεία: [Πόλη]
| Αξιοθέατο | Τύπος | Τιμή Εισόδου | Διάρκεια Επίσκεψης | Ώρες |
|---|---|---|---|---|
(συμπλήρωσε 6–8 αξιοθέατα)

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

ΣΗΜΑΝΤΙΚΟ: Γράψε **ΟΛΟΚΛΗΡΗ** την ατζέντα χωρίς καμία περικοπή ή σύντμηση. Κάλυψε ΚΑΘΕ μέρα για ΚΑΘΕ προορισμό. Μη σταματάς νωρίς. Χρησιμοποίησε ΠΑΝΤΑ πραγματικές τιμές και εκτιμήσεις. Γράψε στα **Ελληνικά**.`
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
        originCity,
        travelers,
        budget,
        startDate,
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
    <div>
      {/* Settings */}
      <div style={s.card}>
        <SettingsPanel apiKey={apiKey} setApiKey={saveApiKey} activeModel={streaming ? activeModel : ''} />
      </div>

      {/* Customer picker */}
      <div style={s.card}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: selectedCustomer || showCustomerPicker ? '16px' : 0 }}>
          <User size={18} color="#4f46e5" />
          <span style={{ fontSize: '16px', fontWeight: '700', color: '#312e81', flex: 1 }}>Πελάτης</span>
          {selectedCustomer ? (
            <button onClick={() => setSelectedCustomer(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', display: 'flex', padding: '2px' }}>
              <X size={15} />
            </button>
          ) : (
            <button
              onClick={() => setShowCustomerPicker(v => !v)}
              style={{ display: 'flex', alignItems: 'center', gap: '5px', background: '#eef2ff', color: '#4f46e5', border: 'none', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}
            >
              {showCustomerPicker ? 'Κλείσιμο' : 'Επιλογή πελάτη'}
              <ChevronDown size={13} />
            </button>
          )}
        </div>

        {selectedCustomer ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '12px 14px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: '15px', flexShrink: 0 }}>
              {(selectedCustomer.name || '?')[0].toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight: '700', color: '#166534' }}>{selectedCustomer.name}</div>
              {selectedCustomer.email && <div style={{ fontSize: '12px', color: '#4ade80' }}>{selectedCustomer.email}</div>}
            </div>
            <Check size={16} color="#16a34a" style={{ marginLeft: 'auto' }} />
          </div>
        ) : showCustomerPicker && (
          <div style={{ border: '1px solid #e0e7ff', borderRadius: '10px', overflow: 'hidden', maxHeight: '220px', overflowY: 'auto' }}>
            {customers.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: '#9ca3af', fontSize: '14px' }}>
                Δεν υπάρχουν πελάτες.{' '}
                <button onClick={onGoToCRM} style={{ background: 'none', border: 'none', color: '#4f46e5', fontWeight: '600', cursor: 'pointer' }}>
                  Πρόσθεσε από το CRM →
                </button>
              </div>
            ) : customers.map(c => (
              <div
                key={c.id}
                onClick={() => { setSelectedCustomer(c); setShowCustomerPicker(false) }}
                style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', cursor: 'pointer', borderBottom: '1px solid #f3f4f6' }}
                onMouseEnter={e => e.currentTarget.style.background = '#f8f7ff'}
                onMouseLeave={e => e.currentTarget.style.background = 'white'}
              >
                <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: '13px', flexShrink: 0 }}>
                  {(c.name || '?')[0].toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: '600', color: '#1e1b4b', fontSize: '14px' }}>{c.name}</div>
                  {c.email && <div style={{ fontSize: '12px', color: '#9ca3af' }}>{c.email}</div>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Trip Details */}
      <div style={s.card}>
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
        <div style={s.error}>
          <AlertCircle size={16} />{error}
        </div>
      )}

      {/* Buttons */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <button
          style={{ ...s.btn, background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: 'white', opacity: streaming ? 0.7 : 1 }}
          onClick={generate} disabled={streaming}
        >
          <Sparkles size={17} />
          {streaming ? 'Δημιουργία...' : 'Δημιούργησε Ατζέντα'}
        </button>

        {itinerary && !streaming && (
          <>
            <button style={{ ...s.btn, background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0' }} onClick={handleExport}>
              <Download size={17} />
              Λήψη Word
            </button>

            {selectedCustomer && (
              <button
                style={{ ...s.btn, background: savedToCustomer ? '#f0fdf4' : '#fffbeb', color: savedToCustomer ? '#166534' : '#92400e', border: `1px solid ${savedToCustomer ? '#bbf7d0' : '#fde68a'}`, opacity: saving ? 0.7 : 1 }}
                onClick={handleSaveToCustomer} disabled={saving || savedToCustomer}
              >
                {savedToCustomer ? <Check size={17} /> : <Save size={17} />}
                {savedToCustomer ? `Αποθηκεύτηκε στον ${selectedCustomer.name}` : saving ? 'Αποθήκευση...' : `Αποθήκευση στον ${selectedCustomer.name}`}
              </button>
            )}
          </>
        )}
      </div>

      {/* Result */}
      {itinerary && (
        <div style={s.card}>
          <ItineraryView text={itinerary} streaming={streaming} />
        </div>
      )}
    </div>
  )
}
