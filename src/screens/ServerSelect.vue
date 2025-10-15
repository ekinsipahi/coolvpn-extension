<template>
  <div class="relative min-w-[320px] bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 min-h-[420px] overflow-hidden">
    <!-- FX BACKDROP (non-interactive) -->
    <div class="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <!-- subtle radial wash (prevents white flash) -->
      <div class="absolute inset-0 fx-wash"></div>

      <!-- floating blobs -->
      <div class="fx-blob fx-emerald" aria-hidden="true"></div>
      <div class="fx-blob fx-indigo"  aria-hidden="true"></div>
      <div class="fx-blob fx-cyan"    aria-hidden="true"></div>
    </div>

    <!-- AppBar -->
    <div class="sticky top-0 z-10 bg-inherit/70 backdrop-blur-md border-b border-white/20 dark:border-white/5">
      <div class="px-3 py-2 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <button
            class="p-2 rounded-xl hover:bg-zinc-200/60 dark:hover:bg-zinc-800/60 active:scale-[0.98] transition"
            @click="$router.back()"
            aria-label="Back"
          >
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div class="text-base font-semibold">Choose server location</div>
        </div>

        <div class="flex items-center gap-2">
          <div
            v-if="pinging"
            class="w-4 h-4 border-2 rounded-full border-zinc-400/50 border-t-emerald-600 animate-spin"
            aria-label="Measuring"
          ></div>
          <button
            class="px-2 py-1 text-sm rounded-lg hover:bg-zinc-200/60 dark:hover:bg-zinc-800/60 active:scale-[0.98] transition"
            @click="reload"
          >
            Reload
          </button>
        </div>
      </div>
    </div>

    <!-- Search -->
    <div class="px-3 pt-3">
      <div
        class="flex items-center gap-2 rounded-2xl px-3 py-2 shadow-sm border
               bg-white/75 dark:bg-white/10 backdrop-blur-sm
               border-zinc-200/60 dark:border-white/10">
        <svg class="w-4 h-4 opacity-70" viewBox="0 0 24 24" fill="currentColor">
          <path
            d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79L20 21.49 21.49 20l-5.99-6zM9.5 14C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
          />
        </svg>
        <input
          v-model.trim="query"
          class="flex-1 bg-transparent outline-none text-sm placeholder:opacity-60"
          placeholder="Search location"
        />
        <div
          v-if="loading"
          class="w-4 h-4 border-2 rounded-full border-zinc-400/40 border-t-emerald-600 animate-spin"
        ></div>
      </div>
      <div class="mt-2 text-[11px] tracking-wide opacity-60">
        AVAILABLE SERVERS <span v-if="pinging" class="italic">· measuring…</span>
      </div>
    </div>

    <!-- List -->
    <div class="px-3 py-2 pb-4">
      <div v-if="error" class="text-red-500 text-sm my-2">{{ error }}</div>

      <div v-if="!loading && filtered.length === 0" class="text-sm opacity-70 py-10 text-center">
        {{ profiles.length ? 'No servers match search' : 'No servers available' }}
      </div>

      <ul v-else class="space-y-2">
        <li v-for="p in filtered" :key="p.id">
          <button
            class="group w-full flex items-center gap-3 p-3 rounded-xl
                   bg-white/75 dark:bg-white/10 backdrop-blur-md
                   border border-zinc-200/60 dark:border-white/10
                   shadow-sm hover:shadow transition
                   hover:border-emerald-400/40 active:scale-[0.995]"
            @click="pick(p)"
          >
            <!-- Flag circle -->
            <div
              class="w-9 h-9 rounded-full flex items-center justify-center text-lg
                     bg-white/90 dark:bg-zinc-900 shadow-sm"
            >
              {{ flagForName(titleOf(p), p) }}
            </div>

            <!-- Title + meta -->
            <div class="flex-1 text-left min-w-0">
              <div class="font-semibold truncate">
                {{ titleOf(p) }}
              </div>
              <div class="text-[11px] opacity-60 truncate">
                <span v-if="p.countryCode">{{ p.countryCode }}</span>
                <span v-if="p.anonymity">&nbsp;•&nbsp;{{ p.anonymity }}</span>
              </div>
            </div>

            <!-- Strength + ms -->
            <div class="flex items-center gap-2">
              <span
                class="text-[11px] font-semibold px-2 py-1 rounded-md border
                       transition-colors"
                :class="badgeClassFor(p)"
              >
                <svg class="inline w-3 h-3 mr-1 align-[-2px]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M2 20h2v-2H2v2zm4 0h2v-6H6v6zm4 0h2v-10h-2v10zm4 0h2V7h-2v13zm4 0h2V3h-2v17z"/>
                </svg>
                {{ latencyText(p) }}
              </span>

              <svg
                class="w-5 h-5 opacity-60 transform transition-transform group-hover:translate-x-0.5"
                viewBox="0 0 24 24" fill="currentColor"
              >
                <path d="M9 6l6 6-6 6" />
              </svg>
            </div>
          </button>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ConfigHolder } from '../services/configHolder.js'

