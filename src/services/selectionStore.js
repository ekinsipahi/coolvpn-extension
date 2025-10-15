// src/services/selectionStore.js
// Oturum boyunca seçimi tutar; ayrıca opsiyonel local fallback
const SES_KEY = 'selectedProfile_session_v1';
const LOC_KEY = 'selectedProfile_local_v1';

export async function saveSelectedProfileSession(profile) {
  try {
    // chrome.storage.session varsa onu kullan
    if (chrome?.storage?.session) {
      await chrome.storage.session.set({ [SES_KEY]: profile });
    } else {
      sessionStorage.setItem(SES_KEY, JSON.stringify(profile));
    }
  } catch {
    // fallback local
    try { localStorage.setItem(SES_KEY, JSON.stringify(profile)); } catch {}
  }
  // opsiyonel: local’e de son seçim (tarayıcı kapanıp açılınca hatırlamak istersen)
  try { await chrome.storage?.local?.set?.({ [LOC_KEY]: profile }); } catch {}
}

export async function loadSelectedProfileSession() {
  // 1) chrome.session
  try {
    if (chrome?.storage?.session) {
      const s = await chrome.storage.session.get(SES_KEY);
      if (s && s[SES_KEY]) return s[SES_KEY];
    }
  } catch {}
  // 2) window.sessionStorage
  try {
    const raw = sessionStorage.getItem(SES_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  // 3) local fallback (tarayıcı yeniden açılırsa)
  try {
    if (chrome?.storage?.local) {
      const s = await chrome.storage.local.get(LOC_KEY);
      if (s && s[LOC_KEY]) return s[LOC_KEY];
    }
  } catch {}
  try {
    const raw = localStorage.getItem(LOC_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}
