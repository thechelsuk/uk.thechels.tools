// Pure JSON formatting logic, shared by the page and the tests.

/** Recursively sort object keys A–Z. Arrays keep their order. */
export function sortKeys(value) {
  if (Array.isArray(value)) return value.map(sortKeys);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.keys(value).sort().map((k) => [k, sortKeys(value[k])]));
  }
  return value;
}

/**
 * Format a JSON string.
 * options.indent: "2" | "4" | "tab"   options.mode: "pretty" | "min"   options.sort: boolean
 * Returns { ok, text, error } and never throws.
 */
export function formatJson(input, { indent = "2", mode = "pretty", sort = false } = {}) {
  if (!input.trim()) return { ok: true, text: "", error: "" };
  try {
    let data = JSON.parse(input);
    if (sort) data = sortKeys(data);
    const space = indent === "tab" ? "\t" : Number(indent);
    const text = mode === "min" ? JSON.stringify(data) : JSON.stringify(data, null, space);
    return { ok: true, text, error: "" };
  } catch (e) {
    return { ok: false, text: "", error: e.message };
  }
}
