// src/services/serverLoader.js
export async function fetchConfigs(url = 'https://raw.githubusercontent.com/ekinsipahi/coolvpn-configs/refs/heads/main/configs.json') {
  const res = await fetch(url, { cache: 'no-store' })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const data = await res.json()

  const globalUser = String(data.username || '').trim()
  const globalPass = String(data.password || '').trim()

  const parsed = []

  if (Array.isArray(data.configs)) {
    for (const item of data.configs) {
      if (!item || typeof item !== 'object') continue
      const id   = String(item.id ?? '').trim()
      const name = String(item.name ?? id).trim()

      const profilesRaw = item.profiles
      if (Array.isArray(profilesRaw)) {
        for (const pr of profilesRaw) {
          if (!pr || typeof pr !== 'object') continue
          const proto = String(pr.proto ?? 'udp').trim()
          const port  = Number(pr.port ?? 1194)
          const ovpnUrl = String(pr.ovpn_url ?? pr.url ?? '').trim()
          const username = String(pr.username ?? item.username ?? globalUser ?? '').trim()
          const password = String(pr.password ?? item.password ?? globalPass ?? '').trim()

          if (!ovpnUrl) continue

          // Şu an için proxy yok (OVPN dosyası). UI gösterecek, bağlanırken toast verir.
          parsed.push({
            id: id || `${name}-${proto}-${port}`.toLowerCase().replace(/\s+/g, '-'),
            bundleName: name,
            ovpnUrl,
            proto,
            port,
            username,
            password,
            premium: !!item.premium || false,
            // proxy: { scheme:'socks5', host:'', port:0, username:'', password:'' } // ileride
          })
        }
      }
    }
  }

  // Demo premium dummy (OVPN’siz)
  if (!parsed.some(p => p.bundleName === 'Premium Dummy (Demo)')) {
    parsed.unshift({
      id: 'premium_dummy',
      bundleName: 'Premium Dummy (Demo)',
      ovpnUrl: '',
      proto: 'tcp',
      port: 443,
      username: globalUser || 'vpnbook',
      password: globalPass || 'm34wk9w',
      premium: true
    })
  }

  return parsed
}
