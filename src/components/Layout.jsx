import { useState, useEffect } from 'react'
import { signOut } from 'firebase/auth'
import { auth } from '../firebase'
import { useAuth } from '../context/AuthContext'
import { getCustomers, getFieldTemplates, saveFieldTemplates } from '../utils/db'
import TripPlanner from './TripPlanner'
import CustomerList from './CRM/CustomerList'
import CustomerDetail from './CRM/CustomerDetail'
import FieldTemplateManager from './CRM/FieldTemplateManager'
import { Plane, Users, LogOut, Menu, X, Settings2, ChevronDown, ChevronUp, UserCog, HardDrive } from 'lucide-react'
import AccountSettings from './AccountSettings'
import FileManager from './FileManager'

const NAV = [
  { id: 'trip',      label: 'Νέο Ταξίδι',        icon: Plane },
  { id: 'customers', label: 'Πελάτες CRM',        icon: Users },
  { id: 'files',     label: 'Αρχεία Server',      icon: HardDrive },
  { id: 'account',   label: 'Ο Λογαριασμός μου', icon: UserCog },
]

export default function Layout() {
  const user = useAuth()
  const [page, setPage] = useState('trip')
  const [selectedCustomerId, setSelectedCustomerId] = useState(null)
  const [customers, setCustomers] = useState([])
  const [templates, setTemplates] = useState([])
  const [savingTemplates, setSavingTemplates] = useState(false)
  const [showTemplateManager, setShowTemplateManager] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (user) {
      loadCustomers()
      loadTemplates()
    }
  }, [user])

  async function loadCustomers() {
    setCustomers(await getCustomers(user.uid))
  }

  async function loadTemplates() {
    setTemplates(await getFieldTemplates(user.uid))
  }

  async function handleSaveTemplates(fields) {
    setSavingTemplates(true)
    await saveFieldTemplates(user.uid, fields)
    setTemplates(fields)
    setSavingTemplates(false)
  }

  function goToCRM() {
    setPage('customers')
    setSelectedCustomerId(null)
    setSidebarOpen(false)
  }

  function handleSelectCustomer(c) {
    setSelectedCustomerId(c.id)
  }

  function handleBackFromDetail() {
    setSelectedCustomerId(null)
    loadCustomers()
  }

  function handleNavClick(id) {
    setPage(id)
    setSelectedCustomerId(null)
    setSidebarOpen(false)
  }

  const sidebarW = 220

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f0f4f8' }}>

      {/* Sidebar */}
      <aside style={{
        width: `${sidebarW}px`, flexShrink: 0,
        background: 'white', borderRight: '1px solid #e0e7ff',
        display: 'flex', flexDirection: 'column',
        position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 40,
        transform: sidebarOpen || window.innerWidth >= 768 ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.25s',
      }}>
        {/* Logo */}
        <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid #e0e7ff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', borderRadius: '10px', padding: '7px', display: 'flex' }}>
              <Plane color="white" size={18} />
            </div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: '800', color: '#1e1b4b' }}>TripCraft AI</div>
              <div style={{ fontSize: '11px', color: '#6366f1' }}>Travel CRM</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 10px' }}>
          {NAV.map(({ id, label, icon: Icon }) => {
            const active = page === id
            return (
              <button
                key={id}
                onClick={() => handleNavClick(id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  width: '100%', padding: '10px 12px', borderRadius: '10px',
                  border: 'none', cursor: 'pointer', marginBottom: '4px',
                  background: active ? '#eef2ff' : 'transparent',
                  color: active ? '#4f46e5' : '#374151',
                  fontWeight: active ? '700' : '500', fontSize: '14px',
                  textAlign: 'left', transition: 'all 0.15s',
                }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = '#f8f7ff' }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
              >
                <Icon size={16} />
                {label}
                {id === 'customers' && customers.length > 0 && (
                  <span style={{ marginLeft: 'auto', background: '#eef2ff', color: '#4f46e5', borderRadius: '20px', padding: '1px 8px', fontSize: '11px', fontWeight: '700' }}>
                    {customers.length}
                  </span>
                )}
              </button>
            )
          })}
        </nav>

        {/* User + logout */}
        <div style={{ padding: '14px 16px', borderTop: '1px solid #e0e7ff' }}>
          <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user?.email}
          </div>
          <button
            onClick={() => signOut(auth)}
            style={{
              display: 'flex', alignItems: 'center', gap: '7px',
              width: '100%', background: '#fef2f2', color: '#dc2626',
              border: '1px solid #fecaca', borderRadius: '8px',
              padding: '8px 12px', cursor: 'pointer', fontWeight: '600', fontSize: '13px',
            }}
          >
            <LogOut size={14} />
            Αποσύνδεση
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 39 }}
        />
      )}

      {/* Main */}
      <div style={{ marginLeft: `${sidebarW}px`, flex: 1, minWidth: 0 }}>
        {/* Top bar */}
        <div style={{
          background: 'white', borderBottom: '1px solid #e0e7ff',
          padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '12px',
          position: 'sticky', top: 0, zIndex: 30,
        }}>
          <button
            onClick={() => setSidebarOpen(v => !v)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'none', padding: '4px', color: '#374151' }}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div style={{ fontSize: '16px', fontWeight: '700', color: '#1e1b4b', flex: 1 }}>
            {page === 'trip' ? '✈️ Νέο Ταξίδι'
              : page === 'account' ? '⚙️ Ο Λογαριασμός μου'
              : page === 'files' ? '🗄️ Αρχεία Server'
              : selectedCustomerId ? '👤 Στοιχεία Πελάτη'
              : '👥 Πελάτες CRM'}
          </div>

          {/* Field template manager toggle — only on CRM page */}
          {page === 'customers' && !selectedCustomerId && (
            <button
              onClick={() => setShowTemplateManager(v => !v)}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                background: showTemplateManager ? '#eef2ff' : '#f8f7ff',
                color: '#4f46e5', border: '1px solid #c7d2fe',
                borderRadius: '8px', padding: '7px 14px',
                cursor: 'pointer', fontSize: '13px', fontWeight: '600',
              }}
            >
              <Settings2 size={14} />
              Πεδία πελατών
              {templates.length > 0 && (
                <span style={{ background: '#4f46e5', color: 'white', borderRadius: '20px', padding: '1px 7px', fontSize: '11px', fontWeight: '700' }}>
                  {templates.length}
                </span>
              )}
              {showTemplateManager ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </button>
          )}
        </div>

        {/* Content */}
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '28px 20px' }}>

          {/* Field template manager panel */}
          {page === 'customers' && !selectedCustomerId && showTemplateManager && (
            <div style={{
              background: 'white', border: '1px solid #c7d2fe',
              borderRadius: '14px', padding: '20px 24px', marginBottom: '20px',
              boxShadow: '0 2px 12px rgba(99,102,241,0.08)',
            }}>
              <FieldTemplateManager
                templates={templates}
                onSave={handleSaveTemplates}
                saving={savingTemplates}
              />
            </div>
          )}

          {page === 'trip' && (
            <TripPlanner customers={customers} onGoToCRM={goToCRM} />
          )}
          {page === 'account' && (
            <AccountSettings />
          )}
          {page === 'files' && (
            <FileManager />
          )}
          {page === 'customers' && !selectedCustomerId && (
            <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 4px 24px rgba(79,70,229,0.08)', border: '1px solid #e0e7ff', padding: '28px' }}>
              <CustomerList
                onSelect={handleSelectCustomer}
                templates={templates}
              />
            </div>
          )}
          {page === 'customers' && selectedCustomerId && (
            <CustomerDetail
              customerId={selectedCustomerId}
              onBack={handleBackFromDetail}
              templates={templates}
            />
          )}
        </div>
      </div>
    </div>
  )
}
