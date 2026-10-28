import { $, config, copyText, setStatus } from "/assets/js/toolkit.js";
import { clock, duration, summarise } from "./time.js";

const KEY = "pomodoroSessions"; // same key as before, so existing logs carry over
const settings = config();
const goal = $("#goal"), length = $("#length"), start = $("#start"), status = $("#status");
const baseTitle = document.title;

let sessions = load();
let session = null;   // the session in progress
let endsAt = 0;       // clock time the timer finishes
let remaining = 0;    // seconds left while paused
let running = false;

length.replaceChildren(...(settings.minutes || [25]).map((m) => Object.assign(document.createElement("option"), { value: m, textContent: `${m} minutes`, selected: m === (settings.default || 25) })));
remaining = Number(length.value) * 60;

function load() { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; } }
function save() { try { localStorage.setItem(KEY, JSON.stringify(sessions)); } catch { /* storage blocked */ } }
const when = (iso) => new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

function show(seconds) {
  $("#clock").textContent = clock(seconds);
  document.title = running ? `${clock(seconds)} · ${goal.value || "Focus"}` : baseTitle;
}

function tick() {
  if (!running) return;
  const left = (endsAt - Date.now()) / 1000;
  if (left <= 0) { finish(); setStatus(status, "Session complete. Take a break.", "ok"); return; }
  show(left);
  setTimeout(tick, 250);
}

function toggle() {
  if (!goal.value.trim() && !session) { setStatus(status, "Write a goal first", "error"); goal.focus(); return; }
  if (running) {
    running = false;
    remaining = (endsAt - Date.now()) / 1000;
    session.pauses.push({ paused: new Date().toISOString(), resumed: null });
    start.textContent = "Resume";
    setStatus(status, "Paused");
    show(remaining);
    return;
  }
  if (!session) session = { goal: goal.value.trim(), startTime: new Date().toISOString(), endTime: null, duration: 0, pauses: [] };
  else session.pauses.at(-1).resumed = new Date().toISOString();
  running = true;
  endsAt = Date.now() + remaining * 1000;
  start.textContent = "Pause";
  goal.disabled = length.disabled = true;
  setStatus(status, "");
  tick();
}

function finish() {
  if (!session) return;
  session.endTime = new Date().toISOString();
  const paused = session.pauses.reduce((t, p) => t + ((p.resumed ? new Date(p.resumed) : new Date()) - new Date(p.paused)), 0);
  session.duration = Math.round((new Date(session.endTime) - new Date(session.startTime) - paused) / 1000);
  sessions.unshift(session);
  save();
  reset();
  render();
}

function reset() {
  running = false;
  session = null;
  remaining = Number(length.value) * 60;
  start.textContent = "Start";
  goal.disabled = length.disabled = false;
  show(remaining);
}

function render() {
  $("#log").replaceChildren(...sessions.map((s, i) => {
    const tr = document.createElement("tr");
    const cells = [s.goal, when(s.startTime), duration(s.duration), String(s.pauses.length)];
    tr.append(...cells.map((text) => Object.assign(document.createElement("td"), { textContent: text })));
    const del = Object.assign(document.createElement("button"), { type: "button", className: "link", textContent: "Delete" });
    del.addEventListener("click", () => { sessions.splice(i, 1); save(); render(); });
    const td = document.createElement("td");
    td.append(del);
    tr.append(td);
    return tr;
  }));
  const { count, total } = summarise(sessions);
  $("#summary").textContent = count ? `${count} sessions · ${duration(total)} focused` : "No sessions yet";
}

start.addEventListener("click", toggle);
$("#end").addEventListener("click", finish);
$("#reset").addEventListener("click", reset);
length.addEventListener("change", reset);
document.addEventListener("keydown", (e) => {
  if (e.code === "Space" && !["INPUT", "SELECT", "BUTTON", "TEXTAREA"].includes(document.activeElement.tagName)) { e.preventDefault(); toggle(); }
});
$("#copy").addEventListener("click", async () => setStatus(status, (await copyText(JSON.stringify(sessions, null, 2))) ? "Log copied" : "Copy failed", "ok"));
$("#clear").addEventListener("click", () => { if (confirm("Delete every session in the log?")) { sessions = []; save(); render(); } });
show(remaining);
render();
