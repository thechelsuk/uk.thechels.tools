import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import yaml from "js-yaml";
import { incomeTax, periodNi } from "../assets/js/uk-tax.js";
import { statutoryRedundancy, noticeWeeks, holidayDaysOwed, calculateRedundancy } from "../_tools/redundancy/calc.js";

const rates = yaml.load(readFileSync(new URL("../_data/uk_rates.yml", import.meta.url), "utf8"));
const d = (s) => new Date(`${s}T00:00:00`);
const near = (a, b, msg) => assert.ok(Math.abs(a - b) < 0.01, `${msg}: ${a} != ${b}`);

test("income tax across basic and higher bands", () => {
  near(incomeTax(60000, 12570, rates), 7540 + 3892, "£60k");
  near(incomeTax(12000, 12570, rates), 0, "below allowance");
  near(incomeTax(130000, 12570, rates), 37700 * 0.2 + (125140 - 50270) * 0.4 + (130000 - 125140) * 0.45, "£130k");
});

test("employee NI on one month's pay", () => {
  near(periodNi(5000, 12, rates), (50270 / 12 - 12570 / 12) * 0.08 + (5000 - 50270 / 12) * 0.02, "£5k month");
  near(periodNi(900, 12, rates), 0, "below threshold");
});

test("statutory redundancy is age-banded per service year and capped", () => {
  // Born 1980, 12 full years from 2014: ages 34–40 at 1 week, 41–45 at 1.5 weeks; pay capped at £751.
  const r = statutoryRedundancy({ dob: d("1980-01-01"), start: d("2014-01-01"), end: d("2026-06-30"), weeklyPay: 900 }, rates);
  assert.equal(r.completeYears, 12);
  assert.equal(r.rows.length, 12);
  near(r.total, 7 * 751 + 5 * 1.5 * 751, "total");
  assert.equal(r.rows[0].band, "22–40");
  assert.equal(r.rows.at(-1).band, "41+");
});

test("no statutory pay under 2 years; only the last 20 years count", () => {
  assert.equal(statutoryRedundancy({ dob: d("1990-01-01"), start: d("2025-01-01"), end: d("2026-06-30"), weeklyPay: 500 }, rates).total, 0);
  const long = statutoryRedundancy({ dob: d("1960-01-01"), start: d("2000-01-01"), end: d("2026-06-30"), weeklyPay: 500 }, rates);
  assert.equal(long.rows.length, 20);
  near(long.total, 20 * 1.5 * 500, "20 years at 41+");
});

test("statutory notice is a week per full year up to 12", () => {
  assert.equal(noticeWeeks(3.5, 0, rates), 3);
  assert.equal(noticeWeeks(15, 0, rates), 12);
  assert.equal(noticeWeeks(15, 16, rates), 16);
  assert.equal(noticeWeeks(0.5, 0, rates), 1);
});

test("holiday owed is pro rata to the leave year, less days taken, plus carry forward", () => {
  near(holidayDaysOwed({ entitlement: 28, leaveYearStart: d("2026-01-01"), end: d("2026-07-01"), taken: 5, carried: 3 }), (28 * 181) / 365 - 5 + 3, "owed");
});

test("the first £30,000 of redundancy pay is tax-free", () => {
  const r = calculateRedundancy({
    dob: d("1980-01-01"), serviceStart: d("2014-01-01"), termination: d("2026-06-30"),
    weeklyPay: 900, enhancedPay: 25000, contractualNoticeWeeks: 0,
    annualHolidayDays: 28, leaveYearStart: d("2026-01-01"), daysTaken: 28, carryForwardDays: 0,
    personalAllowance: 12570, taxMonth: 3, ytdGross: 11250, ytdTax: 1000, furtherIncome: false,
    salSacPercent: 0, studentLoanPlan: null,
  }, rates);
  near(r.taxFree, 30000, "tax-free");
  near(r.taxableRedundancyExcess, 10889.5 + 25000 - 30000, "excess");
  near(r.holidayPay, 0, "holiday all taken");
  near(r.noticePay, 12 * 900, "notice");
});
