import { test } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { makeMatrix, buildSvg, labelLayout } from "../_tools/qr-generator/qr-svg.js";

const qrcode = createRequire(import.meta.url)("qrcode-generator");
const matrix = makeMatrix(qrcode, "https://thechels.uk");

test("makes a square matrix that grows with the version", () => {
  assert.equal(matrix.length, matrix[0].length);
  assert.ok(matrix.length >= 21);
  assert.equal(makeMatrix(qrcode, "https://thechels.uk", { version: 10 }).length, 57);
});

test("encodes text as UTF-8", () => {
  assert.doesNotThrow(() => makeMatrix(qrcode, "Café £5 👋"));
});

test("the label runs up the right edge from the bottom corner, with a line before and after", () => {
  const n = matrix.length, margin = 4;
  const l = labelLayout(n, "thechels.uk", { margin });
  assert.ok(l.x > n + margin && l.x < n + 2 * margin, "label sits in the right margin");
  assert.equal(l.before.from, n + margin, "first line starts at the bottom corner");
  assert.ok(l.before.to > l.textStart, "gap between the first line and the text");
  assert.ok(l.textEnd > l.after.from, "gap between the text and the second line");
  assert.equal(l.after.to, margin, "second line runs to the top of the code");
  assert.ok(l.textStart - l.textEnd < n * 0.6, "label is short enough to leave a line after it");
});

test("the SVG keeps every module, and draws the label rotated to read upwards", () => {
  const { svg, width, height } = buildSvg(matrix, { label: "thechels.uk" });
  assert.equal(width, height);
  assert.match(svg, /^<svg xmlns="http:\/\/www.w3.org\/2000\/svg"/);
  assert.match(svg, /transform="rotate\(-90 /);
  assert.match(svg, /textLength="[\d.]+" lengthAdjust="spacing"/, "text is fitted to its space so both gaps match");
  assert.match(svg, /font-variant="small-caps"/);
  assert.match(svg, />thechels\.uk<\/text>/);
  const drawn = (svg.match(/<path d="([^"]+)" fill/)[1].match(/M/g) || []).length;
  assert.equal(drawn, matrix.flat().filter(Boolean).length, "no modules hidden");
});

test("label text is escaped", () => {
  assert.match(buildSvg(matrix, { label: "<b>&" }).svg, /&lt;b&gt;&amp;/);
});
