import { useEffect, useRef } from 'react'

function renderMarkdown(text) {
  const lines = text.split('\n')
  const elements = []
  let i = 0
  let key = 0

  while (i < lines.length) {
    const line = lines[i]

    // Table
    if (line.trim().startsWith('|') && i + 1 < lines.length && lines[i + 1].match(/\|[\s:-]+\|/)) {
      const tableLines = []
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        tableLines.push(lines[i]); i++
      }
      const headers = tableLines[0].split('|').slice(1, -1).map(h => h.trim())
      const rows = tableLines.slice(2).map(r => r.split('|').slice(1, -1).map(c => c.trim()))
      elements.push(
        <div key={key++} style={{ overflowX:'auto', margin:'14px 0' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'14px' }}>
            <thead>
              <tr style={{ background:'rgba(124,58,237,.2)' }}>
                {headers.map((h, j) => (
                  <th key={j} style={{ padding:'9px 14px', border:'1px solid rgba(124,58,237,.25)', textAlign:'left', fontWeight:'700', color:'#a78bfa' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, ri) => (
                <tr key={ri} style={{ background: ri % 2 === 0 ? 'rgba(255,255,255,.03)' : 'rgba(124,58,237,.05)' }}>
                  {row.map((cell, ci) => (
                    <td key={ci} style={{ padding:'8px 14px', border:'1px solid rgba(124,58,237,.12)', color:'rgba(241,245,249,.85)' }}>
                      {inlineRender(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
      continue
    }

    // HR
    if (line.trim() === '---' || line.trim() === '***') {
      elements.push(<hr key={key++} style={{ border:'none', borderTop:'1px solid rgba(124,58,237,.2)', margin:'20px 0' }} />)
      i++; continue
    }

    // H1
    if (line.startsWith('# ')) {
      elements.push(
        <h1 key={key++} style={{
          fontSize:'22px', fontWeight:'800', margin:'26px 0 12px', lineHeight:'1.3',
          background:'linear-gradient(135deg,#fff 30%,#a78bfa 100%)',
          WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
        }}>
          {inlineRender(line.slice(2))}
        </h1>
      )
      i++; continue
    }

    // H2
    if (line.startsWith('## ')) {
      elements.push(
        <h2 key={key++} style={{
          fontSize:'17px', fontWeight:'700', margin:'22px 0 10px', padding:'10px 16px',
          background:'linear-gradient(90deg,rgba(124,58,237,.2),transparent)',
          borderLeft:'3px solid #7c3aed', borderRadius:'0 10px 10px 0',
          color:'#c4b5fd',
        }}>
          {inlineRender(line.slice(3))}
        </h2>
      )
      i++; continue
    }

    // H3
    if (line.startsWith('### ')) {
      elements.push(
        <h3 key={key++} style={{ fontSize:'15px', fontWeight:'700', color:'#e2e8f0', margin:'16px 0 6px' }}>
          {inlineRender(line.slice(4))}
        </h3>
      )
      i++; continue
    }

    // H4
    if (line.startsWith('#### ')) {
      elements.push(
        <h4 key={key++} style={{ fontSize:'14px', fontWeight:'700', color:'rgba(167,139,250,.9)', margin:'12px 0 4px' }}>
          {inlineRender(line.slice(5))}
        </h4>
      )
      i++; continue
    }

    // Bullet list
    if (line.match(/^[-*]\s/)) {
      const items = []
      while (i < lines.length && lines[i].match(/^[-*]\s/)) {
        items.push(lines[i].slice(2)); i++
      }
      elements.push(
        <ul key={key++} style={{ margin:'6px 0 6px 4px', padding:0, listStyle:'none' }}>
          {items.map((item, j) => (
            <li key={j} style={{
              margin:'4px 0', color:'rgba(226,232,240,.85)', fontSize:'14px', lineHeight:'1.7',
              paddingLeft:'18px', position:'relative',
            }}>
              <span style={{ position:'absolute', left:0, color:'#7c3aed', fontSize:'16px', lineHeight:'1.4' }}>·</span>
              {inlineRender(item)}
            </li>
          ))}
        </ul>
      )
      continue
    }

    // Numbered list
    if (line.match(/^\d+\.\s/)) {
      const items = []
      while (i < lines.length && lines[i].match(/^\d+\.\s/)) {
        items.push(lines[i].replace(/^\d+\.\s/, '')); i++
      }
      elements.push(
        <ol key={key++} style={{ margin:'6px 0 6px 20px', padding:0 }}>
          {items.map((item, j) => (
            <li key={j} style={{ margin:'4px 0', color:'rgba(226,232,240,.85)', fontSize:'14px', lineHeight:'1.7' }}>
              {inlineRender(item)}
            </li>
          ))}
        </ol>
      )
      continue
    }

    // Empty
    if (line.trim() === '') {
      elements.push(<div key={key++} style={{ height:'6px' }} />)
      i++; continue
    }

    // Paragraph
    elements.push(
      <p key={key++} style={{ margin:'4px 0', color:'rgba(226,232,240,.8)', fontSize:'14px', lineHeight:'1.8' }}>
        {inlineRender(line)}
      </p>
    )
    i++
  }

  return elements
}

function inlineRender(text) {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**'))
      return <strong key={i} style={{ color:'#e2e8f0', fontWeight:'700' }}>{part.slice(2, -2)}</strong>
    if (part.startsWith('*') && part.endsWith('*'))
      return <em key={i} style={{ color:'rgba(167,139,250,.9)' }}>{part.slice(1, -1)}</em>
    return part
  })
}

export default function ItineraryView({ text, streaming }) {
  const bottomRef = useRef(null)

  useEffect(() => {
    if (streaming) bottomRef.current?.scrollIntoView({ behavior:'smooth', block:'end' })
  }, [text, streaming])

  return (
    <div>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.3} }
        @keyframes itinFadeIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
      <div style={{
        display:'flex', alignItems:'center', gap:'10px',
        marginBottom:'22px', paddingBottom:'16px',
        borderBottom:'1px solid rgba(124,58,237,.2)',
        animation: 'itinFadeIn .4s ease both',
      }}>
        <span style={{
          fontSize:'18px', fontWeight:'800',
          background:'linear-gradient(135deg,#fff 30%,#a78bfa 70%,#ec4899 100%)',
          WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
        }}>
          📋 Ατζέντα Ταξιδιού
        </span>
        {streaming && (
          <span style={{
            display:'flex', alignItems:'center', gap:'6px',
            fontSize:'11px', fontWeight:'700',
            color:'#a78bfa',
            background:'rgba(124,58,237,.15)',
            border:'1px solid rgba(124,58,237,.3)',
            padding:'3px 10px', borderRadius:'20px',
            letterSpacing:'0.5px',
          }}>
            <span style={{
              width:'6px', height:'6px', borderRadius:'50%',
              background:'linear-gradient(135deg,#7c3aed,#ec4899)',
              animation:'pulse 1s infinite',
            }} />
            Δημιουργία...
          </span>
        )}
      </div>
      <div style={{ fontFamily:'system-ui,sans-serif' }}>
        {renderMarkdown(text)}
      </div>
      <div ref={bottomRef} />
    </div>
  )
}
