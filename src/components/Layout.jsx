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

const PAGE_TITLES = {
  trip:      '✈️ Νέο Ταξίδι',
  account:   '⚙️ Ο Λογαριασμός μου',
  files:     '🗄️ Αρχεία Server',
  customers: '👥 Πελάτες CRM',
}

export default function Layout() {
  const user = useAuth()
  const [page, setPage] = useState('trip')
  const [selectedCustomerId, setSelectedCustomerId] = useState(null)
  const [customers, setCustomers] = useState([])
  const [templates, setTemplates] = useState([])
  const [savingTemplates, setSavingTemplates] = useState(false)
  const [showTemplateManager, setShowTemplateManager] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [hoveredNav, setHoveredNav] = useState(null)

  useEffect(() => {
    if (user) { loadCustomers(); loadTemplates() }
  }, [user])

  async function loadCustomers() { setCustomers(await getCustomers(user.uid)) }
  async function loadTemplates()  { setTemplates(await getFieldTemplates(user.uid)) }

  async function handleSaveTemplates(fields) {
    setSavingTemplates(true)
    await saveFieldTemplates(user.uid, fields)
    setTemplates(fields)
    setSavingTemplates(false)
  }

  function goToCRM() { setPage('customers'); setSelectedCustomerId(null); setSidebarOpen(false) }
  function handleSelectCustomer(c) { setSelectedCustomerId(c.id) }
  function handleBackFromDetail() { setSelectedCustomerId(null); loadCustomers() }
  function handleNavClick(id) { setPage(id); setSelectedCustomerId(null); setSidebarOpen(false) }

  const sidebarW = 228

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'#080518' }}>
      <style>{`
        @keyframes sidebarGlow {
          0%,100% { opacity:.5; }
          50%      { opacity:1; }
        }
        .nav-btn { transition: all .15s ease !important; }
        .nav-btn:hover { background: rgba(124,58,237,.15) !important; color: #a78bfa !important; }
        .logout-btn:hover { background: rgba(220,38,38,.2) !important; border-color: rgba(220,38,38,.4) !important; }
        .logout-btn { transition: all .15s ease; }
        .topbar-btn:hover { background: rgba(124,58,237,.2) !important; color: #a78bfa !important; }
        .topbar-btn { transition: all .15s ease; }

        /* Override inner component colors for dark theme */
        ::-webkit-scrollbar { width:6px; height:6px; }
        ::-webkit-scrollbar-track { background: rgba(255,255,255,.03); }
        ::-webkit-scrollbar-thumb { background: rgba(124,58,237,.4); border-radius:3px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(124,58,237,.7); }
      `}</style>

      {/* ── Sidebar ── */}
      <aside style={{
        width:`${sidebarW}px`, flexShrink:0,
        background:'linear-gradient(180deg, #0d0829 0%, #060112 100%)',
        borderRight:'1px solid rgba(124,58,237,.15)',
        display:'flex', flexDirection:'column',
        position:'fixed', top:0, left:0, bottom:0, zIndex:40,
        transform: sidebarOpen || window.innerWidth >= 768 ? 'translateX(0)' : 'translateX(-100%)',
        transition:'transform .25s ease',
      }}>
        {/* Sidebar ambient glow */}
        <div style={{
          position:'absolute', top:0, right:0, width:'1px', bottom:0,
          background:'linear-gradient(180deg, transparent, rgba(124,58,237,.4) 40%, rgba(236,72,153,.3) 70%, transparent)',
          pointerEvents:'none',
        }} />

        {/* Logo */}
        <div style={{ padding:'22px 20px 18px', borderBottom:'1px solid rgba(255,255,255,.06)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'11px' }}>
            <div style={{
              background:'linear-gradient(135deg, #7c3aed, #ec4899)',
              borderRadius:'12px', padding:'8px', display:'flex',
              boxShadow:'0 0 16px rgba(124,58,237,.5)',
            }}>
              <Plane color="white" size={18} />
            </div>
            <div>
              <div style={{
                fontSize:'15px', fontWeight:'900', letterSpacing:'-0.3px',
                background:'linear-gradient(135deg, #fff 30%, #a78bfa 100%)',
                WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
              }}>
                TripCraft AI
              </div>
              <div style={{ fontSize:'10px', color:'rgba(167,139,250,.6)', letterSpacing:'1.5px', textTransform:'uppercase' }}>
                Travel CRM
              </div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex:1, padding:'14px 10px' }}>
          {NAV.map(({ id, label, icon: Icon }) => {
            const active = page === id
            return (
              <button
                key={id}
                className="nav-btn"
                onClick={() => handleNavClick(id)}
                style={{
                  display:'flex', alignItems:'center', gap:'10px',
                  width:'100%', padding:'10px 14px', borderRadius:'12px',
                  border: active ? '1px solid rgba(124,58,237,.35)' : '1px solid transparent',
                  cursor:'pointer', marginBottom:'3px',
                  background: active
                    ? 'linear-gradient(135deg, rgba(124,58,237,.25), rgba(236,72,153,.1))'
                    : 'transparent',
                  color: active ? '#a78bfa' : 'rgba(148,163,184,.8)',
                  fontWeight: active ? '700' : '500', fontSize:'13.5px',
                  textAlign:'left',
                  boxShadow: active ? 'inset 0 0 12px rgba(124,58,237,.1)' : 'none',
                  position:'relative', overflow:'hidden',
                }}
              >
                {active && (
                  <div style={{
                    position:'absolute', left:0, top:'20%', bottom:'20%',
                    width:'3px', borderRadius:'0 2px 2px 0',
                    background:'linear-gradient(180deg, #7c3aed, #ec4899)',
                  }} />
                )}
                <Icon size={16} />
                {label}
                {id === 'customers' && customers.length > 0 && (
                  <span style={{
                    marginLeft:'auto',
                    background:'linear-gradient(135deg, #7c3aed, #ec4899)',
                    color:'white', borderRadius:'20px',
                    padding:'1px 8px', fontSize:'10px', fontWeight:'700',
                  }}>
                    {customers.length}
                  </span>
                )}
              </button>
            )
          })}
        </nav>

        {/* User + logout */}
        <div style={{ padding:'14px 14px', borderTop:'1px solid rgba(255,255,255,.06)' }}>
          <div style={{
            fontSize:'11px', color:'rgba(148,163,184,.5)',
            marginBottom:'10px', overflow:'hidden',
            textOverflow:'ellipsis', whiteSpace:'nowrap',
          }}>
            {user?.email}
          </div>
          <button
            className="logout-btn"
            onClick={() => signOut(auth)}
            style={{
              display:'flex', alignItems:'center', gap:'8px',
              width:'100%',
              background:'rgba(220,38,38,.1)',
              color:'rgba(252,165,165,.9)',
              border:'1px solid rgba(220,38,38,.25)',
              borderRadius:'10px', padding:'9px 14px',
              cursor:'pointer', fontWeight:'600', fontSize:'13px',
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
          style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.6)', zIndex:39, backdropFilter:'blur(4px)' }}
        />
      )}

      {/* ── Main ── */}
      <div style={{ marginLeft:`${sidebarW}px`, flex:1, minWidth:0 }}>

        {/* Top bar */}
        <div style={{
          background:'rgba(13,8,41,.85)',
          backdropFilter:'blur(16px)',
          borderBottom:'1px solid rgba(124,58,237,.15)',
          padding:'13px 28px', display:'flex', alignItems:'center', gap:'12px',
          position:'sticky', top:0, zIndex:30,
        }}>
          <button
            onClick={() => setSidebarOpen(v => !v)}
            style={{
              background:'none', border:'none', cursor:'pointer',
              display:'none', padding:'4px', color:'rgba(167,139,250,.8)',
            }}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <div style={{
            fontSize:'15px', fontWeight:'700', flex:1,
            background:'linear-gradient(135deg, #fff 30%, #a78bfa 100%)',
            WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
          }}>
            {selectedCustomerId
              ? '👤 Στοιχεία Πελάτη'
              : PAGE_TITLES[page]}
          </div>

          {page === 'customers' && !selectedCustomerId && (
            <button
              className="topbar-btn"
              onClick={() => setShowTemplateManager(v => !v)}
              style={{
                display:'flex', alignItems:'center', gap:'7px',
                background: showTemplateManager
                  ? 'rgba(124,58,237,.25)'
                  : 'rgba(124,58,237,.1)',
                color:'rgba(167,139,250,.9)',
                border:'1px solid rgba(124,58,237,.3)',
                borderRadius:'10px', padding:'8px 16px',
                cursor:'pointer', fontSize:'13px', fontWeight:'600',
              }}
            >
              <Settings2 size={14} />
              Πεδία πελατών
              {templates.length > 0 && (
                <span style={{
                  background:'linear-gradient(135deg,#7c3aed,#ec4899)',
                  color:'white', borderRadius:'20px',
                  padding:'1px 7px', fontSize:'10px', fontWeight:'700',
                }}>
                  {templates.length}
                </span>
              )}
              {showTemplateManager ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </button>
          )}
        </div>

        {/* Content */}
        <div style={{ maxWidth:'1060px', margin:'0 auto', padding:'30px 24px' }}>

          {page === 'customers' && !selectedCustomerId && showTemplateManager && (
            <div style={{
              background:'rgba(255,255,255,.04)',
              border:'1px solid rgba(124,58,237,.2)',
              borderRadius:'16px', padding:'22px 26px', marginBottom:'22px',
              boxShadow:'0 4px 24px rgba(0,0,0,.3)',
              backdropFilter:'blur(12px)',
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
            <div style={{
              background:'rgba(255,255,255,.04)',
              backdropFilter:'blur(12px)',
              borderRadius:'18px',
              boxShadow:'0 8px 40px rgba(0,0,0,.4)',
              border:'1px solid rgba(124,58,237,.15)',
              padding:'28px',
            }}>
              <CustomerList onSelect={handleSelectCustomer} templates={templates} />
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
