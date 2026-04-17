const express = require('express')
const multer  = require('multer')
const cors    = require('cors')
const path    = require('path')
const fs      = require('fs')
const { randomUUID } = require('crypto')

const app        = express()
const PORT       = process.env.PORT || 3001
const PDF_DIR    = path.join(__dirname, 'uploads', 'pdfs')
const IMG_DIR    = path.join(__dirname, 'uploads', 'images')

;[PDF_DIR, IMG_DIR].forEach(d => { if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true }) })

app.use(cors())

// ── PDF storage ───────────────────────────────────────────
const pdfStorage = multer.diskStorage({
  destination: PDF_DIR,
  filename: (_req, _file, cb) => cb(null, `${randomUUID()}.pdf`),
})
const uploadPdf = multer({
  storage: pdfStorage,
  fileFilter: (_req, file, cb) => {
    if (file.mimetype !== 'application/pdf')
      return cb(Object.assign(new Error('Μόνο PDF επιτρέπονται'), { code: 'WRONG_TYPE' }))
    cb(null, true)
  },
  limits: { fileSize: 20 * 1024 * 1024 },
})

// ── Image storage ─────────────────────────────────────────
const ALLOWED_IMG = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const imageStorage = multer.diskStorage({
  destination: IMG_DIR,
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg'
    cb(null, `${randomUUID()}${ext}`)
  },
})
const uploadImg = multer({
  storage: imageStorage,
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_IMG.includes(file.mimetype))
      return cb(Object.assign(new Error('Μόνο JPG, PNG, WebP, GIF επιτρέπονται'), { code: 'WRONG_TYPE' }))
    cb(null, true)
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB για avatars
})

// ── PDF routes ────────────────────────────────────────────
app.post('/files/upload', uploadPdf.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Δεν βρέθηκε αρχείο.' })
  const fileId = path.basename(req.file.filename, '.pdf')
  res.json({
    fileId,
    downloadURL: `http://localhost:${PORT}/files/${fileId}`,
    storagePath: fileId,
  })
})

app.get('/files/:fileId', (req, res) => {
  const filePath = path.join(PDF_DIR, `${req.params.fileId}.pdf`)
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'Δεν βρέθηκε.' })
  res.download(filePath)
})

app.delete('/files/:fileId', (req, res) => {
  const filePath = path.join(PDF_DIR, `${req.params.fileId}.pdf`)
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
  res.json({ ok: true })
})

// ── Image routes ──────────────────────────────────────────
app.post('/images/upload', uploadImg.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Δεν βρέθηκε εικόνα.' })
  const photoId = req.file.filename          // uuid.ext
  res.json({
    photoId,
    photoURL: `http://localhost:${PORT}/images/${photoId}`,
  })
})

app.get('/images/:filename', (req, res) => {
  const filePath = path.join(IMG_DIR, req.params.filename)
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'Δεν βρέθηκε.' })
  res.sendFile(filePath)   // auto Content-Type από extension
})

app.delete('/images/:filename', (req, res) => {
  const filePath = path.join(IMG_DIR, req.params.filename)
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
  res.json({ ok: true })
})

// ── error handler ─────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  res.status(400).json({ error: err.message })
})

app.listen(PORT, () => {
  console.log(`TripCraft file server → http://localhost:${PORT}`)
})