const LAST_PROFILE_ID = 'lastSelectedProfileId'
const OPT_EP_KEY      = 'cvpn_optimal_ep_v1'

const PROXY_JSON_URL = 'https://raw.githubusercontent.com/ekinsipahi/coolvpn-proxies/refs/heads/main/coolvpn-proxies.json'

function flagFromCode(cc) {
  const up = String(cc || '').toUpperCase()
  if (up.length !== 2) return '🌐'
  const base = 0x1F1E6
  return String.fromCodePoint(base + (up.charCodeAt(0)-65), base + (up.charCodeAt(1)-65))
}
function norm(s) { return String(s||'').toLowerCase().replace(/[_\-./]+/g,' ').replace(/\s+/g,' ').trim() }

function persistLastSelectedHostPort(p, title) {
  try { localStorage.setItem(LAST_PROFILE_ID, JSON.stringify(`${p.host}:${p.port}`)) } catch {}
  try { chrome?.storage?.local?.set?.({ [LAST_PROFILE_ID]: `${p.host}:${p.port}` }) } catch {}
  try {
    chrome?.storage?.session?.set?.({
      [OPT_EP_KEY]: { host: p.host, port: Number(p.port), scheme: p.scheme || 'http', title }
    })
  } catch {}
}

export default {
  name: 'ServerSelect',
  setup() {
    const router    = useRouter()
    const loading   = ref(false)
    const pinging   = ref(false)
    const error     = ref('')
    const profiles  = ref([])
    const latencies = ref({})
    const query     = ref('')

    const titleOf = (p) => {
      if (!p) return 'Unnamed'
      const left = p.countryCode ? `${p.countryCode.toUpperCase()} · ` : ''
      const right = p.scheme ? ` (${p.scheme})` : ''
      return `${left}${p.host}:${p.port}${right}`
    }
    const flagForName = (_name, p) => p?.countryCode ? flagFromCode(p.countryCode) : '🌐'
    const latencyText = (p) => latencies.value[p.id] == null ? '— ms' : `${latencies.value[p.id]} ms`
    const badgeClassFor = (p) => {
      const ms = latencies.value[p.id]
      if (ms == null) return 'border-zinc-400/40 text-zinc-600 dark:text-zinc-300 bg-transparent'
      if (ms < 40)  return 'border-emerald-400/40 text-emerald-700 dark:text-emerald-400 bg-emerald-500/10'
      if (ms < 120) return 'border-amber-400/40 text-amber-700 dark:text-amber-400 bg-amber-500/10'
      return 'border-red-400/40 text-red-700 dark:text-red-400 bg-red-500/10'
    }

    const filtered = computed(() => {
      const q = norm(query.value)
      if (!q) return profiles.value
      return profiles.value.filter(p => norm(`${p.host} ${p.port} ${p.scheme} ${p.country} ${p.countryCode} ${titleOf(p)}`).includes(q))
    })

    async function fetchProxies() {
      loading.value = true
      error.value = ''
      try {
        const res = await fetch(PROXY_JSON_URL, { cache: 'no-store' })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        const arr = Array.isArray(data?.proxies) ? data.proxies : []
        const out = []

        for (const r of arr) {
          const hostPort = String(r.proxy || '').trim()
          const m = hostPort.match(/^([^:\s]+):(\d{2,5})$/)
          if (!m) continue
          const host = m[1]
          const port = Number(m[2])
          const scheme = String(r.protocol || 'http').toLowerCase()
          const id = `${scheme}://${host}:${port}`

          out.push({
            id, scheme, host, port,
            country: r?.ip_data?.country || '',
            countryCode: r?.ip_data?.countryCode || '',
            anonymity: r?.anonymity || '',
            uptime: r?.uptime ?? null,
            timeoutMs: r?.timeout ?? null,
            lastSeen: r?.last_seen ?? null,
            alive: !!r?.alive,
          })
        }

        let items = out.filter(x => x.alive && x.host && x.port)
        const seen = new Set()
        items = items.filter(x => (seen.has(x.id) ? false : (seen.add(x.id), true)))

        items.sort((a,b) => {
          const uA = a.uptime ?? 0, uB = b.uptime ?? 0
          if (uB !== uA) return uB - uA
          const tA = a.timeoutMs ?? 1e9, tB = b.timeoutMs ?? 1e9
          if (tA !== tB) return tA - tB
          const pref = (cc) => ['US','CA','GB','DE','NL','FR'].indexOf((cc||'').toUpperCase())
          const pA = pref(a.countryCode); const pB = pref(b.countryCode)
          return (pA === -1 ? 99 : pA) - (pB === -1 ? 99 : pB)
        })

        const lmap = {}
        for (const it of items) lmap[it.id] = it.timeoutMs ?? null

        profiles.value = items
        latencies.value = lmap

        try { ConfigHolder.profiles = items } catch {}
        try { ConfigHolder.latencies = lmap } catch {}
      } catch (e) {
        error.value = `Proxy list load failed: ${e?.message || e}`
      } finally {
        loading.value = false
      }
    }

    async function refreshLatencies() {
      if (!profiles.value.length) return
      pinging.value = true
      const lmap = latencies.value
      profiles.value = profiles.value.slice().sort((a,b) => {
        const la = lmap[a.id], lb = lmap[b.id]
        const ah = la != null,  bh = lb != null
        if (ah && bh) return la - lb
        if (ah && !bh) return -1
        if (!ah && bh) return 1
        return titleOf(a).localeCompare(titleOf(b))
      })
      pinging.value = false
    }

    async function reload() {
      await fetchProxies()
      await refreshLatencies()
    }

    async function pick(p) {
      try { ConfigHolder.bestProfile = p } catch {}
      try { ConfigHolder.globalHttpProxy = { scheme: p.scheme || 'http', host: p.host, port: p.port } } catch {}
      const title = titleOf(p)
      persistLastSelectedHostPort(p, title)
      try { await chrome.storage?.local?.set?.({ lastSelectedProfileId_raw: p.id }) } catch {}

      try {
        const before = router.currentRoute.value.fullPath
        router.back()
        setTimeout(async () => {
          const after = router.currentRoute.value.fullPath
          if (after === before) {
            try { await router.replace({ name: 'home' }) } catch { await router.replace('/home') }
          }
        }, 50)
      } catch {
        try { await router.replace({ name: 'home' }) } catch { await router.replace('/home') }
      }
    }

    onMounted(async () => {
      if (Array.isArray(ConfigHolder.profiles) && ConfigHolder.profiles.length) {
        profiles.value = ConfigHolder.profiles
        latencies.value = ConfigHolder.latencies || {}
      } else {
        await fetchProxies()
      }
      await refreshLatencies()
    })

    return {
      loading, pinging, error, profiles, latencies, query,
      filtered, titleOf, flagForName, latencyText, badgeClassFor,
      reload, pick
    }
  }
}
</script>

