/** Tidy a UK postcode to "AA9 9AA" form, or null if it can't be one. */
export function normalisePostcode(input) {
  const s = input.toUpperCase().replace(/\s+/g, "");
  if (!/^[A-Z]{1,2}\d[A-Z\d]?\d[A-Z]{2}$/.test(s)) return null;
  return `${s.slice(0, -3)} ${s.slice(-3)}`;
}

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

/** Plain, display-ready values from an OpenWeather "current weather" response. */
export function describeWeather(d) {
  return {
    place: d.name,
    summary: cap(d.weather?.[0]?.description || d.weather?.[0]?.main || ""),
    temp: `${Math.round(d.main.temp)}°C`,
    feels: `${Math.round(d.main.feels_like)}°C`,
    humidity: `${d.main.humidity}%`,
    wind: `${Math.round(d.wind.speed)} m/s (${Math.round(d.wind.speed * 2.237)} mph)`,
  };
}
