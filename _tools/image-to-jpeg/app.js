import { $, canvasToBlob, copyText, downloadBlob, drawToCanvas, formatBytes, loadImage, onFiles, onPasteImage, setStatus } from "/assets/js/toolkit.js";
import { fitWidth, hasTransparency } from "./size.js";

const status = $("#status"), quality = $("#quality"), width = $("#width"), background = $("#background");
let image = null, name = "image", blob = null, transparent = false, timer;

async function open([file]) {
  if (!file?.type.startsWith("image/")) return;
  image = await loadImage(file);
  name = (file.name || "pasted").replace(/\.[^.]+$/, "");
  const probe = drawToCanvas(image).getContext("2d").getImageData(0, 0, image.width, image.height).data;
  transparent = hasTransparency(probe);
  $("#bg-field").hidden = !transparent;
  width.placeholder = `${image.width} (original)`;
  $("#result").hidden = false;
  render();
}

async function render() {
  if (!image) return;
  const size = fitWidth(image.width, image.height, Number(width.value));
  const canvas = drawToCanvas(image, { ...size, background: background.value });
  blob = await canvasToBlob(canvas, "image/jpeg", quality.value / 100);
  const preview = $("#preview");
  URL.revokeObjectURL(preview.src);
  preview.src = URL.createObjectURL(blob);
  setStatus(status, `${size.width} × ${size.height} px · ${formatBytes(blob.size)}`);
}
const later = () => { clearTimeout(timer); timer = setTimeout(render, 120); };

onFiles($("#drop"), $("#file"), open);
onPasteImage((file) => open([file]));
quality.addEventListener("input", () => { $("#quality-value").textContent = quality.value; later(); });
width.addEventListener("input", later);
background.addEventListener("input", later);
$("#download").addEventListener("click", () => blob && downloadBlob(`${name}.jpg`, blob));
$("#again").addEventListener("click", () => $("#file").click());
$("#copy").addEventListener("click", async () => {
  if (!blob) return;
  const uri = await new Promise((r) => { const f = new FileReader(); f.onload = () => r(f.result); f.readAsDataURL(blob); });
  setStatus(status, (await copyText(uri)) ? "Data URI copied" : "Copy failed", "ok");
});
