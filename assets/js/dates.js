// Table cells that hold a date shouldn't wrap mid-date ("2026-02-" / "28").

const MONTH = "(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*";
const DATE = new RegExp(
  "^(?:" +
    "\\d{4}[-:]\\d{2}[-:]\\d{2}" +                         // 2026-02-28, or 2026:02:28 in Exif
    "|\\d{1,2}/\\d{1,2}/\\d{2,4}" +                        // 28/02/2026
    `|(?:[a-z]{3}\\s+)?\\d{1,2}\\s+${MONTH}(?:\\s+\\d{4})?` + // Sat 28 Mar, 28 February 2026
  ")\\b",
  "i",
);

export const looksLikeDate = (text) => DATE.test(text.trim());

/** Give every date cell in `root` the `nowrap` class, now and as tables change. */
export function markDateCells(root = document) {
  const mark = () => {
    for (const cell of root.querySelectorAll("td:not(.nowrap), th:not(.nowrap)")) {
      if (cell.children.length <= 1 && looksLikeDate(cell.textContent)) cell.classList.add("nowrap");
    }
  };
  mark();
  new MutationObserver(mark).observe(root.body ?? root, { childList: true, subtree: true });
}
