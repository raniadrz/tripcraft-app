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

  useEffect(() => {
    load()
  }, [])

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
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Users size={20} color="#4f46e5" />
          <span style={{ fontSize: '18px', fontWeight: '700', color: '#1e1b4b' }}>
            Πελάτες
          </span>
          <span style={{ background: '#eef2ff', color: '#4f46e5', borderRadius: '20px', padding: '2px 10px', fontSize: '13px', fontWeight: '700' }}>
            {customers.length}
          </span>
        </div>
        <button
          onClick={() => setShowForm(v => !v)}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: showForm ? '#f3f4f6' : 'linear-gradient(135deg, #4f46e5, #7c3aed)',
            color: showForm ? '#374151' : 'white', border: 'none',
            borderRadius: '10px', padding: '9px 18px', cursor: 'pointer',
            fontWeight: '700', fontSize: '14px',
          }}
        >
          <UserPlus size={15} />
          {showForm ? 'Άκυρο' : 'Νέος Πελάτης'}
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div style={{ background: '#f8f7ff', border: '1px solid #e0e7ff', borderRadius: '14px', padding: '24px', marginBottom: '20px' }}>
          <div style={{ fontSize: '15px', fontWeight: '700', color: '#312e81', marginBottom: '16px' }}>Νέος Πελάτης</div>
          <CustomerForm templates={templates} onSave={handleAdd} onCancel={() => setShowForm(false)} saving={saving} />
        </div>
      )}

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: '16px' }}>
        <Search size={15} color="#9ca3af" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
        <input
          type="text"
          placeholder="Αναζήτηση πελάτη..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width: '100%', padding: '10px 12px 10px 36px',
            borderRadius: '10px', border: '1px solid #d1d5db',
            fontSize: '14px', outline: 'none', boxSizing: 'border-box',
          }}
        />
      </div>

      {/* List */}
      {loading ? (
        <div style={{ textAlign: 'center', color: '#6b7280', padding: '40px' }}>Φόρτωση...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#9ca3af', padding: '48px 20px' }}>
          <Users size={40} color="#d1d5db" style={{ margin: '0 auto 12px' }} />
          <div style={{ fontSize: '15px', fontWeight: '600' }}>
            {search ? 'Δεν βρέθηκαν αποτελέσματα' : 'Δεν έχεις πελάτες ακόμα'}
          </div>
          <div style={{ fontSize: '13px', marginTop: '4px' }}>Πάτα «Νέος Πελάτης» για να προσθέσεις</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {filtered.map(c => (
            <div
              key={c.id}
              onClick={() => onSelect(c)}
              style={{
                background: 'white', border: '1px solid #e0e7ff', borderRadius: '12px',
                padding: '14px 16px', cursor: 'pointer', transition: 'all 0.15s',
                display: 'flex', alignItems: 'center', gap: '14px',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#6366f1'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#e0e7ff'}
            >
              {/* Avatar */}
              <div style={{
                width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0,
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontWeight: '700', fontSize: '16px',
              }}>
                {(c.name || '?')[0].toUpperCase()}
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: '700', color: '#1e1b4b', fontSize: '15px' }}>{c.name}</div>
                <div style={{ display: 'flex', gap: '12px', marginTop: '2px', flexWrap: 'wrap' }}>
                  {c.email && (
                    <span style={{ fontSize: '12px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Mail size={11} />{c.email}
                    </span>
                  )}
                  {c.phone && (
                    <span style={{ fontSize: '12px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Phone size={11} />{c.phone}
                    </span>
                  )}
                  {c.city && (
                    <span style={{ fontSize: '12px', color: '#6b7280' }}>📍 {c.city}</span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <button
                  onClick={e => handleDelete(e, c.id)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#d1d5db', padding: '6px', display: 'flex', borderRadius: '6px' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                  onMouseLeave={e => e.currentTarget.style.color = '#d1d5db'}
                >
                  <Trash2 size={15} />
                </button>
                <ChevronRight size={18} color="#9ca3af" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
