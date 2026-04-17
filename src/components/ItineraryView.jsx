import { useEffect, useRef } from 'react'

// Minimal markdown renderer — handles headers, bold, bullets, tables, hr
function renderMarkdown(text) {
  const lines = text.split('\n')
  const elements = []
  let i = 0
  let key = 0

  while (i < lines.length) {
    const line = lines[i]

    // Table detection
    if (line.trim().startsWith('|') && i + 1 < lines.length && lines[i + 1].match(/\|[\s:-]+\|/)) {
      const tableLines = []
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        tableLines.push(lines[i])
        i++
      }
      const headers = tableLines[0].split('|').slice(1, -1).map(h => h.trim())
      const rows = tableLines.slice(2).map(r => r.split('|').slice(1, -1).map(c => c.trim()))
      elements.push(
        <div key={key++} style={{ overflowX: 'auto', margin: '12px 0' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr style={{ background: '#eef2ff' }}>
                {headers.map((h, j) => (
                  <th key={j} style={{ padding: '8px 12px', border: '1px solid #c7d2fe', textAlign: 'left', fontWeight: '600', color: '#312e81' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, ri) => (
                <tr key={ri} style={{ background: ri % 2 === 0 ? 'white' : '#f8f7ff' }}>
                  {row.map((cell, ci) => (
                    <td key={ci} style={{ padding: '7px 12px', border: '1px solid #e0e7ff', color: '#374151' }}>
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
      elements.push(<hr key={key++} style={{ border: 'none', borderTop: '1px solid #e0e7ff', margin: '16px 0' }} />)
      i++; continue
    }

    // H1
    if (line.startsWith('# ')) {
      elements.push(
        <h1 key={key++} style={{ fontSize: '22px', fontWeight: '800', color: '#1e1b4b', margin: '24px 0 12px', lineHeight: '1.3' }}>
          {inlineRender(line.slice(2))}
        </h1>
      )
      i++; continue
    }

    // H2
    if (line.startsWith('## ')) {
      elements.push(
        <h2 key={key++} style={{
          fontSize: '18px', fontWeight: '700', color: '#312e81',
          margin: '22px 0 10px', padding: '8px 14px',
          background: 'linear-gradient(90deg, #eef2ff, transparent)',
          borderLeft: '4px solid #4f46e5', borderRadius: '0 8px 8px 0',
        }}>
          {inlineRender(line.slice(3))}
        </h2>
      )
      i++; continue
    }

    // H3
    if (line.startsWith('### ')) {
      elements.push(
        <h3 key={key++} style={{ fontSize: '15px', fontWeight: '700', color: '#1e1b4b', margin: '16px 0 6px' }}>
          {inlineRender(line.slice(4))}
        </h3>
      )
      i++; continue
    }

    // H4
    if (line.startsWith('#### ')) {
      elements.push(
        <h4 key={key++} style={{ fontSize: '14px', fontWeight: '700', color: '#374151', margin: '12px 0 4px' }}>
          {inlineRender(line.slice(5))}
        </h4>
      )
      i++; continue
    }

    // Bullet list
    if (line.match(/^[-*]\s/)) {
      const items = []
      while (i < lines.length && lines[i].match(/^[-*]\s/)) {
        items.push(lines[i].slice(2))
        i++
      }
      elements.push(
        <ul key={key++} style={{ margin: '6px 0 6px 20px', padding: 0, listStyle: 'disc' }}>
          {items.map((item, j) => (
            <li key={j} style={{ margin: '3px 0', color: '#374151', fontSize: '14px', lineHeight: '1.6' }}>
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
        items.push(lines[i].replace(/^\d+\.\s/, ''))
        i++
      }
      elements.push(
        <ol key={key++} style={{ margin: '6px 0 6px 20px', padding: 0 }}>
          {items.map((item, j) => (
            <li key={j} style={{ margin: '3px 0', color: '#374151', fontSize: '14px', lineHeight: '1.6' }}>
              {inlineRender(item)}
            </li>
          ))}
        </ol>
      )
      continue
    }

    // Empty line
    if (line.trim() === '') {
      elements.push(<div key={key++} style={{ height: '8px' }} />)
      i++; continue
    }

    // Paragraph
    elements.push(
      <p key={key++} style={{ margin: '4px 0', color: '#374151', fontSize: '14px', lineHeight: '1.7' }}>
        {inlineRender(line)}
      </p>
    )
    i++
  }

  return elements
}

function inlineRender(text) {
  // split on **bold** and *italic*
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} style={{ color: '#1e1b4b' }}>{part.slice(2, -2)}</strong>
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={i}>{part.slice(1, -1)}</em>
    }
    return part
  })
}

export default function ItineraryView({ text, streaming }) {
  const bottomRef = useRef(null)

  useEffect(() => {
    if (streaming) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }
  }, [text, streaming])

  return (
    <div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #e0e7ff',
      }}>
        <span style={{ fontSize: '18px', fontWeight: '700', color: '#312e81' }}>
          📋 Ατζέντα Ταξιδιού
        </span>
        {streaming && (
          <span style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            fontSize: '12px', color: '#4f46e5', background: '#eef2ff',
            padding: '3px 10px', borderRadius: '20px',
          }}>
            <span style={{
              width: '6px', height: '6px', borderRadius: '50%', background: '#4f46e5',
              animation: 'pulse 1s infinite',
            }} />
            Δημιουργία...
          </span>
        )}
      </div>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }`}</style>
      <div style={{ fontFamily: 'system-ui, sans-serif' }}>
        {renderMarkdown(text)}
      </div>
      <div ref={bottomRef} />
    </div>
  )
}
