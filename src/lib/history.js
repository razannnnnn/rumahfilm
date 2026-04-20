const HISTORY_KEY = "rumahfilm_history";
const MAX_HISTORY = 20;

export function getHistory() {
  try {
    const data = localStorage.getItem(HISTORY_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveHistory({ id, title, currentTime, poster }) {
  try {
    const history = getHistory();
    const existing = history.findIndex((h) => h.id === id);

    const entry = {
      id,
      title,
      poster: poster || null,
      currentTime: Math.floor(currentTime),
      watchedAt: new Date().toISOString(),
    };

    if (existing !== -1) {
      history[existing] = entry;
    } else {
      history.unshift(entry);
      if (history.length > MAX_HISTORY) history.pop();
    }

    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch {}
}

export function getFilmProgress(id) {
  try {
    const history = getHistory();
    const entry = history.find((h) => h.id === id);
    return entry ? entry.currentTime : 0;
  } catch {
    return 0;
  }
}

export function removeHistory(id) {
  try {
    const history = getHistory().filter((h) => h.id !== id);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch {}
}

export function clearHistory() {
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch {}
}

export function formatWatchedAt(isoString) {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Baru saja";
  if (diffMins < 60) return `${diffMins} menit lalu`;
  if (diffHours < 24) return `${diffHours} jam lalu`;
  if (diffDays < 7) return `${diffDays} hari lalu`;
  return date.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

export function formatDuration(seconds) {
  if (!seconds) return "0:00";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}j ${String(m).padStart(2, "0")}m`;
  return `${m}:${String(s).padStart(2, "0")}`;
}