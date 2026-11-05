const key = "socialgood:auth-success";
const maxAge = 10 * 60 * 1000;

export function queueAuthSuccess(message: string) {
  try { sessionStorage.setItem(key, JSON.stringify({ message, at: Date.now() })); } catch { /* Sign-in still works without storage. */ }
}

export function clearAuthSuccess() {
  try { sessionStorage.removeItem(key); } catch { /* Storage can be unavailable. */ }
}

export function consumeAuthSuccess(): string | null {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    sessionStorage.removeItem(key);
    const item = JSON.parse(raw);
    if (typeof item.message !== "string" || item.message.length > 160 || typeof item.at !== "number") return null;
    const age = Date.now() - item.at;
    return age >= 0 && age <= maxAge ? item.message : null;
  } catch { return null; }
}
