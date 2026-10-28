import { $, config, copyText, downloadText, setStatus } from "/assets/js/toolkit.js";
import { convert } from "./convert.js";

const yaml = window.jsyaml; // from the vendored js-yaml build
const input = $("#input"), output = $("#output"), direction = $("#direction"), style = $("#style"), status = $("#status");

function run() {
  const toYaml = direction.value === "json-yaml";
  $("#in-label").textContent = toYaml ? "JSON" : "YAML";
  $("#out-label").textContent = toYaml ? "YAML" : "JSON";
  $("#style-field").hidden = !toYaml;
  const r = convert(input.value, { direction: direction.value, style: style.value }, yaml);
  output.value = r.text;
  setStatus(status, !input.value.trim() ? "" : r.ok ? "● Converted" : r.error, r.ok ? "ok" : "error");
}

input.addEventListener("input", run);
direction.addEventListener("change", () => {
  if (output.value) { input.value = output.value; } // swap so you can convert back
  run();
});
style.addEventListener("change", run);
$("#sample").addEventListener("click", () => { direction.value = "json-yaml"; input.value = JSON.stringify(JSON.parse(config().sample), null, 2); run(); });
$("#clear").addEventListener("click", () => { input.value = ""; run(); input.focus(); });
$("#copy").addEventListener("click", async () => output.value && setStatus(status, (await copyText(output.value)) ? "Copied" : "Copy failed", "ok"));
$("#download").addEventListener("click", () => {
  if (!output.value) return;
  const toYaml = direction.value === "json-yaml";
  downloadText(toYaml ? "converted.yaml" : "converted.json", output.value, toYaml ? "application/yaml" : "application/json");
});
run();
