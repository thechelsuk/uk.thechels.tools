import { $, config, setStatus } from "/assets/js/toolkit.js";
import { chartDefaults, onThemeChange } from "/assets/js/charts.js";
import { cumulative, parseNumbers, percentile, simulate } from "./simulate.js";

const { Chart } = window; // vendored Chart.js; the annotation plugin registers itself
const settings = config();
const status = $("#status");
let chart = null, last = null;

function draw() {
  if (!last) return;
  const c = chartDefaults(Chart);
  const points = cumulative(last);
  chart?.destroy();
  chart = new Chart($("#chart"), {
    type: "bar",
    data: {
      labels: points.map((p) => p.sprints),
      datasets: [{ label: "Chance of finishing", data: points.map((p) => p.chance * 100), backgroundColor: c.accent, borderRadius: 3 }],
    },
    options: {
      scales: {
        x: { title: { display: true, text: "Sprints" } },
        y: { min: 0, max: 100, title: { display: true, text: "Chance of being done (%)" }, ticks: { callback: (v) => `${v}%` } },
      },
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: (ctx) => `${ctx.parsed.y.toFixed(1)}% chance within ${ctx.label} sprints` } },
        annotation: {
          annotations: [80, 90].map((v) => ({
            type: "line", scaleID: "y", value: v, borderColor: v === 80 ? c.warn : c.ok, borderWidth: 1.5, borderDash: [6, 4],
            label: { display: true, content: `${v}%`, position: "start", backgroundColor: "transparent", color: c.ink },
          })),
        },
      },
    },
  });
}

$("#form").addEventListener("submit", (e) => {
  e.preventDefault();
  try {
    last = simulate(parseNumbers($("#throughput").value), Number($("#remaining").value), { iterations: settings.iterations || 10000 });
    for (const p of [50, 80, 90, 95]) $(`#p${p}`).textContent = `${percentile(last, p / 100)} sprints`;
    $("#stats").hidden = false;
    setStatus(status, `${last.length.toLocaleString()} simulated runs`, "ok");
    draw();
  } catch (err) {
    setStatus(status, err.message, "error");
  }
});
$("#sample").addEventListener("click", () => {
  $("#throughput").value = settings.sample_throughput;
  $("#remaining").value = settings.sample_remaining;
  $("#form").requestSubmit();
});
onThemeChange(draw);
