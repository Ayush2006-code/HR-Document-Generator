// Lets HR replace a template .docx from the UI without redeploying the app.
// Overrides are stored in IndexedDB and take effect immediately for all
// future generations (see templateProcessor.js, which checks here first).
//
// SUPABASE READINESS NOTE — same shape as employeeStorage.js /
// documentHistoryStorage.js: callers only use the exported functions, so a
// future move to a per-user Supabase Storage bucket (path like
// `templates/{user_id}/{key}`) would only touch this file. Not migrated
// here — still local-only IndexedDB, per the current scope.
const DB_NAME = 'hrdoc-templates'
const STORE_NAME = 'overrides'
const DB_VERSION = 1

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE_NAME)) db.createObjectStore(STORE_NAME)
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

export async function setTemplateOverride(key, arrayBuffer) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).put(arrayBuffer, key)
    tx.oncomplete = () => resolve(true)
    tx.onerror = () => reject(tx.error)
  })
}

export async function getTemplateOverride(key) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly')
    const req = tx.objectStore(STORE_NAME).get(key)
    req.onsuccess = () => resolve(req.result || null)
    req.onerror = () => reject(req.error)
  })
}

export async function clearTemplateOverride(key) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).delete(key)
    tx.oncomplete = () => resolve(true)
    tx.onerror = () => reject(tx.error)
  })
}

export async function hasTemplateOverride(key) {
  return (await getTemplateOverride(key)) !== null
}
