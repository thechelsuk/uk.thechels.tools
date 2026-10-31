import { test } from "node:test";
import assert from "node:assert/strict";
import { WEB_WIDTH, targetSize, webpName } from "../_tools/image-to-webp/webp.js";

test("keeps the original size when the resize toggle is off", () => {
  assert.deepEqual(targetSize(2000, 1000, false), { width: 2000, height: 1000 });
});

test("resizes to 832px wide keeping proportions when the toggle is on", () => {
  assert.equal(WEB_WIDTH, 832);
  assert.deepEqual(targetSize(2000, 1000, true), { width: 832, height: 416 });
  assert.deepEqual(targetSize(1000, 750, true), { width: 832, height: 624 });
});

test("never enlarges an image narrower than 832px", () => {
  assert.deepEqual(targetSize(640, 480, true), { width: 640, height: 480 });
});

test("names the download after the original file", () => {
  assert.equal(webpName("holiday.photo.JPG"), "holiday.photo.webp");
  assert.equal(webpName("screenshot.png", { width: 832 }), "screenshot-832w.webp");
  assert.equal(webpName(""), "image.webp");
});
