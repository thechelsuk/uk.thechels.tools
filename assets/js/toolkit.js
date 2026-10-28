// Small helpers shared by the tools. Import what you need:
//   import { $, config, copyText, downloadText, onFiles, setStatus } from "/assets/js/toolkit.js";

export const $ = (selector, root = document) => root.querySelector(selector);

/** The tool's `config:` front matter, as an object. Empty if it has none. */
export function config() {
  const el = document.getElementById("tool-config");
  try { return el ? JSON.parse(el.textContent) : {}; } catch { return {}; }
}

/** UK tax rates from _data/uk_rates.yml, for tools with `uk_rates: true`. */
export function ukRates() {
  const el = document.getElementById("uk-rates");
  return el ? JSON.parse(el.textContent) : null;
}

/** Show a short message in a status element. kind: "ok" | "error" | "" */
export function setStatus(el, text, kind = "") {
  if (!el) return;
  el.textContent = text;
  el.className = `status ${kind}`.trim();
}

/** Copy text to the clipboard. Returns true on success. */
export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/** Save text as a file in the browser. */
export function downloadText(filename, text, type = "text/plain") {
  downloadBlob(filename, new Blob([text], { type }));
}

/** Save a Blob as a file in the browser. */
export function downloadBlob(filename, blob) {
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement("a"), { href: url, download: filename });
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Wire a drop zone and a file input to one callback.
 * The zone also opens the file picker when clicked or activated with the keyboard.
 */
export function onFiles(zone, input, callback) {
  const handle = (files) => files && files.length && callback([...files]);
  input.addEventListener("change", () => handle(input.files));
  zone.addEventListener("click", () => input.click());
  zone.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); input.click(); }
  });
  zone.addEventListener("dragover", (e) => { e.preventDefault(); zone.classList.add("is-over"); });
  zone.addEventListener("dragleave", () => zone.classList.remove("is-over"));
  zone.addEventListener("drop", (e) => {
    e.preventDefault();
    zone.classList.remove("is-over");
    handle(e.dataTransfer.files);
  });
}

/** Wire every [data-copy-link] button to copy the page URL. */
export function wireCopyLink() {
  for (const button of document.querySelectorAll("[data-copy-link]")) {
    button.addEventListener("click", async () => {
      const ok = await copyText(location.href.split("#")[0]);
      const label = button.textContent;
      button.textContent = ok ? "Copied" : "Copy failed";
      setTimeout(() => (button.textContent = label), 1500);
    });
  }
}

/** Human-readable file size: "940 B", "12.3 KB", "1.4 MB". */
export function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
}

/** Decode an image file. Uses the photo's own rotation. */
export const loadImage = (file) => createImageBitmap(file);

/** Draw an image onto a new canvas, optionally scaled and on a background colour. */
export function drawToCanvas(image, { width = image.width, height = image.height, background } = {}) {
  const canvas = Object.assign(document.createElement("canvas"), { width, height });
  const ctx = canvas.getContext("2d");
  if (background) { ctx.fillStyle = background; ctx.fillRect(0, 0, width, height); }
  ctx.drawImage(image, 0, 0, width, height);
  return canvas;
}

export const canvasToBlob = (canvas, type = "image/jpeg", quality = 0.92) =>
  new Promise((resolve) => canvas.toBlob(resolve, type, quality));

/** Call back with the first image pasted anywhere on the page. */
export function onPasteImage(callback) {
  document.addEventListener("paste", (e) => {
    const item = [...(e.clipboardData?.items || [])].find((i) => i.type.startsWith("image/"));
    if (item) callback(item.getAsFile());
  });
}
