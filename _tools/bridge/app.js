import { $, setStatus } from "/assets/js/toolkit.js";
import { chartDefaults, onThemeChange } from "/assets/js/charts.js";
import { gbp } from "/assets/js/uk-tax.js";
import { buildPath, earliestFireAge, earliestFireAgeExact, formatAge, futureValue, requiredApex, requiredContribution } from "./bridge.js";

const { Chart } = window;
const status = $("#status");
let chart = null, last = null;

// Clamp a field to a sensible range, as the original did.
const safe = (id, min, max, fallback) => {
  let n = Number.parseFloat($(`#${id}`).value);
  if (!Number.isFinite(n)) n = fallback;
  return Math.min(max, Math.max(min, n));
};
const mode = () => document.querySelector("input[name=mode]:checked").value;
const LABELS = { ok: "On track", warn: "Worth a look", info: "Details", "": "Result" };
const card = (kind, title, lines) =>
  `<div class="card ${kind}" data-label="${LABELS[kind] ?? "Result"}"><h3>${title}</h3>${lines.filter(Boolean).map((l) => `<p>${l}</p>`).join("")}</div>`;

$("#growthRate").addEventListener("input", (e) => { $("#growthValue").textContent = `${e.target.value}%`; });
for (const r of document.querySelectorAll("input[name=mode]")) r.addEventListener("change", () => { $("#targetGroup").hidden = mode() !== "target"; });

function draw() {
  if (!last) return;
  const c = chartDefaults(Chart);
  const colours = [c.warn, c.accent, c.ok];
  chart?.destroy();
  chart = new Chart($("#chart"), {
    type: "line",
    data: {
      labels: last.paths[1].map((p) => p.age),
      datasets: last.paths.flatMap((path, i) => [
        { label: `${last.pcts[i]}% real${i === 1 ? " (selected)" : ""}`, data: path.map((p) => p.value), borderColor: colours[i], borderWidth: i === 1 ? 2.5 : 1.5, borderDash: i === 1 ? [] : [6, 3], pointRadius: 0, tension: 0.1, fill: false },
        { label: `${last.pcts[i]}% apex (age ${last.ages[i]})`, data: path.map((p) => (p.age === last.ages[i] ? p.value : null)), borderColor: colours[i], backgroundColor: colours[i], pointStyle: "star", pointRadius: 7, showLine: false },
      ]),
    },
    options: {
      scales: { x: { title: { display: true, text: "Age" } }, y: { beginAtZero: true, title: { display: true, text: "ISA value (today's money)" }, ticks: { callback: (v) => gbp(v) } } },
      plugins: { tooltip: { callbacks: { label: (ctx) => (ctx.raw === null ? "" : `${ctx.dataset.label}: ${gbp(ctx.raw)}`) } } },
    },
  });
}

$("#form").addEventListener("submit", (e) => {
  e.preventDefault();
  const age = safe("currentAge", 18, 90, 43);
  const balance = safe("isaBalance", 0, 5e7, 0);
  const contribution = safe("annualContribution", 0, 5e6, 0);
  const withdrawal = safe("annualWithdrawal", 0, 5e6, 0);
  const endAge = safe("bridgeEndAge", age + 1, 100, 58);
  const pct = safe("growthRate", 2, 8, 5);
  const pcts = [pct - 1, pct, pct + 1];
  const rates = pcts.map((p) => p / 100);

  let ages;
  if (mode() === "target") {
    const t = safe("targetFireAge", age + 1, endAge - 1, Math.min(endAge - 1, age + 7));
    ages = [t, t, t];
  } else {
    const solved = rates.map((r) => earliestFireAge(age, balance, contribution, withdrawal, r, endAge));
    if (!solved[1]) {
      $("#results").hidden = true;
      return setStatus(status, "No retirement age works before your pension starts. Try adding more, withdrawing less, or a later pension age.", "error");
    }
    ages = solved.map((s) => s?.fireAge ?? solved[1].fireAge);
  }

  const fire = ages[1];
  const required = requiredApex(withdrawal, rates[1], endAge - fire);
  const projected = futureValue(balance, contribution, rates[1], fire - age);
  const gap = required - projected;
  const needed = requiredContribution(balance, required, rates[1], fire - age);
  const lines = [`Bridge from ${fire} to ${endAge} (${endAge - fire} years). Apex needed: <strong>${gbp(required)}</strong>. Projected ISA: <strong>${gbp(projected)}</strong>.`];

  let html;
  if (gap > 1) {
    if (needed !== null && Number.isFinite(needed)) lines.push(`To retire at ${fire}, you'd need to add about <strong>${gbp(needed)}</strong> a year, up from ${gbp(contribution)}.`);
    html = card("warn", `Short by ${gbp(gap)} at age ${fire}`, lines);
  } else {
    lines.push(`Surplus: <strong>${gbp(-gap)}</strong> above the apex.`);
    if (needed !== null && Number.isFinite(needed) && needed <= 0) lines.push(`You could stop adding to it now and still retire at ${fire}.`);
    else if (needed !== null && Number.isFinite(needed) && needed < contribution) lines.push(`You could add as little as ${gbp(needed)} a year and still retire at ${fire}.`);
    html = card("ok", `On track to retire at ${fire}`, lines);
  }
  if (mode() === "solve") {
    const exact = rates.map((r) => earliestFireAgeExact(age, balance, contribution, withdrawal, r, endAge));
    const extra = [`The earliest age your projected ISA covers the bridge at ${pct}% real growth.`];
    if (exact.every((x) => x !== null)) extra.push(`Exact crossover: ${pcts.map((p, i) => `${p}% → <strong>${formatAge(exact[i])}</strong>`).join(", ")}.`);
    html += card("info", `Earliest age at ${pcts[0]}–${pcts[2]}% growth: ${Math.min(...ages)} to ${Math.max(...ages)}`, extra);
  }
  $("#cards").innerHTML = html;

  const paths = rates.map((r, i) => buildPath(age, balance, contribution, withdrawal, r, ages[i], endAge));
  last = { paths, pcts, ages };
  $("#thead").innerHTML = `<tr><th>Age</th><th>Phase</th>${pcts.map((p) => `<th>${p}% real</th>`).join("")}</tr>`;
  $("#table").innerHTML = paths[1].map((p, i) =>
    `<tr${p.age === fire ? ' class="total"' : ""}><td>${p.age}</td><td>${p.phase === "accumulation" ? "Growing" : "Drawing down"}</td>${paths.map((path) => `<td>${gbp(path[i]?.value ?? 0)}</td>`).join("")}</tr>`).join("");
  setStatus(status, "");
  $("#results").hidden = false;
  draw();
});
onThemeChange(draw);
