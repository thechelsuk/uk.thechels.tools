import { test } from "node:test";
import assert from "node:assert/strict";
import { looksLikeDate } from "../assets/js/dates.js";

test("spots cells that are, or start with, a date", () => {
  for (const s of ["2026-02-28", "2014-01-01 to 2015-01-01", "28/02/2026", "28 Feb 2026", "Sat 28 Mar", "2026-10-20 14:03 UTC", "28 February 2026, 09:15", "2026:10:20 14:03:11"]) {
    assert.ok(looksLikeDate(s), s);
  }
});

test("ignores ordinary text and numbers", () => {
  for (const s of ["The WAN Show", "£1,234", "12", "Plan 2", "Ask a question in 2026 about it", ""]) {
    assert.ok(!looksLikeDate(s), s);
  }
});
