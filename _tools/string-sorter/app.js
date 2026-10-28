import { $, copyText, setStatus } from "/assets/js/toolkit.js";
import { reverseText, reverseWords, sortCharacters } from "./reverse.js";

const MODES = { chars: reverseText, words: reverseWords, sort: sortCharacters };
const input = $("#input"), output = $("#output"), mode = $("#mode"), status = $("#status");
const run = () => { output.value = MODES[mode.value](input.value); setStatus(status, ""); };

input.addEventListener("input", run);
mode.addEventListener("change", run);
$("#clear").addEventListener("click", () => { input.value = ""; run(); input.focus(); });
$("#copy").addEventListener("click", async () => {
  if (output.value) setStatus(status, (await copyText(output.value)) ? "Copied" : "Copy failed", "ok");
});
