<template>
  <div
    class="flex items-center gap-3 p-3 rounded-lg bg-white dark:bg-zinc-900 shadow-sm shadow-black/10 dark:shadow-black/40"
    :class="highlight ? 'ring-1 ring-emerald-500/50' : ''"
  >
    <div class="relative">
      <svg :class="osI.class" viewBox="0 0 24 24" fill="currentColor">
        <path :d="osI.path" />
      </svg>
      <div class="absolute -bottom-1 -right-1 rounded-full bg-white dark:bg-zinc-900 p-[2px] shadow">
        <svg :class="brI.class" viewBox="0 0 24 24" fill="currentColor">
          <path :d="brI.path" />
        </svg>
      </div>
    </div>

    <div class="flex-1 min-w-0">
      <div class="flex items-center gap-2">
        <div class="font-semibold truncate">{{ dev.name }}</div>
        <svg v-if="highlight" class="w-4 h-4 text-amber-500" viewBox="0 0 24 24" fill="currentColor">
          <path
            d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
          />
        </svg>
      </div>
      <div class="text-xs opacity-70 truncate">{{ dev.id }}</div>
    </div>

    <button
      class="px-2 py-1 text-xs rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700"
      @click="copy"
    >
      Copy
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  dev: { type: Object, required: true },
  highlight: { type: Boolean, default: false }
})
const emit = defineEmits(['copy'])

const osI = computed(() => osIcon(props.dev.os))
const brI = computed(() => browserIcon(props.dev.browser))
const copy = () => emit('copy', props.dev.id)

/* ==== Icon helpers ==== */
function osIcon(os){
  const base = 'w-7 h-7'
  if (os === 'Windows') return { class: base, path: 'M3 4l8-2v9H3V4zm10-2l8 2v7h-8V2zM3 13h8v9l-8-2v-7zm10 0h8v7l-8 2v-9z' }
  if (os === 'macOS')  return { class: base, path: 'M15 2c-1.5 0-3 .9-3.8 2.3C10.4 5.7 10.2 7.5 11 9c1 .1 2-.3 2.7-1 .7-.8 1.2-1.8 1.3-2.9-1.2-.5-1.9-2-0-3.1zM19 22c-2 .2-2.7-1.3-5-1.3S11.2 22 9 22c-2.9 0-5.5-4.1-5.5-8.2 0-3.8 2.6-5.8 5.1-5.8 1.6 0 2.8.9 3.9.9 1 0 2.5-1 4.3-1 .7 0 3 .1 4.2 2.2-3.7 2.1-3.2 7.7.6 9.9-.8 1.2-1.9 2-3.6 2z' }
  if (os === 'Android')return { class: base, path: 'M7 6h10v10h-1v3h-2v-3H10v3H8v-3H7V6zm9.5-3l1 1.7-1.7 1-1-1.7L16.5 3zM7.5 3L9.2 4.7l-1 1.7-1.7-1L7.5 3z' }
  if (os === 'iOS')    return { class: base, path: 'M12 2c1.7 0 3 1.3 3 3s-1.3 3-3 3-3-1.3-3-3S10.3 2 12 2zm5 7H7c-1.1 0-2 .9-2 2v7c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2v-7c0-1.1-.9-2-2-2z' }
  if (os === 'Linux')  return { class: base, path: 'M12 2c2.2 0 4 2.1 4 4.7 0 1.8-1 3.4-2.4 4.1.3.5.4 1 .4 1.6 0 1.4-.7 2.6-1.7 3.3l1.3 4.3h-2.2l-1.2-3.9-1.2 3.9H6.6l1.3-4.3C6.9 15.3 6.2 14.1 6.2 12.7c0-.6.2-1.1.4-1.6C5.2 10.1 4.2 8.5 4.2 6.7 4.2 4.1 6 2 8.2 2c1.1 0 2.1.6 2.7 1.5C11 2.6 11.5 2 12 2z' }
  return { class: base, path: 'M4 4h16v16H4z' }
}
function browserIcon(br){
  const base = 'w-4 h-4'
  if (br === 'Chrome') return { class: base, path: 'M12 2a10 10 0 100 20 10 10 0 000-20zm0 4a6 6 0 015.2 3H12a3 3 0 00-2.6 1.5L6.7 6.7A6 6 0 0112 6zm-6 6a6 6 0 011.2-3.6l2.7 4.7A3 3 0 0012 15a3 3 0 002.6-1.5l2.7 4.7A6 6 0 016 12zm6 6a6 6 0 01-4.9-2.6h6.8A3 3 0 0015 12c0-.5-.1-1-.3-1.4h3.1A6 6 0 0112 18z' }
  if (br === 'Firefox')return { class: base, path: 'M12 2c5.5 0 10 4.4 10 9.9 0 5.4-4.5 9.9-10 9.9-5.6 0-10-4.5-10-9.9 0-2.1.7-4.1 1.9-5.7.2.3.5.7.9 1.1C4 8.3 3.6 9.7 3.6 11c0 3.9 3.4 7.1 7.6 7.1 4.2 0 7.6-3.2 7.6-7.1 0-3.2-2.3-5.9-5.6-6.7.5-.1 1.1-.3 1.6-.3L12 2z' }
  if (br === 'Edge')    return { class: base, path: 'M12 2c5.5 0 10 4.4 10 9.8-2.3-1.9-5.2-3-8.4-3-5 0-9.2 3-10.8 7.2C4.3 21 7.9 22 12 22c6.1 0 11-4.3 11-9.7 0-5.3-4.9-10.3-11-10.3z' }
  if (br === 'Brave')  return { class: base, path: 'M5 4l3-2h8l3 2-1 6-6 8-6-8-1-6zM9 7l3 2 3-2-1 3-2 1-2-1-1-3z' }
  if (br === 'Opera')  return { class: base, path: 'M12 2c5.5 0 10 4.5 10 10s-4.5 10-10 10S2 17.5 2 12 6.5 2 12 2zm0 3c-2.8 0-5 3.1-5 7s2.2 7 5 7 5-3.1 5-7-2.2-7-5-7z' }
  if (br === 'Safari') return { class: base, path: 'M12 2a10 10 0 100 20 10 10 0 000-20zm3.5 4.5L11 13l-6.5 4.5L13 11l2.5-4.5z' }
  return { class: base, path: 'M4 4h16v16H4z' }
}
</script>
