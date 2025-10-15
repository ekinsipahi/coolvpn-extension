<!-- src/screens/PairDevice.vue -->
<template>
  <div class="relative min-w-[320px] w-[360px] max-w-full overflow-hidden">
    <!-- bubbly gradient bg -->
    <div class="pointer-events-none absolute inset-0 -z-10">
      <div class="absolute -top-24 -left-28 w-72 h-72 rounded-full bg-emerald-400/25 blur-3xl animate-float-slow"></div>
      <div class="absolute -bottom-24 -right-20 w-64 h-64 rounded-full bg-indigo-400/25 blur-3xl animate-float-slower"></div>
      <div class="absolute top-1/3 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full bg-cyan-400/20 blur-3xl animate-float"></div>
    </div>

    <div class="px-4 py-3 bg-zinc-50/80 dark:bg-zinc-950/80 backdrop-blur text-zinc-900 dark:text-zinc-100 flex items-center justify-between">
      <button class="p-2 rounded-lg hover:bg-zinc-200/60 dark:hover:bg-zinc-800/60" @click="$router.back()" aria-label="Back">
        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/>
        </svg>
      </button>
      <div class="text-base font-semibold">Add device</div>
      <div class="w-9"></div>
    </div>

    <div class="p-4 text-zinc-900 dark:text-zinc-100">
      <!-- Generate -->
      <div class="rounded-2xl bg-white/80 dark:bg-zinc-900/70 shadow-sm shadow-black/10 dark:shadow-black/40 p-4">
        <div class="text-sm font-semibold">Share this on the other device</div>
        <div class="mt-3 flex flex-col items-center">
          <img v-if="qrDataUrl" :src="qrDataUrl" alt="QR" class="w-40 h-40 rounded-lg shadow"/>
          <div v-else class="w-40 h-40 rounded-lg bg-zinc-200/60 dark:bg-zinc-800/60 animate-pulse"></div>
          <div class="mt-3 text-xs opacity-70 break-all text-center">{{ shareUrl }}</div>

          <div class="mt-3 flex items-center gap-2">
            <div class="px-2 py-1 text-xs rounded bg-zinc-100 dark:bg-zinc-800 font-mono">{{ shortCode }}</div>
            <button class="text-xs px-2 py-1 rounded bg-emerald-600 text-white hover:bg-emerald-500" @click="copy(shareUrl)">Copy URL</button>
            <button class="text-xs px-2 py-1 rounded bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700" @click="openPairSite">Open site</button>
          </div>
        </div>
      </div>

      <!-- Import -->
      <div class="mt-4 rounded-2xl bg-white/80 dark:bg-zinc-900/70 shadow-sm shadow-black/10 dark:shadow-black/40 p-4">
        <div class="text-sm font-semibold">Have a code?</div>
        <div class="text-xs opacity-70">Paste the URL or payload string from the other device.</div>
        <div class="mt-2 flex items-center gap-2">
          <input v-model.trim="importText" class="flex-1 px-3 py-2 text-sm rounded-lg bg-zinc-100 dark:bg-zinc-800 outline-none" placeholder="Paste here…" />
          <button class="text-sm px-3 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500" @click="importDevice">Add</button>
        </div>
        <div v-if="importError" class="text-xs text-red-500 mt-2">{{ importError }}</div>
        <div v-if="importOk" class="text-xs text-emerald-600 mt-2">Device added.</div>
      </div>
    </div>
  </div>
</template>

<script>
import QRCode from 'qrcode'

const UUID_KEY = 'cvpn_uuid_v1'
const DEVICES_KEY = 'cvpn_devices_v1'

