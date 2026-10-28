import { test } from "node:test";
import assert from "node:assert/strict";
import { simulate, earliestAge } from "../_tools/fire-two/simulate.js";

const base = { startAge: 60, retireAge: 60, spendEarly: 10000, spendLate: 10000, spendChangeAge: 90, dc: 0, dcMonthly: 0, sipp: 0, isa: 100000, dbAmount: 0, dbAge: 99, dbLump: 0, spAmount: 0, spAge: 99, otherIncome: 0, otherIncomeUntil: 0, contributionsUntil: 0, growth: 0 };

test("with no growth, the pots last total ÷ spending years", () => {
  const rows = simulate(base);
  assert.equal(rows.find((r) => r.age === 69).total, 0);
  assert.equal(rows.find((r) => r.age === 69).drawdown, 10000);
  assert.equal(rows.find((r) => r.age === 70).drawdown, 0);
});

test("guaranteed income comes first; drawdown covers the rest", () => {
  const rows = simulate({ ...base, spAmount: 6000, spAge: 62 });
  assert.equal(rows.find((r) => r.age === 62).drawdown, 4000);
});

test("the DB lump sum lands in the ISA once", () => {
  const rows = simulate({ ...base, retireAge: 99, isa: 0, dbLump: 5000, dbAge: 65 });
  assert.equal(rows.find((r) => r.age === 70).isa, 5000);
});

test("earliest age finds the first age that lasts to 100", () => {
  assert.equal(earliestAge({ ...base, isa: 420000 }), 60); // 41 years of £10k, with some left
  assert.equal(earliestAge({ ...base, isa: 100 }), null);
});
