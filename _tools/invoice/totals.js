const pence = (n) => Math.round((Number(n) || 0) * 100);

/** Line totals, subtotal, tax and total for invoice items, worked in whole pence. */
export function totals(items, taxRate) {
  const lines = items.map((i) => Math.round((Number(i.qty) || 0) * pence(i.price)));
  const subtotal = lines.reduce((a, b) => a + b, 0);
  const tax = Math.round((subtotal * (Number(taxRate) || 0)) / 100);
  return { lines: lines.map((p) => p / 100), subtotal: subtotal / 100, tax: tax / 100, total: (subtotal + tax) / 100 };
}
