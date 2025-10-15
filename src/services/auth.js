// src/services/auth.js
// Named-exports only (no export default)
// Storage-first approach: chrome.storage.sync -> chrome.storage.local -> localStorage/sessionStorage
// Basic auth helpers for extension + web UI.

const TOKEN_KEY = 'cvpn_token'
const USER_KEY = 'cvpn_user'
const DEFAULT_VERIFY_ENDPOINT = '/api/auth/me'
const DEFAULT_LOGIN_ENDPOINT = '/api/auth/login'
const DEFAULT_LOGOUT_ENDPOINT = '/api/auth/logout'

/* --- internal helpers for chrome storage (promise wrappers) --- */
function _hasChromeStorageSync() {
  return (typeof chrome !== 'undefined') && chrome.storage && chrome.storage.sync && typeof chrome.storage.sync.get === 'function'
}
function _hasChromeStorageLocal() {
  return (typeof chrome !== 'undefined') && chrome.storage && chrome.storage.local && typeof chrome.storage.local.get === 'function'
}

function _chromeSyncGet(key) {
  return new Promise((resolve) => {
    if (!_hasChromeStorageSync()) return resolve(null)
    try {
      chrome.storage.sync.get([key], (res) => {
        resolve(res ? res[key] : null)
      })
    } catch (e) { resolve(null) }
  })
}
function _chromeSyncSet(obj) {
  return new Promise((resolve) => {
    if (!_hasChromeStorageSync()) return resolve(false)
    try {
      chrome.storage.sync.set(obj, () => resolve(true))
    } catch (e) { resolve(false) }
  })
}
function _chromeSyncRemove(key) {
  return new Promise((resolve) => {
    if (!_hasChromeStorageSync()) return resolve(false)
    try {
      chrome.storage.sync.remove([key], () => resolve(true))
    } catch (e) { resolve(false) }
  })
}

function _chromeLocalGet(key) {
  return new Promise((resolve) => {
    if (!_hasChromeStorageLocal()) return resolve(null)
    try {
      chrome.storage.local.get([key], (res) => {
        resolve(res ? res[key] : null)
      })
    } catch (e) { resolve(null) }
  })
}
function _chromeLocalSet(obj) {
  return new Promise((resolve) => {
    if (!_hasChromeStorageLocal()) return resolve(false)
    try {
      chrome.storage.local.set(obj, () => resolve(true))
    } catch (e) { resolve(false) }
  })
}
function _chromeLocalRemove(key) {
  return new Promise((resolve) => {
    if (!_hasChromeStorageLocal()) return resolve(false)
    try {
      chrome.storage.local.remove([key], () => resolve(true))
    } catch (e) { resolve(false) }
  })
}

/* --- event emitter for auth changes --- */
const _listeners = new Set()
function _emitChange() {
  for (const cb of Array.from(_listeners)) {
    try { cb() } catch (e) { /* swallow */ }
  }
}

/* --- storage public API --- */
export async function getToken() {
  // try chrome.sync
  try {
    const t1 = await _chromeSyncGet(TOKEN_KEY)
    if (t1) return t1
  } catch {}
  try {
    const t2 = await _chromeLocalGet(TOKEN_KEY)
    if (t2) return t2
  } catch {}
  try {
    const t3 = localStorage.getItem(TOKEN_KEY)
    if (t3) return t3
  } catch {}
  try {
    const t4 = sessionStorage.getItem(TOKEN_KEY)
    if (t4) return t4
  } catch {}
  return null
}

export async function setToken(token, { remember = true } = {}) {
  // try sync, then local, then fallback
  try {
    const ok = await _chromeSyncSet({ [TOKEN_KEY]: token })
    if (ok) { _emitChange(); return true }
  } catch {}
  try {
    const ok = await _chromeLocalSet({ [TOKEN_KEY]: token })
    if (ok) { _emitChange(); return true }
  } catch {}
  try {
    if (remember) localStorage.setItem(TOKEN_KEY, token)
    else sessionStorage.setItem(TOKEN_KEY, token)
    _emitChange()
    return true
  } catch {}
  return false
}

export async function clearToken() {
  try { await _chromeSyncRemove(TOKEN_KEY) } catch {}
  try { await _chromeLocalRemove(TOKEN_KEY) } catch {}
  try { localStorage.removeItem(TOKEN_KEY) } catch {}
  try { sessionStorage.removeItem(TOKEN_KEY) } catch {}
  _emitChange()
  return true
}

/* --- auth helpers --- */
export async function isAuthenticated({ verifyWithServer = false, verifyEndpoint = DEFAULT_VERIFY_ENDPOINT } = {}) {
  const token = await getToken()
  if (!token) return false
  if (!verifyWithServer) return true
  // verify against backend
  try {
    const res = await fetch(verifyEndpoint, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
      credentials: 'include',
    })
    if (!res.ok) return false
    const body = await res.json().catch(()=>null)
    if (body && body.user) {
      try { localStorage.setItem(USER_KEY, JSON.stringify(body.user)) } catch {}
    }
    return true
  } catch {
    // network error: be conservative -> false
    return false
  }
}

export async function getUserFromCache() {
  try {
    const raw = localStorage.getItem(USER_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch { return null }
}

/* --- login/logout flows (backend) --- */
export async function loginWithEmail(email, password, { loginEndpoint = DEFAULT_LOGIN_ENDPOINT, remember = true } = {}) {
  const res = await fetch(loginEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
    credentials: 'include',
  }).catch((err) => { throw new Error('network') })
  const body = await res.json().catch(()=>null)
  if (!res.ok) {
    const msg = (body && body.message) ? body.message : `Login failed (${res.status})`
    throw new Error(msg)
  }
  const token = body && body.token
  if (!token) throw new Error('no-token')
  await setToken(token, { remember })
  if (body.user) {
    try { localStorage.setItem(USER_KEY, JSON.stringify(body.user)) } catch {}
  }
  return body
}

export async function logout({ logoutEndpoint = DEFAULT_LOGOUT_ENDPOINT } = {}) {
  // best-effort call to backend to invalidate token
  try {
    const token = await getToken()
    if (token) {
      await fetch(logoutEndpoint, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        credentials: 'include',
      }).catch(()=>{})
    }
  } catch {}
  await clearToken()
  try { localStorage.removeItem(USER_KEY) } catch {}
  _emitChange()
  return true
}

/* --- subscriptions for UI to react to auth changes --- */
export function onAuthChange(cb) {
  if (typeof cb !== 'function') return () => {}
  _listeners.add(cb)
  // return unsubscribe
  return () => { _listeners.delete(cb) }
}

/* --- simple convenience wrappers --- */
export async function ensureAuthFast() {
  // fast local check (no network)
  return await isAuthenticated({ verifyWithServer: false })
}

export async function ensureAuthVerified() {
  // verified against backend
  return await isAuthenticated({ verifyWithServer: true })
}

/* named exports only (no default) */
