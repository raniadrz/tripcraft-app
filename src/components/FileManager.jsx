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
    <div style={{
      display: 'flex', alignItems: 'center', gap: '12px',
      padding: '12px 16px', borderBottom: '1px solid #f3f4f6',
      transition: 'background 0.15s',
    }}
      onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      {isImage ? (
        <img
          src={file.url}
          alt={name}
          style={{ width: 40, height: 40, borderRadius: '6px', objectFit: 'cover', flexShrink: 0, border: '1px solid #e5e7eb' }}
          onError={e => { e.target.style.display = 'none' }}
        />
      ) : (
        <div style={{ width: 40, height: 40, borderRadius: '6px', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <FileText size={20} color="#d97706" />
        </div>
      )}

      <div style={{ flex: 1, minWidth: 0 }}>
        <a
          href={file.url}
          target="_blank"
          rel="noreferrer"
          style={{ fontSize: '13px', fontWeight: '600', color: '#1e1b4b', textDecoration: 'none', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
        >
          {name}
        </a>
        <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>
          {formatSize(file.size)} · {formatDate(file.createdAt)}
        </div>
      </div>

      <button
        onClick={handleDelete}
        disabled={deleting}
        style={{
          background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626',
          borderRadius: '7px', padding: '6px 10px', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px',
          fontWeight: '600', flexShrink: 0,
          opacity: deleting ? 0.5 : 1,
        }}
      >
        <Trash2 size={13} />
        {deleting ? '...' : 'Διαγραφή'}
      </button>
    </div>
  )
}

function Section({ title, icon: Icon, files, loading, onDelete, isImage, color }) {
  const totalSize = files.reduce((s, f) => s + f.size, 0)

  return (
    <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #e0e7ff', overflow: 'hidden', boxShadow: '0 2px 12px rgba(79,70,229,0.06)' }}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: '10px', background: '#fafbff' }}>
        <div style={{ background: color + '20', borderRadius: '8px', padding: '6px', display: 'flex' }}>
          <Icon size={18} color={color} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '15px', fontWeight: '700', color: '#1e1b4b' }}>{title}</div>
          <div style={{ fontSize: '11px', color: '#9ca3af' }}>
            {loading ? 'Φόρτωση...' : `${files.length} αρχεία · ${formatSize(totalSize)}`}
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '32px', textAlign: 'center', color: '#9ca3af', fontSize: '14px' }}>Φόρτωση...</div>
      ) : files.length === 0 ? (
        <div style={{ padding: '32px', textAlign: 'center', color: '#9ca3af', fontSize: '14px' }}>Δεν υπάρχουν αρχεία</div>
      ) : (
        files.map(f => (
          <FileRow key={f.filename} file={f} onDelete={onDelete} isImage={isImage} />
        ))
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
    setLoading(true)
    setError('')
    try {
      const [pRes, iRes] = await Promise.all([
        fetch(`${FILE_SERVER}/files`),
        fetch(`${FILE_SERVER}/images`),
      ])
      if (!pRes.ok || !iRes.ok) throw new Error()
      const [p, i] = await Promise.all([pRes.json(), iRes.json()])
      setPdfs(p)
      setImages(i)
    } catch {
      setError('Δεν είναι διαθέσιμος ο file server. Τρέχει το Docker;')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ flex: 1 }}>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: '#1e1b4b' }}>Διαχείριση Αρχείων</h2>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#6b7280' }}>Αρχεία αποθηκευμένα στον local file server</p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: '#eef2ff', color: '#4f46e5', border: '1px solid #c7d2fe',
            borderRadius: '8px', padding: '8px 16px', cursor: 'pointer',
            fontSize: '13px', fontWeight: '600',
            opacity: loading ? 0.5 : 1,
          }}
        >
          <RefreshCw size={14} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          Ανανέωση
        </button>
      </div>

      {/* Error */}
      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '14px 16px', color: '#dc2626', fontSize: '14px' }}>
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
            color="#d97706"
            onDelete={name => setPdfs(prev => prev.filter(f => f.filename !== name))}
          />
          <Section
            title="Εικόνες"
            icon={Image}
            files={images}
            loading={loading}
            isImage={true}
            color="#7c3aed"
            onDelete={name => setImages(prev => prev.filter(f => f.filename !== name))}
          />
        </>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
      `}</style>
    </div>
  )
}
