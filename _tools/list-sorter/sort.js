const collator = new Intl.Collator("en-GB", { numeric: true, sensitivity: "base" });

/**
 * Sort lines of text. Blank lines are dropped.
 * order: "asc" | "desc" | "reverse" (keep original order, flipped)
 */
export function sortLines(text, { order = "asc", unique = false, trim = false } = {}) {
  let lines = text.split(/\r?\n/).map((l) => (trim ? l.trim() : l)).filter((l) => l.trim() !== "");
  if (unique) lines = [...new Set(lines)];
  if (order === "reverse") return lines.reverse();
  lines.sort(collator.compare);
  return order === "desc" ? lines.reverse() : lines;
}
