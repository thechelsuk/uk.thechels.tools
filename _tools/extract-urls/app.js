import { $, copyText, setStatus } from "/assets/js/toolkit.js";
import { urlsFromText, uniqueUrls } from "./urls.js";

const input = $("#input"), output = $("#output"), status = $("#status"), unique = $("#unique");
let linkUrls = []; // hrefs from the last rich-text paste

// DOMParser builds an inert document: nothing in the pasted HTML runs.
function hrefsFromHtml(html) {
  const doc = new DOMParser().parseFromString(html, "text/html");
  return [...doc.querySelectorAll("a[href]")].map((a) => a.href).filter((u) => /^https?:/i.test(u));
}

function run() {
  let urls = [...linkUrls, ...urlsFromText(input.value)];
  if (unique.checked) urls = uniqueUrls(urls);
  output.value = urls.join("\n");
  setStatus(status, input.value.trim() ? `${urls.length} links` : "");
}

input.addEventListener("paste", (e) => {
  const html = e.clipboardData?.getData("text/html");
  linkUrls = html ? hrefsFromHtml(html) : [];
  setTimeout(run); // let the plain text land in the box first
});
input.addEventListener("input", () => { if (!input.value.trim()) linkUrls = []; run(); });
unique.addEventListener("change", run);
$("#clear").addEventListener("click", () => { input.value = ""; linkUrls = []; run(); input.focus(); });
$("#copy").addEventListener("click", async () => {
  if (output.value) setStatus(status, (await copyText(output.value)) ? "Copied" : "Copy failed", "ok");
});
