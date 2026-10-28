/** Columns and rows for a near-square grid of `n` tiles. */
export function gridSize(n) {
  if (!n) return { cols: 0, rows: 0 };
  const cols = Math.ceil(Math.sqrt(n));
  return { cols, rows: Math.ceil(n / cols) };
}
