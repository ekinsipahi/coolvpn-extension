<!-- src/screens/Devices.vue -->
<template>
  <div class="min-w-[320px] w-[360px] max-w-full bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
    <!-- AppBar -->
    <div class="sticky top-0 z-10 flex items-center justify-between px-3 py-2">
      <button class="p-2 rounded-lg hover:bg-zinc-200/60 dark:hover:bg-zinc-800/60" @click="$router.back()" aria-label="Back">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <h1 class="text-base font-semibold">Devices</h1>
      <div class="w-9"></div>
    </div>

    <div class="p-3">
      <div v-if="loading" class="flex items-center gap-2 text-sm opacity-70">
        <div class="w-4 h-4 border-2 rounded-full border-zinc-400/40 border-t-emerald-600 animate-spin"></div>
        Loading…
      </div>

      <template v-else>
        <!-- This device (highlighted) -->
        <div v-if="current" class="mb-3">
          <div class="text-xs font-semibold opacity-60 mb-1">THIS DEVICE</div>
          <DeviceRow :dev="current" :highlight="true" @copy="copyUuid" />
        </div>

        <!-- Other devices -->
        <div>
          <div class="text-xs font-semibold opacity-60 mb-1">OTHER DEVICES</div>
          <div v-if="others.length === 0" class="text-sm opacity-70 py-6 text-center">
            No other devices
          </div>
          <ul v-else class="divide-y divide-zinc-200/60 dark:divide-zinc-800/60">
            <li v-for="d in others" :key="d.id">
              <DeviceRow :dev="d" @copy="copyUuid" />
            </li>
          </ul>
        </div>
      </template>
    </div>

    <!-- Toast -->
    <div v-if="toast" class="fixed left-1/2 -translate-x-1/2 bottom-3 bg-zinc-900 text-white text-sm rounded-lg px-3 py-2 shadow">
      {{ toast }}
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import DeviceRow from '../components/DeviceRow.vue'

const UUID_KEY = 'cvpn_uuid_v1'
const DEVICES_KEY = 'cvpn_devices_v1'

/* ==== UA detection ==== */
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

/* ==== Storage helpers ==== */
async function loadUuid(){
  try { const r = await chrome?.storage?.session?.get?.([UUID_KEY]); if (r && r[UUID_KEY]) return r[UUID_KEY] } catch {}
  try { const r = await chrome?.storage?.sync?.get?.([UUID_KEY]);    if (r && r[UUID_KEY]) return r[UUID_KEY] } catch {}
  try { const r = await chrome?.storage?.local?.get?.([UUID_KEY]);   if (r && r[UUID_KEY]) return r[UUID_KEY] } catch {}
  try { const raw = localStorage.getItem(UUID_KEY); if (raw) return JSON.parse(raw) } catch {}
  return null
}
async function saveUuid(v){
  try { await chrome?.storage?.session?.set?.({ [UUID_KEY]: v }) } catch {}
  try { await chrome?.storage?.sync?.set?.({ [UUID_KEY]: v }) } catch {}
  try { await chrome?.storage?.local?.set?.({ [UUID_KEY]: v }) } catch {}
  try { localStorage.setItem(UUID_KEY, JSON.stringify(v)) } catch {}
}
async function ensureUuid(){
  let u = await loadUuid()
  if (u && typeof u === 'object' && typeof u.id === 'string') u = u.id
  if (typeof u !== 'string' || u.length < 8){
    const fresh = (globalThis.crypto?.randomUUID?.()
      || (`${Date.now().toString(36)}-${Math.random().toString(36).slice(2,10)}`))
    await saveUuid(fresh)
    return fresh
  }
  return u
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

export default {
  name: 'DevicesScreen',
  components: { DeviceRow },
  setup(){
    const loading = ref(true)
    const toast = ref('')
    const all = ref([])
    const currentId = ref(null)

    const current = computed(()=> all.value.find(d => d.id === currentId.value) || null)
    const others  = computed(()=> all.value.filter(d => d.id !== currentId.value))

    function showToast(t){ toast.value = t; setTimeout(()=> toast.value='', 1800) }

    async function copyUuid(id){
      try { await navigator.clipboard.writeText(id); showToast('UUID copied') } catch { showToast('Copy failed') }
    }

    onMounted(async ()=>{
      loading.value = true
      try {
        const env = detectEnv()
        const uuid = await ensureUuid()   // ← UUID garanti
        currentId.value = uuid

        let list = await loadDevices()
        if (!Array.isArray(list)) list = []

        const now = Date.now()
        const name = `${env.os} • ${env.browser}`

        const idx = list.findIndex(d => d.id === uuid)
        if (idx >= 0){
          list[idx] = { ...list[idx], name, os: env.os, browser: env.browser, lastSeenAt: now }
        } else {
          list.push({ id: uuid, name, os: env.os, browser: env.browser, createdAt: now, lastSeenAt: now })
        }

        list.sort((a,b)=>{
          if (a.id === uuid && b.id !== uuid) return -1
          if (b.id === uuid && a.id !== uuid) return 1
          return (b.lastSeenAt||0) - (a.lastSeenAt||0)
        })

        await saveDevices(list)
        all.value = list
      } finally {
        loading.value = false
      }
    })

    return { loading, toast, current, others, copyUuid }
  }
}
</script>

