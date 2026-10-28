// QR code to SVG with an architectural-style label: small caps in grey,
// set vertically in the right margin and reading upwards from the bottom
// corner, with a hairline at mid-height before and after the text (like a
// strikethrough that stops short of the letters). Units are QR modules.

/** Boolean rows from qrcode-generator. version 0 picks the smallest that fits. */
export function makeMatrix(qrcode, text, { ecc = "M", version = 0 } = {}) {
  qrcode.stringToBytes = qrcode.stringToBytesFuncs["UTF-8"];
  const qr = qrcode(version, ecc);
  qr.addData(text, "Byte");
  qr.make();
  const n = qr.getModuleCount();
  return Array.from({ length: n }, (_, r) => Array.from({ length: n }, (_, c) => qr.isDark(r, c)));
}

// Approximate width of tracked small caps, in ems, per character.
const CHAR_EM = 0.62 + 0.2;

/**
 * Where the vertical label goes, in SVG units (y grows downwards):
 * a short line up from the bottom corner, a gap, the text, a gap, then a
 * line on up to the top of the code.
 */
export function labelLayout(n, label, { margin = 4, fontSize = 1.1, lead = 2, gap = 0.7 } = {}) {
  const bottom = n + margin, top = margin;
  const length = label.length * CHAR_EM * fontSize;
  const letterSpacing = fontSize * 0.2;
  const textStart = bottom - lead - gap;
  const textEnd = textStart - length;
  // Tracking adds space after the last letter too; start the second line from
  // where the ink ends, so the gaps either side of the lettering match.
  const inkEnd = textEnd + letterSpacing;
  return {
    x: n + margin + margin / 2,
    fontSize,
    letterSpacing,
    length,
    textStart,
    textEnd,
    before: { from: bottom, to: bottom - lead },
    after: { from: inkEnd - gap, to: top },
  };
}

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const n2 = (v) => Math.round(v * 1000) / 1000;

/** Build the SVG. Returns { svg, width, height }. */
export function buildSvg(matrix, {
  label = "", margin = 4,
  dark = "#14181c", light = "#ffffff", labelColour = "#6e7378",
  font = "thechelsuk, 'Helvetica Neue', Helvetica, Arial, sans-serif",
  fontCss = "", // optional @font-face rules, so a downloaded file carries its font
} = {}) {
  const n = matrix.length;
  const W = n + 2 * margin;
  const text = label.trim().toLowerCase(); // lower case so small caps render as small caps

  let d = "";
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) if (matrix[y][x]) d += `M${x + margin} ${y + margin}h1v1h-1z`;
  }

  let extra = "";
  if (text) {
    const l = labelLayout(n, text, { margin });
    const x = n2(l.x);
    extra = `<path d="M${x} ${n2(l.before.from)}V${n2(l.before.to)}M${x} ${n2(l.after.from)}V${n2(l.after.to)}" fill="none" stroke="${esc(labelColour)}" stroke-width="0.08"/>`
      + `<text x="${x}" y="${n2(l.textStart)}" transform="rotate(-90 ${x} ${n2(l.textStart)})" textLength="${n2(l.length)}" lengthAdjust="spacing" font-family="${esc(font)}" font-size="${l.fontSize}" font-variant="small-caps" letter-spacing="${n2(l.letterSpacing)}" fill="${esc(labelColour)}" text-anchor="start" dominant-baseline="central">${esc(text)}</text>`;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${W}" shape-rendering="crispEdges">`
    + (fontCss && text ? `<defs><style>${fontCss}</style></defs>` : "")
    + `<rect width="${W}" height="${W}" fill="${esc(light)}"/>`
    + `<path d="${d}" fill="${esc(dark)}"/>`
    + `<g shape-rendering="geometricPrecision">${extra}</g></svg>`;
  return { svg, width: W, height: W };
}
