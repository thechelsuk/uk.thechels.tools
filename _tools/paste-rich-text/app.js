import { $, copyText, setStatus } from "/assets/js/toolkit.js";

const paste = $("#paste"), html = $("#html"), preview = $("#preview"), clean = $("#clean"), status = $("#status");
let raw = "";

// DOMParser gives an inert document: nothing in the pasted markup runs.
function tidy(source, strip) {
  const doc = new DOMParser().parseFromString(source, "text/html");
  doc.querySelectorAll("script, style, meta, link, title, o\\:p").forEach((el) => el.remove());
  const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_COMMENT);
  const comments = [];
  while (walker.nextNode()) comments.push(walker.currentNode);
  comments.forEach((c) => c.remove());
  for (const el of doc.body.querySelectorAll("*")) {
    for (const { name } of [...el.attributes]) {
      if (/^on/i.test(name) || (strip && (name === "style" || name === "class" || name === "id" || name.startsWith("data-") || name === "lang" || name === "dir"))) el.removeAttribute(name);
    }
  }
  return doc.body.innerHTML.replace(/ /g, "&nbsp;").trim();
}

function render() {
  const out = raw ? tidy(raw, clean.checked) : "";
  html.value = out;
  preview.srcdoc = `<!doctype html><meta charset="utf-8"><style>body{font:15px/1.6 system-ui,sans-serif;margin:12px;color:#222;background:#fff}</style>${out}`;
  setStatus(status, raw ? `${out.length.toLocaleString()} characters of HTML` : "");
}

paste.addEventListener("paste", (e) => {
  raw = e.clipboardData?.getData("text/html") || "";
  if (!raw) setStatus(status, "No formatted text on the clipboard, only plain text", "error");
  setTimeout(render);
});
clean.addEventListener("change", render);
$("#clear").addEventListener("click", () => { raw = ""; paste.value = ""; render(); paste.focus(); });
$("#copy").addEventListener("click", async () => {
  if (html.value) setStatus(status, (await copyText(html.value)) ? "Copied" : "Copy failed", "ok");
});
render();
