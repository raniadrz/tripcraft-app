import {
  Document, Packer, Paragraph, TextRun, HeadingLevel,
  AlignmentType, BorderStyle, Table, TableRow, TableCell,
  WidthType, ShadingType,
} from 'docx'
import { saveAs } from 'file-saver'

function parseMarkdownToDocx(text) {
  const paragraphs = []
  const lines = text.split('\n')

  for (const raw of lines) {
    const line = raw.trimEnd()

    if (line.startsWith('### ')) {
      paragraphs.push(new Paragraph({
        text: line.slice(4),
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 200, after: 100 },
      }))
    } else if (line.startsWith('## ')) {
      paragraphs.push(new Paragraph({
        text: line.slice(3),
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 150 },
        border: {
          bottom: { style: BorderStyle.SINGLE, size: 6, color: '4f46e5' },
        },
      }))
    } else if (line.startsWith('# ')) {
      paragraphs.push(new Paragraph({
        text: line.slice(2),
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
      }))
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      paragraphs.push(new Paragraph({
        text: line.slice(2),
        bullet: { level: 0 },
        spacing: { before: 40, after: 40 },
      }))
    } else if (line.match(/^\d+\. /)) {
      const content = line.replace(/^\d+\. /, '')
      paragraphs.push(new Paragraph({
        text: content,
        numbering: { reference: 'default-numbering', level: 0 },
        spacing: { before: 40, after: 40 },
      }))
    } else if (line.startsWith('**') && line.endsWith('**') && line.length > 4) {
      paragraphs.push(new Paragraph({
        children: [new TextRun({ text: line.slice(2, -2), bold: true })],
        spacing: { before: 120, after: 60 },
      }))
    } else if (line === '' || line === '---') {
      paragraphs.push(new Paragraph({ text: '', spacing: { before: 80, after: 80 } }))
    } else {
      // handle inline bold **text**
      const parts = line.split(/\*\*(.+?)\*\*/g)
      if (parts.length > 1) {
        const runs = parts.map((part, i) =>
          new TextRun(i % 2 === 1 ? { text: part, bold: true } : { text: part })
        )
        paragraphs.push(new Paragraph({ children: runs, spacing: { before: 60, after: 60 } }))
      } else {
        paragraphs.push(new Paragraph({ text: line, spacing: { before: 60, after: 60 } }))
      }
    }
  }

  return paragraphs
}

export async function exportToWord(itinerary, tripTitle) {
  const titleParagraph = new Paragraph({
    children: [
      new TextRun({
        text: '✈ ' + tripTitle,
        bold: true,
        size: 48,
        color: '4f46e5',
      }),
    ],
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 400 },
  })

  const dateParagraph = new Paragraph({
    children: [
      new TextRun({
        text: `Δημιουργήθηκε: ${new Date().toLocaleDateString('el-GR', { day: '2-digit', month: 'long', year: 'numeric' })}`,
        size: 20,
        color: '888888',
        italics: true,
      }),
    ],
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 600 },
  })

  const bodyParagraphs = parseMarkdownToDocx(itinerary)

  const doc = new Document({
    numbering: {
      config: [{
        reference: 'default-numbering',
        levels: [{
          level: 0,
          format: 'decimal',
          text: '%1.',
          alignment: AlignmentType.START,
        }],
      }],
    },
    sections: [{
      properties: {
        page: {
          margin: { top: 1440, right: 1080, bottom: 1440, left: 1080 },
        },
      },
      children: [titleParagraph, dateParagraph, ...bodyParagraphs],
    }],
  })

  const blob = await Packer.toBlob(doc)
  const safeName = tripTitle.replace(/[^a-zA-Zα-ωΑ-Ω0-9 ]/g, '').trim() || 'itinerary'
  saveAs(blob, `${safeName}.docx`)
}
