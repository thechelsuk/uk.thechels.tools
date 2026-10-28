import { test } from "node:test";
import assert from "node:assert/strict";
import { projectRetirement, fireNumber } from "../_tools/fire/projection.js";

const base = { currentAge: 60, retirementAge: 61, spendingBefore75: 10000, spendingAfter75: 10000, assets: 100000, monthlyContributions: 0, growthRate: 0, inflationRate: 0, db: null, state: null, realTerms: true };

test("with no growth, money lasts total ÷ spending years", () => {
  const r = projectRetirement(base);
  // The original marks funds as exhausted in the year they can only just cover spending.
  assert.equal(r.exhaustedAge, 70);
  assert.equal(r.rows.find((x) => x.age === 69).fromPortfolio, 10000);
});

test("pensions reduce what's drawn from the portfolio", () => {
  const r = projectRetirement({ ...base, state: { amount: 6000, startAge: 66 }, db: { amount: 4000, startAge: 68 } });
  assert.equal(r.rows.find((x) => x.age === 66).fromPortfolio, 4000);
  assert.equal(r.rows.find((x) => x.age === 68).fromPortfolio, 0);
  assert.equal(r.exhaustedAge, null);
});

test("contributions are added each year until retirement", () => {
  const r = projectRetirement({ ...base, currentAge: 58, retirementAge: 61, assets: 0, monthlyContributions: 1000, spendingBefore75: 0, spendingAfter75: 0 });
  assert.equal(r.atRetirement, 24000);
});

test("FIRE number is spending over the withdrawal rate", () => {
  assert.equal(fireNumber(36000, 0.04), 900000);
});