<style>
/* ---------- FX BACKDROP ---------- */
.fx-wash {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(60% 60% at 20% 0%, rgba(16, 185, 129, 0.08), transparent 70%),
    radial-gradient(60% 60% at 100% 80%, rgba(99, 102, 241, 0.08), transparent 70%),
    radial-gradient(70% 70% at 50% 50%, rgba(6, 182, 212, 0.07), transparent 75%);
}

/* Animated blobs — very low opacity; no full fade-out to avoid flashes */
.fx-blob {
  position: absolute;
  filter: blur(36px);
  opacity: 0.28; /* stays > 0 so there’s no ‘white blink’ */
  will-change: transform;
  pointer-events: none;
}
.fx-emerald { width: 280px; height: 280px; top: -80px; left: -90px; background: rgba(16,185,129,0.35); animation: floatA 18s ease-in-out infinite alternate; }
.fx-indigo  { width: 300px; height: 300px; right: -110px; bottom: -90px; background: rgba(99,102,241,0.32); animation: floatB 24s ease-in-out infinite alternate; }
.fx-cyan    { width: 260px; height: 260px; left: 45%; top: 28%; transform: translateX(-50%); background: rgba(6,182,212,0.28); animation: floatC 20s ease-in-out infinite alternate; }

@keyframes floatA { 0% { transform: translate(0,0) scale(1); } 50%{ transform: translate(10px,-14px) scale(1.04);} 100% { transform: translate(0,0) scale(1);} }
@keyframes floatB { 0% { transform: translate(0,0) scale(1); } 50%{ transform: translate(-12px,10px) scale(1.05);} 100% { transform: translate(0,0) scale(1);} }
@keyframes floatC { 0% { transform: translate(-50%,0) scale(1); } 50%{ transform: translate(-52%,8px) scale(1.03);} 100% { transform: translate(-50%,0) scale(1);} }

/* ---------- Small polish ---------- */
button { transition: transform 120ms ease, box-shadow 200ms ease, border-color 200ms ease, background-color 200ms ease; }
</style>
