import { $, config } from "/assets/js/toolkit.js";
import { analyse } from "./analyse.js";

const settings = config();
const input = $("#input"), output = $("#output");

// Turn findings into non-overlapping highlighted ranges, earliest first.
function ranges(found) {
  const all = [
    ...found.weasel.map((f) => ({ ...f, kind: "weasel" })),
    ...found.passive.map((f) => ({ ...f, kind: "passive" })),
    ...found.duplicates.map((f) => ({ ...f, kind: "duplicate" })),
  ].sort((a, b) => a.start - b.start);
  const kept = [];
  for (const r of all) if (!kept.length || r.start >= kept.at(-1).end) kept.push(r);
  return kept;
}

function render() {
  const text = input.value;
  const found = analyse(text, settings);
  const parts = [];
  let at = 0;
  for (const r of ranges(found)) {
    parts.push(document.createTextNode(text.slice(at, r.start)));
    parts.push(Object.assign(document.createElement("mark"), { className: `ws-${r.kind}`, textContent: text.slice(r.start, r.end) }));
    at = r.end;
  }
  parts.push(document.createTextNode(text.slice(at)));
  output.replaceChildren(...parts);

  for (const key of ["weasel", "passive", "duplicates"]) $(`#n-${key}`).textContent = found[key].length;
  $("#count").textContent = `${(text.match(/\S+/g) || []).length} words`;
}

input.addEventListener("input", render);
$("#sample").addEventListener("click", () => { input.value = settings.sample || ""; render(); });
render();
