<!-- src/screens/Home.vue -->
<template>
  <!-- AURORA BACKDROP -->
  <div class="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
    <!-- soft blobs -->
    <div class="aurora-blob blur-3xl bg-emerald-400/30 animate-float-slow"
         style="width:22rem;height:22rem;top:-5rem;left:-5rem;"></div>
    <div class="aurora-blob blur-3xl bg-indigo-400/25 animate-float-slower"
         style="width:22rem;height:22rem;right:-6rem;bottom:-5rem;"></div>
    <div class="aurora-blob blur-3xl bg-cyan-400/20 animate-float"
         style="width:26rem;height:26rem;left:50%;top:32%;transform:translate(-50%,-50%);"></div>

    <!-- subtle grain -->
    <div class="absolute inset-0 opacity-[.08] mix-blend-overlay pointer-events-none"
         style="background-image:radial-gradient(#000 1px,transparent 1px);background-size:2.5px 2.5px;"></div>
  </div>

  <!-- MAIN SURFACE -->
  <div class="min-w-[320px] p-4 bg-white/55 dark:bg-zinc-900/45 backdrop-blur-xl
              text-zinc-900 dark:text-zinc-100 rounded-2xl ring-1 ring-black/5 dark:ring-white/10 shadow-xl">

    <!-- HEADER -->
    <div class="flex items-center justify-between">
      <button
        class="p-2 rounded-xl bg-white/60 dark:bg-white/5 backdrop-blur hover:bg-white/90 dark:hover:bg-white/10
               ring-1 ring-black/5 dark:ring-white/10 transition"
        @click="$router.push('/preferences')" aria-label="Preferences">
        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z" />
        </svg>
      </button>

      <a target="_blank" href="https://coolvpn.app/pricing"
        class="relative cursor-pointer overflow-hidden flex items-center gap-1
               bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-500
               hover:from-emerald-500 hover:to-teal-400
               text-white text-sm font-semibold px-3 py-2 rounded-xl shadow-lg ring-1 ring-white/20 transition">
        <span class="absolute inset-0 -translate-x-full bg-[linear-gradient(110deg,transparent,rgba(255,255,255,.45),transparent)] animate-glint"></span>
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
        </svg>
        Go Premium
      </a>
    </div>

    <!-- SPEED CARDS -->
    <div class="mt-4 grid grid-cols-2 gap-3">
      <!-- boş bırakıldı -->
    </div>

    <!-- BIG CONTROL -->
    <div class="mt-6 flex flex-col items-center">
      <div class="relative w-40 h-40 group" @click="toggleConnection" role="button" aria-label="Toggle connection">
        <!-- halo / glow -->
        <span
          class="absolute inset-0 rounded-full bg-emerald-400/20 blur-2xl opacity-0 transition-opacity duration-500"
          :class="(isBusy || connected) ? 'opacity-100' : ''"></span>
        <span v-if="connected"
          class="absolute -inset-4 rounded-full bg-emerald-400/15 blur-3xl animate-glow-pulse"></span>

        <!-- button body -->
        <div class="relative w-36 h-36 rounded-full flex flex-col items-center justify-center transition shadow-2xl
                    ring-1 ring-black/5 dark:ring-white/10
                    group-active:scale-[0.98]"
             :class="[
               (isBusy || connected) ? 'bg-emerald-600 text-white' : 'bg-white/80 dark:bg-zinc-900/70',
               (isBusy || connected) ? 'shadow-emerald-500/30' : 'shadow-black/20',
               isBusy ? 'outline outline-2 outline-emerald-400/50' : (connected ? 'outline outline-2 outline-emerald-500/60' : '')
             ]">

          <!-- sheen -->
          <div class="absolute inset-0 overflow-hidden rounded-full pointer-events-none">
            <div class="absolute -inset-[2px] rounded-full opacity-30 bg-[radial-gradient(120%_120%_at_50%_-10%,rgba(255,255,255,.9),transparent_60%)]"></div>
            <div class="absolute inset-0 -translate-x-full bg-[linear-gradient(120deg,transparent,rgba(255,255,255,.65),transparent)] animate-glint-slow"></div>
          </div>

          <transition name="fade-fast" mode="out-in">
            <div v-if="isBusy" key="spinner"
              class="w-8 h-8 border-3 rounded-full border-white/40 border-t-white animate-spin"></div>

            <div v-else key="power" class="flex flex-col items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-9 h-9"
                   :class="connected ? 'text-white' : 'text-emerald-600'" viewBox="0 0 24 24" fill="currentColor">
                <path d="M13 3h-2v10h2V3zm-1 18c-4.41 0-8-3.59-8-8 0-3.73 2.55-6.86 6-7.74V3.08C5.61 4 3 7.22 3 11c0 4.97 4.03 9 9 9s9-4.03 9-9c0-3.78-2.61-7-6-7.92v2.18c3.45.88 6 4.01 6 7.74 0 4.41-3.59 8-8 8z" />
              </svg>
              <div class="mt-1 text-sm font-semibold tracking-wide"
                   :class="connected ? 'text-white' : 'text-emerald-700'">
                {{ connected ? 'Stop' : 'Start' }}
              </div>
            </div>
          </transition>
        </div>

        <!-- pulse ring (only when connected) -->
        <span v-if="connected" class="absolute inset-0 rounded-full animate-pulse-ring border border-emerald-400/40"></span>
      </div>

      <div class="mt-3 text-base font-semibold"
        :class="isBusy ? 'text-emerald-500' : (connected ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-600 dark:text-zinc-300')">
        <transition name="fade-fast" mode="out-in">
          <span :key="`${establishing}-${connecting}-${connected}`">
            {{ isBusy ? (establishing ? 'Establishing connection…' : 'Connecting…') : (connected ? 'Connected' : 'Not connected') }}
          </span>
        </transition>
      </div>
      <div class="text-sm text-zinc-500 dark:text-zinc-400">{{ formatDuration(connectedDuration) }}</div>
    </div>

    <!-- SERVER PICKER (footer card) -->
    <div class="mt-5">
      <button
        class="group relative w-full flex items-center gap-3 rounded-xl
               bg-white/70 dark:bg-white/5 backdrop-blur-xl ring-1 ring-black/5 dark:ring-white/10
               px-3 py-3 shadow-lg hover:shadow-xl transition disabled:opacity-60 disabled:pointer-events-none"
        @click="$router.push('/servers')"
        :disabled="serverFinding" :aria-busy="serverFinding ? 'true' : 'false'"
        :aria-disabled="serverFinding ? 'true' : 'false'">

        <!-- top sheen -->
        <span class="pointer-events-none absolute inset-0 rounded-xl overflow-hidden">
          <span class="absolute -inset-1 opacity-20 bg-[radial-gradient(120%_80%_at_50%_0%,#fff,transparent_60%)]"></span>
        </span>

        <!-- Flag / Spinner -->
        <div class="w-7 h-5 rounded bg-zinc-100/80 dark:bg-white/10 flex items-center justify-center text-base ring-1 ring-black/5 dark:ring-white/10">
          <template v-if="serverFinding">
            <span class="w-4 h-4 border-3 rounded-full border-zinc-400/40 border-t-emerald-600 animate-spin"></span>
          </template>
          <template v-else>
            {{ flagForCountry(selectedTitle) }}
          </template>
        </div>

        <!-- Title -->
        <div class="flex-1 text-left font-semibold truncate">
          <template v-if="serverFinding">Finding optimal server…</template>
          <template v-else>{{ selectedTitle }}</template>
        </div>

        <!-- Chevron -->
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 opacity-70 group-hover:opacity-90 transition" viewBox="0 0 24 24" fill="currentColor">
          <path d="M7 10l5 5 5-5z" />
        </svg>
      </button>
    </div>

    <!-- TOAST -->
    <div v-if="toast"
         class="fixed left-1/2 -translate-x-1/2 bottom-3 bg-zinc-900/90 text-white text-sm rounded-lg px-3 py-2 shadow-lg ring-1 ring-white/10">
      {{ toast }}
    </div>
  </div>
