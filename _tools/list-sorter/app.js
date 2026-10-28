import { $, copyText, setStatus } from "/assets/js/toolkit.js";
import { sortLines } from "./sort.js";

const input = $("#input"), output = $("#output"), status = $("#status");
const opts = { order: $("#order"), unique: $("#unique"), trim: $("#trim") };

function run() {
  const lines = sortLines(input.value, { order: opts.order.value, unique: opts.unique.checked, trim: opts.trim.checked });
  output.value = lines.join("\n");
  const total = input.value.split(/\r?\n/).filter((l) => l.trim()).length;
  $("#in-count").textContent = `${total} items`;
  setStatus(status, total ? `${lines.length} items` : "");
}

input.addEventListener("input", run);
for (const el of Object.values(opts)) el.addEventListener("change", run);
$("#clear").addEventListener("click", () => { input.value = ""; run(); input.focus(); });
$("#copy").addEventListener("click", async () => {
  if (output.value) setStatus(status, (await copyText(output.value)) ? "Copied" : "Copy failed", "ok");
});
