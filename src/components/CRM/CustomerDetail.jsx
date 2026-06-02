import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getCustomer, updateCustomer, getTrips, deleteTrip, getTripFiles, addTripFile, deleteTripFile } from '../../utils/db'
import { uploadTripFile, deleteTripFileFromStorage } from '../../utils/tripStorage'
import CustomerForm from './CustomerForm'
import { ArrowLeft, Edit2, MapPin, Calendar, Trash2, ChevronDown, ChevronUp, Download, Users, Wallet, Paperclip, Upload, FileText, X } from 'lucide-react'
import { exportToWord } from '../../utils/exportWord'

function TripFiles({ uid, customerId, tripId }) {
  const [files, setFiles] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')
  const inputRef = useRef()

  async function load() {
    setFiles(await getTripFiles(uid, customerId, tripId))
  }

  async function handleUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.type !== 'application/pdf') { setError('Μόνο PDF αρχεία επιτρέπονται.'); return }
    if (file.size > 20 * 1024 * 1024) { setError('Μέγιστο μέγεθος: 20 MB.'); return }
    setError(''); setUploading(true); setProgress(0)
    try {
      const { downloadURL, storagePath } = await uploadTripFile(uid, customerId, tripId, file, setProgress)
      await addTripFile(uid, customerId, tripId, { name: file.name, size: file.size, downloadURL, storagePath })
      await load()
    } catch (err) {
      setError(err.message || 'Σφάλμα κατά το ανέβασμα.')
    } finally {
      setUploading(false); e.target.value = ''
    }
  }

  async function handleDelete(f) {
    if (!confirm(`Διαγραφή "${f.name}";`)) return
    try { await deleteTripFileFromStorage(f.storagePath) } catch {}
    await deleteTripFile(uid, customerId, tripId, f.id)
    setFiles(prev => prev.filter(x => x.id !== f.id))
  }

  useEffect(() => { load() }, [])

  function fmtSize(bytes) {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div style={{ marginTop:'16px', borderTop:'1px solid rgba(124,58,237,.15)', paddingTop:'14px' }}>
      <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'10px' }}>
        <Paperclip size={14} color="#a78bfa" />
        <span style={{ fontSize:'13px', fontWeight:'700', color:'#a78bfa', flex:1 }}>
          Αρχεία ταξιδιού
          {files && files.length > 0 && (
            <span style={{ marginLeft:'6px', background:'rgba(124,58,237,.2)', color:'#a78bfa', borderRadius:'20px', padding:'1px 8px', fontSize:'10px', fontWeight:'700' }}>
              {files.length}
            </span>
          )}
        </span>
        <input ref={inputRef} type="file" accept="application/pdf" style={{ display:'none' }} onChange={handleUpload} />
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          style={{
            display:'flex', alignItems:'center', gap:'5px',
            background:'rgba(124,58,237,.15)', color:'#a78bfa',
            border:'1px solid rgba(124,58,237,.3)',
            borderRadius:'8px', padding:'5px 12px', fontSize:'12px',
            fontWeight:'600', cursor: uploading ? 'not-allowed' : 'pointer',
            opacity: uploading ? 0.6 : 1,
          }}
        >
          <Upload size={12} />
          {uploading ? `${progress}%` : 'Προσθήκη PDF'}
        </button>
      </div>

      {uploading && (
        <div style={{ height:'4px', background:'rgba(124,58,237,.15)', borderRadius:'4px', marginBottom:'10px', overflow:'hidden' }}>
          <div style={{ height:'100%', width:`${progress}%`, background:'linear-gradient(90deg,#7c3aed,#ec4899)', transition:'width .2s', borderRadius:'4px' }} />
        </div>
      )}

      {error && (
        <div style={{ fontSize:'12px', color:'#fca5a5', background:'rgba(220,38,38,.12)', border:'1px solid rgba(220,38,38,.25)', borderRadius:'8px', padding:'6px 10px', marginBottom:'8px' }}>
          {error}
        </div>
      )}

      {files === null ? (
        <div style={{ fontSize:'12px', color:'rgba(148,163,184,.5)' }}>Φόρτωση...</div>
      ) : files.length === 0 ? (
        <div style={{ fontSize:'12px', color:'rgba(148,163,184,.4)', fontStyle:'italic' }}>Δεν υπάρχουν συνημμένα αρχεία.</div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
          {files.map(f => (
            <div key={f.id} style={{
              display:'flex', alignItems:'center', gap:'10px',
              background:'rgba(255,255,255,.04)', border:'1px solid rgba(124,58,237,.15)',
              borderRadius:'10px', padding:'8px 12px',
            }}>
              <FileText size={16} color="#ef4444" style={{ flexShrink:0 }} />
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:'13px', fontWeight:'600', color:'#f1f5f9', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                  {f.name}
                </div>
                <div style={{ fontSize:'11px', color:'rgba(148,163,184,.5)' }}>{fmtSize(f.size)}</div>
              </div>
              <a
                href={f.downloadURL}
                target="_blank"
                rel="noreferrer"
                style={{
                  display:'flex', alignItems:'center',
                  background:'rgba(16,185,129,.12)', border:'1px solid rgba(16,185,129,.25)',
                  borderRadius:'7px', padding:'5px 8px', color:'#6ee7b7', textDecoration:'none',
                }}
              >
                <Download size={13} />
              </a>
              <button
                onClick={() => handleDelete(f)}
                style={{ display:'flex', alignItems:'center', background:'none', border:'none', cursor:'pointer', color:'rgba(148,163,184,.3)', padding:'5px', borderRadius:'6px', transition:'color .15s' }}
                onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(148,163,184,.3)'}
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

export default function CustomerDetail({ customerId, onBack, templates = [] }) {
  const user = useAuth()
  const [customer, setCustomer] = useState(null)
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [expandedTrip, setExpandedTrip] = useState(null)

  useEffect(() => { load() }, [customerId])

  async function load() {
    setLoading(true)
    const [c, t] = await Promise.all([
      getCustomer(user.uid, customerId),
      getTrips(user.uid, customerId),
    ])
    setCustomer(c); setTrips(t); setLoading(false)
  }

  async function handleSave(data) {
    setSaving(true)
    await updateCustomer(user.uid, customerId, data)
    setCustomer(c => ({ ...c, ...data }))
    setSaving(false); setEditing(false)
  }

  async function handleDeleteTrip(tripId) {
    if (!confirm('Διαγραφή ταξιδιού;')) return
    await deleteTrip(user.uid, customerId, tripId)
    setTrips(t => t.filter(x => x.id !== tripId))
  }

  async function handleExportTrip(trip) {
    await exportToWord(trip.fullItinerary || trip.summary, `${customer.name} — ${trip.title}`)
  }

  if (loading) return (
    <div style={{ textAlign:'center', padding:'60px', color:'rgba(167,139,250,.7)' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ width:'36px', height:'36px', border:'3px solid rgba(124,58,237,.25)', borderTopColor:'#7c3aed', borderRadius:'50%', animation:'spin .8s linear infinite', margin:'0 auto 12px' }} />
      Φόρτωση...
    </div>
  )

  if (!customer) return (
    <div style={{ textAlign:'center', color:'#fca5a5', padding:'60px' }}>Πελάτης δεν βρέθηκε.</div>
  )

  const allCustomFields = Object.entries(customer.customFields || {})

  return (
    <div style={{ animation:'pageEnter .5s ease both' }}>
      <style>{`
        @keyframes pageEnter { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .trip-row:hover { background:rgba(124,58,237,.12) !important; }
        .trip-row { transition:background .15s; }
        .trip-expanded { animation:pageEnter .25s ease both; }
      `}</style>

      {/* Back */}
      <button onClick={onBack} style={{
        display:'flex', alignItems:'center', gap:'6px',
        background:'none', border:'none', cursor:'pointer',
        color:'#a78bfa', fontWeight:'600', fontSize:'14px',
        padding:'0 0 20px 0', transition:'color .15s',
      }}
      onMouseEnter={e => e.currentTarget.style.color = '#ec4899'}
      onMouseLeave={e => e.currentTarget.style.color = '#a78bfa'}
      >
        <ArrowLeft size={16} /> Πίσω στη λίστα
      </button>

      {/* Customer card */}
      <div style={{
        background:'rgba(255,255,255,.04)', backdropFilter:'blur(12px)',
        border:'1px solid rgba(124,58,237,.15)', borderRadius:'18px',
        padding:'26px', marginBottom:'22px',
      }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'22px', flexWrap:'wrap', gap:'12px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'16px' }}>
            <div style={{
              width:'56px', height:'56px', borderRadius:'50%',
              background:'linear-gradient(135deg,#7c3aed,#ec4899)',
              display:'flex', alignItems:'center', justifyContent:'center',
              color:'white', fontWeight:'800', fontSize:'22px',
              boxShadow:'0 0 20px rgba(124,58,237,.5)',
            }}>
              {(customer.name || '?')[0].toUpperCase()}
            </div>
            <div>
              <div style={{
                fontSize:'20px', fontWeight:'800',
                background:'linear-gradient(135deg,#fff 30%,#a78bfa 100%)',
                WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
              }}>{customer.name}</div>
              {customer.city && <div style={{ fontSize:'13px', color:'rgba(148,163,184,.6)', marginTop:'2px' }}>📍 {customer.city}</div>}
            </div>
          </div>
          <button
            onClick={() => setEditing(e => !e)}
            style={{
              display:'flex', alignItems:'center', gap:'6px',
              background: editing ? 'rgba(255,255,255,.08)' : 'rgba(124,58,237,.15)',
              color: editing ? 'rgba(148,163,184,.8)' : '#a78bfa',
              border:`1px solid ${editing ? 'rgba(255,255,255,.1)' : 'rgba(124,58,237,.3)'}`,
              borderRadius:'10px', padding:'9px 16px', cursor:'pointer',
              fontWeight:'600', fontSize:'13px', transition:'all .15s',
            }}
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
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:'12px', marginBottom: allCustomFields.length ? '16px' : 0 }}>
              {[
                { label: 'Email', value: customer.email },
                { label: 'Τηλέφωνο', value: customer.phone },
                { label: 'Πόλη', value: customer.city },
              ].filter(f => f.value).map(f => (
                <div key={f.label} style={{ background:'rgba(124,58,237,.08)', border:'1px solid rgba(124,58,237,.15)', borderRadius:'10px', padding:'10px 14px' }}>
                  <div style={{ fontSize:'10px', fontWeight:'700', color:'rgba(167,139,250,.6)', textTransform:'uppercase', letterSpacing:'0.8px' }}>{f.label}</div>
                  <div style={{ fontSize:'14px', color:'#f1f5f9', fontWeight:'600', marginTop:'3px' }}>{f.value}</div>
                </div>
              ))}
            </div>

            {/* Template fields */}
            {templates.length > 0 && (
              <div style={{ marginBottom:'12px' }}>
                <div style={{ fontSize:'10px', fontWeight:'700', color:'#a78bfa', textTransform:'uppercase', letterSpacing:'0.8px', marginBottom:'8px', display:'flex', alignItems:'center', gap:'6px' }}>
                  <span style={{ width:'5px', height:'5px', borderRadius:'50%', background:'linear-gradient(135deg,#7c3aed,#ec4899)', display:'inline-block' }} />
                  Κοινά Πεδία
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))', gap:'10px' }}>
                  {templates.map(t => (
                    <div key={t.key} style={{ background:'rgba(124,58,237,.1)', border:'1px solid rgba(124,58,237,.2)', borderRadius:'10px', padding:'10px 14px' }}>
                      <div style={{ fontSize:'10px', fontWeight:'700', color:'rgba(167,139,250,.7)', textTransform:'uppercase', letterSpacing:'0.7px' }}>{t.label}</div>
                      <div style={{ fontSize:'14px', color: customer.customFields?.[t.key] ? '#f1f5f9' : 'rgba(148,163,184,.4)', fontWeight: customer.customFields?.[t.key] ? '600' : '400', marginTop:'3px' }}>
                        {customer.customFields?.[t.key] || '—'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Extra fields */}
            {allCustomFields.filter(([k]) => !templates.find(t => t.key === k)).some(([, v]) => v) && (
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:'12px', marginBottom:'12px' }}>
                {allCustomFields.filter(([k]) => !templates.find(t => t.key === k)).map(([k, v]) => v && (
                  <div key={k} style={{ background:'rgba(236,72,153,.08)', border:'1px solid rgba(236,72,153,.15)', borderRadius:'10px', padding:'10px 14px' }}>
                    <div style={{ fontSize:'10px', fontWeight:'700', color:'rgba(249,168,212,.6)', textTransform:'uppercase', letterSpacing:'0.7px' }}>{k.replaceAll('_', ' ')}</div>
                    <div style={{ fontSize:'14px', color:'#f1f5f9', fontWeight:'600', marginTop:'3px' }}>{v}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Notes */}
            {customer.notes && (
              <div style={{ background:'rgba(251,191,36,.08)', border:'1px solid rgba(251,191,36,.2)', borderRadius:'10px', padding:'12px 14px' }}>
                <div style={{ fontSize:'10px', fontWeight:'700', color:'rgba(251,191,36,.7)', textTransform:'uppercase', letterSpacing:'0.7px', marginBottom:'5px' }}>Σημειώσεις</div>
                <div style={{ fontSize:'14px', color:'rgba(241,245,249,.8)', lineHeight:'1.6' }}>{customer.notes}</div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Trips */}
      <div style={{
        background:'rgba(255,255,255,.04)', backdropFilter:'blur(12px)',
        border:'1px solid rgba(124,58,237,.15)', borderRadius:'18px', padding:'26px',
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'18px' }}>
          <MapPin size={18} color="#a78bfa" />
          <span style={{
            fontSize:'16px', fontWeight:'800',
            background:'linear-gradient(135deg,#fff 30%,#a78bfa 100%)',
            WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
          }}>Ταξίδια</span>
          <span style={{ background:'linear-gradient(135deg,#7c3aed,#ec4899)', color:'white', borderRadius:'20px', padding:'2px 10px', fontSize:'12px', fontWeight:'700' }}>
            {trips.length}
          </span>
        </div>

        {trips.length === 0 ? (
          <div style={{ textAlign:'center', padding:'36px 20px' }}>
            <MapPin size={36} color="rgba(124,58,237,.3)" style={{ margin:'0 auto 10px' }} />
            <div style={{ fontSize:'14px', color:'rgba(148,163,184,.5)' }}>Δεν υπάρχουν αποθηκευμένα ταξίδια ακόμα.</div>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
            {trips.map((trip, i) => (
              <div key={trip.id} style={{ border:'1px solid rgba(124,58,237,.15)', borderRadius:'14px', overflow:'hidden' }}>
                <div
                  className="trip-row"
                  onClick={() => setExpandedTrip(expandedTrip === trip.id ? null : trip.id)}
                  style={{
                    padding:'14px 18px', cursor:'pointer',
                    display:'flex', alignItems:'center', gap:'12px',
                    background: expandedTrip === trip.id ? 'rgba(124,58,237,.15)' : 'rgba(255,255,255,.03)',
                  }}
                >
                  <div style={{
                    background:'linear-gradient(135deg,#7c3aed,#ec4899)',
                    color:'white', borderRadius:'8px', padding:'4px 10px',
                    fontSize:'11px', fontWeight:'800', flexShrink:0,
                    boxShadow:'0 2px 8px rgba(124,58,237,.4)',
                  }}>
                    Trip {trips.length - i}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontWeight:'700', color:'#f1f5f9', fontSize:'14px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                      {trip.title}
                    </div>
                    <div style={{ display:'flex', gap:'10px', marginTop:'3px', flexWrap:'wrap' }}>
                      {trip.destinations && <span style={{ fontSize:'12px', color:'rgba(148,163,184,.6)', display:'flex', alignItems:'center', gap:'4px' }}><MapPin size={11} />{trip.destinations}</span>}
                      {trip.travelers && <span style={{ fontSize:'12px', color:'rgba(148,163,184,.6)', display:'flex', alignItems:'center', gap:'4px' }}><Users size={11} />{trip.travelers} άτομα</span>}
                      {trip.budget && <span style={{ fontSize:'12px', color:'rgba(148,163,184,.6)', display:'flex', alignItems:'center', gap:'4px' }}><Wallet size={11} />{trip.budget}</span>}
                      {trip.createdAt && <span style={{ fontSize:'12px', color:'rgba(148,163,184,.4)', display:'flex', alignItems:'center', gap:'4px' }}><Calendar size={11} />{trip.createdAt.toDate?.().toLocaleDateString('el-GR') || ''}</span>}
                    </div>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:'4px', flexShrink:0 }}>
                    <button onClick={e => { e.stopPropagation(); handleExportTrip(trip) }} style={{ background:'rgba(16,185,129,.12)', border:'1px solid rgba(16,185,129,.2)', borderRadius:'8px', padding:'6px', cursor:'pointer', display:'flex', color:'#6ee7b7', transition:'all .15s' }}>
                      <Download size={14} />
                    </button>
                    <button
                      onClick={e => { e.stopPropagation(); handleDeleteTrip(trip.id) }}
                      style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(148,163,184,.3)', padding:'6px', display:'flex', borderRadius:'8px', transition:'color .15s' }}
                      onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                      onMouseLeave={e => e.currentTarget.style.color = 'rgba(148,163,184,.3)'}
                    >
                      <Trash2 size={14} />
                    </button>
                    {expandedTrip === trip.id ? <ChevronUp size={16} color="rgba(167,139,250,.5)" /> : <ChevronDown size={16} color="rgba(167,139,250,.5)" />}
                  </div>
                </div>

                {expandedTrip === trip.id && (
                  <div className="trip-expanded" style={{
                    padding:'18px', borderTop:'1px solid rgba(124,58,237,.15)',
                    background:'rgba(0,0,0,.15)',
                  }}>
                    <pre style={{ fontSize:'13px', color:'rgba(226,232,240,.75)', whiteSpace:'pre-wrap', lineHeight:'1.8', margin:0, fontFamily:'system-ui,sans-serif' }}>
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
