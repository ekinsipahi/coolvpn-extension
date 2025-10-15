<template>
  <div class="min-w-[320px] h-[420px] bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 relative">
    <!-- center logo + title -->
    <div class="w-full h-full flex flex-col items-center justify-center">
      <div class="w-[140px] h-[140px] rounded-full shadow-lg bg-white dark:bg-white/10 dark:shadow-black/40 shadow-black/10 overflow-hidden">
        <div class="w-full h-full flex items-center justify-center animate-splash-scale">
          <img :src="logoUrl" alt="logo" class="w-[104px] h-[104px] object-contain select-none" draggable="false" />
        </div>
      </div>
      <div class="mt-4 text-[22px] font-extrabold tracking-wide" :style="{ color: primaryAccent }">
        CoolVPN
      </div>
    </div>

    <!-- bottom typing line -->
    <div class="absolute left-0 right-0 bottom-4">
      <div class="px-3 w-full flex flex-col items-center">
        <div class="flex items-center gap-1">
          <span class="text-[16px] font-semibold tracking-wide text-zinc-700 dark:text-zinc-200">
            {{ currentTyped }}
          </span>
          <span v-if="currentTyped.length"
                class="ml-1 w-2 h-[14px] rounded-[3px] animate-caret-blink"
                :style="{ background: primaryAccent }"></span>
        </div>
        <div class="mt-2 text-[12px] text-zinc-500 dark:text-zinc-400/70">fast • secure • cheap</div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'

export default {
  name: 'SplashScreen',
  setup() {
    const router = useRouter()

    const TYPE_MS = 35
    const PAUSE_FULL_MS = 420
    const BACKSPACE_MS = 22
    const START_DELAY_MS = 120
    const FALLBACK_MAX_MS = 2600

    const tagline = 'fast secure and cheap'
    const currentTyped = ref('')
    const primaryAccent = '#22c55e'
    const logoUrl = chrome.runtime.getURL('icons/icon128.png')

    let tType = null, tBack = null, tStart = null, tFallback = null
    let cancelled = false

    async function goNext() {
      if (cancelled) return
      // introDone flag set
      try {
        const sess = !!(chrome?.storage?.session)
        const api  = sess ? chrome.storage.session : chrome.storage.local
        await api.set({ introDone_v1: true })
        const p = await api.get('promoDone_v1')
        if (!p?.promoDone_v1) {
          router.replace({ name: 'promo' })
          return
        }
      } catch {
        localStorage.setItem('introDone_v1', '1')
        if (!localStorage.getItem('promoDone_v1')) {
          router.replace({ name: 'promo' })
          return
        }
      }
      router.replace({ name: 'home' })
    }

    function typeForward(text) {
      return new Promise(resolve => {
        let i = 0
        tType = setInterval(() => {
          if (cancelled) { clearInterval(tType); return }
          if (i < text.length) currentTyped.value += text[i++]
          else { clearInterval(tType); resolve() }
        }, TYPE_MS)
      })
    }

    function backspaceAll() {
      return new Promise(resolve => {
        tBack = setInterval(() => {
          if (cancelled) { clearInterval(tBack); return }
          if (currentTyped.value.length) currentTyped.value = currentTyped.value.slice(0, -1)
          else { clearInterval(tBack); resolve() }
        }, BACKSPACE_MS)
      })
    }

    onMounted(async () => {
      // Aynı oturumda splash'i bir kez göster
      try {
        const s = await chrome.storage.session.get('splashDone_v1')
        if (s?.splashDone_v1) { await goNext(); return }
      } catch {}

      tFallback = setTimeout(goNext, FALLBACK_MAX_MS)

      tStart = setTimeout(async () => {
        await typeForward(tagline)
        await new Promise(r => setTimeout(r, PAUSE_FULL_MS))
        await backspaceAll()
        clearTimeout(tFallback)
        try { await chrome.storage.session.set({ splashDone_v1: true }) } catch {}
        await goNext()
      }, START_DELAY_MS)
    })

    onBeforeUnmount(() => {
      cancelled = true
      clearInterval(tType); clearInterval(tBack)
      clearTimeout(tStart); clearTimeout(tFallback)
    })

    return { currentTyped, primaryAccent, logoUrl }
  }
}
</script>

<style>
@keyframes splashScale {
  0%   { transform: scale(.86) }
  60%  { transform: scale(1.04) }
  80%  { transform: scale(.98) }
  100% { transform: scale(1) }
}
.animate-splash-scale { animation: splashScale 900ms cubic-bezier(.2,.8,.2,1) both }
@keyframes caretBlink { 0%,49%{opacity:1} 50%,100%{opacity:.1} }
.animate-caret-blink { animation: caretBlink 1s step-end infinite }
</style>
