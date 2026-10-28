import { $, copyText, setStatus } from "/assets/js/toolkit.js";
import { parseHex, toHsl, contrastWith, bestTextColour } from "./colour.js";

const KEY = "colors"; // same key as the old version, so saved palettes carry over
const hex = $("#hex"), picker = $("#picker"), status = $("#status");
let current = parseHex(hex.value);

const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; } };
const store = (list) => { try { localStorage.setItem(KEY, JSON.stringify(list)); } catch { /* storage blocked */ } };
const grade = (r) => `${r.toFixed(2)}:1 ${r >= 7 ? "AAA" : r >= 4.5 ? "AA" : r >= 3 ? "AA large only" : "fails"}`;

function show(colour) {
  current = colour;
  if (!colour) { setStatus(status, "Enter 3 or 6 hex digits", "error"); return; }
  const { r, g, b } = colour, { h, s, l } = toHsl(colour), c = contrastWith(colour);
  const swatch = $("#swatch");
  swatch.style.background = colour.hex;
  swatch.style.color = bestTextColour(colour);
  $("#v-hex").textContent = colour.hex;
  $("#v-rgb").textContent = `rgb(${r} ${g} ${b})`;
  $("#v-hsl").textContent = `hsl(${h} ${s}% ${l}%)`;
  $("#v-white").textContent = grade(c.white);
  $("#v-black").textContent = grade(c.black);
  picker.value = colour.hex.toLowerCase();
  setStatus(status, "");
}

function renderPalette() {
  const list = load();
  $("#palette").replaceChildren(...list.map((code) => {
    const li = document.createElement("li");
    const b = Object.assign(document.createElement("button"), { type: "button", title: code, className: "hex-chip" });
    b.style.background = code;
    b.setAttribute("aria-label", `Load ${code}`);
    b.addEventListener("click", () => { hex.value = code.slice(1); show(parseHex(code)); });
    li.append(b, Object.assign(document.createElement("span"), { textContent: code }));
    return li;
  }));
  if (!list.length) $("#palette").replaceChildren(Object.assign(document.createElement("li"), { textContent: "No saved colours yet.", className: "hex-empty" }));
}

hex.addEventListener("input", () => show(parseHex(hex.value)));
picker.addEventListener("input", () => { hex.value = picker.value.slice(1).toUpperCase(); show(parseHex(picker.value)); });
$("#save").addEventListener("click", () => {
  if (!current) return;
  const list = load();
  if (!list.includes(current.hex)) store([...list, current.hex]);
  renderPalette();
  setStatus(status, "Saved", "ok");
});
$("#copy").addEventListener("click", async () => current && setStatus(status, (await copyText(current.hex)) ? "Copied" : "Copy failed", "ok"));
$("#clear-palette").addEventListener("click", () => { try { localStorage.removeItem(KEY); } catch { /* ignore */ } renderPalette(); });

show(current);
renderPalette();
