import { $ } from "/assets/js/toolkit.js";
import { chartDefaults, onThemeChange } from "/assets/js/charts.js";
import { gbp } from "/assets/js/uk-tax.js";
import { earliestAge, simulate } from "./simulate.js";

const { Chart } = window;
const IDS = ["startAge", "retireAge", "spendEarly", "spendLate", "spendChangeAge", "dc", "dcMonthly", "sipp", "isa", "dbAmount", "dbAge", "dbLump", "spAmount", "spAge", "otherIncome", "otherIncomeUntil", "contributionsUntil", "growth"];
let charts = [];

const short = (n) => (Math.abs(n) >= 1e6 ? `£${(n / 1e6).toFixed(2)}m` : gbp(n));
const axis = (v) => (Math.abs(v) >= 1e6 ? `£${(v / 1e6).toFixed(1)}m` : `£${Math.round(v / 1000)}k`);

function inputs() {
  const v = Object.fromEntries(IDS.map((id) => [id, Number($(`#${id}`).value) || 0]));
  return { ...v, growth: v.growth / 100 };
}

function update() {
  const i = inputs();
  const retire = $("#retireAge");
  retire.min = i.startAge;
  if (i.retireAge < i.startAge) { retire.value = i.startAge; i.retireAge = i.startAge; }
  $("#vRetire").textContent = i.retireAge;
  $("#vEarly").textContent = gbp(i.spendEarly);
  $("#vLate").textContent = gbp(i.spendLate);
  $("#vChange").textContent = i.spendChangeAge;

  const rows = simulate(i);
  const earliest = earliestAge(i, Number(retire.max));
  const atRetire = rows.find((r) => r.age === i.retireAge);
  const at85 = rows.find((r) => r.age === 85)?.total ?? 0;
  const runOut = rows.find((r) => r.total <= 0 && r.retired);

  $("#kEarliest").textContent = earliest ? `Age ${earliest}` : "None";
  $("#kEarliestSub").textContent = earliest ? "earliest viable age, lasts to 100" : "no age works: spend less";
  $("#kPortfolio").textContent = atRetire ? short(atRetire.total) : "–";
  $("#kIncome").textContent = atRetire ? short(atRetire.guaranteed + atRetire.drawdown) : "–";
  $("#k85").textContent = short(at85);
  $("#kRunOut").textContent = runOut ? `Age ${runOut.age}` : "100+";
  $("#kRunOutSub").textContent = runOut ? "pots run out" : "pots last to 100";
  $("#k85").classList.toggle("bad", at85 <= 0);
  $("#kRunOut").classList.toggle("bad", !!runOut);
  $("#warning").hidden = !runOut;

  const milestones = new Set([i.retireAge, 55, 57, i.dbAge, i.spAge, 75, 85, 100]);
  $("#table").innerHTML = rows.map((r) => `<tr${milestones.has(r.age) ? ' class="total"' : ""}><td>${r.age}</td><td>${short(r.total)}</td><td>${r.drawdown ? short(r.drawdown) : "–"}</td><td>${r.db ? short(r.db) : "–"}</td><td>${r.sp ? short(r.sp) : "–"}</td><td>${short(r.income)}</td><td>${r.retired ? `${r.surplus >= 0 ? "+" : ""}${short(r.surplus)}` : "–"}</td></tr>`).join("");
  draw(rows, i);
}

function draw(rows, i) {
  const c = chartDefaults(Chart);
  charts.forEach((x) => x.destroy());
  const base = (stacked) => ({ animation: { duration: 150 }, interaction: { mode: "index", intersect: false }, scales: { x: { stacked, ticks: { maxTicksLimit: 12 } }, y: { stacked, beginAtZero: true, ticks: { callback: axis } } }, plugins: { tooltip: { callbacks: { label: (ctx) => `${ctx.dataset.label}: ${gbp(ctx.raw)}` } } } });
  const retired = rows.filter((r) => r.retired);
  charts = [
    new Chart($("#potChart"), {
      type: "line",
      data: { labels: rows.map((r) => r.age), datasets: [
        { label: "Total", data: rows.map((r) => r.total), borderColor: c.accent, backgroundColor: `color-mix(in srgb, ${c.accent} 12%, transparent)`, fill: true, borderWidth: 2.5, pointRadius: 0, tension: 0.3 },
        { label: "Workplace", data: rows.map((r) => r.dc), borderColor: c.ok, borderWidth: 1.5, pointRadius: 0, tension: 0.3 },
        { label: "SIPP", data: rows.map((r) => r.sipp), borderColor: c.warn, borderWidth: 1.5, pointRadius: 0, tension: 0.3 },
        { label: "ISA", data: rows.map((r) => r.isa), borderColor: c.bad, borderWidth: 1.5, pointRadius: 0, tension: 0.3 },
      ] },
      options: { ...base(false), plugins: { ...base(false).plugins, title: { display: true, text: "Pots by age" } } },
    }),
    new Chart($("#incomeChart"), {
      data: { labels: retired.map((r) => r.age), datasets: [
        { type: "bar", label: "Drawdown", data: retired.map((r) => r.drawdown), backgroundColor: c.accent, stack: "s" },
        { type: "bar", label: "DB pension", data: retired.map((r) => r.db), backgroundColor: c.ok, stack: "s" },
        { type: "bar", label: "State Pension", data: retired.map((r) => r.sp), backgroundColor: c.warn, stack: "s" },
        { type: "line", label: "Spending", data: retired.map((r) => r.spend), borderColor: c.bad, borderDash: [4, 3], pointRadius: 0, borderWidth: 1.5 },
      ] },
      options: { ...base(true), plugins: { ...base(true).plugins, title: { display: true, text: "Income in retirement" } } },
    }),
  ];
}

function tab(which) {
  $("#chartsView").hidden = which !== "charts";
  $("#tableView").hidden = which !== "table";
  $("#tabCharts").setAttribute("aria-selected", String(which === "charts"));
  $("#tabTable").setAttribute("aria-selected", String(which === "table"));
}
$("#tabCharts").addEventListener("click", () => tab("charts"));
$("#tabTable").addEventListener("click", () => tab("table"));
for (const id of IDS) $(`#${id}`).addEventListener("input", update);
onThemeChange(update);
update();
