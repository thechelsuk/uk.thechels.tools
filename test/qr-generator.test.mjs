import { test } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { makeMatrix, plateFor, buildSvg, finderClear } from "../_tools/qr-generator/qr-svg.js";

const qrcode = createRequire(import.meta.url)("qrcode-generator");

test("makes a square matrix that grows with the version", () => {
  const m = makeMatrix(qrcode, "https://thechels.uk", { ecc: "H" });
  assert.equal(m.length, m[0].length);
  assert.ok(m.length >= 25);
  assert.ok(makeMatrix(qrcode, "https://thechels.uk", { ecc: "H", version: 10 }).length === 57);
});

test("encodes text as UTF-8", () => {
  assert.doesNotThrow(() => makeMatrix(qrcode, "Café £5 👋", { ecc: "M" }));
});

test("the centre plate is centred, on the grid, and keeps clear of the finder squares", () => {
  const size = 37;
  const p = plateFor(size, "thechels.uk");
  assert.equal(p.x + p.w / 2, size / 2);
  assert.ok(Number.isInteger(p.x) && Number.isInteger(p.y) && Number.isInteger(p.w) && Number.isInteger(p.h));
  assert.ok(finderClear(size, p));
  assert.ok((p.w * p.h) / (size * size) < 0.16, "plate covers too much of the code");
});

test("a longer label gets a wider plate, up to a limit", () => {
  assert.ok(plateFor(41, "a much longer label here").w > plateFor(41, "abc").w);
  assert.ok(finderClear(41, plateFor(41, "x".repeat(80))));
});

test("the SVG has the quiet zone, the label in small caps, and no modules under the plate", () => {
  const m = makeMatrix(qrcode, "https://thechels.uk", { ecc: "H" });
  const { svg, plate } = buildSvg(m, { label: "thechels.uk", placement: "centre" });
  assert.match(svg, /^<svg xmlns="http:\/\/www.w3.org\/2000\/svg"/);
  assert.match(svg, /viewBox="0 0 (\d+) \1"/);
  assert.match(svg, /font-variant="small-caps"/);
  assert.match(svg, />thechels\.uk<\/text>/);
  const d = svg.match(/<path d="([^"]+)"/)[1];
  for (const [, x, y] of d.matchAll(/M(\d+) (\d+)/g)) {
    const inside = +x - 4 >= plate.x && +x - 4 < plate.x + plate.w && +y - 4 >= plate.y && +y - 4 < plate.y + plate.h;
    assert.ok(!inside, `module drawn under the plate at ${x},${y}`);
  }
});

test("a label below the code adds a title strip instead of covering modules", () => {
  const m = makeMatrix(qrcode, "https://thechels.uk", { ecc: "M" });
  const { svg, plate } = buildSvg(m, { label: "thechels.uk", placement: "below" });
  const [, w, h] = svg.match(/viewBox="0 0 (\d+(?:\.\d+)?) (\d+(?:\.\d+)?)"/).map(Number);
  assert.ok(h > w);
  assert.equal(plate, null);
});

test("label text is escaped", () => {
  const m = makeMatrix(qrcode, "x", { ecc: "H" });
  assert.match(buildSvg(m, { label: "<b>&" }).svg, /&lt;b&gt;&amp;/);
});
