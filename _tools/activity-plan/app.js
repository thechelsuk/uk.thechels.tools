import { $, config } from "/assets/js/toolkit.js";
import { dayLoad, fromIso, isoDate, nextLevel, planDays, ukDate } from "./plan.js";

// Same storage keys as before, so existing plans carry over.
const DATA = "activityPlanData", START = "activityPlanStartDate";
const { weeks = 4, levels: LEVEL_INFO = [] } = config();
const LEVELS = LEVEL_INFO.map((l) => l.id);
const info = Object.fromEntries(LEVEL_INFO.map((l) => [l.id, l]));

const read = (k, fallback) => { try { return localStorage.getItem(k) ?? fallback; } catch { return fallback; } };
const write = (k, v) => { try { localStorage.setItem(k, v); } catch { /* storage blocked */ } };

let plan = JSON.parse(read(DATA, "{}"));
let start = read(START, null) ? fromIso(read(START)) : new Date();
let brush = "cycle";
let painting = false;

// Brush picker: "Cycle" plus one swatch per level.
$("#brushes").replaceChildren(...[{ id: "cycle", label: "Cycle" }, ...LEVEL_INFO].map((l) => {
  const b = Object.assign(document.createElement("button"), { type: "button", className: `ap-brush lv-${l.id}`, textContent: l.label });
  b.setAttribute("role", "radio");
  b.setAttribute("aria-checked", String(l.id === brush));
  b.addEventListener("click", () => {
    brush = l.id;
    $("#brushes").querySelectorAll("button").forEach((x) => x.setAttribute("aria-checked", String(x === b)));
  });
  return b;
}));

function paint(cell, first) {
  const key = cell.dataset.key;
  const level = brush === "cycle" ? (first ? nextLevel(plan[key], LEVELS) : null) : brush;
  if (!level) return;
  if (level === "blank") delete plan[key]; else plan[key] = level;
  cell.className = `ap-cell lv-${level}`;
  cell.textContent = info[level].short;
  cell.setAttribute("aria-label", `${cell.dataset.label}: ${info[level].label}`);
  const day = key.slice(0, 10);
  $(`#load-${day}`).textContent = dayLoad(plan, day, LEVELS);
  write(DATA, JSON.stringify(plan));
}

function render() {
  const wrap = $("#plan");
  const frag = document.createDocumentFragment();
  let current = 0;
  for (const day of planDays(start, weeks)) {
    if (day.week !== current) {
      current = day.week;
      const head = Object.assign(document.createElement("div"), { className: "ap-week" });
      head.append(Object.assign(document.createElement("span"), { textContent: `Week ${current}` }));
      for (let h = 0; h < 24; h++) head.append(Object.assign(document.createElement("span"), { className: "ap-hour", textContent: h }));
      head.append(Object.assign(document.createElement("span"), { className: "ap-load-h", textContent: "Load" }));
      frag.append(head);
    }
    const row = Object.assign(document.createElement("div"), { className: "ap-row" });
    row.append(Object.assign(document.createElement("span"), { className: "ap-date", textContent: ukDate(day.date) }));
    for (let h = 0; h < 24; h++) {
      const key = `${day.key}-${h}`;
      const level = plan[key] || "blank";
      const cell = Object.assign(document.createElement("button"), { type: "button", className: `ap-cell lv-${level}`, textContent: info[level].short });
      cell.dataset.key = key;
      cell.dataset.label = `${ukDate(day.date)} ${h}:00`;
      cell.setAttribute("aria-label", `${cell.dataset.label}: ${info[level].label}`);
      row.append(cell);
    }
    row.append(Object.assign(document.createElement("span"), { className: "ap-load", id: `load-${day.key}`, textContent: dayLoad(plan, day.key, LEVELS) }));
    frag.append(row);
  }
  wrap.replaceChildren(frag);
}

// Click or drag to paint. Keyboard: Enter/Space on a cell (it's a button).
const plan$ = $("#plan");
plan$.addEventListener("pointerdown", (e) => {
  const cell = e.target.closest(".ap-cell");
  if (!cell) return;
  e.preventDefault();
  painting = true;
  paint(cell, true);
});
// Track the pointer's position rather than its target, so dragging works with touch too.
plan$.addEventListener("pointermove", (e) => {
  if (!painting || brush === "cycle") return;
  const cell = document.elementFromPoint(e.clientX, e.clientY)?.closest(".ap-cell");
  if (cell && !cell.classList.contains(`lv-${brush}`)) paint(cell, false);
});
addEventListener("pointerup", () => { painting = false; });
plan$.addEventListener("click", (e) => {
  const cell = e.target.closest(".ap-cell");
  if (cell && e.detail === 0) paint(cell, true); // keyboard activation
});

const startInput = $("#start");
startInput.value = isoDate(start);
startInput.addEventListener("change", () => {
  if (!startInput.value) return;
  start = fromIso(startInput.value);
  write(START, startInput.value);
  render();
});
$("#print").addEventListener("click", () => print());
$("#clear").addEventListener("click", () => {
  if (!confirm("Clear every hour in the plan?")) return;
  plan = {};
  write(DATA, "{}");
  render();
});
render();
