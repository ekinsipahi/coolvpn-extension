// src/router/index.js
import { createRouter, createWebHashHistory } from 'vue-router'

import Splash from '../screens/Splash.vue'
import Home from '../screens/Home.vue'
import Preferences from '../screens/Preferences.vue'
import ServerSelect from '../screens/ServerSelect.vue'
import Promo from '../screens/Promo.vue'
import PrivacyPolicy from '../screens/PrivacyPolicy.vue'
import Devices from '../screens/Devices.vue'
import PairDevice from '../screens/PairDevice.vue'


const routes = [
  { path: '/', redirect: '/splash' },
  { path: '/splash', name: 'splash', component: Splash },
  { path: '/home', name: 'home', component: Home },
  { path: '/promo', name: 'promo', component: Promo },
  { path: '/privacy', name: 'privacy', component: PrivacyPolicy },
  { path: '/preferences', name: 'preferences', component: Preferences },
  { path: '/devices', name: 'devices', component: Devices },
  { path: '/pair', name: 'pair', component: PairDevice },
  { path: '/servers', name: 'servers', component: ServerSelect },
  { path: '/:pathMatch(.*)*', redirect: '/home' },
]

export const router = createRouter({
  history: createWebHashHistory(),
  routes,
})
