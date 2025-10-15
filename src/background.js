// background.js (MV3 service worker)

let currentProxyAuth = null; // { host, port, username, password }
const STATE_KEY = 'cvpn_bg_state_v1';
const PREFS_KEY = 'cvpn_prefs';

// ---- DNR Rule IDs ----
const RULE_ID_KILLSWITCH = 900000;
const RULE_ID_ADBLOCK_BASE = 100000; // 100000..100099
const RULE_ID_ALLOW_EXTENSION = 990000; // extension initiator allow

// Kill-switch allowlist (izin verilecek hedef domainler)
const KILL_SWITCH_ALLOW = [
  'localhost',
  '127.0.0.1',
  'chromewebstore.google.com',
  'clients2.google.com',
  'update.googleapis.com',
  'googleusercontent.com',
  'raw.githubusercontent.com',
  'coolvpn.example',
  'https://coolvpn.app',
  'coolvpn.com',
];

// Basit ad/tracker listesi (istersen genişlet/remote çek)
const AD_HOSTS = [
  'doubleclick.net',
  'googlesyndication.com',
  'googleadservices.com',
  'google-analytics.com',
  'facebook.com/tr',
  'graph.facebook.com',
  'connect.facebook.net',
  'hotjar.com',
  'segment.com',
  'mixpanel.com',
  'criteo.com',
  'taboola.com',
  'outbrain.com',
  'scorecardresearch.com',
  'quantserve.com',
  'adservice.google.com',
  'adform.net',
  'adnxs.com',
  'rubiconproject.com',
  'moatads.com',
];

// ---- storage helpers ----
async function loadState() {
  try { const a = await chrome.storage.local.get([STATE_KEY]); if (a && a[STATE_KEY]) return a[STATE_KEY]; } catch {}
  return { proxyEnabled: false, killSwitch: false, adBlock: false };
}
async function saveState(state) {
  try { await chrome.storage.local.set({ [STATE_KEY]: state }); } catch {}
}
async function loadPrefs() {
  try { const s = await chrome.storage.sync.get([PREFS_KEY]); if (s && s[PREFS_KEY]) return s[PREFS_KEY]; } catch {}
  try { const s = await chrome.storage.local.get([PREFS_KEY]); if (s && s[PREFS_KEY]) return s[PREFS_KEY]; } catch {}
  try { const raw = localStorage.getItem(PREFS_KEY); if (raw) return JSON.parse(raw); } catch {}
  return null;
}

// ---- proxy helpers ----
function proxySet(value, scope = "regular") {
  return new Promise((resolve, reject) => {
    try {
      chrome.proxy.settings.set({ value, scope }, () => {
        const err = chrome.runtime.lastError;
        if (err) reject(err); else resolve();
      });
    } catch (e) { reject(e); }
  });
}

// ---- DNR rule builders ----
function buildKillSwitchRule() {
  // Tüm istekleri blokla; allowlist’teki hedef domainler hariç.
  return {
    id: RULE_ID_KILLSWITCH,
    priority: 10000,
    action: { type: "block" },
    condition: {
      resourceTypes: [
        "main_frame","sub_frame","script","xmlhttprequest","image",
        "font","media","websocket","ping","other"
      ],
      excludedDomains: KILL_SWITCH_ALLOW
    }
  };
}
function buildAdRules() {
  const types = ["script","xmlhttprequest","image","sub_frame","media","font","ping","other"];
  return AD_HOSTS.map((host, i) => ({
    id: RULE_ID_ADBLOCK_BASE + i,
    priority: 1000,
    action: { type: "block" },
    condition: { urlFilter: host, resourceTypes: types }
  }));
}

// Extension’ın başlattığı *tüm* istekleri izinli yap (her şeyden önce)
function buildAllowExtensionRule() {
  const types = [
    "main_frame","sub_frame","script","xmlhttprequest","image",
    "font","media","websocket","ping","other"
  ];
  return {
    id: RULE_ID_ALLOW_EXTENSION,
    priority: 20000, // block kuralından yüksek
    action: { type: "allow" },
    condition: {
      initiatorDomains: [chrome.runtime.id], // extension-id domain olarak kullanılır
      resourceTypes: types
    }
  };
}

// Her zaman mevcut tut
async function ensureAllowExtensionRule() {
  try {
    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: [RULE_ID_ALLOW_EXTENSION],
      addRules: [buildAllowExtensionRule()]
    });
  } catch (e) {
    console.warn('[bg] ensureAllowExtensionRule failed:', e);
  }
}

async function applyKillSwitchRules(state) {
  const want = !!state.killSwitch && !state.proxyEnabled;
  try {
    await ensureAllowExtensionRule();
    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: [RULE_ID_KILLSWITCH],
      addRules: want ? [buildKillSwitchRule()] : []
    });
    console.log('[bg] kill-switch applied, active =', want);
  } catch (e) {
    console.error('[bg] applyKillSwitchRules error:', e);
  }
}
async function applyAdBlockRules(state) {
  const adIds = AD_HOSTS.map((_, i) => RULE_ID_ADBLOCK_BASE + i);
  try {
    await ensureAllowExtensionRule();
    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: adIds,
      addRules: state.adBlock ? buildAdRules() : []
    });
    console.log('[bg] adblock applied, active =', !!state.adBlock);
  } catch (e) {
    console.error('[bg] applyAdBlockRules error:', e);
  }
}