function b64url(str){
  return btoa(unescape(encodeURIComponent(str))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')
}
function b64urlToJson(b64){
  try{
    const s = decodeURIComponent(escape(atob(String(b64).replace(/-/g,'+').replace(/_/g,'/'))))
    return JSON.parse(s)
  }catch{ return null }
}

function detectEnv () {
  const ua = navigator.userAgent || ''
  const navUAData = navigator.userAgentData || null
  let os = 'Unknown'
  if (/Windows NT|Win/i.test(ua)) os = 'Windows'
  else if (/Mac OS X|Macintosh/i.test(ua)) os = 'macOS'
  else if (/Android/i.test(ua)) os = 'Android'
  else if (/iPhone|iPad|iPod/i.test(ua)) os = 'iOS'
  else if (/Linux/i.test(ua)) os = 'Linux'

  let browser = 'Browser'
  if (/Edg\//i.test(ua)) browser = 'Edge'
  else if (/OPR\/|Opera/i.test(ua)) browser = 'Opera'
  else if (typeof navigator.brave === 'object') browser = 'Brave'
  else if (/Vivaldi/i.test(ua)) browser = 'Vivaldi'
  else if (/Firefox/i.test(ua)) browser = 'Firefox'
  else if (/Chrome/i.test(ua) && !/Chromium/i.test(ua)) browser = 'Chrome'
  else if (/Safari/i.test(ua)) browser = 'Safari'

  const device = navUAData?.platform || navigator.platform || os
  return { os, browser, device }
}

async function loadUuid(){
  try { const r = await chrome?.storage?.session?.get?.([UUID_KEY]); if (r && r[UUID_KEY]) return r[UUID_KEY] } catch {}
  try { const r = await chrome?.storage?.sync?.get?.([UUID_KEY]);    if (r && r[UUID_KEY]) return r[UUID_KEY] } catch {}
  try { const r = await chrome?.storage?.local?.get?.([UUID_KEY]);   if (r && r[UUID_KEY]) return r[UUID_KEY] } catch {}
  try { const raw = localStorage.getItem(UUID_KEY); if (raw) return JSON.parse(raw) } catch {}
  return null
}
async function loadDevices(){
  try { const r = await chrome?.storage?.sync?.get?.([DEVICES_KEY]); if (r && r[DEVICES_KEY]) return r[DEVICES_KEY] } catch {}
  try { const r = await chrome?.storage?.local?.get?.([DEVICES_KEY]); if (r && r[DEVICES_KEY]) return r[DEVICES_KEY] } catch {}
  try { const raw = localStorage.getItem(DEVICES_KEY); if (raw) return JSON.parse(raw) } catch {}
  return []
}
async function saveDevices(list){
  try { await chrome?.storage?.sync?.set?.({ [DEVICES_KEY]: list }); return } catch {}
  try { await chrome?.storage?.local?.set?.({ [DEVICES_KEY]: list }); return } catch {}
  try { localStorage.setItem(DEVICES_KEY, JSON.stringify(list)) } catch {}
}

async function sha256Hex(s){
  const enc = new TextEncoder().encode(s)
  const buf = await crypto.subtle.digest('SHA-256', enc)
  const b = Array.from(new Uint8Array(buf)).map(x => x.toString(16).padStart(2,'0')).join('')
  return b
}

export default {
  name: 'PairDevice',
  data: () => ({
    qrDataUrl: '',
    shareUrl: '',
    shortCode: '',
    importText: '',
    importError: '',
    importOk: false,
  }),
  async mounted(){
    const env = detectEnv()
    const uuid = await loadUuid()
    const name = `${env.os} • ${env.browser}`
    const ts = Date.now()

    const payload = { v:1, id: uuid, name, os: env.os, browser: env.browser, ts }
    const p = b64url(JSON.stringify(payload))
    const sig = await sha256Hex(`${uuid}.${ts}.${env.os}.${env.browser}`)
    this.shortCode = 'CV1-' + sig.slice(0, 18).toUpperCase()

    this.shareUrl = `https://coolvpn.app/pair?code=${encodeURIComponent(this.shortCode)}&p=${encodeURIComponent(p)}`

    try {
      this.qrDataUrl = await QRCode.toDataURL(this.shareUrl, { margin: 1, scale: 6 })
    } catch {
      this.qrDataUrl = ''
    }
  },
  methods:{
    async copy(t){ try{ await navigator.clipboard.writeText(t) }catch{} },
    openPairSite(){ try { chrome.tabs.create({ url: this.shareUrl }) } catch {} },

    async importDevice(){
      this.importError = ''; this.importOk = false
      try{
        // hem direkt URL hem de sadece p=... gelebilir
        const txt = this.importText.trim()
        let pstr = ''

        if (txt.includes('://')) {
          const u = new URL(txt)
          pstr = u.searchParams.get('p') || ''
        } else if (/p=/.test(txt)) {
          const m = txt.match(/p=([A-Za-z0-9\-_]+)/); pstr = m ? m[1] : ''
        } else {
          pstr = txt // direkt payload olabilir
        }

        const obj = b64urlToJson(pstr)
        if (!obj || !obj.id || !obj.name) throw new Error('Invalid payload')

        let list = await loadDevices()
        if (!Array.isArray(list)) list = []

        const idx = list.findIndex(d => d.id === obj.id)
        const now = Date.now()
        if (idx >= 0){
          list[idx] = { ...list[idx], name: obj.name, os: obj.os, browser: obj.browser, lastSeenAt: now }
        } else {
          list.push({ id: obj.id, name: obj.name, os: obj.os, browser: obj.browser, createdAt: now, lastSeenAt: now })
        }
        // Kendini en üste al
        list.sort((a,b)=> (b.lastSeenAt||0) - (a.lastSeenAt||0))

        await saveDevices(list)
        this.importOk = true
        this.importText = ''
      }catch(e){
        this.importError = 'Could not parse code.'
      }
    }
  }
}
</script>

<style>
@keyframes float { 0%{ transform: translateY(0) } 50%{ transform: translateY(-10px) } 100%{ transform: translateY(0) } }
@keyframes float-slow { 0%{ transform: translate(0,0) } 50%{ transform: translate(6px,-12px) } 100%{ transform: translate(0,0) } }
@keyframes float-slower { 0%{ transform: translate(0,0) } 50%{ transform: translate(-8px,10px) } 100%{ transform: translate(0,0) } }

.animate-float { animation: float 6s ease-in-out infinite; }
.animate-float-slow { animation: float-slow 9s ease-in-out infinite; }
.animate-float-slower { animation: float-slower 12s ease-in-out infinite; }
</style>
