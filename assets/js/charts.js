// Chart.js helpers so every chart matches the site's colours in light and dark mode.
//   import { chartColours, chartDefaults, onThemeChange } from "/assets/js/charts.js";

const css = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

export function chartColours() {
  return {
    ink: css("--ink-2"), muted: css("--muted"), grid: css("--line"),
    accent: css("--accent"), spark: css("--spark"), ok: css("--ok"), warn: css("--warn"), bad: css("--bad"),
    series: [css("--accent"), css("--warn"), css("--ok"), css("--bad"), css("--spark")],
  };
}

/** Apply site fonts and colours to Chart.js's global defaults. */
export function chartDefaults(Chart) {
  const c = chartColours();
  Chart.defaults.font.family = getComputedStyle(document.body).fontFamily;
  Chart.defaults.color = c.ink;
  Chart.defaults.borderColor = c.grid;
  Chart.defaults.maintainAspectRatio = false;
  return c;
}

/** Run `callback` when the visitor switches theme or the system theme changes. */
export function onThemeChange(callback) {
  new MutationObserver(callback).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  matchMedia("(prefers-color-scheme: dark)").addEventListener("change", callback);
}
