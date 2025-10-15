// src/services/latencySampler.js

// Tek bir GET ile RTT ölç
async function rttOnce(url, timeoutMs = 900) {
  const ctrl = new AbortController()
  const t0 = performance.now()
  const to = setTimeout(() => ctrl.abort(), timeoutMs)
  try {
    const res = await fetch(url, { signal: ctrl.signal, cache: 'no-store' })
    // body okumadan RTT ölçelim
    const dt = performance.now() - t0
    clearTimeout(to)
    return Math.max(1, Math.round(dt))
  } catch {
    clearTimeout(to)
    return null
  }
}

// Basit sampler: herkese aynı RTT’yi dağıt (gerçek değil ama UI için işlevsel)
export async function sampleLatencies(profiles, { probeUrl = 'https://1.1.1.1/cdn-cgi/trace', attempts = 2 } = {}) {
  // bir kaç deneme ortalaması
  const samples = []
  for (let i = 0; i < attempts; i++) {
    const v = await rttOnce(probeUrl, 1000)
    if (v != null) samples.push(v)
  }
  const avg = samples.length ? Math.round(samples.reduce((a,b)=>a+b,0) / samples.length) : null

  const out = {}
  for (const p of profiles) out[p.id] = avg
  return out
}
