// Put every table in a scrollable .table-wrap, so on narrow screens it keeps
// its width and scrolls sideways instead of squashing its columns.
export function wrapTables(root = document) {
  for (const table of root.querySelectorAll("table")) {
    if (table.parentElement?.classList.contains("table-wrap")) continue;
    const wrap = document.createElement("div");
    wrap.className = "table-wrap";
    wrap.tabIndex = 0; // keyboard users can scroll it too
    wrap.setAttribute("role", "region");
    wrap.setAttribute("aria-label", table.caption?.textContent || "Table");
    table.replaceWith(wrap);
    wrap.append(table);
  }
}
