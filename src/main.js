// src/main.js
import { createApp } from 'vue'
import App from './App.vue'
import { router } from './router/index.js' // veya './router/index.js'
import './style.css'

createApp(App)
  .use(router)
  .mount('#app')
