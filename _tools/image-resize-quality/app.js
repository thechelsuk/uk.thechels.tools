import { $, canvasToBlob, drawToCanvas, formatBytes, loadImage, onFiles, onPasteImage, setStatus } from "/assets/js/toolkit.js";
import { hasTransparency } from "../image-to-jpeg/size.js";
import { variants } from "./variants.js";

const grid = $("#grid"), background = $("#background"), status = $("#status");
let image = null, name = "image", urls = [];

async function open([file]) {
  if (!file?.type.startsWith("image/")) return;
  image = await loadImage(file);
  name = (file.name || "pasted").replace(/\.[^.]+$/, "");
  const data = drawToCanvas(image).getContext("2d").getImageData(0, 0, image.width, image.height).data;
  $("#bg-field").hidden = !hasTransparency(data);
  $("#result").hidden = false;
  render();
}

async function render() {
  urls.forEach(URL.revokeObjectURL);
  urls = [];
  setStatus(status, "Working…");
  const items = await Promise.all(variants(image.width, image.height).map(async (v) => {
    const blob = await canvasToBlob(drawToCanvas(image, { width: v.width, height: v.height, background: background.value }), "image/jpeg", v.quality);
    const url = URL.createObjectURL(blob);
    urls.push(url);
    const li = document.createElement("li");
    const img = Object.assign(document.createElement("img"), { src: url, alt: `${v.width} px at ${v.quality * 100}% quality`, loading: "lazy" });
    img.addEventListener("click", () => li.classList.toggle("is-big"));
    const info = Object.assign(document.createElement("p"), { textContent: `${v.width} × ${v.height} · ${v.quality * 100}% · ${formatBytes(blob.size)}` });
    const link = Object.assign(document.createElement("a"), { href: url, download: `${name}-w${v.width}-q${v.quality * 100}.jpg`, textContent: "Download", className: "btn" });
    li.append(img, info, link);
    return li;
  }));
  grid.replaceChildren(...items);
  setStatus(status, `Original ${image.width} × ${image.height} px`);
}

onFiles($("#drop"), $("#file"), open);
onPasteImage((file) => open([file]));
background.addEventListener("change", () => image && render());
