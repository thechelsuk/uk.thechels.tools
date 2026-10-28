import { $, canvasToBlob, downloadBlob, setStatus } from "/assets/js/toolkit.js";
import { gridSize } from "./layout.js";

const PROXY = "https://api.allorigins.win/raw?url=";
const status = $("#status"), grid = $("#grid");
const parser = new DOMParser(); // builds inert documents: nothing in a feed runs

async function fetchFeed(url) {
  try {
    const res = await fetch(url);
    if (res.ok) return await res.text();
  } catch { /* blocked by the feed's server: try the proxy */ }
  if (!$("#proxy").checked) return null;
  const res = await fetch(PROXY + encodeURIComponent(url));
  return res.ok ? res.text() : null;
}

function artwork(xml) {
  const doc = parser.parseFromString(xml, "text/xml");
  return doc.querySelector("image[href]")?.getAttribute("href")
    || doc.querySelector("image url")?.textContent?.trim()
    || doc.querySelector("channel > *[href]")?.getAttribute("href")
    || null;
}

async function make() {
  const file = $("#file").files[0];
  if (!file) return setStatus(status, "Choose an OPML file first", "error");
  const opml = parser.parseFromString(await file.text(), "text/xml");
  const feeds = [...opml.querySelectorAll("outline[xmlUrl]")].map((o) => ({ title: o.getAttribute("text") || o.getAttribute("title") || "Untitled podcast", url: o.getAttribute("xmlUrl") }));
  if (!feeds.length) return setStatus(status, "No podcast feeds found in that file", "error");

  grid.replaceChildren();
  $("#download").disabled = true;
  let done = 0, found = 0;
  setStatus(status, `Fetching 0 of ${feeds.length}…`);
  await Promise.all(feeds.map(async (feed) => {
    try {
      const xml = await fetchFeed(feed.url);
      const src = xml && artwork(xml);
      if (src) {
        const li = document.createElement("li");
        const img = Object.assign(document.createElement("img"), { src, alt: feed.title, title: feed.title, loading: "lazy" });
        img.addEventListener("error", () => li.remove());
        li.append(img, Object.assign(document.createElement("span"), { textContent: feed.title }));
        grid.append(li);
        found++;
      }
    } catch { /* skip this feed */ }
    setStatus(status, `Fetching ${++done} of ${feeds.length}…`);
  }));
  setStatus(status, `Artwork for ${found} of ${feeds.length} podcasts`, found ? "ok" : "error");
  $("#download").disabled = !found;
}

async function download() {
  const imgs = [...grid.querySelectorAll("img")].filter((i) => i.complete && i.naturalWidth);
  const { cols, rows } = gridSize(imgs.length);
  const size = 300;
  const canvas = Object.assign(document.createElement("canvas"), { width: cols * size, height: rows * size });
  const ctx = canvas.getContext("2d");
  imgs.forEach((img, i) => ctx.drawImage(img, (i % cols) * size, Math.floor(i / cols) * size, size, size));
  try {
    downloadBlob("podcast-grid.png", await canvasToBlob(canvas, "image/png"));
  } catch {
    setStatus(status, "Some hosts don't allow their artwork to be saved. Take a screenshot instead.", "error");
  }
}

$("#go").addEventListener("click", make);
$("#download").addEventListener("click", download);
