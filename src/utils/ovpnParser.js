// src/utils/ovpnParser.js
// Basit .ovpn parser: http-proxy / socks-proxy satırlarını çıkarır.
// remote <host> <port> bilgisini de döner (proxy değildir, bilgilendirme).
export function parseOvpn(text) {
  const result = {
    proxy: null,           // { scheme: 'http'|'https'|'socks5', host, port, username?, password? }
    remoteHost: null,      // OpenVPN sunucusu (proxy değil)
    remotePort: null,
    proto: null,           // tcp/udp vb
    cipher: null,
    authUserPass: false,   // 'auth-user-pass' var mı
  };

  if (!text || typeof text !== 'string') return result;

  // satırları temizle
  const lines = text
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(l => l && !l.startsWith('#') && !l.startsWith(';'));

  // yardımcı: ilk eşleşmeyi bul
  const matchLine = (re) => {
    for (const l of lines) {
      const m = l.match(re);
      if (m) return m;
    }
    return null;
  };

  // proto
  {
    const m = matchLine(/^proto\s+(\S+)/i);
    if (m) result.proto = m[1].toLowerCase();
  }

  // cipher
  {
    const m = matchLine(/^cipher\s+(\S+)/i);
    if (m) result.cipher = m[1];
  }

  // auth-user-pass
  {
    const m = matchLine(/^auth-user-pass(?:\s+\S+)?$/i); // path de olabilir
    if (m) result.authUserPass = true;
  }

  // remote host port (proxy DEĞİL)
  {
    const m = matchLine(/^remote\s+([^\s]+)\s+(\d+)/i);
    if (m) {
      result.remoteHost = m[1];
      result.remotePort = parseInt(m[2], 10);
    }
  }

  // http-proxy host port [user] [pass]
  {
    const m = matchLine(/^http-proxy\s+([^\s]+)\s+(\d+)(?:\s+([^\s]+)\s+([^\s]+))?/i);
    if (m) {
      result.proxy = {
        scheme: 'http',
        host: m[1],
        port: parseInt(m[2], 10),
        username: m[3],
        password: m[4],
      };
      return result;
    }
  }

  // http-proxy-option ... (genelde kullanıcı/parola/headers için, atlıyoruz)

  // socks-proxy host port [user] [pass]
  {
    const m = matchLine(/^socks-proxy\s+([^\s]+)\s+(\d+)(?:\s+([^\s]+)\s+([^\s]+))?/i);
    if (m) {
      result.proxy = {
        scheme: 'socks5',
        host: m[1],
        port: parseInt(m[2], 10),
        username: m[3],
        password: m[4],
      };
      return result;
    }
  }

  return result;
}
