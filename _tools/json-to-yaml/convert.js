// JSON <-> YAML. The js-yaml library is passed in: the page uses the vendored
// browser build (window.jsyaml) and the tests use the npm package.

const STYLES = {
  block: { indent: 2, noArrayIndent: true },
  flow: { flowLevel: 1, noArrayIndent: true },
  quoted: { styles: { "!!str": "double" }, noArrayIndent: true, quotingType: '"', forceQuotes: true },
};

/** Returns { ok, text, error } and never throws. */
export function convert(input, { direction = "json-yaml", style = "block", indent = 2 } = {}, yaml) {
  if (!input.trim()) return { ok: true, text: "", error: "" };
  if (direction === "yaml-json") {
    try {
      return { ok: true, text: JSON.stringify(yaml.load(input), null, indent), error: "" };
    } catch (e) {
      return { ok: false, text: "", error: `Invalid YAML: ${e.reason || e.message}` };
    }
  }
  let data;
  try {
    data = JSON.parse(input);
  } catch (e) {
    return { ok: false, text: "", error: `Invalid JSON: ${e.message}` };
  }
  return { ok: true, text: yaml.dump(data, STYLES[style] || STYLES.block), error: "" };
}
