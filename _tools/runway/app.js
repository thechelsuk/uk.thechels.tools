import { $, setStatus, ukRates } from "/assets/js/toolkit.js";
import { chartDefaults, onThemeChange } from "/assets/js/charts.js";
import { gbp } from "/assets/js/uk-tax.js";
import { runway } from "./runway.js";

const { Chart } = window;
const rates = ukRates();
const status = $("#status");
const num = (id) => Number.parseFloat($(`#${id}`).value) || 0;
const POTS = [["savings", "Savings"], ["bonds", "Premium Bonds"], ["isa", "Cash ISA"], ["ssisa", "S&S ISA"]];
let chart = null, last = null;

for (const el of document.querySelectorAll("[data-rate]")) el.textContent = gbp(el.dataset.rate.split(".").reduce((o, k) => o[k], rates));

function draw() {
  if (!last) return;
  const c = chartDefaults(Chart);
  chart?.destroy();
  chart = new Chart($("#chart"), {
    type: "line",
    data: {
      labels: last.rows.map((r) => r.month),
      datasets: POTS.map(([key, label], i) => ({
        label, data: last.rows.map((r) => r[key]), fill: true, stack: "pots", pointRadius: 0, tension: 0.1,
        borderColor: c.series[i], backgroundColor: `color-mix(in srgb, ${c.series[i]} 55%, transparent)`,
      })),
    },
    options: {
      interaction: { mode: "index", intersect: false },
      scales: {
        x: { stacked: true, title: { display: true, text: "Month" }, ticks: { maxTicksLimit: 12 } },
        y: { stacked: true, ticks: { callback: (v) => gbp(v) } },
      },
      plugins: { tooltip: { callbacks: { label: (ctx) => `${ctx.dataset.label}: ${gbp(ctx.parsed.y)}` } } },
    },
  });
}

$("#form").addEventListener("submit", (e) => {
  e.preventDefault();
  const pots = [
    { key: "savings", balance: num("savings-amt"), rate: num("savings-rate"), tax: num("savings-tax") },
    { key: "bonds", balance: num("bonds-amt"), rate: num("bonds-rate") },
    { key: "isa", balance: num("isa-amt"), rate: num("isa-rate") },
    { key: "ssisa", balance: num("ssisa-amt"), rate: num("ssisa-rate") },
  ];
  const monthly = num("monthly");
  const total = pots.reduce((s, p) => s + p.balance, 0);
  if (num("bonds-amt") > rates.savings.premium_bonds_limit) return setStatus(status, `Premium Bonds are limited to ${gbp(rates.savings.premium_bonds_limit)}`, "error");
  if (total <= 0 || monthly <= 0) return setStatus(status, "Enter at least one pot and your monthly spending", "error");

  last = runway(pots, monthly);
  $("#s-runway").textContent = last.endless ? "Indefinite" : `${last.years}y ${last.monthsLeft}m`;
  $("#s-start").textContent = gbp(total);
  $("#s-interest").textContent = gbp(last.interest);
  $("#s-tax").textContent = gbp(last.tax);
  $("#table").innerHTML = last.rows.map((r) =>
    `<tr><td>${r.month}</td><td>${gbp(r.withdrawal, true)}</td>${POTS.map(([k]) => `<td>${gbp(r[k], true)}</td>`).join("")}<td>${gbp(r.total, true)}</td></tr>`).join("");
  setStatus(status, last.endless ? "At these rates the money grows faster than you spend it" : `${last.months} months${last.partial ? ", the last one partly covered" : ""}`, "ok");
  $("#results").hidden = false;
  draw();
});
onThemeChange(draw);
