import { test } from "node:test";
import assert from "node:assert/strict";
import { clock, duration, summarise } from "../_tools/pomodoro/time.js";
import { apiUrls, issueToMarkdown } from "../_tools/github-issue/issue.js";
import { normalisePostcode, describeWeather } from "../_tools/weather-forecast/weather.js";

test("formats the timer and durations", () => {
  assert.equal(clock(1500), "25:00");
  assert.equal(clock(65), "01:05");
  assert.equal(clock(-3), "00:00");
  assert.equal(duration(3725), "1h 2m 5s");
  assert.equal(duration(125), "2m 5s");
});

test("summarises focused time from sessions", () => {
  const s = [{ duration: 1500 }, { duration: 600 }, { duration: 900 }];
  assert.deepEqual(summarise(s), { count: 3, total: 3000 });
});

test("turns an issue URL into API URLs, with or without extra path", () => {
  assert.deepEqual(apiUrls("https://github.com/acme/app/issues/42#issuecomment-1"), {
    issue: "https://api.github.com/repos/acme/app/issues/42",
    comments: "https://api.github.com/repos/acme/app/issues/42/comments?per_page=100",
  });
  assert.ok(apiUrls("https://github.com/acme/app/pull/7").issue.endsWith("/issues/7"));
  assert.throws(() => apiUrls("https://example.com/x"), /GitHub issue/);
});

test("builds Markdown with a blank line around every heading", () => {
  const md = issueToMarkdown(
    { title: "Bug", state: "open", user: { login: "ann" }, created_at: "2026-01-02T03:04:05Z", html_url: "https://github.com/a/b/issues/1", body: "It broke." },
    [{ user: { login: "bo" }, created_at: "2026-01-03T00:00:00Z", body: "Fixed." }],
  );
  assert.equal(md, [
    "# Bug", "", "- **State:** open", "- **Opened by:** ann", "- **Opened:** 2026-01-02 03:04 UTC", "- **Link:** https://github.com/a/b/issues/1", "",
    "It broke.", "", "## Comments", "", "### bo, 2026-01-03 00:00 UTC", "", "Fixed.", "",
  ].join("\n"));
});

test("cleans up UK postcodes", () => {
  assert.equal(normalisePostcode(" gl50 1aa "), "GL50 1AA");
  assert.equal(normalisePostcode("GL501AA"), "GL50 1AA");
  assert.equal(normalisePostcode("nope!"), null);
});

test("describes OpenWeather data in plain values", () => {
  const w = describeWeather({ name: "Cheltenham", weather: [{ main: "Rain", description: "light rain" }], main: { temp: 11.46, feels_like: 10.2, humidity: 87 }, wind: { speed: 4.12 } });
  assert.deepEqual(w, { place: "Cheltenham", summary: "Light rain", temp: "11°C", feels: "10°C", humidity: "87%", wind: "4 m/s (9 mph)" });
});
