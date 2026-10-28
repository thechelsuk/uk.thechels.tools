import { $, setStatus } from "/assets/js/toolkit.js";
import { describeWeather, normalisePostcode } from "./weather.js";

const KEY = "openweather_api_key"; // same key as before
const key = $("#key"), remember = $("#remember"), status = $("#status");

try {
  const saved = localStorage.getItem(KEY);
  if (saved) { key.value = saved; remember.checked = true; }
} catch { /* storage blocked */ }

function storeKey() {
  try {
    if (remember.checked && key.value.trim()) localStorage.setItem(KEY, key.value.trim());
    else localStorage.removeItem(KEY);
  } catch { /* storage blocked */ }
}

$("#form").addEventListener("submit", async (e) => {
  e.preventDefault();
  storeKey();
  const postcode = normalisePostcode($("#postcode").value);
  if (!postcode) return setStatus(status, "That doesn't look like a UK postcode", "error");
  $("#go").disabled = true;
  setStatus(status, "Finding postcode…");
  try {
    const place = await fetch(`https://api.postcodes.io/postcodes/${encodeURIComponent(postcode)}`);
    if (!place.ok) throw new Error("Postcode not found");
    const { latitude, longitude } = (await place.json()).result;
    setStatus(status, "Getting weather…");
    const params = new URLSearchParams({ lat: latitude, lon: longitude, appid: key.value.trim(), units: "metric" });
    const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?${params}`);
    if (res.status === 401) throw new Error("OpenWeatherMap didn't accept that key (new keys can take a couple of hours)");
    if (!res.ok) throw new Error("Weather not available right now");
    const w = describeWeather(await res.json());
    $("#place").textContent = `${w.place} (${postcode})`;
    for (const id of ["summary", "temp", "feels", "humidity", "wind"]) $(`#${id}`).textContent = w[id];
    $("#result").hidden = false;
    setStatus(status, `Updated ${new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`, "ok");
  } catch (err) {
    setStatus(status, err.message, "error");
  } finally {
    $("#go").disabled = false;
  }
});
remember.addEventListener("change", storeKey);
