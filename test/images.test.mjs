import { test } from "node:test";
import assert from "node:assert/strict";
import { fitWidth, hasTransparency } from "../_tools/image-to-jpeg/size.js";
import { variants } from "../_tools/image-resize-quality/variants.js";
import { describeContent } from "../_tools/qr/content.js";

test("scales to a target width keeping the aspect ratio, never enlarging", () => {
  assert.deepEqual(fitWidth(4000, 3000, 1000), { width: 1000, height: 750 });
  assert.deepEqual(fitWidth(800, 600, 1000), { width: 800, height: 600 });
  assert.deepEqual(fitWidth(800, 600, 0), { width: 800, height: 600 });
});

test("spots transparent pixels in RGBA data", () => {
  assert.equal(hasTransparency(new Uint8ClampedArray([0, 0, 0, 255, 9, 9, 9, 255])), false);
  assert.equal(hasTransparency(new Uint8ClampedArray([0, 0, 0, 255, 9, 9, 9, 128])), true);
});

test("plans every width and quality combination", () => {
  const v = variants(2000, 1000, { qualities: [0.9, 0.5], scales: [1, 0.5] });
  assert.deepEqual(v.map((x) => `${x.width}x${x.height}@${x.quality}`), ["2000x1000@0.9", "2000x1000@0.5", "1000x500@0.9", "1000x500@0.5"]);
});

test("only links QR content that is a web address", () => {
  assert.deepEqual(describeContent("https://example.com/a"), { kind: "url", href: "https://example.com/a" });
  assert.deepEqual(describeContent("javascript:alert(1)"), { kind: "text" });
  assert.deepEqual(describeContent("WIFI:T:WPA;S:Home;P:secret;;"), { kind: "wifi", network: "Home" });
  assert.deepEqual(describeContent("mailto:a@b.com"), { kind: "email", address: "a@b.com" });
  assert.deepEqual(describeContent("<img src=x onerror=alert(1)>"), { kind: "text" });
});
