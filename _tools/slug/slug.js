const LETTERS = "abcdefghijklmnopqrstuvwxyz";
const ALPHANUMERIC = LETTERS + "0123456789";

/** Slider positions 1–15 map to these lengths. */
export const SLIDER_LENGTHS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 24, 32, 64];

/** A random integer below `max`, using the browser's secure random source. */
export function secureRandom(max) {
  const values = new Uint32Array(1);
  crypto.getRandomValues(values);
  return values[0] % max;
}

export function generateSlug(length, { letterStart = true, random = secureRandom } = {}) {
  if (length <= 0) return "";
  let slug = letterStart ? LETTERS[random(LETTERS.length) % LETTERS.length] : "";
  while (slug.length < length) slug += ALPHANUMERIC[random(ALPHANUMERIC.length) % ALPHANUMERIC.length];
  return slug;
}
