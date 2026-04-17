import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getCustomer, updateCustomer, getTrips, deleteTrip, getTripFiles, addTripFile, deleteTripFile } from '../../utils/db'
import { uploadTripFile, deleteTripFileFromStorage } from '../../utils/tripStorage'
import CustomerForm from './CustomerForm'
import { ArrowLeft, Edit2, MapPin, Calendar, Trash2, ChevronDown, ChevronUp, Download, Users, Wallet, Paperclip, Upload, FileText, X } from 'lucide-react'
import { exportToWord } from '../../utils/exportWord'

// ── TripFiles sub-component ────────────────────────────────
function TripFiles({ uid, customerId, tripId }) {
  const [files, setFiles] = useState(null) // null = not loaded yet
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')
  const inputRef = useRef()

  async function load() {
    const list = await getTripFiles(uid, customerId, tripId)
    setFiles(list)
  }

  async function handleUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.type !== 'application/pdf') { setError('Μόνο PDF αρχεία επιτρέπονται.'); return }
    if (file.size > 20 * 1024 * 1024) { setError('Μέγιστο μέγεθος: 20 MB.'); return }
    setError('')
    setUploading(true)
    setProgress(0)
    try {
      const { downloadURL, storagePath } = await uploadTripFile(uid, customerId, tripId, file, setProgress)
      await addTripFile(uid, customerId, tripId, {
        name: file.name,
        size: file.size,
        downloadURL,
        storagePath,
      })
      await load()
    } catch (err) {
      setError(err.message || 'Σφάλμα κατά το ανέβασμα.')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  async function handleDelete(f) {
    if (!confirm(`Διαγραφή "${f.name}";`)) return
    try {
      await deleteTripFileFromStorage(f.storagePath)
    } catch { /* already deleted from storage */ }
    await deleteTripFile(uid, customerId, tripId, f.id)
    setFiles(prev => prev.filter(x => x.id !== f.id))
  }

  // Load on first mount
  useEffect(() => { load() }, [])

  function fmtSize(bytes) {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div style={{ marginTop: '16px', borderTop: '1px solid #e0e7ff', paddingTop: '14px' }}>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
        <Paperclip size={14} color="#6366f1" />
        <span style={{ fontSize: '13px', fontWeight: '700', color: '#4f46e5', flex: 1 }}>
          Αρχεία ταξιδιού
          {files && files.length > 0 && (
            <span style={{ marginLeft: '6px', background: '#eef2ff', color: '#4f46e5', borderRadius: '20px', padding: '1px 8px', fontSize: '11px', fontWeight: '700' }}>
              {files.length}
            </span>
          )}
        </span>
        <input ref={inputRef} type="file" accept="application/pdf" style={{ display: 'none' }} onChange={handleUpload} />
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          style={{
            display: 'flex', alignItems: 'center', gap: '5px',
            background: '#eef2ff', color: '#4f46e5', border: '1px solid #c7d2fe',
            borderRadius: '7px', padding: '5px 12px', fontSize: '12px',
            fontWeight: '600', cursor: uploading ? 'not-allowed' : 'pointer',
            opacity: uploading ? 0.6 : 1,
          }}
        >
          <Upload size={12} />
          {uploading ? `${progress}%` : 'Προσθήκη PDF'}
        </button>
      </div>

      {/* Upload progress bar */}
      {uploading && (
        <div style={{ height: '4px', background: '#e0e7ff', borderRadius: '4px', marginBottom: '10px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg,#4f46e5,#7c3aed)', transition: 'width 0.2s', borderRadius: '4px' }} />
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{ fontSize: '12px', color: '#dc2626', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', padding: '6px 10px', marginBottom: '8px' }}>
          {error}
        </div>
      )}

      {/* File list */}
      {files === null ? (
        <div style={{ fontSize: '12px', color: '#9ca3af' }}>Φόρτωση...</div>
      ) : files.length === 0 ? (
        <div style={{ fontSize: '12px', color: '#9ca3af', fontStyle: 'italic' }}>Δεν υπάρχουν συνημμένα αρχεία.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {files.map(f => (
            <div key={f.id} style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              background: 'white', border: '1px solid #e0e7ff', borderRadius: '8px', padding: '8px 12px',
            }}>
              <FileText size={16} color="#ef4444" style={{ flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#1e1b4b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {f.name}
                </div>
                <div style={{ fontSize: '11px', color: '#9ca3af' }}>{fmtSize(f.size)}</div>
              </div>
              <a
                href={f.downloadURL}
                target="_blank"
                rel="noreferrer"
                title="Λήψη / άνοιγμα"
                style={{ display: 'flex', alignItems: 'center', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '6px', padding: '5px 8px', color: '#16a34a', textDecoration: 'none' }}
              >
                <Download size={13} />
              </a>
              <button
                onClick={() => handleDelete(f)}
                title="Διαγραφή"
                style={{ display: 'flex', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', color: '#d1d5db', padding: '5px', borderRadius: '6px' }}
                onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                onMouseLeave={e => e.currentTarget.style.color = '#d1d5db'}
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Main component ─────────────────────────────────────────
export default function CustomerDetail({ customerId, onBack, templates = [] }) {
  const user = useAuth()
  const [customer, setCustomer] = useState(null)
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [expandedTrip, setExpandedTrip] = useState(null)

  useEffect(() => {
    load()
  }, [customerId])

  async function load() {
    setLoading(true)
    const [c, t] = await Promise.all([
      getCustomer(user.uid, customerId),
      getTrips(user.uid, customerId),
    ])
    setCustomer(c)
    setTrips(t)
    setLoading(false)
  }

  async function handleSave(data) {
    setSaving(true)
    await updateCustomer(user.uid, customerId, data)
    setCustomer(c => ({ ...c, ...data }))
    setSaving(false)
    setEditing(false)
  }

  async function handleDeleteTrip(tripId) {
    if (!confirm('Διαγραφή ταξιδιού;')) return
    await deleteTrip(user.uid, customerId, tripId)
    setTrips(t => t.filter(x => x.id !== tripId))
  }

  async function handleExportTrip(trip) {
    const title = `${customer.name} — ${trip.title}`
    await exportToWord(trip.fullItinerary || trip.summary, title)
  }

  if (loading) return <div style={{ textAlign: 'center', color: '#6b7280', padding: '60px' }}>Φόρτωση...</div>
  if (!customer) return <div style={{ textAlign: 'center', color: '#ef4444', padding: '60px' }}>Πελάτης δεν βρέθηκε.</div>

  const allCustomFields = Object.entries(customer.customFields || {})

  return (
    <div>
      {/* Back */}
      <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', color: '#6366f1', fontWeight: '600', fontSize: '14px', padding: '0 0 20px 0' }}>
        <ArrowLeft size={16} /> Πίσω στη λίστα
      </button>

      {/* Customer card */}
      <div style={{ background: 'white', border: '1px solid #e0e7ff', borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '52px', height: '52px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontWeight: '800', fontSize: '20px',
            }}>
              {(customer.name || '?')[0].toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: '20px', fontWeight: '800', color: '#1e1b4b' }}>{customer.name}</div>
              {customer.city && <div style={{ fontSize: '13px', color: '#6b7280' }}>📍 {customer.city}</div>}
            </div>
          </div>
          <button
            onClick={() => setEditing(e => !e)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', background: editing ? '#f3f4f6' : '#eef2ff', color: editing ? '#374151' : '#4f46e5', border: 'none', borderRadius: '8px', padding: '8px 16px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}
          >
            <Edit2 size={14} />
            {editing ? 'Άκυρο' : 'Επεξεργασία'}
          </button>
        </div>

        {editing ? (
          <CustomerForm initial={customer} templates={templates} onSave={handleSave} saving={saving} />
        ) : (
          <div>
            {/* Fixed fields */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px', marginBottom: allCustomFields.length ? '16px' : 0 }}>
              {[
                { label: 'Email', value: customer.email },
                { label: 'Τηλέφωνο', value: customer.phone },
                { label: 'Πόλη', value: customer.city },
              ].filter(f => f.value).map(f => (
                <div key={f.label} style={{ background: '#f8f7ff', borderRadius: '10px', padding: '10px 14px' }}>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{f.label}</div>
                  <div style={{ fontSize: '14px', color: '#1e1b4b', fontWeight: '600', marginTop: '2px' }}>{f.value}</div>
                </div>
              ))}
            </div>

            {/* Template fields (shared schema) */}
            {templates.length > 0 && (
              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '11px', fontWeight: '700', color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#6366f1', display: 'inline-block' }} />
                  Κοινά Πεδία
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '10px' }}>
                  {templates.map(t => (
                    <div key={t.key} style={{ background: '#eef2ff', border: '1px solid #c7d2fe', borderRadius: '10px', padding: '10px 14px' }}>
                      <div style={{ fontSize: '11px', fontWeight: '700', color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t.label}</div>
                      <div style={{ fontSize: '14px', color: customer.customFields?.[t.key] ? '#1e1b4b' : '#9ca3af', fontWeight: customer.customFields?.[t.key] ? '600' : '400', marginTop: '2px' }}>
                        {customer.customFields?.[t.key] || '—'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Extra customer-specific custom fields (not in templates) */}
            {allCustomFields.filter(([k]) => !templates.find(t => t.key === k)).some(([, v]) => v) && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px', marginBottom: '12px' }}>
                {allCustomFields.filter(([k]) => !templates.find(t => t.key === k)).map(([k, v]) => v && (
                  <div key={k} style={{ background: '#fdf4ff', border: '1px solid #f3e8ff', borderRadius: '10px', padding: '10px 14px' }}>
                    <div style={{ fontSize: '11px', fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{k.replaceAll('_', ' ')}</div>
                    <div style={{ fontSize: '14px', color: '#1e1b4b', fontWeight: '600', marginTop: '2px' }}>{v}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Notes */}
            {customer.notes && (
              <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '10px', padding: '12px 14px' }}>
                <div style={{ fontSize: '11px', fontWeight: '700', color: '#92400e', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Σημειώσεις</div>
                <div style={{ fontSize: '14px', color: '#78350f', lineHeight: '1.6' }}>{customer.notes}</div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Trips */}
      <div style={{ background: 'white', border: '1px solid #e0e7ff', borderRadius: '16px', padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <MapPin size={18} color="#4f46e5" />
          <span style={{ fontSize: '16px', fontWeight: '700', color: '#1e1b4b' }}>Ταξίδια</span>
          <span style={{ background: '#eef2ff', color: '#4f46e5', borderRadius: '20px', padding: '2px 10px', fontSize: '13px', fontWeight: '700' }}>
            {trips.length}
          </span>
        </div>

        {trips.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#9ca3af', padding: '32px 20px' }}>
            <MapPin size={32} color="#d1d5db" style={{ margin: '0 auto 8px' }} />
            <div style={{ fontSize: '14px' }}>Δεν υπάρχουν αποθηκευμένα ταξίδια ακόμα.</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {trips.map((trip, i) => (
              <div key={trip.id} style={{ border: '1px solid #e0e7ff', borderRadius: '12px', overflow: 'hidden' }}>
                {/* Trip header */}
                <div
                  onClick={() => setExpandedTrip(expandedTrip === trip.id ? null : trip.id)}
                  style={{ padding: '14px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', background: expandedTrip === trip.id ? '#f8f7ff' : 'white' }}
                >
                  <div style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: 'white', borderRadius: '8px', padding: '4px 10px', fontSize: '12px', fontWeight: '800', flexShrink: 0 }}>
                    Trip {trips.length - i}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: '700', color: '#1e1b4b', fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {trip.title}
                    </div>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '2px', flexWrap: 'wrap' }}>
                      {trip.destinations && (
                        <span style={{ fontSize: '12px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <MapPin size={11} />{trip.destinations}
                        </span>
                      )}
                      {trip.travelers && (
                        <span style={{ fontSize: '12px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Users size={11} />{trip.travelers} άτομα
                        </span>
                      )}
                      {trip.budget && (
                        <span style={{ fontSize: '12px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Wallet size={11} />{trip.budget}
                        </span>
                      )}
                      {trip.createdAt && (
                        <span style={{ fontSize: '12px', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Calendar size={11} />
                          {trip.createdAt.toDate?.().toLocaleDateString('el-GR') || ''}
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                    <button onClick={e => { e.stopPropagation(); handleExportTrip(trip) }} title="Λήψη Word" style={{ background: '#f0fdf4', border: 'none', borderRadius: '7px', padding: '6px', cursor: 'pointer', display: 'flex', color: '#16a34a' }}>
                      <Download size={14} />
                    </button>
                    <button onClick={e => { e.stopPropagation(); handleDeleteTrip(trip.id) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#d1d5db', padding: '6px', display: 'flex', borderRadius: '7px' }}
                      onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                      onMouseLeave={e => e.currentTarget.style.color = '#d1d5db'}>
                      <Trash2 size={14} />
                    </button>
                    {expandedTrip === trip.id ? <ChevronUp size={16} color="#9ca3af" /> : <ChevronDown size={16} color="#9ca3af" />}
                  </div>
                </div>

                {/* Expanded summary + files */}
                {expandedTrip === trip.id && (
                  <div style={{ padding: '16px', borderTop: '1px solid #e0e7ff', background: '#fafafa' }}>
                    <pre style={{ fontSize: '13px', color: '#374151', whiteSpace: 'pre-wrap', lineHeight: '1.7', margin: 0, fontFamily: 'system-ui, sans-serif' }}>
                      {trip.summary}
                    </pre>
                    <TripFiles uid={user.uid} customerId={customerId} tripId={trip.id} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
