import { $, copyText, setStatus } from "/assets/js/toolkit.js";
import { generateSlug, SLIDER_LENGTHS } from "./slug.js";

const slider = $("#length"), output = $("#output"), status = $("#status");
const length = () => SLIDER_LENGTHS[Number(slider.value) - 1];

function generate() {
  output.value = generateSlug(length(), { letterStart: $("#letter").checked });
  setStatus(status, "");
}

slider.addEventListener("input", () => { $("#length-value").textContent = length(); });
$("#form").addEventListener("submit", (e) => { e.preventDefault(); generate(); output.select(); });
output.addEventListener("focus", () => output.select());
$("#copy").addEventListener("click", async () => {
  if (output.value) setStatus(status, (await copyText(output.value)) ? "Copied" : "Copy failed", "ok");
});
generate();
