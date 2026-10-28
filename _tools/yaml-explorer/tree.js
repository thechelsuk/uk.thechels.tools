// What to show for each value in the YAML tree.

const plural = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`;

export function describe(value) {
  if (Array.isArray(value)) return { kind: "array", label: plural(value.length, "item") };
  if (value === null || value === undefined) return { kind: "null", label: "null" };
  if (value instanceof Date) return { kind: "string", label: value.toISOString() };
  if (typeof value === "object") return { kind: "object", label: plural(Object.keys(value).length, "key") };
  if (typeof value === "string") return { kind: "string", label: JSON.stringify(value) };
  return { kind: typeof value, label: String(value) };
}
