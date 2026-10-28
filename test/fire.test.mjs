import { test } from "node:test";
import assert from "node:assert/strict";
import { projectRetirement } from "../_tools/fire/projection.js";

const pot = (key, value, extra = {}) => ({ key, name: key, value, monthly: 0, growth: 0, until: null, fromAge: 0, ...extra });
const base = {
  currentAge: 60, retirementAge: 61, spendingBefore75: 10000, spendingAfter75: 10000, inflationRate: 0, realTerms: true,
  pots: [pot("cash", 100000)], order: ["cash"], db: null, state: null,
};
const at = (r, age) => r.rows.find((x) => x.age === age);

test("with no growth, money lasts total ÷ spending years", () => {
  const r = projectRetirement(base);
  assert.equal(at(r, 70).withdrawals.cash, 10000);
  assert.deepEqual(r.gaps, [{ from: 71, to: 100, total: 300000 }]);
  assert.equal(r.runsOutAge, 71);
});

test("pensions reduce what's drawn from the pots", () => {
  const r = projectRetirement({ ...base, state: { amount: 6000, startAge: 66 }, db: { amount: 4000, startAge: 68 } });
  assert.equal(at(r, 66).fromPortfolio, 4000);
  assert.equal(at(r, 68).fromPortfolio, 0);
  assert.deepEqual(r.gaps, []);
});

test("pots are drawn in the chosen order", () => {
  const pots = [pot("cash", 15000), pot("isa", 50000)];
  const r = projectRetirement({ ...base, pots, order: ["cash", "isa"] });
  assert.deepEqual(at(r, 61).withdrawals, { cash: 10000, isa: 0 });
  assert.deepEqual(at(r, 62).withdrawals, { cash: 5000, isa: 5000 });
  assert.deepEqual(at(r, 63).withdrawals, { cash: 0, isa: 10000 });
  const flipped = projectRetirement({ ...base, pots, order: ["isa", "cash"] });
  assert.deepEqual(at(flipped, 61).withdrawals, { cash: 0, isa: 10000 });
});

test("a pension can't be touched before its from age, leaving a gap", () => {
  const pots = [pot("isa", 20000), pot("dc", 100000, { fromAge: 65 })];
  const r = projectRetirement({ ...base, pots, order: ["dc", "isa"] });
  assert.deepEqual(at(r, 61).withdrawals, { isa: 10000, dc: 0 });
  assert.equal(at(r, 63).shortfall, 10000);
  assert.deepEqual(r.gaps[0], { from: 63, to: 64, total: 20000 });
  assert.deepEqual(at(r, 65).withdrawals, { isa: 0, dc: 10000 });
  assert.equal(at(r, 65).shortfall, 0);
  assert.equal(r.runsOutAge, 75);
});

test("every pot grows until it's empty, including locked ones", () => {
  const pots = [pot("isa", 10000, { growth: 0.1 }), pot("dc", 1000, { growth: 0.1, fromAge: 99 })];
  const r = projectRetirement({ ...base, pots, order: ["isa", "dc"], spendingBefore75: 0, spendingAfter75: 0 });
  assert.ok(Math.abs(at(r, 62).balances.isa - 12100) < 1e-6);
  assert.ok(Math.abs(at(r, 62).balances.dc - 1210) < 1e-6);
});

test("each pot's contributions stop at its own age, or at retirement if blank", () => {
  const pots = [pot("cash", 0, { monthly: 100 }), pot("isa", 0, { monthly: 100, until: 59 }), pot("dc", 0, { monthly: 100, until: 63 })];
  const r = projectRetirement({ ...base, currentAge: 57, retirementAge: 61, spendingBefore75: 0, spendingAfter75: 0, pots, order: ["cash", "isa", "dc"] });
  assert.deepEqual(at(r, 61).balances, { cash: 4800, isa: 2400, dc: 4800 });
  assert.deepEqual(at(r, 64).balances, { cash: 4800, isa: 2400, dc: 7200 });
  assert.equal(r.atRetirement, 12000);
});

test("spending and pensions are in today's money, so both views agree", () => {
  const input = { ...base, currentAge: 55, retirementAge: 58, inflationRate: 0.03, pots: [pot("isa", 200000, { growth: 0.05 })], order: ["isa"], state: { amount: 5000, startAge: 67 } };
  const real = projectRetirement(input);
  const nominal = projectRetirement({ ...input, realTerms: false });
  assert.equal(real.runsOutAge, nominal.runsOutAge);
  const factor = 1.03 ** (80 - 55);
  assert.ok(Math.abs(at(nominal, 80).spending / factor - at(real, 80).spending) < 1e-6);
  assert.ok(Math.abs(at(nominal, 80).total / factor - at(real, 80).total) < 1e-6);
  assert.equal(at(real, 67).state, 5000);
});

test("spending steps down from 75", () => {
  const r = projectRetirement({ ...base, pots: [pot("cash", 1e6)], spendingAfter75: 4000 });
  assert.equal(at(r, 74).fromPortfolio, 10000);
  assert.equal(at(r, 75).fromPortfolio, 4000);
});
