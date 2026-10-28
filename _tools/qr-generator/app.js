import { $, canvasToBlob, config, downloadBlob, downloadText, setStatus } from "/assets/js/toolkit.js";
import { buildSvg, makeMatrix } from "./qr-svg.js";

const { qrcode, jsQR } = window; // vendored qrcode-generator and jsQR
const settings = config();
const status = $("#status");
let current = null; // { svg, width, height }
let fontCss = "";
let run = 0;

$("#text").value = settings.default_text || "";
$("#label").value = settings.default_label || "";
$("#labelColour").value = settings.label_colour || "#6e7378";

// Embed the site font in downloads, so the label looks the same everywhere.
fetch("/fonts/thechelsuk-Regular.woff2").then((r) => r.blob()).then((b) => new Promise((ok) => {
  const f = new FileReader();
  f.onload = () => ok(f.result.split(",")[1]);
  f.readAsDataURL(b);
})).then((b64) => { fontCss = `@font-face{font-family:thechelsuk;src:url(data:font/woff2;base64,${b64}) format("woff2")}`; render(); }).catch(() => {});

function rasterise(svg, width, height, scale) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
    img.onload = () => {
      const canvas = Object.assign(document.createElement("canvas"), { width: Math.round(width * scale), height: Math.round(height * scale) });
      const ctx = canvas.getContext("2d");
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas);
    };
    img.onerror = reject;
    img.src = url;
  });
}

async function scans(built, expected) {
  const canvas = await rasterise(built.svg, built.width, built.height, 8);
  const { data } = canvas.getContext("2d").getImageData(0, 0, canvas.width, canvas.height);
  return jsQR(data, canvas.width, canvas.height)?.data === expected;
}

function options() {
  const placement = $("#placement").value;
  return {
    label: placement === "none" ? "" : $("#label").value,
    placement: placement === "none" ? "centre" : placement,
    dark: $("#dark").value,
    labelColour: $("#labelColour").value,
    fontCss,
  };
}

async function render() {
  const me = ++run;
  const text = $("#text").value;
  const opts = options();
  const centred = opts.label.trim() && opts.placement === "centre";
  $("#eccNote").hidden = !centred;
  $("#ecc").disabled = centred;
  if (!text) { $("#preview").replaceChildren(); current = null; return setStatus(status, "Enter a link or some text"); }

  const ecc = centred ? "H" : $("#ecc").value;
  try {
    // Start at the smallest version; step up if the label stops it scanning.
    const first = makeMatrix(qrcode, text, { ecc });
    const start = (first.length - 17) / 4;
    for (let version = start; version <= Math.min(40, start + 6); version++) {
      const matrix = version === start ? first : makeMatrix(qrcode, text, { ecc, version });
      const built = buildSvg(matrix, opts);
      const ok = await scans(built, text);
      if (me !== run) return; // a newer edit has started
      if (ok || version === Math.min(40, start + 6)) {
        current = built;
        $("#preview").innerHTML = built.svg; // built from escaped values only
        const grew = version > start ? `, made larger so the label fits` : "";
        setStatus(status, ok ? `● Scans OK · ${matrix.length} × ${matrix.length}${grew}` : "This combination doesn't scan reliably. Try a shorter label or put it below.", ok ? "ok" : "error");
        return;
      }
    }
  } catch (e) {
    current = null;
    $("#preview").replaceChildren();
    setStatus(status, /overflow|too long/i.test(e.message) ? "That's too much text for a QR code" : e.message, "error");
  }
}

let timer;
for (const id of ["text", "label", "placement", "ecc", "dark", "labelColour"]) {
  $(`#${id}`).addEventListener("input", () => { clearTimeout(timer); timer = setTimeout(render, 150); });
}
$("#svg").addEventListener("click", () => current && downloadText("qr-code.svg", current.svg, "image/svg+xml"));
$("#png").addEventListener("click", async () => {
  if (!current) return;
  const size = Number($("#pngSize").value);
  const canvas = await rasterise(current.svg, current.width, current.height, size / current.width);
  downloadBlob("qr-code.png", await canvasToBlob(canvas, "image/png"));
});
render();
