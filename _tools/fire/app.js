import { $, setStatus } from "/assets/js/toolkit.js";
import { chartDefaults, onThemeChange } from "/assets/js/charts.js";
import { gbp } from "/assets/js/uk-tax.js";
// Load the model with the same ?v= as this file, so a cached old copy isn't mixed with new code.
const { projectRetirement } = await import(`./projection.js${new URL(import.meta.url).search}`);

const { Chart } = window;
const status = $("#status");
const num = (id) => Number.parseFloat($(`#${id}`).value) || 0;
const optionalAge = (id) => { const el = $(`#${id}`); return el && el.value !== "" ? Math.round(Number(el.value)) : null; };
const LABELS = { ok: "On track", warn: "Worth a look", info: "Details", "": "Result" };
const card = (kind, title, lines) =>
  `<div class="card ${kind}" data-label="${LABELS[kind] ?? "Result"}"><h3>${title}</h3>${lines.filter(Boolean).map((l) => `<p>${l}</p>`).join("")}</div>`;
const potFields = [...document.querySelectorAll("fieldset.pot")];
let charts = [], last = null;

for (const box of document.querySelectorAll("[data-reveals]")) box.addEventListener("change", () => { $(`#${box.dataset.reveals}`).hidden = !box.checked; });

// Withdrawal order: move a pot up or down the list.
const orderList = $("#order");
orderList.addEventListener("click", (e) => {
  const button = e.target.closest("[data-move]");
  if (!button) return;
  const item = button.closest("li");
  if (button.dataset.move === "-1" && item.previousElementSibling) orderList.insertBefore(item, item.previousElementSibling);
  else if (button.dataset.move === "1" && item.nextElementSibling) orderList.insertBefore(item.nextElementSibling, item);
  button.focus();
});

// Same colour for a pot in both charts.
function potColours(c) {
  const palette = [c.spark, c.accent, c.ok, c.warn, c.bad];
  return Object.fromEntries(last.pots.map((p, i) => [p.key, palette[i % palette.length]]));
}

function draw() {
  if (!last) return;
  const c = chartDefaults(Chart);
  charts.forEach((x) => x.destroy());
  const { rows } = last.result;
  const colour = potColours(c);
  const money = { ticks: { callback: (v) => gbp(v) } };
  const tooltip = { callbacks: { label: (ctx) => (ctx.parsed.y ? `${ctx.dataset.label}: ${gbp(ctx.parsed.y)}` : null) } };
  const retireLabel = { id: "retire", afterDraw(chart) {
    const x = chart.scales.x.getPixelForValue(last.retirementAge - rows[0].age);
    const { top, bottom } = chart.chartArea, ctx = chart.ctx;
    ctx.save(); ctx.strokeStyle = c.muted; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(x, top); ctx.lineTo(x, bottom); ctx.stroke(); ctx.restore();
  } };

  charts.push(new Chart($("#assetChart"), {
    type: "line",
    data: {
      labels: rows.map((r) => r.age),
      datasets: last.pots.map((p) => ({
        label: p.name, data: rows.map((r) => r.balances[p.key]), borderColor: colour[p.key],
        backgroundColor: `color-mix(in srgb, ${colour[p.key]} 30%, transparent)`, fill: true, pointRadius: 0, tension: 0.1, borderWidth: 1.5,
      })),
    },
    options: {
      interaction: { mode: "index", intersect: false },
      scales: { x: { title: { display: true, text: "Age" } }, y: { stacked: true, beginAtZero: true, ...money } },
      plugins: { title: { display: true, text: "Value of each pot (dashed line: retirement)" }, tooltip },
    },
    plugins: [retireLabel],
  }));

  const retired = rows.filter((r) => r.phase === "withdrawal");
  const bar = (label, data, backgroundColor) => ({ type: "bar", label, data, backgroundColor, stack: "income" });
  charts.push(new Chart($("#incomeChart"), {
    data: {
      labels: retired.map((r) => r.age),
      datasets: [
        ...last.pots.map((p) => bar(`From ${p.name}`, retired.map((r) => r.withdrawals[p.key]), colour[p.key])),
        bar("Defined benefit", retired.map((r) => r.db), `color-mix(in srgb, ${c.ink} 75%, transparent)`),
        bar("State Pension", retired.map((r) => r.state), `color-mix(in srgb, ${c.muted} 25%, transparent)`),
        { ...bar("Shortfall", retired.map((r) => r.shortfall), "transparent"), borderColor: c.bad, borderWidth: 1.5, borderDash: [3, 3] },
        { type: "line", label: "Spending", data: retired.map((r) => r.spending), borderColor: c.ink, borderDash: [5, 4], borderWidth: 1.5, pointRadius: 0, fill: false, stepped: "middle" },
      ],
    },
    options: {
      interaction: { mode: "index", intersect: false },
      scales: { x: { stacked: true, title: { display: true, text: "Age" } }, y: { stacked: true, beginAtZero: true, ...money } },
      plugins: { title: { display: true, text: "Where each year's income comes from" }, tooltip },
    },
  }));
}

