import { test } from "node:test";
import assert from "node:assert/strict";
import { futureValue, requiredApex, requiredContribution, buildPath, earliestFireAge, earliestFireAgeExact, formatAge } from "../_tools/bridge/bridge.js";

const near = (a, b) => assert.ok(Math.abs(a - b) < 0.01, `${a} != ${b}`);

test("future value with and without growth", () => {
  near(futureValue(1000, 100, 0, 5), 1500);
  near(futureValue(1000, 0, 0.1, 2), 1210);
  near(futureValue(0, 100, 0.1, 2), 210);
});

test("the apex pays out exactly the withdrawals", () => {
  const apex = requiredApex(10000, 0.05, 8);
  const path = buildPath(50, apex, 0, 10000, 0.05, 50, 58);
  near(path.at(-1).value, 0);
  near(requiredApex(10000, 0, 8), 80000);
});

test("the contribution needed reaches the target", () => {
  const c = requiredContribution(50000, 200000, 0.05, 10);
  near(futureValue(50000, c, 0.05, 10), 200000);
});

test("earliest FIRE age is the first year the pot covers the bridge", () => {
  const r = earliestFireAge(43, 147000, 20000, 36000, 0.05, 58);
  assert.ok(r.projected >= r.required);
  const before = r.fireAge - 1;
  assert.ok(futureValue(147000, 20000, 0.05, before - 43) < requiredApex(36000, 0.05, 58 - before));
  assert.equal(earliestFireAge(43, 0, 0, 100000, 0.05, 58), null);
});

test("the exact crossover falls within the whole-year answer", () => {
  const whole = earliestFireAge(43, 147000, 20000, 36000, 0.05, 58).fireAge;
  const exact = earliestFireAgeExact(43, 147000, 20000, 36000, 0.05, 58);
  assert.ok(exact <= whole && exact > whole - 1);
  assert.equal(formatAge(52.25), "52y 3m");
  assert.equal(formatAge(52.99), "53y");
});
