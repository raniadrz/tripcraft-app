import { useState, useEffect, useCallback } from 'react'
import { HardDrive, FileText, Image, Trash2, RefreshCw, AlertCircle } from 'lucide-react'

const FILE_SERVER = 'http://localhost:3001'

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(ms) {
  return new Date(ms).toLocaleString('el-GR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function FileRow({ file, onDelete, isImage }) {
  const [deleting, setDeleting] = useState(false)
  const name = file.filename

  async function handleDelete() {
    if (!confirm(`Διαγραφή "${name}";`)) return
    setDeleting(true)
    try {
      const endpoint = isImage
        ? `${FILE_SERVER}/images/${name}`
        : `${FILE_SERVER}/files/${name.replace('.pdf', '')}`
      await fetch(endpoint, { method: 'DELETE' })
      onDelete(name)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div
      style={{
        display:'flex', alignItems:'center', gap:'12px',
        padding:'12px 18px', borderBottom:'1px solid rgba(124,58,237,.08)',
        transition:'background .15s',
      }}
      onMouseEnter={e => e.currentTarget.style.background = 'rgba(124,58,237,.07)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      {isImage ? (
        <img
          src={file.url}
          alt={name}
          style={{ width:42, height:42, borderRadius:'8px', objectFit:'cover', flexShrink:0, border:'1px solid rgba(124,58,237,.2)' }}
          onError={e => { e.target.style.display = 'none' }}
        />
      ) : (
        <div style={{
          width:42, height:42, borderRadius:'8px', flexShrink:0,
          background:'rgba(217,119,6,.15)',
          display:'flex', alignItems:'center', justifyContent:'center',
          border:'1px solid rgba(217,119,6,.25)',
        }}>
          <FileText size={20} color="#fbbf24" />
        </div>
      )}

      <div style={{ flex:1, minWidth:0 }}>
        <a
          href={file.url}
          target="_blank"
          rel="noreferrer"
          style={{ fontSize:'13px', fontWeight:'600', color:'#f1f5f9', textDecoration:'none', display:'block', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}
        >
          {name}
        </a>
        <div style={{ fontSize:'11px', color:'rgba(148,163,184,.5)', marginTop:'2px' }}>
          {formatSize(file.size)} · {formatDate(file.createdAt)}
        </div>
      </div>

      <button
        onClick={handleDelete}
        disabled={deleting}
        style={{
          background:'rgba(220,38,38,.12)', border:'1px solid rgba(220,38,38,.25)',
          color:'rgba(252,165,165,.8)',
          borderRadius:'8px', padding:'6px 12px', cursor:'pointer',
          display:'flex', alignItems:'center', gap:'4px', fontSize:'12px',
          fontWeight:'600', flexShrink:0, opacity: deleting ? 0.5 : 1,
          transition:'all .15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(220,38,38,.2)'; e.currentTarget.style.color = '#fca5a5' }}
        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(220,38,38,.12)'; e.currentTarget.style.color = 'rgba(252,165,165,.8)' }}
      >
        <Trash2 size={13} />
        {deleting ? '...' : 'Διαγραφή'}
      </button>
    </div>
  )
}

function Section({ title, icon: Icon, files, loading, onDelete, isImage, accentColor }) {
  const totalSize = files.reduce((s, f) => s + f.size, 0)

  return (
    <div style={{
      background:'rgba(255,255,255,.04)', backdropFilter:'blur(12px)',
      borderRadius:'16px', border:'1px solid rgba(124,58,237,.15)', overflow:'hidden',
      animation:'pageEnter .45s ease both',
    }}>
      <div style={{
        padding:'16px 20px',
        borderBottom:'1px solid rgba(124,58,237,.1)',
        display:'flex', alignItems:'center', gap:'12px',
        background:'rgba(124,58,237,.06)',
      }}>
        <div style={{
          background: `rgba(${accentColor},.15)`,
          borderRadius:'8px', padding:'7px', display:'flex',
          border:`1px solid rgba(${accentColor},.25)`,
        }}>
          <Icon size={18} color={`rgba(${accentColor},1)`} />
        </div>
        <div style={{ flex:1 }}>
          <div style={{
            fontSize:'15px', fontWeight:'700',
            background:'linear-gradient(135deg,#fff 30%,#a78bfa 100%)',
            WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
          }}>{title}</div>
          <div style={{ fontSize:'11px', color:'rgba(148,163,184,.5)' }}>
            {loading ? 'Φόρτωση...' : `${files.length} αρχεία · ${formatSize(totalSize)}`}
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ padding:'36px', textAlign:'center', color:'rgba(167,139,250,.5)', fontSize:'14px' }}>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          <div style={{ width:'28px', height:'28px', border:'2px solid rgba(124,58,237,.25)', borderTopColor:'#7c3aed', borderRadius:'50%', animation:'spin .8s linear infinite', margin:'0 auto 10px' }} />
          Φόρτωση...
        </div>
      ) : files.length === 0 ? (
        <div style={{ padding:'36px', textAlign:'center', color:'rgba(148,163,184,.4)', fontSize:'14px' }}>
          Δεν υπάρχουν αρχεία
        </div>
      ) : (
        files.map(f => <FileRow key={f.filename} file={f} onDelete={onDelete} isImage={isImage} />)
      )}
    </div>
  )
}