function readPots() {
  return potFields.map((f) => {
    const key = f.dataset.pot;
    return {
      key, name: f.dataset.name, value: num(`${key}Value`), monthly: num(`${key}Monthly`), growth: num(`${key}Growth`) / 100,
      until: optionalAge(`${key}Until`), fromAge: optionalAge(`${key}From`) ?? 0,
    };
  });
}

const ageRange = (g) => (g.from === g.to ? `Age ${g.from}` : `Age ${g.from}–${g.to}`);

$("#form").addEventListener("submit", (e) => {
  e.preventDefault();
  const currentAge = Math.round(num("currentAge")), retirementAge = Math.round(num("retirementAge"));
  if (retirementAge <= currentAge) return setStatus(status, "Retirement age must be after your current age", "error");
  const pots = readPots();
  const input = {
    currentAge, retirementAge, spendingEarly: num("spendingEarly"), spendingLater: num("spendingLater"), spendingChangeAge: Math.round(num("spendingChangeAge")),
    inflationRate: num("inflation") / 100, realTerms: $("#realTerms").checked, pots,
    order: [...orderList.children].map((li) => li.dataset.pot),
    db: $("#hasDb").checked ? { amount: num("dbAmount"), startAge: Math.round(num("dbAge")) } : null,
    state: $("#hasSp").checked ? { amount: num("spAmount"), startAge: Math.round(num("spAge")) } : null,
  };
  const r = projectRetirement(input);
  const terms = input.realTerms ? " in today's money" : "";

  // One headline card. Lead with the first year spending isn't met, then
  // describe each gap: a bridge before a pension opens, or the pots running
  // dry for good, where only what the pensions don't cover is short.
  const rising = input.realTerms ? "" : " (rising with inflation)";
  const describeSteps = (steps) => steps.map((st, n) => {
    const oneYear = steps[n + 1]?.age === st.age + 1;
    return oneYear ? `${gbp(st.shortfall)} short at ${st.age}` : `${gbp(st.shortfall)} a year from ${st.age}`;
  }).join(", then ");
  const gapLine = (g) => {
    if (g.to < 100) {
      const opens = pots.find((p) => p.fromAge === g.to + 1);
      return `<strong>${ageRange(g)}: ${gbp(g.total)} short in total</strong>${opens ? `, until the ${opens.name} opens at ${opens.fromAge}` : ""}.`;
    }
    return `<strong>From ${g.from}, the pots are empty.</strong> Pensions cover what they can: ${describeSteps(g.steps)}${rising}. ${gbp(g.total)} short in total by 100.`;
  };
  const hasBridge = r.gaps.some((g) => g.to < 100);
  let kind = "warn", title, summary;
  if (r.firstShortAge) {
    title = `Spending isn't fully covered from age ${r.firstShortAge}`;
    summary = r.at100 > 0 ? `${gbp(r.at100)} is left at 100, but some years fall short.` : null;
  } else if (r.at100 <= 1000) { title = `Only ${gbp(r.at100)} left at 100`; summary = "The money lasts, but with almost nothing to spare."; }
  else { kind = "ok"; title = `${gbp(r.at100)} left at 100`; summary = "On these assumptions the money lasts your whole retirement."; }
  const tips = [hasBridge && "move money into Cash or the ISA, change the withdrawal order", r.runsOutAge && "spend less, add more each month", "retire later"].filter(Boolean);
  const headline = card(kind, title, [
    summary, ...r.gaps.map(gapLine),
    r.firstShortAge && `To close the gap${r.gaps.length > 1 ? "s" : ""}: ${[tips.slice(0, -1).join(", "), tips.at(-1)].filter(Boolean).join(" or ")}.`,
  ]);

  const potLines = pots.map((p) => {
    const atRetire = r.rows.find((x) => x.age === retirementAge).balances[p.key];
    const emptied = r.rows.find((x) => x.age > retirementAge && x.balances[p.key] <= 0 && r.rows.find((y) => y.age === x.age - 1).balances[p.key] > 0);
    return `${p.name}: <strong>${gbp(atRetire)}</strong> at ${retirementAge}${p.fromAge > retirementAge ? `, locked until ${p.fromAge}` : ""}${emptied ? `, empty by ${emptied.age}` : ""}.`;
  });

  $("#cards").innerHTML = headline + card("info", `${gbp(r.atRetirement)} at retirement`, [
    ...potLines,
  ]) + card("info", "Assumptions", [
    `Spending: ${gbp(input.spendingEarly)} a year, then ${gbp(input.spendingLater)} from ${input.spendingChangeAge}, in today's money.`,
    input.db && `Defined benefit: ${gbp(input.db.amount)} a year from ${input.db.startAge}.`,
    input.state && `State Pension: ${gbp(input.state.amount)} a year from ${input.state.startAge}.`,
    `Drawn in this order: ${input.order.map((k) => pots.find((p) => p.key === k).name).join(", then ")}.`,
    `All figures are gross (before tax)${terms}.`,
  ]);
  last = { result: r, retirementAge, pots };
  setStatus(status, "");
  $("#results").hidden = false;
  draw();
});
onThemeChange(draw);
