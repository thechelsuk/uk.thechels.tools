import { test } from "node:test";
import assert from "node:assert/strict";
import { addDays, isoDate, ukDate, nextLevel, dayLoad, planDays } from "../_tools/activity-plan/plan.js";

const LEVELS = ["blank", "sleep", "rest", "low-effort", "medium-effort", "high-effort"];

test("date helpers work in local time without drifting over the clocks changing", () => {
  const start = new Date(2026, 2, 28); // 28 March 2026, the day before BST starts
  assert.equal(isoDate(addDays(start, 1)), "2026-03-29");
  assert.equal(isoDate(addDays(start, 2)), "2026-03-30");
  assert.equal(ukDate(start), "Sat 28 Mar");
});

test("cycles through levels and wraps back to blank", () => {
  assert.equal(nextLevel("blank", LEVELS), "sleep");
  assert.equal(nextLevel("high-effort", LEVELS), "blank");
  assert.equal(nextLevel(undefined, LEVELS), "sleep");
});

test("daily load adds effort levels 3 to 5 as 1 to 3 points", () => {
  const plan = { "2026-01-01-9": "low-effort", "2026-01-01-10": "high-effort", "2026-01-01-11": "rest", "2026-01-02-9": "medium-effort" };
  assert.equal(dayLoad(plan, "2026-01-01", LEVELS), 4);
  assert.equal(dayLoad(plan, "2026-01-02", LEVELS), 2);
});

test("plans four weeks of days from the start date", () => {
  const days = planDays(new Date(2026, 0, 5), 4);
  assert.equal(days.length, 28);
  assert.equal(days[0].key, "2026-01-05");
  assert.equal(days[27].key, "2026-02-01");
  assert.equal(days[7].week, 2);
});