// ---- mesajlar ----
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  (async () => {
    try {
      if (!msg || !msg.type) throw new Error("No message type");

      if (msg.type === "ENABLE_PROXY") {
        const { cfg, usePAC = false } = msg.payload || {};
        if (!cfg || !cfg.host || !cfg.port) throw new Error("Invalid proxy config (host/port missing)");
        if (usePAC) throw new Error("PAC path not implemented in this sample");

        const value = {
          mode: "fixed_servers",
          rules: {
            singleProxy: {
              scheme: (cfg.scheme || "socks5").toLowerCase(),
              host: cfg.host,
              port: Number(cfg.port)
            },
            bypassList: ["<local>", "localhost", "127.0.0.1", "::1"]
          }
        };
        await proxySet(value);

        currentProxyAuth = (cfg.username && cfg.password) ? {
          host: cfg.host, port: Number(cfg.port),
          username: String(cfg.username), password: String(cfg.password)
        } : null;

        const st = await loadState();
        st.proxyEnabled = true;
        await saveState(st);
        await applyKillSwitchRules(st); // kill-switch gerekli ise kaldır
        sendResponse({ ok: true });
        return;
      }

      if (msg.type === "DISABLE_PROXY") {
        await proxySet({ mode: "direct" });
        currentProxyAuth = null;

        const st = await loadState();
        st.proxyEnabled = false;
        await saveState(st);
        await applyKillSwitchRules(st); // kill-switch açıksa tümünü blokla
        sendResponse({ ok: true });
        return;
      }

      if (msg.type === "SET_KILL_SWITCH") {
        const enabled = !!msg?.payload?.enabled;
        const st = await loadState();
        st.killSwitch = enabled;
        await saveState(st);
        await applyKillSwitchRules(st);
        sendResponse({ ok: true });
        return;
      }

      if (msg.type === "SET_ADBLOCK") {
        const enabled = !!msg?.payload?.enabled;
        const st = await loadState();
        st.adBlock = enabled;
        await saveState(st);
        await applyAdBlockRules(st);
        sendResponse({ ok: true });
        return;
      }

      if (msg.type === "GET_PROXY_STATUS") {
        const st = await loadState();
        sendResponse({ ok: true, enabled: !!st.proxyEnabled });
        return;
      }

      // Debug: dinamik kuralları getir
      if (msg.type === "GET_DNR_DEBUG") {
        const rules = await chrome.declarativeNetRequest.getDynamicRules();
        sendResponse({ ok: true, rules });
        return;
      }

      throw new Error(`Unknown message type: ${msg.type}`);
    } catch (e) {
      console.error("[background] error:", e);
      sendResponse({ ok: false, error: String(e && e.message || e) });
    }
  })();
  return true;
});

// ---- proxy auth ----
chrome.webRequest.onAuthRequired.addListener(
  (details, callback) => {
    try {
      if (details.isProxy && currentProxyAuth) {
        callback({ authCredentials: { username: currentProxyAuth.username, password: currentProxyAuth.password } });
      } else {
        callback();
      }
    } catch (e) { console.warn("[background] onAuthRequired error:", e); callback(); }
  },
  { urls: ["<all_urls>"] },
  ["asyncBlocking"]
);

// ---- kurulum/başlangıç ----
async function applyFromPrefsOnStart() {
  try {
    const st = await loadState();
    const prefs = await loadPrefs();
    if (prefs) {
      st.killSwitch = !!prefs.killSwitch;
      st.adBlock   = !!prefs.adBlock;
      await saveState(st);
    }
    st.proxyEnabled = !!st.proxyEnabled;

    await ensureAllowExtensionRule();
    await applyAdBlockRules(st);
    await applyKillSwitchRules(st);
  } catch (e) {
    console.warn("[background] applyFromPrefsOnStart failed:", e);
  }
}

chrome.runtime.onInstalled.addListener(async () => {
  try { await proxySet({ mode: "direct" }); } catch (e) {
    console.warn("[background] onInstalled proxySet direct failed:", e);
  }
  await applyFromPrefsOnStart();
});
chrome.runtime.onStartup?.addListener?.(applyFromPrefsOnStart);

// Prefs değişimleri de uygula (double safety)
chrome.storage.onChanged.addListener(async (changes, area) => {
  if ((area === 'sync' || area === 'local') && changes[PREFS_KEY]?.newValue) {
    try {
      const st = await loadState();
      const p = changes[PREFS_KEY].newValue || {};
      st.killSwitch = !!p.killSwitch;
      st.adBlock = !!p.adBlock;
      await saveState(st);
      await ensureAllowExtensionRule();
      await applyAdBlockRules(st);
      await applyKillSwitchRules(st);
    } catch (e) {
      console.warn("[background] apply from storage change failed:", e);
    }
  }
});
