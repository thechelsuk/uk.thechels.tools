// SQL formatting logic. The formatter function is passed in, so the page can
// use the vendored browser build and the tests can use the npm package.

export function buildOptions({ dialect = "sql", tabWidth = "2", keywordCase = "preserve", indentStyle = "standard" } = {}) {
  const width = Number.parseInt(tabWidth, 10);
  return {
    language: dialect,
    tabWidth: Number.isNaN(width) ? 2 : Math.min(8, Math.max(1, width)),
    keywordCase,
    indentStyle,
  };
}

/** Returns { ok, text, error } and never throws. */
export function formatSql(sql, values, format) {
  if (!sql.trim()) return { ok: true, text: "", error: "" };
  try {
    return { ok: true, text: format(sql, buildOptions(values)), error: "" };
  } catch (e) {
    return { ok: false, text: "", error: e.message };
  }
}
