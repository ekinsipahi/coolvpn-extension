// src/services/refreshCoordinator.js
import { ConfigHolder } from './configHolder.js'
import { fetchConfigs } from './serverLoader.js'
import { sampleLatencies } from './latencySampler.js'

class RefreshCoordinator {
  constructor() {
    this._timer = null
    this._busy = false
    this.intervalMs = 15000 // 15 sn’de bir
    this.configUrl = 'https://raw.githubusercontent.com/ekinsipahi/coolvpn-configs/refs/heads/main/configs.json'
  }

  async refreshOnce() {
    if (this._busy) return
    this._busy = true
    try {
      const profiles = await fetchConfigs(this.configUrl)
      ConfigHolder.setProfiles(profiles)

      // latency (opsiyonel)
      const lat = await sampleLatencies(profiles)
      ConfigHolder.setLatencies(lat)
    } catch (e) {
      // konsola bırak, UI toast’ı istersen App’ten atabilirsin
      console.warn('[RefreshCoordinator] refresh failed:', e)
    } finally {
      this._busy = false
    }
  }

  start() {
    this.stop()
    this.refreshOnce() // hemen bir kere
    this._timer = setInterval(() => this.refreshOnce(), this.intervalMs)
  }

  stop() {
    if (this._timer) clearInterval(this._timer)
    this._timer = null
  }
}

export const refreshCoordinator = new RefreshCoordinator()