export default function FileManager() {
  const [pdfs, setPdfs] = useState([])
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const [pRes, iRes] = await Promise.all([
        fetch(`${FILE_SERVER}/files`),
        fetch(`${FILE_SERVER}/images`),
      ])
      if (!pRes.ok || !iRes.ok) throw new Error()
      const [p, i] = await Promise.all([pRes.json(), iRes.json()])
      setPdfs(p); setImages(i)
    } catch {
      setError('Δεν είναι διαθέσιμος ο file server. Τρέχει το Docker;')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'20px', animation:'pageEnter .5s ease both' }}>
      <style>{`@keyframes pageEnter{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
        <div style={{ flex:1 }}>
          <h2 style={{
            margin:0, fontSize:'20px', fontWeight:'800',
            background:'linear-gradient(135deg,#fff 30%,#a78bfa 100%)',
            WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
          }}>
            Διαχείριση Αρχείων
          </h2>
          <p style={{ margin:'4px 0 0', fontSize:'13px', color:'rgba(148,163,184,.5)' }}>
            Αρχεία αποθηκευμένα στον local file server
          </p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          style={{
            display:'flex', alignItems:'center', gap:'6px',
            background:'rgba(124,58,237,.15)', color:'#a78bfa',
            border:'1px solid rgba(124,58,237,.3)',
            borderRadius:'10px', padding:'9px 18px', cursor:'pointer',
            fontSize:'13px', fontWeight:'600',
            opacity: loading ? 0.5 : 1, transition:'all .15s',
          }}
        >
          <RefreshCw size={14} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          Ανανέωση
        </button>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          display:'flex', alignItems:'center', gap:'10px',
          background:'rgba(220,38,38,.12)', border:'1px solid rgba(220,38,38,.25)',
          borderRadius:'12px', padding:'14px 18px', color:'#fca5a5', fontSize:'14px',
        }}>
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {!error && (
        <>
          <Section
            title="PDF Αρχεία"
            icon={FileText}
            files={pdfs}
            loading={loading}
            isImage={false}
            accentColor="217,119,6"
            onDelete={name => setPdfs(prev => prev.filter(f => f.filename !== name))}
          />
          <Section
            title="Εικόνες"
            icon={Image}
            files={images}
            loading={loading}
            isImage={true}
            accentColor="124,58,237"
            onDelete={name => setImages(prev => prev.filter(f => f.filename !== name))}
          />
        </>
      )}
    </div>
  )
}
