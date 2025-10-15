<template>
  <div class="min-w-[320px] w-[360px] max-w-full bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
    <!-- AppBar -->
    <div class="sticky top-0 z-10 flex items-center gap-2 px-3 py-2">
      <button
        class="p-2 rounded-lg hover:bg-zinc-200/60 dark:hover:bg-zinc-800/60"
        aria-label="Back"
        @click="$router.back()"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/>
        </svg>
      </button>
      <h1 class="text-base font-semibold">Privacy Policy</h1>
    </div>

    <div class="p-4 space-y-3 text-sm leading-6">
      <p>This is a placeholder for the Privacy Policy. Replace with your real policy text later.</p>
      <p>We do not log your browsing content. Connection metadata may be processed to operate the service.</p>
      <p>Contact: support@coolvpn.example</p>
    </div>
  </div>
</template>

<script>
export default { name: 'PrivacyPolicy' }
</script>
