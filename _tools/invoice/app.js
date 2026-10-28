import { $, config, setStatus } from "/assets/js/toolkit.js";
import { gbp } from "/assets/js/uk-tax.js";
import { totals } from "./totals.js";

const { storage_key: KEY = "invoiceDraft", sample_items: SAMPLE = [] } = config();
const FIELDS = ["number", "date", "due", "from", "to", "taxRate", "terms"];
const items = $("#items"), status = $("#status");
let logo = "";

const today = () => new Date().toISOString().slice(0, 10);
const inDays = (n) => new Date(Date.now() + n * 864e5).toISOString().slice(0, 10);

function addRow({ desc = "", qty = 1, price = 0 } = {}) {
  const tr = document.createElement("tr");
  tr.innerHTML = `<td><input type="text" class="d" aria-label="Description"></td>
    <td><input type="number" class="q" min="0" step="1" aria-label="Quantity"></td>
    <td><input type="number" class="p" min="0" step="0.01" aria-label="Unit price"></td>
    <td class="a"></td>
    <td class="no-print"><button type="button" class="link">Remove</button></td>`;
  tr.querySelector(".d").value = desc;
  tr.querySelector(".q").value = qty;
  tr.querySelector(".p").value = price;
  tr.querySelector("button").addEventListener("click", () => { tr.remove(); update(); });
  items.append(tr);
}

const rows = () => [...items.querySelectorAll("tr")].map((tr) => ({ desc: tr.querySelector(".d").value, qty: tr.querySelector(".q").value, price: tr.querySelector(".p").value }));

function update() {
  const t = totals(rows(), $("#taxRate").value);
  [...items.querySelectorAll(".a")].forEach((td, i) => { td.textContent = gbp(t.lines[i], true); });
  $("#subtotal").textContent = gbp(t.subtotal, true);
  $("#tax").textContent = gbp(t.tax, true);
  $("#total").textContent = gbp(t.total, true);
  save();
}

function save() {
  const data = { ...Object.fromEntries(FIELDS.map((f) => [f, $(`#${f}`).value])), items: rows(), logo };
  try { localStorage.setItem(KEY, JSON.stringify(data)); } catch { setStatus(status, "Couldn't save the draft in this browser (the logo may be too large)", "error"); }
}

function showLogo(src) {
  logo = src || "";
  $("#logo").src = logo;
  $("#logo").hidden = !logo;
  $("#removeLogo").hidden = !logo;
}

function load() {
  let data = null;
  try { data = JSON.parse(localStorage.getItem(KEY)); } catch { /* none */ }
  items.replaceChildren();
  if (data) {
    for (const f of FIELDS) if (data[f] !== undefined) $(`#${f}`).value = data[f];
    (data.items?.length ? data.items : SAMPLE).forEach(addRow);
    showLogo(data.logo);
  } else {
    $("#date").value = today();
    $("#due").value = inDays(30);
    SAMPLE.forEach(addRow);
  }
  update();
}

$("#invoice").addEventListener("input", update);
$("#addItem").addEventListener("click", () => { addRow(); update(); items.querySelector("tr:last-child .d").focus(); });
$("#logoFile").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const r = new FileReader();
  r.onload = () => { showLogo(r.result); save(); };
  r.readAsDataURL(file);
});
$("#removeLogo").addEventListener("click", () => { showLogo(""); save(); });
$("#print").addEventListener("click", () => print());
$("#reset").addEventListener("click", () => {
  if (!confirm("Start a new invoice? This clears the current draft.")) return;
  try { localStorage.removeItem(KEY); } catch { /* ignore */ }
  location.reload();
});
load();
