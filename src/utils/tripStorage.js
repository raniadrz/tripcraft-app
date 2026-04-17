// ── Local file server (active) ────────────────────────────
// Runs via: docker compose up  (or: node server/index.js)
const FILE_SERVER = 'http://localhost:3001'

/**
 * Upload a PDF to the local file server.
 * Returns Promise<{ downloadURL, storagePath }>
 * storagePath = fileId (uuid) used later for deletion.
 */
export async function uploadTripFile(_uid, _customerId, _tripId, file, onProgress) {
  const form = new FormData()
  form.append('file', file)

  // FormData uploads don't expose progress natively via fetch —
  // use XMLHttpRequest for the progress callback.
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', `${FILE_SERVER}/files/upload`)

    xhr.upload.addEventListener('progress', e => {
      if (e.lengthComputable) onProgress?.(Math.round((e.loaded / e.total) * 100))
    })

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve(JSON.parse(xhr.responseText))
        } catch {
          reject(new Error('Μη έγκυρη απάντηση από server.'))
        }
      } else {
        try {
          reject(new Error(JSON.parse(xhr.responseText).error || `HTTP ${xhr.status}`))
        } catch {
          reject(new Error(`HTTP ${xhr.status}`))
        }
      }
    })

    xhr.addEventListener('error', () => reject(new Error('Σφάλμα δικτύου. Τρέχει ο file server;')))
    xhr.send(form)
  })
}

/** Delete a file from the local server by its storagePath (= fileId). */
export async function deleteTripFileFromStorage(storagePath) {
  await fetch(`${FILE_SERVER}/files/${storagePath}`, { method: 'DELETE' })
}


// ── Firebase Storage (για αργότερα — απαιτεί Blaze plan) ──
//
// import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage'
// import { storage } from '../firebase'
//
// function fileRef(uid, customerId, tripId, filename) {
//   return ref(storage, `users/${uid}/customers/${customerId}/trips/${tripId}/${filename}`)
// }
//
// export function uploadTripFile(uid, customerId, tripId, file, onProgress) {
//   const storageRef = fileRef(uid, customerId, tripId, `${Date.now()}_${file.name}`)
//   const task = uploadBytesResumable(storageRef, file, { contentType: 'application/pdf' })
//   return new Promise((resolve, reject) => {
//     task.on(
//       'state_changed',
//       snap => onProgress?.(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
//       reject,
//       async () => {
//         const downloadURL = await getDownloadURL(task.snapshot.ref)
//         resolve({ downloadURL, storagePath: task.snapshot.ref.fullPath })
//       },
//     )
//   })
// }
//
// export async function deleteTripFileFromStorage(storagePath) {
//   await deleteObject(ref(storage, storagePath))
// }
