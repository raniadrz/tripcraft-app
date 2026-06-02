import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getCustomers, addCustomer, deleteCustomer } from '../../utils/db'
import CustomerForm from './CustomerForm'
import { UserPlus, Trash2, ChevronRight, Search, Users, Phone, Mail } from 'lucide-react'

export default function CustomerList({ onSelect, templates = [] }) {
  const user = useAuth()
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    setCustomers(await getCustomers(user.uid))
    setLoading(false)
  }

  async function handleAdd(data) {
    setSaving(true)
    await addCustomer(user.uid, data)
    await load()
    setSaving(false)
    setShowForm(false)
  }

  async function handleDelete(e, id) {
    e.stopPropagation()
    if (!confirm('Διαγραφή πελάτη; Θα διαγραφούν και όλα τα ταξίδια του.')) return
    await deleteCustomer(user.uid, id)
    setCustomers(c => c.filter(x => x.id !== id))
  }

  const filtered = customers.filter(c =>
    [c.name, c.email, c.phone, c.city].join(' ').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{ animation:'pageEnter .5s ease both' }}>
      <style>{`
        @keyframes pageEnter { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes rowSlideIn {
          from { opacity:0; transform:translateX(-10px); }
          to   { opacity:1; transform:translateX(0); }
        }
        .cust-row { transition:all .15s ease !important; animation:rowSlideIn .35s ease both; }
        .cust-row:hover { background:rgba(124,58,237,.1) !important; border-color:rgba(124,58,237,.4) !important; transform:translateX(3px); }
        .search-input:focus { border-color:rgba(124,58,237,.6) !important; box-shadow:0 0 0 3px rgba(124,58,237,.15) !important; }
        .search-input { transition:border .2s, box-shadow .2s; }
        ::placeholder { color:rgba(148,163,184,.35) !important; }
      `}</style>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'22px', flexWrap:'wrap', gap:'12px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
          <Users size={20} color="#a78bfa" />
          <span style={{
            fontSize:'18px', fontWeight:'800',
            background:'linear-gradient(135deg,#fff 30%,#a78bfa 100%)',
            WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
          }}>Πελάτες</span>
          <span style={{
            background:'linear-gradient(135deg,#7c3aed,#ec4899)',
            color:'white', borderRadius:'20px',
            padding:'2px 10px', fontSize:'12px', fontWeight:'700',
          }}>
            {customers.length}
          </span>
        </div>
        <button
          onClick={() => setShowForm(v => !v)}
          style={{
            display:'flex', alignItems:'center', gap:'7px',
            background: showForm ? 'rgba(255,255,255,.08)' : 'linear-gradient(135deg,#7c3aed,#ec4899)',
            color: showForm ? 'rgba(148,163,184,.8)' : 'white',
            border: showForm ? '1px solid rgba(255,255,255,.1)' : 'none',
            borderRadius:'12px', padding:'10px 20px', cursor:'pointer',
            fontWeight:'700', fontSize:'14px',
            boxShadow: showForm ? 'none' : '0 4px 16px rgba(124,58,237,.4)',
            transition:'all .18s ease',
          }}
        >
          <UserPlus size={15} />
          {showForm ? 'Άκυρο' : 'Νέος Πελάτης'}
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div style={{
          background:'rgba(124,58,237,.08)',
          border:'1px solid rgba(124,58,237,.2)',
          borderRadius:'16px', padding:'24px', marginBottom:'20px',
          animation:'pageEnter .3s ease both',
        }}>
          <div style={{
            fontSize:'15px', fontWeight:'700', marginBottom:'16px',
            background:'linear-gradient(135deg,#fff 30%,#a78bfa 100%)',
            WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
          }}>
            Νέος Πελάτης
          </div>
          <CustomerForm templates={templates} onSave={handleAdd} onCancel={() => setShowForm(false)} saving={saving} />
        </div>
      )}

      {/* Search */}
      <div style={{ position:'relative', marginBottom:'18px' }}>
        <Search size={15} color="rgba(148,163,184,.5)" style={{ position:'absolute', left:'13px', top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }} />
        <input
          className="search-input"
          type="text"
          placeholder="Αναζήτηση πελάτη..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width:'100%', padding:'11px 14px 11px 40px',
            borderRadius:'12px',
            border:'1px solid rgba(255,255,255,.1)',
            background:'rgba(255,255,255,.06)',
            color:'#f1f5f9',
            fontSize:'14px', outline:'none', boxSizing:'border-box',
          }}
        />
      </div>

      {/* List */}
      {loading ? (
        <div style={{ textAlign:'center', padding:'48px', color:'rgba(167,139,250,.7)' }}>
          <div style={{
            width:'36px', height:'36px',
            border:'3px solid rgba(124,58,237,.25)', borderTopColor:'#7c3aed',
            borderRadius:'50%', animation:'spin .8s linear infinite',
            margin:'0 auto 12px',
          }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          Φόρτωση...
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign:'center', padding:'56px 20px', color:'rgba(148,163,184,.5)' }}>
          <Users size={44} color="rgba(124,58,237,.3)" style={{ margin:'0 auto 14px' }} />
          <div style={{ fontSize:'15px', fontWeight:'600', color:'rgba(167,139,250,.8)', marginBottom:'4px' }}>
            {search ? 'Δεν βρέθηκαν αποτελέσματα' : 'Δεν έχεις πελάτες ακόμα'}
          </div>
          <div style={{ fontSize:'13px' }}>Πάτα «Νέος Πελάτης» για να προσθέσεις</div>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
          {filtered.map((c, idx) => (
            <div
              key={c.id}
              className="cust-row"
              onClick={() => onSelect(c)}
              style={{
                background:'rgba(255,255,255,.04)',
                border:'1px solid rgba(124,58,237,.15)',
                borderRadius:'14px', padding:'14px 18px',
                cursor:'pointer',
                display:'flex', alignItems:'center', gap:'14px',
                animationDelay: `${idx * 0.05}s`,
              }}
            >
              <div style={{
                width:'42px', height:'42px', borderRadius:'50%', flexShrink:0,
                background:'linear-gradient(135deg,#7c3aed,#ec4899)',
                display:'flex', alignItems:'center', justifyContent:'center',
                color:'white', fontWeight:'700', fontSize:'17px',
                boxShadow:'0 0 12px rgba(124,58,237,.4)',
              }}>
                {(c.name || '?')[0].toUpperCase()}
              </div>

              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontWeight:'700', color:'#f1f5f9', fontSize:'15px', marginBottom:'2px' }}>{c.name}</div>
                <div style={{ display:'flex', gap:'12px', flexWrap:'wrap' }}>
                  {c.email && (
                    <span style={{ fontSize:'12px', color:'rgba(148,163,184,.6)', display:'flex', alignItems:'center', gap:'4px' }}>
                      <Mail size={11} />{c.email}
                    </span>
                  )}
                  {c.phone && (
                    <span style={{ fontSize:'12px', color:'rgba(148,163,184,.6)', display:'flex', alignItems:'center', gap:'4px' }}>
                      <Phone size={11} />{c.phone}
                    </span>
                  )}
                  {c.city && (
                    <span style={{ fontSize:'12px', color:'rgba(148,163,184,.6)' }}>📍 {c.city}</span>
                  )}
                </div>
              </div>

              <div style={{ display:'flex', alignItems:'center', gap:'4px' }}>
                <button
                  onClick={e => handleDelete(e, c.id)}
                  style={{
                    background:'none', border:'none', cursor:'pointer',
                    color:'rgba(148,163,184,.3)', padding:'6px', display:'flex', borderRadius:'8px',
                    transition:'all .15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                  onMouseLeave={e => e.currentTarget.style.color = 'rgba(148,163,184,.3)'}
                >
                  <Trash2 size={15} />
                </button>
                <ChevronRight size={18} color="rgba(167,139,250,.5)" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
