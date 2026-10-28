import { $, config, copyText, downloadText, setStatus } from "/assets/js/toolkit.js";
import { formatSql } from "./format.js";

// sql-formatter's browser build sets a global `sqlFormatter`.
const { format } = window.sqlFormatter;

const input = $("#input");
const output = $("#output");
const status = $("#status");
const fields = ["dialect", "tabWidth", "keywordCase", "indentStyle"].map((id) => $(`#${id}`));

const SAMPLE = config().sample || "";

function run() {
  $("#count").textContent = `${input.value.length.toLocaleString()} chars`;
  const values = Object.fromEntries(fields.map((el) => [el.id, el.value]));
  const result = formatSql(input.value, values, format);
  output.value = result.text;
  if (!input.value.trim()) setStatus(status, "");
  else if (result.ok) setStatus(status, "● Formatted", "ok");
  else setStatus(status, result.error, "error");
}

input.addEventListener("input", run);
for (const el of fields) {
  el.addEventListener("input", run);
  el.addEventListener("change", run);
}

$("#sample").addEventListener("click", () => { input.value = SAMPLE; run(); input.focus(); });
$("#clear").addEventListener("click", () => { input.value = ""; run(); input.focus(); });
$("#copy").addEventListener("click", async () => {
  if (!output.value) return;
  setStatus(status, (await copyText(output.value)) ? "Copied" : "Copy failed", "ok");
});
$("#download").addEventListener("click", () => {
  if (output.value) downloadText("formatted.sql", output.value, "application/sql");
});
