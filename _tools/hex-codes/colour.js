// Colour maths for the hex code tool.

/** "#abc", "abc", "#aabbcc" or "aabbcc" -> { hex, r, g, b }, or null if invalid. */
export function parseHex(input) {
  let h = String(input).trim().replace(/^#/, "");
  if (/^[0-9a-f]{3}$/i.test(h)) h = [...h].map((c) => c + c).join("");
  if (!/^[0-9a-f]{6}$/i.test(h)) return null;
  const n = Number.parseInt(h, 16);
  return { hex: `#${h.toUpperCase()}`, r: n >> 16, g: (n >> 8) & 255, b: n & 255 };
}

export function toHsl({ r, g, b }) {
  const [R, G, B] = [r, g, b].map((v) => v / 255);
  const max = Math.max(R, G, B), min = Math.min(R, G, B), d = max - min;
  const l = (max + min) / 2;
  if (!d) return { h: 0, s: 0, l: Math.round(l * 100) };
  const s = d / (1 - Math.abs(2 * l - 1));
  let h = max === R ? ((G - B) / d) % 6 : max === G ? (B - R) / d + 2 : (R - G) / d + 4;
  h = Math.round(h * 60);
  return { h: h < 0 ? h + 360 : h, s: Math.round(s * 100), l: Math.round(l * 100) };
}

const channel = (v) => { const c = v / 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
const luminance = ({ r, g, b }) => 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);

/** WCAG 2 contrast ratio between two colours, from 1 to 21. */
export function contrastRatio(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

const WHITE = { r: 255, g: 255, b: 255 }, BLACK = { r: 0, g: 0, b: 0 };
export const bestTextColour = (c) => (contrastRatio(c, WHITE) >= contrastRatio(c, BLACK) ? "white" : "black");
export const contrastWith = (c) => ({ white: contrastRatio(c, WHITE), black: contrastRatio(c, BLACK) });
