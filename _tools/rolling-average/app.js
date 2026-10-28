import { $, config, setStatus } from "/assets/js/toolkit.js";
import { chartDefaults, onThemeChange } from "/assets/js/charts.js";
import { parseNumbers } from "../monte-carlo/simulate.js";
import { mean, rollingAverage } from "./rolling.js";

const { Chart } = window;
const status = $("#status"), values = $("#values"), size = $("#window");
let chart = null;
const round = (n) => Math.round(n * 100) / 100;

function draw() {
  const data = parseNumbers(values.value);
  const w = Math.max(1, Number(size.value) || 1);
  chart?.destroy();
  if (!data.length) { $("#stats").hidden = true; setStatus(status, "Enter some numbers to chart."); return; }
  const rolling = rollingAverage(data, w);
  const avg = mean(data);
  $("#s-count").textContent = data.length;
  $("#s-mean").textContent = round(avg);
  $("#s-last").textContent = rolling.at(-1) === null ? "–" : round(rolling.at(-1));
  $("#stats").hidden = false;
  setStatus(status, w > data.length ? `The window is bigger than the ${data.length} values entered` : "", w > data.length ? "error" : "");

  const c = chartDefaults(Chart);
  chart = new Chart($("#chart"), {
    type: "line",
    data: {
      labels: data.map((_, i) => i + 1),
      datasets: [
        { label: "Values", data, borderColor: c.muted, backgroundColor: c.muted, pointRadius: 3, borderWidth: 1 },
        { label: `${w}-point rolling average`, data: rolling, borderColor: c.accent, backgroundColor: c.accent, borderWidth: 2.5, pointRadius: 0, tension: 0.25 },
        { label: "Overall average", data: data.map(() => avg), borderColor: c.warn, borderDash: [6, 4], borderWidth: 1.5, pointRadius: 0 },
      ],
    },
    options: { interaction: { mode: "index", intersect: false }, scales: { y: { beginAtZero: true } } },
  });
}

values.addEventListener("input", draw);
size.addEventListener("input", draw);
$("#sample").addEventListener("click", () => { values.value = config().sample; draw(); });
onThemeChange(draw);