</template>


<script>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { ConfigHolder } from '../services/configHolder.js'
import { parseOvpn } from '../utils/ovpnParser.js'

/* ===== CONFIG ===== */
const API_BASE = 'http://coolvpn.app' // dev’de: 'http://127.0.0.1:8000'

/* ===== KEYS ===== */
const SS_KEY = 'cvpn_session_state_v1'             // window.sessionStorage (UI)
const SNAP_KEY = 'cvpn_session_state_snapshot_v1'  // chrome.storage.session (snapshot)
const LAST_PROFILE_ID = 'lastSelectedProfileId'
const OPT_EP_KEY = 'cvpn_optimal_ep_v1'            // optimal endpoint cache
const SESSION_ONCE_KEY = 'autoConnectTried_v1'
const PREFS_KEY = 'cvpn_prefs'
const UUID_KEY = 'cvpn_uuid_v1'  // App.vue bunu üretiyor & aynalıyor
const DEFAULT_PREFS = { autoConnect: false, killSwitch: false, adBlock: false, protocol: 'OpenVPN' }
const UNSAFE_REMOTE_AS_PROXY = false

/* ===== HELPERS ===== */
const dlog = (...a) => { try { console.log('[Home]', ...a) } catch { } }

const baseState = () => ({
  establishing: false, connecting: false, connected: false,
  startedAtMs: null, connectedAccumMs: 0, lastUpdatedMs: Date.now()
})

