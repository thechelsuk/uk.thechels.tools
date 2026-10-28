import { $, setStatus } from "/assets/js/toolkit.js";
import { describe } from "./tree.js";

const yaml = window.jsyaml; // from the vendored js-yaml build
const input = $("#input"), urlInput = $("#url"), tree = $("#tree"), status = $("#status");
let counter = 0;

const el = (tag, className, text) => Object.assign(document.createElement(tag), { className, textContent: text ?? "" });

function node(value) {
  const { kind, label } = describe(value);
  if (kind !== "object" && kind !== "array") return el("span", `y-${kind}`, label);

  const details = el("details");
  details.dataset.id = `d${counter++}`;
  details.addEventListener("toggle", saveState);
  const summary = el("summary", "", "");
  summary.append(el("span", "y-type", kind === "array" ? "list" : "object"), " ", el("span", "y-count", label));
  details.append(summary);

  const entries = kind === "array" ? value.map((v, i) => [i, v]) : Object.entries(value);
  for (const [key, v] of entries) {
    const row = el("div", "y-row");
    row.append(el("span", kind === "array" ? "y-index" : "y-key", kind === "array" ? `${key}` : `${key}:`), " ", node(v));
    details.append(row);
  }
  return details;
}

function render(text) {
  counter = 0;
  tree.replaceChildren();
  if (!text.trim()) { setStatus(status, ""); return; }
  try {
    const root = node(yaml.load(text));
    tree.append(root);
    if (root.tagName === "DETAILS") root.open = true;
    for (const id of readState().open || []) tree.querySelector(`[data-id="${id}"]`)?.setAttribute("open", "");
    setStatus(status, "● Valid YAML", "ok");
  } catch (e) {
    setStatus(status, `Invalid YAML: ${e.reason || e.message}`, "error");
  }
}

// The page address remembers the URL and which branches are open.
function saveState() {
  const open = [...tree.querySelectorAll("details[open]")].map((d) => d.dataset.id);
  const state = { url: urlInput.value || undefined, open: open.length ? open : undefined };
  history.replaceState(null, "", `#${btoa(JSON.stringify(state))}`);
}
function readState() {
  try { return location.hash.length > 1 ? JSON.parse(atob(location.hash.slice(1))) : {}; } catch { return {}; }
}

async function loadUrl() {
  const url = urlInput.value.trim();
  if (!url) return;
  setStatus(status, "Loading…");
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`the server said ${res.status}`);
    input.value = await res.text();
    render(input.value);
    saveState();
  } catch (e) {
    setStatus(status, `Couldn't load that URL: ${e.message}`, "error");
  }
}

input.addEventListener("input", () => { render(input.value); saveState(); });
$("#load").addEventListener("click", loadUrl);
urlInput.addEventListener("keydown", (e) => e.key === "Enter" && loadUrl());
$("#expand").addEventListener("click", () => { tree.querySelectorAll("details").forEach((d) => (d.open = true)); saveState(); });
$("#collapse").addEventListener("click", () => { tree.querySelectorAll("details").forEach((d) => (d.open = false)); saveState(); });

const start = readState();
if (start.url) { urlInput.value = start.url; loadUrl(); }
