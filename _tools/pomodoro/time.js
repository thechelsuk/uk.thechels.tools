const pad = (n) => String(n).padStart(2, "0");

/** Seconds as "MM:SS" for the timer face. */
export function clock(seconds) {
  const s = Math.max(0, Math.round(seconds));
  return `${pad(Math.floor(s / 60))}:${pad(s % 60)}`;
}

/** Seconds as "1h 2m 5s" / "2m 5s". */
export function duration(seconds) {
  const s = Math.round(seconds), h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60);
  return `${h ? `${h}h ` : ""}${m}m ${s % 60}s`;
}

export const summarise = (sessions) => ({ count: sessions.length, total: sessions.reduce((t, s) => t + (s.duration || 0), 0) });
