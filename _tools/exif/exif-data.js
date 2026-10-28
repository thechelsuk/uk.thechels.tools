// Turns the raw tag object from exif-js into things people can read.

const SKIP = new Set(["MakerNote", "UserComment", "thumbnail", "ComponentsConfiguration", "FlashpixVersion", "ExifVersion",
  "ExifIFDPointer", "GPSInfoIFDPointer", "InteroperabilityIFDPointer"]);

export function dmsToDecimal([d, m, s], ref) {
  const value = Number(d) + Number(m) / 60 + Number(s) / 3600;
  return ref === "S" || ref === "W" ? -value : value;
}

/** { lat, lon } when the photo has a GPS position, otherwise null. */
export function gpsFromTags(tags) {
  if (!tags.GPSLatitude || !tags.GPSLongitude) return null;
  return {
    lat: dmsToDecimal(tags.GPSLatitude, tags.GPSLatitudeRef),
    lon: dmsToDecimal(tags.GPSLongitude, tags.GPSLongitudeRef),
  };
}

const round = (n) => String(Math.round(Number(n) * 100) / 100);

export function formatValue(name, value) {
  if (Array.isArray(value)) return value.map((v) => round(v)).join(", ");
  if (value instanceof Number && "numerator" in value) {
    if (name === "ExposureTime" && value.numerator && value < 1) return `1/${Math.round(value.denominator / value.numerator)} s`;
    if (name === "FNumber") return `f/${round(value)}`;
    if (name === "FocalLength") return `${round(value)} mm`;
    return round(value);
  }
  if (typeof value === "number") return round(value);
  return String(value).trim();
}

export const cleanName = (name) => name.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/^GPS(?=[A-Z])/, "GPS ");

// Plain values, arrays and exif-js rationals; not nested objects like thumbnails.
const showable = (v) => v != null && (typeof v !== "object" || Array.isArray(v) || v instanceof Number);

/** Sorted [{ name, label, value }] of tags worth showing. */
export function tagRows(tags) {
  return Object.keys(tags)
    .filter((name) => !SKIP.has(name) && showable(tags[name]))
    .sort()
    .map((name) => ({ name, label: cleanName(name), value: formatValue(name, tags[name]) }));
}
