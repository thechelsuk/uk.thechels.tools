import { $, copyText, setStatus } from "/assets/js/toolkit.js";
import { runCipher } from "./cipher.js";

const method = $("#method"), output = $("#output"), status = $("#status");

function updateFields() {
  $("#shift-field").hidden = method.value !== "caesar";
  $("#keyword-field").hidden = method.value !== "vigenere";
}

$("#form").addEventListener("submit", (e) => {
  e.preventDefault();
  try {
    const { result, warning } = runCipher({
      method: method.value,
      mode: e.submitter?.dataset.mode || "encrypt",
      text: $("#input").value,
      shift: $("#shift").value,
      keyword: $("#keyword").value,
    });
    output.value = result;
    setStatus(status, warning, warning ? "error" : "");
  } catch (err) {
    output.value = "";
    setStatus(status, err.message, "error");
  }
});
method.addEventListener("change", updateFields);
$("#copy").addEventListener("click", async () => {
  if (output.value) setStatus(status, (await copyText(output.value)) ? "Copied" : "Copy failed", "ok");
});
updateFields();
