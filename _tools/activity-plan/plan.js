// Date and scoring helpers for the activity plan. Dates are local calendar
// days; keys look like "2026-01-05" and cells like "2026-01-05-14" (2pm).

export function addDays(date, n) {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate() + n);
  return d;
}

const pad = (n) => String(n).padStart(2, "0");
export const isoDate = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const ukDate = (d) => d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" }).replace(",", "");
export const fromIso = (s) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };

export function nextLevel(current, levels) {
  const i = levels.indexOf(current ?? levels[0]);
  return levels[(i + 1) % levels.length];
}

/** Effort points for a day: low = 1, medium = 2, high = 3. Sleep and rest score 0. */
export function dayLoad(plan, dayKey, levels) {
  let total = 0;
  for (let h = 0; h < 24; h++) total += Math.max(0, levels.indexOf(plan[`${dayKey}-${h}`] ?? levels[0]) - 2);
  return total;
}

/** [{ date, key, week }] for `weeks` weeks from `start`. */
export function planDays(start, weeks) {
  return Array.from({ length: weeks * 7 }, (_, i) => {
    const date = addDays(start, i);
    return { date, key: isoDate(date), week: Math.floor(i / 7) + 1 };
  });
}
