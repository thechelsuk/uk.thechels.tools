/** Move every name one role along (the last wraps to the first). Empty roles stay empty. */
export function rotate(names) {
  const filled = names.map((n, i) => [n.trim(), i]).filter(([n]) => n);
  if (filled.length < 2) return [...names];
  const out = names.map(() => "");
  filled.forEach(([, slot], k) => { out[slot] = filled[(k - 1 + filled.length) % filled.length][0]; });
  return out;
}
