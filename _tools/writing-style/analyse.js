// Writing checks adapted from Matt Might's shell scripts: weasel words,
// passive voice and accidentally repeated words. Word lists come from the
// tool's front matter so they can be edited without touching code.

const BE_VERBS = new Set(["am", "is", "are", "was", "were", "be", "been", "being"]);

const bare = (word) => word.toLowerCase().replace(/^[^\p{L}\p{N}-]+|[^\p{L}\p{N}-]+$/gu, "");

/** Every word with its offsets, and its trimmed form without surrounding punctuation. */
function words(text) {
  return Array.from(text.matchAll(/\S+/g), (m) => {
    const lead = m[0].match(/^[^\p{L}\p{N}-]*/u)[0].length;
    const core = m[0].slice(lead).replace(/[^\p{L}\p{N}-]+$/u, "");
    return { bare: bare(m[0]), start: m.index + lead, end: m.index + lead + core.length, text: core };
  });
}

/**
 * Returns { weasel, passive, duplicates }, each a list of { text, start, end }
 * where start/end are character offsets into `text`.
 */
export function analyse(text, { weasel_words = [], irregular_verbs = [] } = {}) {
  const weasels = new Set(weasel_words.map((w) => w.toLowerCase()));
  const irregular = new Set(irregular_verbs.map((w) => w.toLowerCase()));
  const list = words(text);
  const out = { weasel: [], passive: [], duplicates: [] };

  list.forEach((w, i) => {
    if (weasels.has(w.bare)) out.weasel.push({ text: w.text, start: w.start, end: w.end });

    const next = list[i + 1];
    if (next && BE_VERBS.has(w.bare) && (next.bare.endsWith("ed") || irregular.has(next.bare))) {
      out.passive.push({ text: text.slice(w.start, next.end), start: w.start, end: next.end });
    }

    const prev = list[i - 1];
    if (prev && w.bare && w.bare === prev.bare) out.duplicates.push({ text: w.text, start: w.start, end: w.end });
  });
  return out;
}
