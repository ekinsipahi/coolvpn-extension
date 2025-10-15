<template>
  <div class="rounded-xl bg-white dark:bg-white/10 shadow p-4">
    <div class="flex items-center">
      <svg v-if="icon==='down'" xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-emerald-500" viewBox="0 0 24 24" fill="currentColor"><path d="M5 12h4V3h6v9h4l-7 7-7-7z"/></svg>
      <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-emerald-500" viewBox="0 0 24 24" fill="currentColor"><path d="M19 12h-4v9H9v-9H5l7-7 7 7z"/></svg>
      <div class="ml-2 font-semibold text-sm">{{ title }}</div>
      <span class="ml-2 text-xs opacity-70 cursor-help" :title="tooltipText">ⓘ</span>
      <div class="ml-auto">
        <span class="inline-flex items-baseline gap-1 text-base font-semibold">
          {{ fmt(value) }} <span class="text-xs opacity-70">{{ unit }}</span>
        </span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name:'SpeedCard',
  props:{ title:String, value:Number, unit:{type:String,default:'Mb/s'}, icon:{type:String,default:'down'}, tooltip:{type:String,default:''} },
  computed:{
    tooltipText(){
      return this.tooltip || 'Values are estimated from live samples. Short dips are normal — updates every few seconds.'
    }
  },
  methods:{
    fmt(v){ if (v<1) return v.toFixed(2); if (v<10) return v.toFixed(1); return v.toFixed(0) }
  }
}
</script>
