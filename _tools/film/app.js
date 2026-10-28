import { $, config, setStatus } from "/assets/js/toolkit.js";
import { merge, normalise, search } from "./films.js";

const KEY = config().storage_key || "filmList"; // same key as before
const yaml = window.jsyaml;
const q = $("#q"), results = $("#results"), status = $("#status");

let films = (() => { try { return normalise(JSON.parse(localStorage.getItem(KEY)) || []); } catch { return []; } })();
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(films)); } catch { setStatus(status, "Couldn't save the list in this browser", "error"); } };
const count = () => setStatus(status, `${films.length.toLocaleString()} films`);

function render() {
  const found = search(films, q.value);
  results.replaceChildren(...found.map((f) => {
    const li = document.createElement("li");
    li.append(Object.assign(document.createElement("b"), { textContent: f.Title }));
    const meta = [f.Year, f.Rating && `rated ${f.Rating}`, f.Imdb].filter(Boolean).join(" · ");
    if (meta) li.append(Object.assign(document.createElement("span"), { textContent: meta }));
    return li;
  }));
  if (q.value.trim() && !found.length) results.replaceChildren(Object.assign(document.createElement("li"), { textContent: "No matches", className: "film-none" }));
}

$("#file").addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const added = normalise(yaml.load(await file.text()));
    const before = films.length;
    films = merge(films, added);
    save();
    setStatus(status, `Read ${added.length} films; ${films.length - before} new. ${films.length.toLocaleString()} in total.`, "ok");
    render();
  } catch (err) {
    setStatus(status, `Couldn't read that file: ${err.reason || err.message}`, "error");
  }
  e.target.value = "";
});
q.addEventListener("input", render);
$("#clearAll").addEventListener("click", () => {
  if (!confirm("Delete the whole film list from this browser?")) return;
  films = []; save(); render(); count();
});
count();
q.focus();
