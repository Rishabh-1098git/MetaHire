const KEY = 'mh_user_v1';
const TTL = 3 * 60 * 1000; // 3 minutes

export const getCachedUser = () => {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    if (Date.now() - ts > TTL) { localStorage.removeItem(KEY); return null; }
    return data;
  } catch { return null; }
};

export const setCachedUser = (data) => {
  try { localStorage.setItem(KEY, JSON.stringify({ data, ts: Date.now() })); } catch {}
};

export const clearCachedUser = () => {
  try { localStorage.removeItem(KEY); } catch {}
};
