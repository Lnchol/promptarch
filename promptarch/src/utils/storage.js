import { decryptData } from './encryption';

export const loadState = (key, fallback, isEncrypted = false) => {
  try {
    const saved = localStorage.getItem(key);
    if (!saved) return fallback;
    if (isEncrypted) return decryptData(saved) || fallback;
    return JSON.parse(saved);
  } catch (e) { return fallback; }
};
