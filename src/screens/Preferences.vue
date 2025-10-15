<!-- src/screens/Preferences.vue -->
<template>
  <!-- Soft ambient background (pointer-events yok) -->
  <div class="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
    <div class="absolute -top-24 -left-28 w-72 h-72 rounded-full bg-emerald-400/22 blur-3xl animate-drift-a"></div>
    <div class="absolute -bottom-20 -right-24 w-72 h-72 rounded-full bg-indigo-400/20 blur-3xl animate-drift-b"></div>
    <div class="absolute top-1/3 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full bg-cyan-400/18 blur-3xl animate-float-y"></div>
  </div>

  <div class="min-w-[320px] w-[360px] max-w-full bg-zinc-50/60 backdrop-blur-sm text-zinc-900 dark:bg-zinc-950/60 dark:text-zinc-100 relative">
    <!-- AppBar -->
    <div
      class="sticky top-0 z-10 flex items-center gap-2 px-3 py-2 bg-gradient-to-b from-zinc-50/80 to-zinc-50/30 dark:from-zinc-950/80 dark:to-transparent backdrop-blur-md border-b border-white/20 dark:border-white/10">
      <button class="p-2 rounded-lg hover:bg-zinc-200/60 dark:hover:bg-zinc-800/60 transition" aria-label="Back"
        @click="$router.push('/home')">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <h1 class="text-base font-semibold">Preferences</h1>
    </div>

    <div class="p-4">
      <!-- Section: General -->
      <div class="text-xs font-semibold opacity-60 mb-2 tracking-wide">GENERAL</div>
      <div class="space-y-2">
        <!-- Auto-connect (premium kilidi: TÜM KARTA bağlandı) -->
        <div
          class="group relative flex items-start gap-3 p-3 rounded-xl shadow-sm ring-1 transition"
          :class="premiumClasses"
          @mouseenter="onLockedEnter($event, 'Premium only: auto-connect on startup')"
          @mousemove="onLockedMove"
          @mouseleave="onLockedLeave"
        >
          <div class="mt-0.5">
            <svg class="w-5 h-5 opacity-80 group-hover:opacity-100 transition" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7L8 5z" />
            </svg>
          </div>

          <div class="flex-1">
            <div class="text-sm font-semibold flex items-center gap-1">
              Auto-connect on startup
              <span v-if="!isPremium" class="inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold bg-zinc-900/80 text-white dark:bg-white/10 dark:text-white/90 ring-1 ring-white/10 select-none">Premium</span>
            </div>
            <div class="text-xs opacity-70">Automatically connect when app launches</div>
          </div>

          <label class="inline-flex items-center ml-2" :class="!isPremium ? 'cursor-not-allowed' : 'cursor-pointer'">
            <input type="checkbox" class="sr-only" v-model="prefs.autoConnect" @change="onAutoConnectChange" :disabled="!isPremium" />
            <span class="toggle" :class="{ 'on': isPremium && prefs.autoConnect }"></span>
          </label>
        </div>

        <!-- Kill switch (premium kilidi: TÜM KARTA bağlandı) -->
        <div
          class="group relative flex items-center justify-between p-3 rounded-xl shadow-sm ring-1 transition"
          :class="premiumClasses"
          @mouseenter="onLockedEnter($event, 'Premium only: Kill switch')"
          @mousemove="onLockedMove"
          @mouseleave="onLockedLeave"
        >
          <div class="flex items-start gap-3">
            <div class="mt-0.5">
              <svg class="w-5 h-5 opacity-80 group-hover:opacity-100 transition" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l7 4v6c0 5-3.1 9.4-7 10-3.9-.6-7-5-7-10V6l7-4z" />
              </svg>
            </div>
            <div>
              <div class="text-sm font-semibold flex items-center gap-1">
                Kill switch
                <span v-if="!isPremium" class="inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold bg-zinc-900/80 text-white dark:bg-white/10 dark:text-white/90 ring-1 ring-white/10 select-none">Premium</span>
              </div>
              <div class="text-xs opacity-70">Block traffic when VPN disconnects</div>
            </div>
          </div>
          <label class="inline-flex items-center" :class="!isPremium ? 'cursor-not-allowed' : 'cursor-pointer'">
            <input type="checkbox" class="sr-only" v-model="prefs.killSwitch" @change="onKillSwitchChange" :disabled="!isPremium">
            <span class="toggle" :class="{ 'on': isPremium && prefs.killSwitch }"></span>
          </label>
        </div>

        <!-- Ad-blocker (premium kilidi: TÜM KARTA bağlandı) -->
        <div
          class="group relative flex items-center justify-between p-3 rounded-xl shadow-sm ring-1 transition"
          :class="premiumClasses"
          @mouseenter="onLockedEnter($event, 'Premium only: Ad-blocker')"
          @mousemove="onLockedMove"
          @mouseleave="onLockedLeave"
        >
          <div class="flex items-start gap-3">
            <div class="mt-0.5">
              <svg class="w-5 h-5 opacity-80 group-hover:opacity-100 transition" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l9 4-3 11-6 5-6-5L3 6l9-4zm0 3.2L6.2 6.7l2 7.5L12 18l3.8-3.8 2-7.5L12 5.2z" />
              </svg>
            </div>
            <div>
              <div class="text-sm font-semibold flex items-center gap-1">
                Ad-blocker
                <span v-if="!isPremium" class="inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold bg-zinc-900/80 text-white dark:bg-white/10 dark:text-white/90 ring-1 ring-white/10 select-none">Premium</span>
              </div>
              <div class="text-xs opacity-70">Block common ads & trackers (extension-level)</div>
            </div>
          </div>
          <label class="inline-flex items-center" :class="!isPremium ? 'cursor-not-allowed' : 'cursor-pointer'">
            <input type="checkbox" class="sr-only" v-model="prefs.adBlock" @change="onAdBlockChange" :disabled="!isPremium">
            <span class="toggle" :class="{ 'on': isPremium && prefs.adBlock }"></span>
          </label>
        </div>
      </div>

      <!-- Section: Account -->
      <div class="text-xs font-semibold opacity-60 mt-5 mb-2 tracking-wide">ACCOUNT</div>

      <!-- Add new device -->
      <a
        href="https://coolvpn.app/dashboard/"
        target="_blank" rel="noopener noreferrer"
        class="block select-none no-underline text-inherit
              group w-full text-left p-3 rounded-xl
              bg-white/80 dark:bg-zinc-900/80 shadow-sm shadow-black/10 dark:shadow-black/40
              ring-1 ring-black/5 dark:ring-white/5
              hover:ring-emerald-500/30 hover:bg-white/90 dark:hover:bg-zinc-900
              transition focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="rounded-lg bg-emerald-500/10 p-2">
              <svg class="w-4.5 h-4.5 text-emerald-600 dark:text-emerald-400" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 11h-6V5h-2v6H5v2h6v6h2v-6h6z" />
              </svg>
            </div>
            <div>
              <div class="text-sm font-semibold">Add Premium subscription</div>
              <div class="text-[11px] opacity-60">Add Your Device to premium subscription from here!</div>
            </div>
          </div>
          <svg class="w-5 h-5 opacity-70 group-hover:opacity-100 transition" viewBox="0 0 24 24" fill="currentColor">
            <path d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </a>

      <!-- Manage devices -->
      <button
        class="group w-full text-left mt-2 p-3 rounded-xl bg-white/80 dark:bg-zinc-900/80 shadow-sm shadow-black/10 dark:shadow-black/40 ring-1 ring-black/5 dark:ring-white/5 hover:ring-emerald-500/30 hover:bg-white/90 dark:hover:bg-zinc-900 transition"
        @click="this.$router.push('/devices')">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="rounded-lg bg-zinc-500/10 p-2">
              <svg class="w-4.5 h-4.5 opacity-80" viewBox="0 0 24 24" fill="currentColor">
                <path d="M7 4h10a2 2 0 012 2v12l-4-3H7a2 2 0 01-2-2V6a2 2 0 012-2z" />
              </svg>
            </div>
            <div class="text-sm font-semibold">Manage devices</div>
          </div>
          <svg class="w-5 h-5 opacity-70 group-hover:opacity-100 transition" fill="none" stroke="currentColor"
            stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </button>

      <!-- Divider -->
      <div class="my-4 h-px bg-gradient-to-r from-transparent via-zinc-400/30 to-transparent dark:via-white/10"></div>

      <!-- Privacy -->
    <a 
      href="https://coolvpn.app/privacy-policy/"
      target="_blank" rel="noopener noreferrer"
      class="block select-none no-underline text-inherit
            group w-full text-left p-3 rounded-xl
            bg-white/75 dark:bg-zinc-900/75 shadow-sm
            ring-1 ring-black/5 dark:ring-white/5
            hover:ring-emerald-500/30 hover:bg-white/90 dark:hover:bg-zinc-900
            transition focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
    >
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="rounded-lg bg-zinc-500/10 p-2">
            <svg class="w-4.5 h-4.5 opacity-80" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l7 4v6c0 5-3.1 9.4-7 10-3.9-.6-7-5-7-10V6l7-4z" />
            </svg>
          </div>
          <div class="text-sm font-semibold">Privacy Policy</div>
        </div>
        <svg class="w-5 h-5 opacity-70 group-hover:opacity-100 transition" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </a>
    </div>

    <!-- Hover tooltip (mouse takip) -->
    <transition name="fade-fast">
      <div v-if="hoverTip.show"
           class="pointer-events-none fixed z-50 px-2 py-1 rounded-md text-[11px] font-medium shadow-lg ring-1 backdrop-blur
                  bg-zinc-900/85 text-white ring-white/10 dark:bg-white/10 dark:text-white/90"
           :style="{ left: hoverTip.x + 'px', top: hoverTip.y + 'px', transform: 'translate(12px, 8px)' }">
        {{ hoverTip.text }}
      </div>
    </transition>
  </div>
