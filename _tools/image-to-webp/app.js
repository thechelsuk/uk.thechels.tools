import { $, canvasToBlob, downloadBlob, drawToCanvas, formatBytes, loadImage, onFiles, onPasteImage, setStatus } from "/assets/js/toolkit.js";
import { targetSize, webpName } from "./webp.js";

const status = $("#status"), quality = $("#quality"), resize = $("#resize");
let image = null, fileName = "", blob = null, resized = null, timer;

// Safari can't encode WebP from a canvas and quietly returns a PNG instead.
const supportsWebp = document.createElement("canvas").toDataURL("image/webp").startsWith("data:image/webp");
$("#unsupported").hidden = supportsWebp;

async function open([file]) {
  if (!file?.type.startsWith("image/")) return;
  image = await loadImage(file);
  fileName = file.name || "pasted";
  $("#original").textContent = `Original ${image.width} × ${image.height} px · ${formatBytes(file.size)}`;
  $("#result").hidden = false;
  render();
}

async function render() {
  if (!image || !supportsWebp) return;
  const size = targetSize(image.width, image.height, resize.checked);
  resized = size.width < image.width ? size : null;
  blob = await canvasToBlob(drawToCanvas(image, size), "image/webp", quality.value / 100);
  const preview = $("#preview");
  URL.revokeObjectURL(preview.src);
  preview.src = URL.createObjectURL(blob);
  setStatus(status, `${size.width} × ${size.height} px · ${formatBytes(blob.size)}`);
}
const later = () => { clearTimeout(timer); timer = setTimeout(render, 120); };

onFiles($("#drop"), $("#file"), open);
onPasteImage((file) => open([file]));
quality.addEventListener("input", () => { $("#quality-value").textContent = quality.value; later(); });
resize.addEventListener("change", render);
$("#download").addEventListener("click", () => blob && downloadBlob(webpName(fileName, resized), blob));
$("#again").addEventListener("click", () => $("#file").click());
