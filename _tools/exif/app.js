import { $, copyText, downloadBlob, onFiles, setStatus } from "/assets/js/toolkit.js";
import { gpsFromTags, tagRows } from "./exif-data.js";

// exif-js's browser build sets a global `EXIF`.
const { EXIF } = window;

const status = $("#status");
let current = null; // { file, rows }

const kb = (bytes) => (bytes > 1e6 ? `${(bytes / 1e6).toFixed(1)} MB` : `${Math.round(bytes / 1e3)} KB`);

function showTags(rows, gps) {
  const body = $("#tags");
  body.replaceChildren(...rows.map(({ label, value }) => {
    const tr = document.createElement("tr");
    const th = Object.assign(document.createElement("th"), { scope: "row", textContent: label });
    const td = Object.assign(document.createElement("td"), { textContent: value });
    tr.append(th, td);
    return tr;
  }));

  const line = $("#gps");
  if (gps) {
    const lat = gps.lat.toFixed(6), lon = gps.lon.toFixed(6);
    const link = Object.assign(document.createElement("a"), {
      href: `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=16/${lat}/${lon}`,
      target: "_blank", rel: "noopener", textContent: `${lat}, ${lon}`,
    });
    line.replaceChildren("Location: ", link, " (this photo records where it was taken)");
    line.className = "exif-gps warn";
  } else {
    line.textContent = "Location: none recorded";
    line.className = "exif-gps";
  }
}

async function load([file]) {
  if (!file || !/jpe?g$/i.test(file.type || file.name)) {
    $("#result").hidden = true;
    $("#drop").querySelector("strong").textContent = "That isn't a JPEG. Try another photo.";
    return;
  }
  const tags = EXIF.readFromBinaryFile(await file.arrayBuffer()) || {};
  const rows = tagRows(tags);
  current = { file, rows };

  $("#preview").src = URL.createObjectURL(file);
  $("#file-name").textContent = file.name;
  $("#file-size").textContent = kb(file.size);
  showTags(rows, gpsFromTags(tags));
  setStatus(status, rows.length ? `${rows.length} tags` : "No metadata found", rows.length ? "" : "ok");
  $("#result").hidden = false;
}

async function stripMetadata() {
  const bitmap = await createImageBitmap(current.file); // applies Exif rotation
  const canvas = Object.assign(document.createElement("canvas"), { width: bitmap.width, height: bitmap.height });
  canvas.getContext("2d").drawImage(bitmap, 0, 0);
  canvas.toBlob((blob) => {
    const name = current.file.name.replace(/\.[^.]+$/, "") + "-clean.jpg";
    downloadBlob(name, blob);
    setStatus(status, "Clean copy saved", "ok");
  }, "image/jpeg", 0.92);
}

onFiles($("#drop"), $("#file"), load);
$("#strip").addEventListener("click", () => current && stripMetadata());
$("#again").addEventListener("click", () => $("#file").click());
$("#copy").addEventListener("click", async () => {
  if (!current) return;
  const json = JSON.stringify(Object.fromEntries(current.rows.map((r) => [r.name, r.value])), null, 2);
  setStatus(status, (await copyText(json)) ? "Copied" : "Copy failed", "ok");
});
