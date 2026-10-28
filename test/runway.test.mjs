import { test } from "node:test";
import assert from "node:assert/strict";
import { runway } from "../_tools/runway/runway.js";

test("with no growth, the runway is total ÷ monthly spend", () => {
  const r = runway([{ key: "a", balance: 12000, rate: 0 }], 1000);
  assert.equal(r.months, 12);
  assert.equal(r.partial, false);
});

test("draws pots in order and records a partial final month", () => {
  const r = runway([{ key: "a", balance: 1500, rate: 0 }, { key: "b", balance: 1000, rate: 0 }], 1000);
  assert.equal(r.months, 3);
  assert.deepEqual(r.rows.map((x) => [x.a, x.b]), [[500, 1000], [0, 500], [0, 0]]);
  assert.equal(r.partial, true);
});

test("taxes savings interest at the marginal rate", () => {
  const r = runway([{ key: "a", balance: 12000, rate: 12, tax: 20 }], 12000);
  assert.equal(r.months, 1);
  const big = runway([{ key: "a", balance: 120000, rate: 12, tax: 20 }], 1000, { maxMonths: 1 });
  assert.ok(Math.abs(big.tax - 119000 * 0.01 * 0.2) < 1e-6);
});

test("stops at the safety limit if growth outpaces spending", () => {
  const r = runway([{ key: "a", balance: 1000000, rate: 10 }], 100, { maxMonths: 50 });
  assert.equal(r.endless, true);
});
