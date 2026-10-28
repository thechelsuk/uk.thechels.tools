// UK income tax and National Insurance, using the rates in _data/uk_rates.yml.
// England, Wales and Northern Ireland bands.

/** Income tax on taxable income (after the personal allowance has been taken off). */
export function taxOnTaxable(taxable, personalAllowance, { income_tax: t }) {
  const basicBand = t.basic_rate_limit - personalAllowance;
  const higherBand = t.higher_rate_limit - t.basic_rate_limit;
  let left = Math.max(0, taxable);
  const basic = Math.min(left, basicBand); left -= basic;
  const higher = Math.min(left, higherBand); left -= higher;
  return basic * t.basic_rate + higher * t.higher_rate + left * t.additional_rate;
}

/** Income tax on gross income. */
export const incomeTax = (gross, personalAllowance, rates) =>
  taxOnTaxable(Math.max(0, gross - personalAllowance), personalAllowance, rates);

/** Employee NI on one pay period, with thresholds pro-rated (not cumulative). */
export function periodNi(pay, periodsPerYear, { national_insurance: n }) {
  const pt = n.primary_threshold / periodsPerYear;
  const uel = n.upper_earnings_limit / periodsPerYear;
  let ni = 0;
  if (pay > pt) ni += (Math.min(pay, uel) - pt) * n.main_rate;
  if (pay > uel) ni += (pay - uel) * n.upper_rate;
  return Math.max(0, ni);
}

/** Employer NI on one pay period. */
export const employerNi = (pay, periodsPerYear, { national_insurance: n }) =>
  Math.max(0, pay - n.employer_threshold / periodsPerYear) * n.employer_rate;

/** Student loan repayment on one pay period. */
export const studentLoan = (pay, periodsPerYear, plan) =>
  plan ? Math.max(0, pay - plan.threshold / periodsPerYear) * plan.rate : 0;

/** "£1,234" (or with pence when `pence` is true). */
export const gbp = (n, pence = false) =>
  `${n < 0 ? "-" : ""}£${Math.abs(n).toLocaleString("en-GB", { minimumFractionDigits: pence ? 2 : 0, maximumFractionDigits: pence ? 2 : 0 })}`;