// UI state: window.sessionStorage
function ssGet(fb = null) {
  try { const raw = sessionStorage.getItem(SS_KEY); return raw ? JSON.parse(raw) : fb } catch { return fb }
}
function ssSet(val) { try { sessionStorage.setItem(SS_KEY, JSON.stringify(val)) } catch { } }

// snapshot: chrome.storage.session (popup kapanınca korunur, extension restart olunca sıfırlanır)
async function snapGet() {
  try {
    if (!chrome?.storage?.session) return null
    const r = await chrome.storage.session.get([SNAP_KEY])
    return r?.[SNAP_KEY] || null
  } catch { return null }
}
async function snapSet(val) {
  try {
    if (!chrome?.storage?.session) return
    if (val) await chrome.storage.session.set({ [SNAP_KEY]: val })
    else await chrome.storage.session.remove([SNAP_KEY])
  } catch { }
}

/* ====== OPTIMAL ENDPOINT CACHE ====== */
async function getCachedOptimal() {
  try {
    if (chrome?.storage?.session) {
      const r = await chrome.storage.session.get([OPT_EP_KEY])
      if (r && r[OPT_EP_KEY]) return r[OPT_EP_KEY]
    }
  } catch { }
  try {
    const raw = localStorage.getItem(OPT_EP_KEY)
    if (raw) return JSON.parse(raw)
  } catch { }
  return null
}
async function setCachedOptimal(ep) {
  try { if (chrome?.storage?.session) await chrome.storage.session.set({ [OPT_EP_KEY]: ep }) } catch { }
  try { localStorage.setItem(OPT_EP_KEY, JSON.stringify(ep)) } catch { }
}
async function clearCachedOptimal() {
  try { if (chrome?.storage?.session) await chrome.storage.session.remove([OPT_EP_KEY]) } catch { }
  try { localStorage.removeItem(OPT_EP_KEY) } catch { }
}

// local helpers
function lsGet(key, fb = null) { try { const r = localStorage.getItem(key); return r != null ? JSON.parse(r) : fb } catch { return fb } }
function lsSet(key, val) { try { localStorage.setItem(key, JSON.stringify(val)) } catch { } }

function parseEndpoint(s) {
  if (!s) return null
  try {
    let raw = String(s).trim()
    if (!/^https?:|^socks/i.test(raw) && raw.includes(':')) raw = 'scheme://' + raw
    const u = new URL(raw)
    const host = u.hostname || u.host
    const port = u.port ? Number(u.port) : (u.protocol.startsWith('https') ? 443 : 80)
    return { host, port }
  } catch { return null }
}
const sameEndpoint = (a, b) => !!a && !!b
  && String(a.host || '').toLowerCase() === String(b.host || '').toLowerCase()
  && Number(a.port) === Number(b.port)

