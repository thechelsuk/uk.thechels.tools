import { test } from "node:test";
import assert from "node:assert/strict";
import { dmsToDecimal, gpsFromTags, tagRows, formatValue, cleanName } from "../_tools/exif/exif-data.js";

// exif-js returns rationals as Number objects carrying numerator/denominator.
const rational = (n, d) => Object.assign(new Number(n / d), { numerator: n, denominator: d });

test("converts degrees, minutes, seconds to decimal", () => {
  assert.equal(dmsToDecimal([51, 54, 0], "N").toFixed(4), "51.9000");
  assert.equal(dmsToDecimal([2, 4, 30], "W").toFixed(4), "-2.0750");
});

test("reads GPS position when present", () => {
  const gps = gpsFromTags({ GPSLatitude: [51, 54, 0], GPSLatitudeRef: "N", GPSLongitude: [2, 4, 30], GPSLongitudeRef: "W" });
  assert.deepEqual({ lat: gps.lat.toFixed(4), lon: gps.lon.toFixed(4) }, { lat: "51.9000", lon: "-2.0750" });
  assert.equal(gpsFromTags({ Make: "Apple" }), null);
});

test("formats exposure times as fractions and other rationals as decimals", () => {
  assert.equal(formatValue("ExposureTime", rational(1, 250)), "1/250 s");
  assert.equal(formatValue("FNumber", rational(18, 10)), "f/1.8");
  assert.equal(formatValue("FocalLength", rational(26, 1)), "26 mm");
  assert.equal(formatValue("XResolution", rational(72, 1)), "72");
  assert.equal(formatValue("GPSLatitude", [51, 54, 0]), "51, 54, 0");
});

test("lists readable tags, skipping binary blobs, sorted by name", () => {
  const rows = tagRows({ Model: "iPhone", Make: "Apple", MakerNote: [1, 2, 3], thumbnail: {}, UserComment: [0, 0] });
  assert.deepEqual(rows.map((r) => r.name), ["Make", "Model"]);
});

test("hides internal pointer tags", () => {
  const rows = tagRows({ Make: "Apple", GPSInfoIFDPointer: 98, ExifIFDPointer: 40, InteroperabilityIFDPointer: 12 });
  assert.deepEqual(rows.map((r) => r.name), ["Make"]);
});

test("splits camel-case tag names into words", () => {
  assert.equal(cleanName("DateTimeOriginal"), "Date Time Original");
  assert.equal(cleanName("GPSLatitude"), "GPS Latitude");
});
