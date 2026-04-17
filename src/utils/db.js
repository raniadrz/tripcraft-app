import {
  collection, doc, addDoc, updateDoc, deleteDoc, setDoc,
  getDocs, getDoc, query, orderBy, serverTimestamp,
} from 'firebase/firestore'
import { db } from '../firebase'

// ── helpers ──────────────────────────────────────────────
function customersRef(uid) {
  return collection(db, 'users', uid, 'customers')
}
function tripsRef(uid, customerId) {
  return collection(db, 'users', uid, 'customers', customerId, 'trips')
}

// ── CUSTOMERS ─────────────────────────────────────────────
export async function getCustomers(uid) {
  const q = query(customersRef(uid), orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export async function getCustomer(uid, customerId) {
  const snap = await getDoc(doc(db, 'users', uid, 'customers', customerId))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

export async function addCustomer(uid, data) {
  return addDoc(customersRef(uid), { ...data, createdAt: serverTimestamp() })
}

export async function updateCustomer(uid, customerId, data) {
  return updateDoc(doc(db, 'users', uid, 'customers', customerId), { ...data, updatedAt: serverTimestamp() })
}

export async function deleteCustomer(uid, customerId) {
  return deleteDoc(doc(db, 'users', uid, 'customers', customerId))
}

// ── TRIPS ─────────────────────────────────────────────────
export async function getTrips(uid, customerId) {
  const q = query(tripsRef(uid, customerId), orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export async function addTrip(uid, customerId, tripData) {
  return addDoc(tripsRef(uid, customerId), { ...tripData, createdAt: serverTimestamp() })
}

export async function deleteTrip(uid, customerId, tripId) {
  return deleteDoc(doc(db, 'users', uid, 'customers', customerId, 'trips', tripId))
}

// ── FIELD TEMPLATES (global per user) ────────────────────
const templateDoc = (uid) => doc(db, 'users', uid, 'settings', 'fieldTemplates')

export async function getFieldTemplates(uid) {
  const snap = await getDoc(templateDoc(uid))
  return snap.exists() ? (snap.data().fields || []) : []
}

export async function saveFieldTemplates(uid, fields) {
  return setDoc(templateDoc(uid), { fields }, { merge: true })
}

// ── TRIP FILES (metadata only — binary in Storage) ────────
function tripFilesRef(uid, customerId, tripId) {
  return collection(db, 'users', uid, 'customers', customerId, 'trips', tripId, 'files')
}

export async function getTripFiles(uid, customerId, tripId) {
  const q = query(tripFilesRef(uid, customerId, tripId), orderBy('uploadedAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export async function addTripFile(uid, customerId, tripId, meta) {
  return addDoc(tripFilesRef(uid, customerId, tripId), { ...meta, uploadedAt: serverTimestamp() })
}

export async function deleteTripFile(uid, customerId, tripId, fileId) {
  return deleteDoc(doc(db, 'users', uid, 'customers', customerId, 'trips', tripId, 'files', fileId))
}

// ── SUMMARY EXTRACTION ───────────────────────────────────
export function extractSummary(fullText) {
  // grab budget table if present
  const budgetMatch = fullText.match(/## 💰[\s\S]*?(?=\n## |\n---|\n*$)/i)
  const budget = budgetMatch ? budgetMatch[0].slice(0, 400) : ''

  // grab first 350 chars of body (skip title lines)
  const lines = fullText.split('\n').filter(l => !l.startsWith('#') && l.trim())
  const intro = lines.slice(0, 4).join(' ').slice(0, 350)

  return (intro + (budget ? '\n\n' + budget : '')).trim().slice(0, 800)
}