</template>

<script>
/* ===== CONFIG ===== */
const API_BASE = 'https://coolvpn.app' // dev: http://127.0.0.1:8000

const STORAGE_KEY = 'cvpn_prefs'
const DEFAULT_PREFS = { autoConnect: false, killSwitch: true, adBlock: false }
const UUID_KEY = 'cvpn_uuid_v1'

/* --- storage helpers --- */
async function loadPrefs() {
  try {
    if (chrome?.storage?.sync) {
      const raw = await chrome.storage.sync.get(STORAGE_KEY)
      if (raw && raw[STORAGE_KEY]) return { ...DEFAULT_PREFS, ...raw[STORAGE_KEY] }
    }
  } catch {}
  try {
    if (chrome?.storage?.local) {
      const raw = await chrome.storage.local.get(STORAGE_KEY)
      if (raw && raw[STORAGE_KEY]) return { ...DEFAULT_PREFS, ...raw[STORAGE_KEY] }
    }
  } catch {}
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return { ...DEFAULT_PREFS, ...JSON.parse(raw) }
  } catch {}
  return { ...DEFAULT_PREFS }
}
async function savePrefs(prefs) {
  try { if (chrome?.storage?.sync) { await chrome.storage.sync.set({ [STORAGE_KEY]: prefs }); return } } catch {}
  try { if (chrome?.storage?.local) { await chrome.storage.local.set({ [STORAGE_KEY]: prefs }); return } } catch {}
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs)) } catch {}
}

