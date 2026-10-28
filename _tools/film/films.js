// Film catalogue helpers: tidy records, merge uploads, and rank search results.

const cap = (k) => k.charAt(0).toUpperCase() + k.slice(1).toLowerCase();

/** Capitalise keys (title -> Title), make values strings, and drop untitled records. */
export function normalise(records) {
  return (Array.isArray(records) ? records : [])
    .filter((r) => r && typeof r === "object")
    .map((r) => Object.fromEntries(Object.entries(r).map(([k, v]) => [cap(k), v == null ? "" : String(v).trim()])))
    .filter((r) => r.Title);
}

const key = (f) => (f.Imdb ? f.Imdb.toUpperCase() : `${f.Title.toLowerCase()}|${f.Year || ""}`);

/** Combine two lists; later records replace earlier ones with the same key. */
export function merge(existing, incoming) {
  const map = new Map();
  for (const f of [...existing, ...incoming]) map.set(key(f), f);
  return [...map.values()];
}

export function levenshtein(a, b) {
  a = a.toLowerCase(); b = b.toLowerCase();
  if (!a) return b.length;
  if (!b) return a.length;
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const row = [i];
    for (let j = 1; j <= b.length; j++) row[j] = Math.min(prev[j] + 1, row[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    prev = row;
  }
  return prev[b.length];
}

/** Best `limit` matches: substring matches first (earliest position), then closest spelling. */
export function search(films, query, limit = 10) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return films
    .map((f) => ({ f, at: f.Title.toLowerCase().indexOf(q), d: levenshtein(q, f.Title) }))
    .sort((a, b) => {
      if (a.at !== -1 && b.at !== -1) return a.at - b.at || a.f.Title.localeCompare(b.f.Title);
      if (a.at !== -1) return -1;
      if (b.at !== -1) return 1;
      return a.d - b.d || a.f.Title.localeCompare(b.f.Title);
    })
    .slice(0, limit)
    .map((x) => x.f);
}
