// UK redundancy package calculation. Ported from the original calculator
// without changing the method; rates come from _data/uk_rates.yml.
import { employerNi, incomeTax, periodNi, studentLoan, taxOnTaxable } from "../../assets/js/uk-tax.js";

const DAY = 1000 * 60 * 60 * 24;
const yearsBetween = (a, b) => (b - a) / (DAY * 365.25);
const addYears = (date, n) => { const d = new Date(date); d.setFullYear(d.getFullYear() + n); return d; };

/** Age-banded statutory redundancy pay over the most recent complete years of service. */
export function statutoryRedundancy({ dob, start, end, weeklyPay }, { redundancy: r }) {
  const capped = Math.min(weeklyPay, r.weekly_pay_cap);
  const rawYears = yearsBetween(start, end);
  const completeYears = Math.floor(rawYears);
  const qualifies = completeYears >= r.min_service_years;
  const counted = Math.min(completeYears, r.max_service_years);
  const rows = [];
  let total = 0;
  if (qualifies) {
    let blockStart = addYears(start, completeYears - counted);
    for (let i = 0; i < counted; i++) {
      const blockEnd = addYears(blockStart, 1);
      const age = yearsBetween(dob, blockStart);
      const [multiplier, band] = age < 22 ? [0.5, "Under 22"] : age < 41 ? [1, "22–40"] : [1.5, "41+"];
      const amount = multiplier * capped;
      total += amount;
      rows.push({ from: blockStart, to: blockEnd, age: Math.floor(age), band, multiplier, amount });
      blockStart = blockEnd;
    }
  }
  return { rows, total, completeYears, rawYears, qualifies, cappedWeeklyPay: capped };
}

/** Statutory notice (a week per complete year, 1 week after a month, capped) or contractual, whichever is longer. */
export function noticeWeeks(rawYears, contractual, { redundancy: r }) {
  const complete = Math.floor(rawYears);
  const statutory = Math.min(r.max_notice_weeks, Math.max(complete >= 1 ? complete : rawYears >= 1 / 12 ? 1 : 0, 0));
  return Math.max(statutory, contractual);
}

/** Holiday days owed: pro rata for the leave year so far, less days taken, plus any carried forward. */
export function holidayDaysOwed({ entitlement, leaveYearStart, end, taken, carried = 0 }) {
  const yearDays = (addYears(leaveYearStart, 1) - leaveYearStart) / DAY;
  const elapsed = Math.max(0, (end - leaveYearStart) / DAY);
  const proRata = entitlement * Math.min(1, elapsed / yearDays);
  return Math.max(0, proRata - taken) + carried;
}

export function calculateRedundancy(i, rates) {
  const stat = statutoryRedundancy({ dob: i.dob, start: i.serviceStart, end: i.termination, weeklyPay: i.weeklyPay }, rates);
  const statutoryNotice = noticeWeeks(stat.rawYears, 0, rates);
  const weeks = noticeWeeks(stat.rawYears, i.contractualNoticeWeeks, rates);
  const noticePay = weeks * i.weeklyPay;

  const holidayDays = holidayDaysOwed({ entitlement: i.annualHolidayDays, leaveYearStart: i.leaveYearStart, end: i.termination, taken: i.daysTaken, carried: i.carryForwardDays });
  const holidayPay = holidayDays * (i.weeklyPay / 5);

  const redundancyTotal = stat.total + i.enhancedPay;
  const taxFree = Math.min(redundancyTotal, rates.redundancy.tax_free_limit);
  const taxableRedundancyExcess = Math.max(0, redundancyTotal - rates.redundancy.tax_free_limit);

  const salSac = (noticePay + holidayPay) * (i.salSacPercent / 100);
  const noticeAndHoliday = noticePay + holidayPay - salSac;
  const taxableThisPayslip = noticeAndHoliday + taxableRedundancyExcess;
  const gross = redundancyTotal + noticePay + holidayPay;
  const payable = redundancyTotal + noticeAndHoliday;

  // Cumulative PAYE for the final payslip.
  const cumulativeFreePay = (i.personalAllowance / 12) * i.taxMonth;
  const cumulativeTaxable = Math.max(0, i.ytdGross + taxableThisPayslip - cumulativeFreePay);
  const payslipTax = Math.max(0, taxOnTaxable(cumulativeTaxable, i.personalAllowance, rates) - i.ytdTax);

  // True liability for the year if this is the last income.
  const annualLiability = incomeTax(i.ytdGross + taxableThisPayslip, i.personalAllowance, rates);
  const taxPaid = i.ytdTax + payslipTax;
  const refund = i.furtherIncome ? null : Math.max(0, taxPaid - annualLiability);
  const underpaid = i.furtherIncome ? null : Math.max(0, annualLiability - taxPaid);

  const ni = periodNi(noticeAndHoliday, 12, rates);
  const employer = employerNi(noticeAndHoliday, 12, rates);
  const loan = studentLoan(noticeAndHoliday, 12, i.studentLoanPlan);
  const net = payable - payslipTax - ni - loan;

  return {
    statutory: stat, statutoryNoticeWeeks: statutoryNotice, noticeWeeks: weeks, noticePay,
    holidayDays, holidayPay, enhancedPay: i.enhancedPay, redundancyTotal, taxFree, taxableRedundancyExcess,
    salSac, taxableThisPayslip, gross, payable, payslipTax, annualLiability, refund, underpaid,
    ni, employerNi: employer, studentLoan: loan, net,
  };
}
