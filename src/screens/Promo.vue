<template>
  <div class="relative min-w-[320px] w-[360px] p-4 overflow-hidden">
    <!-- Ambient bubbles -->
    <div class="pointer-events-none absolute inset-0">
      <span class="bubble bubble-1"></span>
      <span class="bubble bubble-2"></span>
      <span class="bubble bubble-3"></span>
      <span class="bubble bubble-4"></span>
    </div>

    <!-- Card -->
    <div class="relative z-10 rounded-2xl bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md shadow-lg p-4">
      <div class="flex items-center gap-2">
        <div class="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-md">
          <svg class="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
          </svg>
        </div>
        <h2 class="text-lg font-bold">Go Premium</h2>
      </div>

      <p class="text-sm opacity-70 mt-1">
        Faster servers, fewer waits, priority routing.
      </p>

      <!-- Perks -->
      <ul class="mt-3 space-y-2 text-sm">
        <li class="flex items-start gap-2">
          <span class="mt-0.5 inline-block w-4 h-4 rounded-full bg-emerald-500/90"></span>
          <span>Top-tier servers with lower latency</span>
        </li>
        <li class="flex items-start gap-2">
          <span class="mt-0.5 inline-block w-4 h-4 rounded-full bg-teal-500/90"></span>
          <span>Priority bandwidth on peak hours</span>
        </li>
        <li class="flex items-start gap-2">
          <span class="mt-0.5 inline-block w-4 h-4 rounded-full bg-cyan-500/90"></span>
          <span>Premium-only tracker filtering</span>
        </li>
      </ul>

      <!-- CTA -->
      <button
        class="mt-4 w-full py-2 rounded-xl text-white font-semibold shadow-lg active:scale-[0.99]
               bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 hover:brightness-[1.05] transition"
        @click="buy"
      >
        Get Premium
      </button>

      <!-- Secondary, tiny & subtle -->
      <button
        class="mt-2 w-full text-center text-[12px] opacity-60 hover:opacity-80 underline underline-offset-2 transition"
        @click="maybeLater"
      >
        maybe later
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Promo',
  methods: {
    async _markDoneAndGo() {
      try {
        const sess = !!(chrome?.storage?.session)
        const api  = sess ? chrome.storage.session : chrome.storage.local
        await api.set({ promoDone_v1: true })
      } catch {
        localStorage.setItem('promoDone_v1', '1')
      }
      this.$router.replace({ name: 'home' })
    },
    async buy() {
      try { chrome?.tabs?.create?.({ url: 'https://coolvpn.example/premium' }) } catch {}
      await this._markDoneAndGo()
    },
    async maybeLater() {
      await this._markDoneAndGo()
    }
  }
}
</script>

<style scoped>
/* soft floating bubbles */
.bubble {
  position: absolute;
  border-radius: 9999px;
  filter: blur(18px);
  opacity: 0.45;
  animation: float 12s ease-in-out infinite;
  background: radial-gradient(60% 60% at 40% 40%, rgba(16,185,129,0.35), rgba(16,185,129,0) 70%),
              radial-gradient(60% 60% at 60% 60%, rgba(45,212,191,0.35), rgba(45,212,191,0) 70%);
}

.bubble-1 { width: 160px; height: 160px; left: -40px; top: -30px; animation-delay: 0s; }
.bubble-2 { width: 120px; height: 120px; right: -30px; top: 40px; animation-delay: 2s; }
.bubble-3 { width: 180px; height: 180px; left: 20px; bottom: -60px; animation-delay: 4s; }
.bubble-4 { width: 130px; height: 130px; right: -20px; bottom: -30px; animation-delay: 6s; }

@keyframes float {
  0%   { transform: translateY(0) translateX(0) scale(1);   opacity: 0.42; }
  50%  { transform: translateY(-10px) translateX(6px) scale(1.03); opacity: 0.55; }
  100% { transform: translateY(0) translateX(0) scale(1);   opacity: 0.42; }
}
</style>
