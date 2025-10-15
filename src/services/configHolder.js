// src/services/configHolder.js
export const ConfigHolder = {
  profiles: [],         // [{ id, bundleName, proxy?, username?, password?, premium? }]
  latencies: {},        // { [id]: ms|null }
  bestProfile: null,    // isteğe bağlı
  setProfiles(list) {
    this.profiles = Array.isArray(list) ? list : []
    this.bestProfile = this.profiles[0] || null
  },
  setLatencies(map) {
    this.latencies = map || {}
  }
}