function extractEndpointFromItem(p) {
  if (typeof p?.proxy === 'string') return parseEndpoint(p.proxy)
  if (p?.proxy?.host && p?.proxy?.port) return { host: String(p.proxy.host), port: Number(p.proxy.port) }
  if (p?.ip && p?.port) return { host: String(p.ip), port: Number(p.port) }
  if (p?.host && p?.port) return { host: String(p.host), port: Number(p.port) }
  if (p?.remoteHost && p?.remotePort) return { host: String(p.remoteHost), port: Number(p.remotePort) }
  return null
}
function formatDuration(totalSec) {
  const hh = String(Math.floor(totalSec / 3600)).padStart(2, '0')
  const mm = String(Math.floor((totalSec % 3600) / 60)).padStart(2, '0')
  const ss = String(totalSec % 60).padStart(2, '0')
  return `${hh}:${mm}:${ss}`
}
function getServerArrayNow() {
  const cand = [
    { key: 'profiles', list: Array.isArray(ConfigHolder.profiles) ? ConfigHolder.profiles : [] },
    { key: 'proxies', list: Array.isArray(ConfigHolder.proxies) ? ConfigHolder.proxies : [] },
    { key: 'serverList', list: Array.isArray(ConfigHolder.serverList) ? ConfigHolder.serverList : [] },
    { key: 'items', list: Array.isArray(ConfigHolder.items) ? ConfigHolder.items : [] },
  ]
  return cand.find(c => c.list.length > 0) || { key: null, list: [] }
}
async function waitUntilServerList(maxMs = 3500, step = 120) {
  const t0 = Date.now()
  while (Date.now() - t0 < maxMs) {
    const { list } = getServerArrayNow()
    if (list.length) return { list }
    await new Promise(r => setTimeout(r, step))
  }
  return getServerArrayNow()
}

/* prefs / bg */
async function loadPrefs() {
  try {
    if (chrome?.storage?.sync) {
      const r = await chrome.storage.sync.get([PREFS_KEY])
      if (r && r[PREFS_KEY]) return r[PREFS_KEY]
    }
  } catch { }
  return lsGet(PREFS_KEY, DEFAULT_PREFS)
}
async function getProxyStatus() {
  try {
    const res = await chrome.runtime.sendMessage({ type: 'GET_PROXY_STATUS' })
    if (typeof res?.enabled === 'boolean') return { enabled: res.enabled }
    if (typeof res?.ok === 'boolean' && typeof res?.enabled === 'boolean') return { enabled: res.enabled }
  } catch { }
  return null
}

/* BG: AdBlock toggle */
async function setAdBlock(enabled) {
  try { await chrome.runtime.sendMessage({ type: 'SET_ADBLOCK', payload: { enabled: !!enabled } }) } catch { }
}

/* ===== HANDSHAKE (saklama yok) ===== */
async function handshakeOnceNoStore(clientUuid = '') {
  const url = `${API_BASE}/api/extension/handshake/`
  const body = { client_uuid: clientUuid || '' }

  console.log('[Handshake][REQUEST]', url, body)

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include', // backend @login_required ise gerekli
    body: JSON.stringify(body)
  })

  console.log('[Handshake][STATUS]', res.status, res.statusText)

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    console.warn('[Handshake][ERROR]', res.status, text)
    throw new Error(`handshake failed: ${res.status}`)
  }

  const json = await res.json()
  console.log('[Handshake][RESPONSE]', json)
  return json
}

