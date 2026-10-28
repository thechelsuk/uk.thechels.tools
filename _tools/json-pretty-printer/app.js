import { $, config, copyText, downloadText, setStatus } from "/assets/js/toolkit.js";
import { formatJson } from "./format.js";

const input = $("#input");
const output = $("#output");
const status = $("#status");
const options = { indent: $("#indent"), mode: $("#mode"), sort: $("#sort") };

const SAMPLE = config().sample || "";

function run() {
  $("#count").textContent = `${input.value.length.toLocaleString()} chars`;
  const result = formatJson(input.value, {
    indent: options.indent.value,
    mode: options.mode.value,
    sort: options.sort.checked,
  });
  output.value = result.text;
  if (!input.value.trim()) setStatus(status, "");
  else if (result.ok) setStatus(status, "● Valid JSON", "ok");
  else setStatus(status, result.error, "error");
}

input.addEventListener("input", run);
for (const el of Object.values(options)) el.addEventListener("change", run);

$("#sample").addEventListener("click", () => { input.value = SAMPLE; run(); input.focus(); });
$("#clear").addEventListener("click", () => { input.value = ""; run(); input.focus(); });
$("#copy").addEventListener("click", async () => {
  if (!output.value) return;
  setStatus(status, (await copyText(output.value)) ? "Copied" : "Copy failed", "ok");
});
$("#download").addEventListener("click", () => {
  if (output.value) downloadText("formatted.json", output.value, "application/json");
});
