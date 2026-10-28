import { $, copyText, drawToCanvas, loadImage, onFiles, onPasteImage, setStatus } from "/assets/js/toolkit.js";
import { describeContent } from "./content.js";

const jsQR = window.jsQR; // from the vendored jsQR build
const status = $("#status"), video = $("#video");
let stream = null, last = "";

function show(data) {
  last = data;
  const info = describeContent(data);
  const text = $("#text");
  const labels = { url: "Web address", wifi: "Wi-Fi network", email: "Email address", text: "Text" };
  $("#kind").textContent = labels[info.kind];
  if (info.kind === "url") {
    const a = Object.assign(document.createElement("a"), { href: info.href, textContent: info.href, target: "_blank", rel: "noopener noreferrer" });
    text.replaceChildren(a);
  } else {
    text.textContent = info.kind === "wifi" ? `${info.network}\n\n${data}` : data;
  }
  $("#result").hidden = false;
  setStatus(status, "● Code found", "ok");
}

function decode(source) {
  const { data, width, height } = drawToCanvas(source).getContext("2d").getImageData(0, 0, source.width ?? source.videoWidth, source.height ?? source.videoHeight);
  return jsQR(data, width, height)?.data ?? null;
}

async function fromFile([file]) {
  if (!file?.type.startsWith("image/")) return;
  stop();
  const found = decode(await loadImage(file));
  if (found !== null) show(found);
  else { $("#result").hidden = true; setStatus(status, "No QR code found in that image", "error"); }
}

function stop() {
  stream?.getTracks().forEach((t) => t.stop());
  stream = null;
  $("#camera").hidden = true;
  $("#drop").hidden = false;
  $("#cam").textContent = "Use camera";
}

async function scan() {
  if (stream) return stop();
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
  } catch {
    return setStatus(status, "Camera not available or permission refused", "error");
  }
  video.srcObject = stream;
  await video.play();
  $("#camera").hidden = false;
  $("#drop").hidden = true;
  $("#cam").textContent = "Stop camera";
  setStatus(status, "Looking for a code…");
  const tick = () => {
    if (!stream) return;
    if (video.videoWidth) {
      const frame = drawToCanvas(video, { width: video.videoWidth, height: video.videoHeight });
      const found = jsQR(frame.getContext("2d").getImageData(0, 0, frame.width, frame.height).data, frame.width, frame.height);
      if (found) { show(found.data); stop(); return; }
    }
    requestAnimationFrame(tick);
  };
  tick();
}

onFiles($("#drop"), $("#file"), fromFile);
onPasteImage((file) => fromFile([file]));
$("#cam").addEventListener("click", scan);
$("#copy").addEventListener("click", async () => last && setStatus(status, (await copyText(last)) ? "Copied" : "Copy failed", "ok"));
