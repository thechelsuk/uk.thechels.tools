export const mean = (values) => values.reduce((a, b) => a + b, 0) / values.length;

/** Rolling mean over `size` values, aligned to the end of each window (null before it fills). */
export function rollingAverage(values, size) {
  return values.map((_, i) => (i + 1 < size ? null : mean(values.slice(i + 1 - size, i + 1))));
}
