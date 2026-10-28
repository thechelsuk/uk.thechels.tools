import { $, setStatus } from "/assets/js/toolkit.js";
import { chartDefaults, onThemeChange } from "/assets/js/charts.js";
import { gbp } from "/assets/js/uk-tax.js";
import { fireNumber, projectRetirement } from "./projection.js";

const { Chart } = window;
const status = $("#status");
const num = (id) => Number.parseFloat($(`#${id}`).value) || 0;
const LABELS = { ok: "On track", warn: "Worth a look", info: "Details", "": "Result" };
const card = (kind, title, lines) =>
  `<div class="card ${kind}" data-label="${LABELS[kind] ?? "Result"}"><h3>${title}</h3>${lines.filter(Boolean).map((l) => `<p>${l}</p>`).join("")}</div>`;
let charts = [], last = null;

for (const box of document.querySelectorAll("[data-reveals]")) box.addEventListener("change", () => { $(`#${box.dataset.reveals}`).hidden = !box.checked; });

function draw() {
  if (!last) return;
  const c = chartDefaults(Chart);
  charts.forEach((x) => x.destroy());
  const { rows } = last.result;
  const money = { ticks: { callback: (v) => gbp(v) } };
  charts = [
    new Chart($("#assetChart"), {
      type: "line",
      data: {
        labels: rows.map((r) => r.age),
        datasets: [
          { label: "Growing", data: rows.map((r) => (r.phase === "accumulation" ? r.value : null)), borderColor: c.ok, backgroundColor: `color-mix(in srgb, ${c.ok} 15%, transparent)`, fill: true, pointRadius: 0, tension: 0.1 },
          { label: "Drawing down", data: rows.map((r, i) => (r.phase === "withdrawal" || rows[i + 1]?.phase === "withdrawal" ? r.value : null)), borderColor: c.accent, backgroundColor: `color-mix(in srgb, ${c.accent} 15%, transparent)`, fill: true, pointRadius: 0, tension: 0.1 },
        ],
      },
      options: { interaction: { mode: "index", intersect: false }, scales: { x: { title: { display: true, text: "Age" } }, y: { beginAtZero: true, ...money } }, plugins: { tooltip: { callbacks: { label: (ctx) => `${ctx.dataset.label}: ${gbp(ctx.parsed.y ?? 0)}` } } } },
    }),
  ];
  const every5 = rows.filter((r) => r.phase === "withdrawal" && (r.age - last.retirementAge) % 5 === 0);
  charts.push(new Chart($("#incomeChart"), {
    data: {
      labels: every5.map((r) => `Age ${r.age}`),
      datasets: [
        { type: "bar", label: "From investments", data: every5.map((r) => r.fromPortfolio), backgroundColor: c.accent, stack: "income" },
        { type: "bar", label: "State Pension", data: every5.map((r) => r.state), backgroundColor: c.ok, stack: "income" },
        { type: "bar", label: "Defined benefit", data: every5.map((r) => r.db), backgroundColor: c.warn, stack: "income" },
        { type: "line", label: "Spending", data: every5.map((r) => r.spending), borderColor: c.ink, borderDash: [5, 4], pointRadius: 3, fill: false },
      ],
    },
    options: { scales: { x: { stacked: true }, y: { stacked: true, beginAtZero: true, ...money } }, plugins: { title: { display: true, text: "Where income comes from" } } },
  }));
}

$("#form").addEventListener("submit", (e) => {
  e.preventDefault();
  const currentAge = Math.round(num("currentAge")), retirementAge = Math.round(num("retirementAge"));
  if (retirementAge <= currentAge) return setStatus(status, "Retirement age must be after your current age", "error");
  const input = {
    currentAge, retirementAge, spendingBefore75: num("spendingBefore75"), spendingAfter75: num("spendingAfter75"),
    assets: num("assets"), monthlyContributions: num("monthly"), growthRate: num("growth") / 100, inflationRate: num("inflation") / 100,
    db: $("#hasDb").checked ? { amount: num("dbAmount"), startAge: Math.round(num("dbAge")) } : null,
    state: $("#hasSp").checked ? { amount: num("spAmount"), startAge: Math.round(num("spAge")) } : null,
    realTerms: $("#realTerms").checked,
  };
  const r = projectRetirement(input);
  const target = fireNumber(input.spendingBefore75, num("swr") / 100);
  let headline;
  if (r.exhaustedAge && r.exhaustedAge < 90) headline = card("warn", `Money runs out at age ${r.exhaustedAge}`, ["Try retiring later, spending less, or adding more each month."]);
  else if (r.at100 <= 1000) headline = card("warn", `Only ${gbp(r.at100)} left at 100`, ["The money lasts, but with almost nothing to spare."]);
  else headline = card("ok", `${gbp(r.at100)} left at 100`, ["On these assumptions the money lasts your whole retirement."]);
  $("#cards").innerHTML = headline + card("info", `${gbp(r.atRetirement)} at retirement`, [
    `Rule-of-thumb FIRE number: <strong>${gbp(target)}</strong> (${gbp(input.spendingBefore75)} ÷ ${num("swr")}%), ${r.atRetirement >= target ? "which you'd reach" : "which you'd fall short of"}.`,
    input.db && `Defined benefit: ${gbp(input.db.amount)} a year from ${input.db.startAge}.`,
    input.state && `State Pension: ${gbp(input.state.amount)} a year from ${input.state.startAge}.`,
    `Spending: ${gbp(input.spendingBefore75)} a year, then ${gbp(input.spendingAfter75)} from 75${input.realTerms ? ", in today's money" : ""}.`,
  ]);
  last = { result: r, retirementAge };
  setStatus(status, "");
  $("#results").hidden = false;
  draw();
});
onThemeChange(draw);