/* --- BG bridges --- */
async function setKillSwitch(enabled) { try { await chrome.runtime.sendMessage({ type: 'SET_KILL_SWITCH', payload: { enabled: !!enabled } }) } catch {} }
async function setAdBlock(enabled)    { try { await chrome.runtime.sendMessage({ type: 'SET_ADBLOCK',    payload: { enabled: !!enabled } }) } catch {} }

/* --- UUID quick getter (Home ile aynı mantık) --- */
async function getUuidQuick () {
  if (window.__CVPN_UUID) return window.__CVPN_UUID
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
  return ''
}

/* --- One-shot handshake (uuid ile, saklama yok) --- */
async function handshakeOnceNoStore(clientUuid = '') {
  try {
    const res = await fetch(`${API_BASE}/api/extension/handshake/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'omit',                 // oturum şart değil
      body: JSON.stringify({ client_uuid: clientUuid || '' })
    })
    if (!res.ok) return { premium: false }
    const json = await res.json().catch(() => ({}))
    return { premium: !!json?.premium }
  } catch { return { premium: false } }
}

export default {
  name: 'PreferencesScreen',
  data: () => ({
    prefs: { ...DEFAULT_PREFS },
    isPremium: false,
    hoverTip: { show: false, x: 0, y: 0, text: '' },
  }),
  computed: {
    premiumClasses() {
      return this.isPremium
        ? 'bg-white/80 dark:bg-zinc-900/80 shadow-black/10 dark:shadow-black/40 ring-black/5 dark:ring-white/5 hover:ring-emerald-500/30'
        : 'bg-zinc-200/55 dark:bg-zinc-800/50 text-zinc-500 dark:text-zinc-400 ring-black/5 dark:ring-white/5 cursor-not-allowed'
    }
  },
  async mounted() {
    // 1) UUID oku
    const uuid = await getUuidQuick()

    // 2) Premium durumunu UUID ile çöz (anonim bile olsa)
    const hs = await handshakeOnceNoStore(uuid)
    this.isPremium = !!hs.premium

    // 3) Prefs’i yükle ve uygula (handshake'ten SONRA; olası blokları önlemek için)
    this.prefs = await loadPrefs()
    try { await setKillSwitch(!!this.prefs.killSwitch) } catch {}
    try { await setAdBlock(!!this.prefs.adBlock) } catch {}

    // 4) storage sync dinle
    try {
      chrome.storage.onChanged.addListener((changes, area) => {
        if ((area === 'sync' || area === 'local') && changes[STORAGE_KEY]?.newValue) {
          this.prefs = { ...DEFAULT_PREFS, ...changes[STORAGE_KEY].newValue }
        }
      })
    } catch {}
  },
  methods: {
    async onAutoConnectChange() { await savePrefs(this.prefs) },
    async onKillSwitchChange()  { await savePrefs(this.prefs); if (this.isPremium) await setKillSwitch(!!this.prefs.killSwitch) },
    async onAdBlockChange()     { await savePrefs(this.prefs); if (this.isPremium) await setAdBlock(!!this.prefs.adBlock) },

    addDevice()     { this.$router.push('/pair') },
    manageDevices() { this.$router.push('/devices') },

    // tooltip handlers
    onLockedEnter(e, text) {
      if (this.isPremium) return
      this.hoverTip.text = text || 'This feature requires Premium'
      this.hoverTip.show = true
      this.onLockedMove(e)
    },
    onLockedMove(e) {
      if (!this.hoverTip.show) return
      this.hoverTip.x = e.clientX
      this.hoverTip.y = e.clientY
    },
    onLockedLeave() {
      this.hoverTip.show = false
    }
  }
}
</script>


<style>
/* ---- Seamless ambient animations (no hard resets) ---- */
@keyframes float-y { from { transform: translateY(-8px) } to { transform: translateY(8px) } }
@keyframes drift-a { from { transform: translate(0,0) } to { transform: translate(10px,-14px) } }
@keyframes drift-b { from { transform: translate(0,0) } to { transform: translate(-12px,10px) } }
.animate-float-y  { animation: float-y 10s ease-in-out infinite alternate; }
.animate-drift-a  { animation: drift-a 14s ease-in-out infinite alternate; }
.animate-drift-b  { animation: drift-b 18s ease-in-out infinite alternate; }

/* ---- Pretty toggle (keeps input accessible) ---- */
.toggle{
  width: 42px; height: 24px; border-radius: 9999px; background: rgba(113,113,122,.35);
  position: relative; display: inline-block;
  transition: background .22s ease, box-shadow .22s ease, transform .22s ease;
  box-shadow: inset 0 0 0 1px rgba(0,0,0,.08);
}
.toggle::after{
  content:""; position:absolute; top:3px; left:3px; width:18px; height:18px; border-radius:9999px; background: white;
  box-shadow: 0 1px 2px rgba(0,0,0,.12); transition: transform .22s ease;
}
.toggle.on{
  background: linear-gradient(180deg, rgba(16,185,129,.9), rgba(16,185,129,.8));
  box-shadow: inset 0 0 0 1px rgba(16,185,129,.35), 0 0 12px rgba(16,185,129,.20);
}
.toggle.on::after{ transform: translateX(18px); }

/* Tooltip fade */
.fade-fast-enter-active, .fade-fast-leave-active { transition: opacity .14s ease; }
.fade-fast-enter-from, .fade-fast-leave-to { opacity: 0; }

/* Reduce motion friendly */
@media (prefers-reduced-motion: reduce) {
  .animate-float-y, .animate-drift-a, .animate-drift-b { animation: none !important; }
}
</style>