/* ---- UUID quick getter (read-only) ---- */
async function getUuidQuick() {
  // 1) App.vue mirror’ı
  if (window.__CVPN_UUID) return window.__CVPN_UUID

  // 2) session → sync → local → window.localStorage sırasıyla oku
  try {
    if (chrome?.storage?.session) {
      const s = await chrome.storage.session.get([UUID_KEY])
      if (s && s[UUID_KEY]) return s[UUID_KEY]
    }
  } catch {}
  try {
    if (chrome?.storage?.sync) {
      const s = await chrome.storage.sync.get([UUID_KEY])
      if (s && s[UUID_KEY]) return s[UUID_KEY]
    }
  } catch {}
  try {
    if (chrome?.storage?.local) {
      const s = await chrome.storage.local.get([UUID_KEY])
      if (s && s[UUID_KEY]) return s[UUID_KEY]
    }
  } catch {}
  try {
    const raw = localStorage.getItem(UUID_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return null
}

/* ===== COMPONENT ===== */
export default {
  name: 'HomeScreen',
  setup() {
    /* --- Premium STATE (yalnızca bellek) --- */
    const premiumNow = ref(false)
    const deviceUuidNow = ref(null)

    /* --- BUTTON STATE (UI) --- */
    const establishing = ref(false)
    const connecting = ref(false)
    const connected = ref(false)
    const isBusy = computed(() => establishing.value || connecting.value)

    const connectedDuration = ref(0)
    let tickTimer = null
    let detachOnChanged = null

    const clientUuid = ref('') // App.vue’nin ürettiğini alacağız

    /* ------ STATE WRITE ------ */
    function writeState(est, conning, conn) {
      const now = Date.now()
      const prev = ssGet(baseState())
      let { startedAtMs, connectedAccumMs } = prev

      if (conn) {
        if (!startedAtMs) startedAtMs = now
      } else {
        if (startedAtMs) {
          connectedAccumMs += Math.max(0, now - Number(startedAtMs))
          startedAtMs = null
        }
      }

      const next = { establishing: !!est, connecting: !!conning, connected: !!conn, startedAtMs, connectedAccumMs, lastUpdatedMs: now }
      ssSet(next)
      void snapSet(next)
      applyStateToUI(next)
    }

    /* ------ HYDRATE ------ */
    async function hydrateStateOnce() {
      let s = ssGet(null)
      if (!s) {
        const snap = await snapGet()
        if (snap) { s = snap; ssSet(snap) }
      }
      if (!s) { s = baseState(); ssSet(s) }
      applyStateToUI(s)
    }
    function applyStateToUI(s) {
      establishing.value = !!s.establishing
      connecting.value = !!s.connecting
      connected.value = !!s.connected
      const now = Date.now()
      const acc = (s.connectedAccumMs || 0) + (s.connected && s.startedAtMs ? (now - Number(s.startedAtMs)) : 0)
      connectedDuration.value = Math.floor(acc / 1000)
    }
    function startTick() {
      clearInterval(tickTimer)
      tickTimer = setInterval(() => {
        const s = ssGet(null)
        if (!s) { connectedDuration.value = 0; return }
        const now = Date.now()
        const acc = (s.connectedAccumMs || 0) + (s.connected && s.startedAtMs ? (now - Number(s.startedAtMs)) : 0)
        connectedDuration.value = Math.floor(acc / 1000)
      }, 1000)
    }
    function stopTick() { clearInterval(tickTimer); tickTimer = null }
    function attachStorageListener() {
      if (!chrome?.storage?.onChanged) return
      const handler = (changes, area) => {
        if (area !== 'session') return
        if (changes[SNAP_KEY]) {
          const v = changes[SNAP_KEY].newValue
          if (v) { ssSet(v); applyStateToUI(v) }
        }
        if (changes[OPT_EP_KEY]) {
          const v = changes[OPT_EP_KEY].newValue
          if (v && v.host && v.port) {
            selectedProfile.value = {
              id: null,
              name: v.title || `${v.host}:${v.port}`,
              scheme: v.scheme || 'http',
              host: v.host, port: Number(v.port),
              proxy: { scheme: v.scheme || 'http', host: v.host, port: Number(v.port) },
            }
            try { ConfigHolder.globalHttpProxy = { scheme: v.scheme || 'http', host: v.host, port: Number(v.port) } } catch { }
          }
        }
      }
      chrome.storage.onChanged.addListener(handler)
      detachOnChanged = () => chrome.storage.onChanged.removeListener(handler)
    }

    // marks
    const markConnecting = () => writeState(true, true, false)
    const markConnectedNow = () => writeState(false, false, true)
    const markDisconnectedNow = () => writeState(false, false, false)

    /* --- FOOTER: finding state --- */
    const serverFinding = ref(false)

    /* --- TOAST --- */
    const toast = ref('')
    const showToast = (m) => { toast.value = m; setTimeout(() => toast.value = '', 2200) }

    /* --- SELECTED SERVER --- */
    const selectedProfile = ref(null)
    const selectedTitle = computed(() => {
      const p = selectedProfile.value
      return p?.bundleName || p?.name || p?.city
        || (p?.ip_data?.city && p?.ip_data?.countryCode ? `${p.ip_data.city}, ${p.ip_data.countryCode}` : null)
        || (extractEndpointFromItem(p) ? `${extractEndpointFromItem(p).host}:${extractEndpointFromItem(p).port}` : null)
        || p?.id || 'Select server'
    })

    // hydrate selected (cache öncelikli)
    async function hydrateSelectedFromLocal() {
      const cached = await getCachedOptimal()
      if (cached && cached.host && cached.port) {
        selectedProfile.value = {
          id: null,
          name: cached.title || `${cached.host}:${cached.port}`,
          scheme: cached.scheme || 'http',
          host: cached.host, port: Number(cached.port),
          proxy: { scheme: cached.scheme || 'http', host: cached.host, port: Number(cached.port) },
        }
        try { ConfigHolder.globalHttpProxy = { scheme: cached.scheme || 'http', host: cached.host, port: Number(cached.port) } } catch { }
        return
      }

      try {
        serverFinding.value = true
        const { list } = await waitUntilServerList()
        const rawVal = lsGet(LAST_PROFILE_ID, null)
        const wanted = parseEndpoint(rawVal)

        if (!list.length) {
          if (wanted) {
            const ph = {
              id: null,
              name: `${wanted.host}:${wanted.port}`,
              scheme: 'http',
              host: wanted.host, port: wanted.port,
              proxy: { host: wanted.host, port: wanted.port, scheme: 'http' },
            }
            selectedProfile.value = ph
            try { ConfigHolder.globalHttpProxy = { scheme: 'http', host: ph.host, port: ph.port } } catch { }
            await setCachedOptimal({ host: ph.host, port: ph.port, scheme: 'http', title: ph.name })
          } else {
            selectedProfile.value = null
          }
          return
        }

        let hit = null
        if (wanted) hit = list.find(p => sameEndpoint(extractEndpointFromItem(p), wanted)) || null
        if (!hit && rawVal != null) hit = list.find(p => String(p?.id ?? '') === String(rawVal)) || null
        if (!hit) hit = list[0] || null

        selectedProfile.value = hit
        const ep = extractEndpointFromItem(hit)
        if (ep) {
          lsSet(LAST_PROFILE_ID, `${ep.host}:${ep.port}`)
          try { ConfigHolder.globalHttpProxy = { scheme: hit.scheme || 'http', host: ep.host, port: ep.port } } catch { }
          await setCachedOptimal({ host: ep.host, port: ep.port, scheme: hit.scheme || 'http', title: hit.name || hit.city || hit.bundleName })
        } else if (hit?.id != null) {
          lsSet(LAST_PROFILE_ID, String(hit.id))
          await clearCachedOptimal()
        }
      } finally { serverFinding.value = false }
    }

    /* --- FLAG --- */
    function flagForCountry(name = '') {
      const c = String(name).toLowerCase()
      if (c.includes('germany') || c.includes('de')) return '🇩🇪'
      if (c.includes('france') || c.includes('fr')) return '🇫🇷'
      if (c.includes('united kingdom') || c.includes('uk')) return '🇬🇧'
      if (c.includes('italy') || c.includes('it')) return '🇮🇹'
      if (c.includes('sweden') || c.includes('se')) return '🇸🇪'
      if (c.includes('poland') || c.includes('pl')) return '🇵🇱'
      if (c.includes('canada') || c.includes('ca')) return '🇨🇦'
      if (c.includes('united states') || c.includes('us')) return '🇺🇸'
      return '🌐'
    }

    /* --- CONNECT / DISCONNECT --- */
    function sanitizeProxy(src) {
      if (typeof src === 'string') {
        const ep = parseEndpoint(src); if (ep) return { scheme: 'http', host: ep.host, port: ep.port }
        return null
      }
      if (!src || !src.host || !src.port) return null
      const scheme = String(src.scheme || '').toLowerCase()
      const norm = ['http', 'https', 'socks5'].includes(scheme) ? scheme : 'socks5'
      return {
        scheme: norm, host: String(src.host), port: Number(src.port),
        username: src.username || src.user || undefined, password: src.password || src.pass || undefined
      }
    }
    async function startConnection() {
      let p = selectedProfile.value
      if (!p) {
        const cached = await getCachedOptimal()
        if (cached && cached.host && cached.port) {
          p = {
            scheme: cached.scheme || 'http', host: cached.host, port: Number(cached.port),
            proxy: { scheme: cached.scheme || 'http', host: cached.host, port: Number(cached.port) }
          }
        } else {
          const ep = parseEndpoint(lsGet(LAST_PROFILE_ID, null))
          if (!ep) { showToast('No server selected.'); return false }
          p = { scheme: 'http', host: ep.host, port: ep.port, proxy: { host: ep.host, port: ep.port, scheme: 'http' } }
        }
      }

      let cfg = sanitizeProxy(p.proxy) || sanitizeProxy(p)
      if (!cfg) {
        const dir = (ConfigHolder.proxyDirectory || {})[p.id]
        cfg = sanitizeProxy(dir) || sanitizeProxy(ConfigHolder.globalHttpProxy)
      }
      if (!cfg) {
        const cached = await getCachedOptimal()
        if (cached && cached.host && cached.port) cfg = { scheme: cached.scheme || 'http', host: cached.host, port: Number(cached.port) }
      }
      if (!cfg) {
        const ep = parseEndpoint(lsGet(LAST_PROFILE_ID, null))
        if (ep) cfg = { scheme: 'http', host: ep.host, port: ep.port }
      }
      if (!cfg) { showToast('This OVPN has no HTTP/SOCKS proxy.'); return false }

      try {
        markConnecting()
        const res = await chrome.runtime.sendMessage({ type: 'ENABLE_PROXY', payload: { cfg } })
        dlog('ENABLE_PROXY =>', res)
        if (!res?.ok) { markDisconnectedNow(); showToast(res?.error || 'Failed to enable proxy'); return false }
        markConnectedNow()
        return true
      } catch (e) {
        dlog('ENABLE_PROXY ERR', e)
        markDisconnectedNow()
        showToast('Failed to enable proxy')
        return false
      }
    }
    async function stopConnection() {
      try { const res = await chrome.runtime.sendMessage({ type: 'DISABLE_PROXY' }); dlog('DISABLE_PROXY =>', res) } catch (e) { dlog('DISABLE_PROXY ERR', e) }
      markDisconnectedNow()
    }
    async function toggleConnection() {
      if (connected.value || isBusy.value) { await stopConnection(); return }
      await startConnection()
    }

    /* --- REALITY CHECK / RECONCILE --- */
    async function reconcileWithReality(prefs) {
      const bg = await getProxyStatus()
      if (bg && typeof bg.enabled === 'boolean') {
        if (bg.enabled) {
          const s = ssGet(null)
          if (!s?.connected) {
            const snap = await snapGet()
            const fresh = snap || { ...baseState(), connected: true, startedAtMs: Date.now() }
            ssSet(fresh); applyStateToUI(fresh); void snapSet(fresh)
          }
        } else {
          const s = ssGet(null)
          if (s?.connected || s?.connecting || s?.establishing) markDisconnectedNow()
        }
        return
      }
      const s = ssGet(null) || {}
      const ageMs = Date.now() - (Number(s.lastUpdatedMs) || 0)
      if (!s.connected && (s.connecting || s.establishing) && ageMs > 20000) markDisconnectedNow()
      if (prefs && prefs.autoConnect === false && !s.connected && (s.connecting || s.establishing)) markDisconnectedNow()
    }

    /* --- MOUNT --- */
    onMounted(async () => {
      // App.vue UUID üretip mirrorladı; buradan sadece OKU
      try { clientUuid.value = (await getUuidQuick()) || '' } catch { clientUuid.value = '' }
      if (!clientUuid.value) console.warn('[Home] UUID not found; handshake boş gidebilir.')

      await hydrateStateOnce()
      startTick()
      attachStorageListener()

      await hydrateSelectedFromLocal()

      const prefs = await loadPrefs()

      // BG AdBlocker tercihinin uygulanması
      try { await setAdBlock(!!prefs.adBlock) } catch { }

      await reconcileWithReality(prefs)

      // ⏱️ auto-connect denemesi (mevcut davranış)
      try {
        if (!sessionStorage.getItem(SESSION_ONCE_KEY)) {
          if (prefs?.autoConnect && !connected.value && !isBusy.value) {
            await toggleConnection()
          }
          sessionStorage.setItem(SESSION_ONCE_KEY, '1')
        }
      } catch { }

      // 🔐 HANDSHAKE: açılışta 1 kez — UUID ile gönder
      try {
        const result = await handshakeOnceNoStore(clientUuid.value)
        premiumNow.value = !!result?.premium
        deviceUuidNow.value = result?.device_uuid || null
        console.log('[Handshake][SUMMARY]', {
          premium: premiumNow.value,
          device_uuid: deviceUuidNow.value,
          client_uuid: clientUuid.value
        })
      } catch (e) {
        console.warn('[Handshake] failed', e)
        premiumNow.value = false
        deviceUuidNow.value = null
      }
    })
    onBeforeUnmount(() => {
      stopTick()
      if (detachOnChanged) detachOnChanged()
    })

    function goPremium() { try { chrome.tabs.create({ url: 'https://coolvpn.example/premium' }) } catch { } }

    return {
      // sadece gösterim/log için
      premiumNow, deviceUuidNow,

      establishing, connecting, connected, isBusy, connectedDuration, formatDuration,
      serverFinding,
      toast, showToast,
      selectedProfile, selectedTitle, flagForCountry,
      clientUuid,
      toggleConnection, stopConnection, goPremium,
    }
  }
}
</script>







<style>
/* --- SHIMMER: dikişsiz, kaybolmadan sürekli akış --- */
/* Hedef: içteki 36x36 kontrol dairesi */
.min-w-\[320px\] .w-36.h-36.rounded-full {
  position: relative;
  overflow: hidden;           /* çizgi kenarlarda taşmasın */
  isolation: isolate;         /* blend güvenli */
}

/* Shimmer band (tek döngüde görünür reset yok) */
.min-w-\[320px\] .w-36.h-36.rounded-full::before {
  content: "";
  position: absolute;
  inset: -2px;                /* çizgi kenarlarda kırpılmasın diye az taşır */
  pointer-events: none;
  border-radius: inherit;
  mix-blend-mode: screen;     /* hem açık hem koyu temada doğal parıltı */

  /* Dar, yumuşak bir diyagonal bant: kenarlar tamamen transparan -> dikiş yok */
  background-image: linear-gradient(
    115deg,
    rgba(255,255,255,0) 0%,
    rgba(255,255,255,0) 38%,
    rgba(255,255,255,.55) 50%,
    rgba(255,255,255,0) 62%,
    rgba(255,255,255,0) 100%
  );

  /* Tiling için geniş doku: 1 tam “doku” = %100; biz %0 → %200 arası kaydıracağız */
  background-size: 200% 100%;
  background-repeat: repeat;

  animation: shimmerMove 4.8s linear infinite;
  will-change: background-position;
}

/* Shimmer hareketi: 0 → 200% kaydırma = bir tam doku kaydır, döngüde dikişsiz olur */
@keyframes shimmerMove {
  0%   { background-position:   0% 0; }
  100% { background-position: 200% 0; }
}

/* --- daha pürüzsüz dalga/pulse (önceki ayarların üstüne geçer) --- */
@keyframes ringPulse {
  0%   { transform: scale(1);    opacity: 0; }
  20%  {                     opacity: .28; }
  70%  {                     opacity: 0; }
  100% { transform: scale(1.18); opacity: 0; }
}
.animate-pulse-ring { animation: ringPulse 2.4s ease-out infinite; }

@keyframes floatY {
  from { transform: translateY(-8px) }
  to   { transform: translateY(8px) }
}
@keyframes driftA {
  from { transform: translate(0,0) }
  to   { transform: translate(10px,-14px) }
}
@keyframes driftB {
  from { transform: translate(0,0) }
  to   { transform: translate(-12px,10px) }
}
.animate-float        { animation: floatY 10s ease-in-out infinite alternate; }
.animate-float-slow   { animation: driftA 14s ease-in-out infinite alternate; }
.animate-float-slower { animation: driftB 18s ease-in-out infinite alternate; }

/* reduce motion */
@media (prefers-reduced-motion: reduce) {
  .min-w-\[320px\] .w-36.h-36.rounded-full::before,
  .animate-float, .animate-float-slow, .animate-float-slower,
  .animate-pulse-ring { animation: none !important; }
}

</style>
