// QR code to SVG, with an architectural-style label: tracked small caps in
// grey, on a plate with a hairline rule, either set into the centre of the
// code or in a title strip beneath it. Units are QR modules throughout.

const FINDER = 8; // a finder square plus its separator

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

/** True if the plate stays out of all three finder squares. */
export function finderClear(size, p) {
  const hits = (x0, y0) => p.x < x0 + FINDER && p.x + p.w > x0 && p.y < y0 + FINDER && p.y + p.h > y0;
  return !hits(0, 0) && !hits(size - FINDER, 0) && !hits(0, size - FINDER);
}

/** Centre plate for a label: on the module grid, centred, and small enough to scan. */
export function plateFor(size, label) {
  const sameParity = (v) => (v % 2 === size % 2 ? v : v + 1);
  const h = sameParity(Math.max(5, Math.round(size * 0.16)));
  // Centred vertically, the plate sits between the finder squares, so it can run
  // nearly edge to edge; its area is what limits how much of the code it hides.
  const maxW = Math.min(size - 6, Math.floor((size * size * 0.15) / h));
  let fontSize = h * 0.34;
  const pad = h * 0.55;
  let w = Math.ceil(label.length * CHAR_EM * fontSize + 2 * pad);
  if (w > maxW) {
    w = maxW;
    fontSize = Math.max(1.2, (w - 2 * pad) / (label.length * CHAR_EM));
  }
  w = sameParity(Math.min(w, maxW));
  if (w > maxW) w -= 2;
  return { x: (size - w) / 2, y: (size - h) / 2, w, h, fontSize };
}

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const n2 = (v) => Math.round(v * 1000) / 1000;

/**
 * Build the SVG. Returns { svg, plate } where plate is the cleared area
 * (in matrix modules) for a centre label, or null.
 */
export function buildSvg(matrix, {
  label = "", placement = "centre", margin = 4,
  dark = "#14181c", light = "#ffffff", labelColour = "#6e7378",
  font = "thechelsuk, 'Helvetica Neue', Helvetica, Arial, sans-serif",
  fontCss = "", // optional @font-face rules, so a downloaded file carries its font
} = {}) {
  const n = matrix.length;
  const text = label.trim().toLowerCase(); // lower case so small caps render as small caps
  const plate = text && placement === "centre" ? plateFor(n, text) : null;
  const strip = text && placement === "below" ? 6 : 0;
  const W = n + 2 * margin, H = W + strip;
  const inPlate = (x, y) => plate && x >= plate.x && x < plate.x + plate.w && y >= plate.y && y < plate.y + plate.h;

  let d = "";
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) if (matrix[y][x] && !inPlate(x, y)) d += `M${x + margin} ${y + margin}h1v1h-1z`;
  }

  const hair = 0.09;
  const type = (cx, cy, size) =>
    `<text x="${n2(cx)}" y="${n2(cy)}" font-family="${esc(font)}" font-size="${n2(size)}" font-variant="small-caps" letter-spacing="${n2(size * 0.2)}" fill="${esc(labelColour)}" text-anchor="middle" dominant-baseline="central">${esc(text)}</text>`;

  let extra = "";
  if (plate) {
    const px = plate.x + margin, py = plate.y + margin, inset = 0.7;
    extra += `<rect x="${px}" y="${py}" width="${plate.w}" height="${plate.h}" fill="${esc(light)}"/>`;
    extra += `<rect x="${n2(px + inset)}" y="${n2(py + inset)}" width="${n2(plate.w - 2 * inset)}" height="${n2(plate.h - 2 * inset)}" fill="none" stroke="${esc(labelColour)}" stroke-width="${hair}"/>`;
    extra += type(px + plate.w / 2, py + plate.h / 2 + 0.05, plate.fontSize);
  } else if (strip) {
    // A dimension-line style rule with end ticks, and the label under it.
    const y = W - margin / 2, x0 = margin, x1 = W - margin, tick = 0.7;
    extra += `<path d="M${x0} ${y}H${x1}M${x0} ${n2(y - tick)}v${tick * 2}M${x1} ${n2(y - tick)}v${tick * 2}" fill="none" stroke="${esc(labelColour)}" stroke-width="${hair}"/>`;
    extra += type(W / 2, y + strip / 2, 2);
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" shape-rendering="crispEdges">`
    + (fontCss && text ? `<defs><style>${fontCss}</style></defs>` : "")
    + `<rect width="${W}" height="${H}" fill="${esc(light)}"/>`
    + `<path d="${d}" fill="${esc(dark)}"/>`
    + `<g shape-rendering="geometricPrecision">${extra}</g></svg>`;
  return { svg, plate, width: W, height: H };
}
