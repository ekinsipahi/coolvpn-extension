<template>
  <div :key="$route.fullPath" class="min-w-[320px]">
    <router-view />
  </div>
</template>

<script>
const UUID_KEY      = 'cvpn_uuid_v1'
const PREFS_KEY     = 'cvpn_prefs'
const DEFAULT_PREFS = { autoConnect: false, killSwitch: false, protocol: 'OpenVPN', dns: 'Use default' }

// ---------- helpers ----------
function dlog(...a){ try{ console.log('[App]', ...a) }catch{} }

async function storageGet(area, keys) {
  try { if (area) return await area.get(keys) } catch {}
  return {}
}
async function storageSet(area, obj) {
  try { if (area) await area.set(obj) } catch {}
}
function lsGet(k, fb=null){ try{ const r=localStorage.getItem(k); return r!=null?JSON.parse(r):fb }catch{ return fb } }
function lsSet(k, v){ try{ localStorage.setItem(k, JSON.stringify(v)) }catch{} }

function uuidv4() {
  try{
    const a = new Uint8Array(16); crypto.getRandomValues(a)
    a[6] = (a[6] & 0x0f) | 0x40
    a[8] = (a[8] & 0x3f) | 0x80
    const h = [...a].map(x=>x.toString(16).padStart(2,'0')).join('')
    return `${h.slice(0,8)}-${h.slice(8,12)}-${h.slice(12,16)}-${h.slice(16,20)}-${h.slice(20)}`
  }catch{
    // zayıf fallback
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,c=>{
      const r=Math.random()*16|0, v=c==='x'?r:(r&0x3|0x8); return v.toString(16)
    })
  }
}

async function ensureUuid() {
  const sSync  = chrome?.storage?.sync
  const sLocal = chrome?.storage?.local
  const sSess  = chrome?.storage?.session

  // 1) session → hızlı erişim
  try {
    const sess = await storageGet(sSess, [UUID_KEY])
    if (sess && sess[UUID_KEY]) {
      window.__CVPN_UUID = sess[UUID_KEY]
      return sess[UUID_KEY]
    }
  } catch {}

  // 2) sync → kalıcılık (tercih edilen)
  let uuid = null
  try {
    const got = await storageGet(sSync, [UUID_KEY])
    uuid = got?.[UUID_KEY] || null
  } catch {}

  // 3) local store (extension scoped)
  if (!uuid) {
    try {
      const got = await storageGet(sLocal, [UUID_KEY])
      uuid = got?.[UUID_KEY] || null
    } catch {}
  }

  // 4) window.localStorage
  if (!uuid) {
    uuid = lsGet(UUID_KEY, null)
  }

  // 5) yoksa üret
  if (!uuid) uuid = uuidv4()

  // 6) her yere yaz (mirror)
  await storageSet(sSync,  { [UUID_KEY]: uuid })
  await storageSet(sLocal, { [UUID_KEY]: uuid })
  await storageSet(sSess,  { [UUID_KEY]: uuid })
  lsSet(UUID_KEY, uuid)

  window.__CVPN_UUID = uuid
  dlog('UUID =', uuid)
  return uuid
}

async function loadPrefsMerged() {
  const sSync  = chrome?.storage?.sync
  const sLocal = chrome?.storage?.local

  // 1) sync
  try {
    const got = await storageGet(sSync, [PREFS_KEY])
    if (got && got[PREFS_KEY]) return { ...DEFAULT_PREFS, ...got[PREFS_KEY] }
  } catch {}

  // 2) local
  try {
    const got = await storageGet(sLocal, [PREFS_KEY])
    if (got && got[PREFS_KEY]) return { ...DEFAULT_PREFS, ...got[PREFS_KEY] }
  } catch {}

  // 3) window.localStorage (compat)
  const raw = lsGet(PREFS_KEY, null)
  if (raw) return { ...DEFAULT_PREFS, ...raw }

  return { ...DEFAULT_PREFS }
}

async function mirrorPrefsToLocalStorage(prefs) {
  // Home.vue autoconnect localStorage’tan okuduğu için buraya ayna basıyoruz
  lsSet(PREFS_KEY, prefs)
}

export default {
  name: 'App',
  async mounted () {
    // --- 0) UUID garanti altına al
    await ensureUuid()

    // --- 1) Prefs’i oku ve localStorage’a ayna bas (Home.vue autoconnect için)
    const prefs = await loadPrefsMerged()
    await mirrorPrefsToLocalStorage(prefs)

    // İstersen storage değişince aynayı güncel tut:
    try {
      chrome.storage.onChanged.addListener((changes, areaName) => {
        if ((areaName === 'sync' || areaName === 'local') && changes[PREFS_KEY]?.newValue) {
          lsSet(PREFS_KEY, { ...DEFAULT_PREFS, ...changes[PREFS_KEY].newValue })
        }
      })
    } catch {}

    // --- 2) İlk açılış akışı (intro/promo)
    let introDone = false
    let promoDone = false
    try {
      const sess = !!(chrome?.storage?.session)
      const api  = sess ? chrome.storage.session : chrome.storage.local
      const res  = await api.get(['introDone_v1', 'promoDone_v1'])
      introDone  = !!res?.introDone_v1
      promoDone  = !!res?.promoDone_v1
    } catch (e) {
      introDone = !!localStorage.getItem('introDone_v1')
      promoDone = !!localStorage.getItem('promoDone_v1')
    }

    if (!introDone) {
      if (this.$route.name !== 'splash') this.$router.replace({ name: 'splash' })
    } else if (!promoDone) {
      if (this.$route.name !== 'promo') this.$router.replace({ name: 'promo' })
    } else {
      if (this.$route.name !== 'home') this.$router.replace({ name: 'home' })
    }

    // Not: Home.vue zaten mount olduğunda localStorage’taki prefs’e bakıp
    // autoConnect true ise bir kere bağlanma denemesi yapıyor (SESSION_ONCE_KEY).
  }
}
</script>
