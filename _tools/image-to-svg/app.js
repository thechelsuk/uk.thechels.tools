import { $, config, copyText, downloadText, drawToCanvas, formatBytes, loadImage, onFiles, setStatus } from "/assets/js/toolkit.js";

const tracer = window.ImageTracer; // from the vendored imagetracerjs build
const preset = $("#preset"), status = $("#status");
let pixels = null, name = "image", svg = "";

preset.replaceChildren(...(config().presets || ["default"]).map((p) => Object.assign(document.createElement("option"), {
  value: p, textContent: p.replace(/(\d)$/, " $1").replace(/^./, (c) => c.toUpperCase()),
})));

async function open([file]) {
  if (!/^image\/(png|jpeg)$/.test(file?.type)) return;
  const image = await loadImage(file);
  name = file.name.replace(/\.[^.]+$/, "");
  pixels = drawToCanvas(image).getContext("2d").getImageData(0, 0, image.width, image.height);
  $("#result").hidden = false;
  trace();
}

function trace() {
  setStatus(status, "Tracing…");
  // Let the status paint before the (synchronous) trace runs.
  requestAnimationFrame(() => setTimeout(() => {
    svg = tracer.imagedataToSVG(pixels, { ...tracer.optionpresets[preset.value], viewbox: true });
    const preview = $("#preview");
    URL.revokeObjectURL(preview.src);
    // Shown as an image, so the SVG can't run anything on this page.
    preview.src = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
    setStatus(status, `${(svg.match(/<path/g) || []).length.toLocaleString()} shapes · ${formatBytes(new Blob([svg]).size)}`);
  }));
}

onFiles($("#drop"), $("#file"), open);
preset.addEventListener("change", () => pixels && trace());
$("#download").addEventListener("click", () => svg && downloadText(`${name}.svg`, svg, "image/svg+xml"));
$("#copy").addEventListener("click", async () => svg && setStatus(status, (await copyText(svg)) ? "SVG copied" : "Copy failed", "ok"));
$("#again").addEventListener("click", () => $("#file").click());
