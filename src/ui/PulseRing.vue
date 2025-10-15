<template>
  <div class="relative select-none pointer-events-none"
       :style="{ width: sizePx, height: sizePx }" aria-hidden="true">
    <div class="absolute inset-0 rounded-full" :style="ringStyle" />
  </div>
</template>

<script>
export default {
  name: 'PulseRing',
  props: { size: { type:[Number,String], default:160 }, color: { type:String, default:'#22c55e' } },
  computed:{
    sizePx(){ return typeof this.size==='number' ? `${this.size}px` : this.size },
    ringStyle(){ return { backgroundColor:this.color, animation:'pulseScale 1200ms ease-out infinite', opacity:0.35 } }
  }
}
</script>

<style>
@keyframes pulseScale { 0% { transform:scale(.95); opacity:.35 } 100% { transform:scale(1.25); opacity:0 } }
</style>
