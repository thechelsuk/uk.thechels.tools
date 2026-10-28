import { $, setStatus, ukRates } from "/assets/js/toolkit.js";
import { gbp } from "/assets/js/uk-tax.js";
import { calculateRedundancy } from "./calc.js";

const rates = ukRates();
const status = $("#status");
const num = (id) => Number.parseFloat($(`#${id}`).value) || 0;
// Parsed as UTC midnight, exactly as the original calculator did.
const date = (id) => ($(`#${id}`).value ? new Date($(`#${id}`).value) : null);
const iso = (d) => d.toISOString().slice(0, 10);

// Fill rate-dependent text and defaults from _data/uk_rates.yml.
for (const el of document.querySelectorAll("[data-rate]")) {
  el.textContent = gbp(el.dataset.rate.split(".").reduce((o, k) => o[k], rates));
}
$("#personalAllowance").value = rates.income_tax.personal_allowance;
$("#studentLoanPlan").replaceChildren(...Object.entries(rates.student_loans).map(([id, p]) =>
  Object.assign(document.createElement("option"), { value: id, textContent: `${p.name} (over ${gbp(p.threshold)} a year, ${p.rate * 100}%)`, selected: id === "plan2" })));
for (const box of document.querySelectorAll("[data-reveals]")) {
  box.addEventListener("change", () => { $(`#${box.dataset.reveals}`).hidden = !box.checked; });
}
$("#annualSalary").addEventListener("input", () => { $("#weeklyPay").value = (num("annualSalary") / 52).toFixed(2); });

const LABELS = { ok: "On track", warn: "Worth a look", info: "Details", "": "Result" };
const card = (kind, title, lines) =>
  `<div class="card ${kind}" data-label="${LABELS[kind] ?? "Result"}"><h3>${title}</h3>${lines.filter(Boolean).map((l) => `<p>${l}</p>`).join("")}</div>`;
const row = (label, value, total = false) => `<tr${total ? ' class="total"' : ""}><td>${label}</td><td>${value}</td></tr>`;

$("#form").addEventListener("submit", (e) => {
  e.preventDefault();
  const dates = ["dob", "serviceStart", "terminationDate", "leaveYearStart"].map(date);
  if (dates.some((d) => !d)) return setStatus(status, "Fill in all four dates", "error");
  const [dob, serviceStart, termination, leaveYearStart] = dates;
  const loanPlan = $("#studentLoanToggle").checked ? rates.student_loans[$("#studentLoanPlan").value] : null;
  const taxMonth = Math.min(12, Math.max(1, Math.round(num("taxMonth")) || 1));

  const r = calculateRedundancy({
    dob, serviceStart, termination, leaveYearStart,
    weeklyPay: num("weeklyPay"), enhancedPay: num("enhancedPay"), contractualNoticeWeeks: num("contractualNoticeWeeks"),
    annualHolidayDays: num("annualHolidayDays"), daysTaken: num("daysTaken"),
    carryForwardDays: $("#carryForwardToggle").checked ? num("carryForwardDays") : 0,
    personalAllowance: num("personalAllowance"), taxMonth, ytdGross: num("ytdGross"), ytdTax: num("ytdTax"),
    furtherIncome: $("#furtherIncome").value === "yes",
    salSacPercent: $("#salSacToggle").checked ? num("salSacPercent") : 0, studentLoanPlan: loanPlan,
  }, rates);

  const limit = gbp(rates.redundancy.tax_free_limit);
  let cards = "";
  if (!r.statutory.qualifies) {
    cards += card("warn", "Under 2 years' service", [`Statutory redundancy pay needs at least ${rates.redundancy.min_service_years} complete years. You have ${r.statutory.completeYears}. Notice and holiday pay are still shown.`]);
  }
  cards += card("info", `Gross package: ${gbp(r.gross)}`, [
    `<strong>Tax-free:</strong> ${gbp(r.taxFree)} of redundancy pay, up to the ${limit} limit`,
    `<strong>Taxable:</strong> ${gbp(r.taxableThisPayslip)} of notice pay, holiday pay and redundancy over ${limit}`,
  ]);
  cards += card("", `Likely net payment: ${gbp(r.net)}`, [
    `Income tax (cumulative PAYE): ${gbp(r.payslipTax)}`,
    `Employee NI: ${gbp(r.ni)}`,
    r.studentLoan > 0 && `Student loan (${loanPlan.name}): ${gbp(r.studentLoan)}`,
    r.salSac > 0 && `Pension salary sacrifice: ${gbp(r.salSac)}, paid into your pension`,
  ]);
  if (r.refund === null) {
    cards += card("", "More income expected this year", ["Your next employer's tax code will carry on from here, so no refund estimate is shown."]);
  } else if (r.refund > 1) {
    cards += card("warn", `Likely overtaxed by about ${gbp(r.refund)}`, [
      `By tax month ${taxMonth}, PAYE has only given you ${taxMonth}/12 of your personal allowance, so a large final payment is taxed as if it repeats. With no more income this tax year, HMRC usually refunds this through your next payslip, a P800 after April, or sooner with a P50 claim.`,
    ]);
  } else if (r.underpaid > 1) {
    cards += card("", `About ${gbp(r.underpaid)} may still be owed`, ["Tax paid so far may not cover your tax for the whole year, which can happen if earlier tax paid was unusually low."]);
  } else {
    cards += card("ok", "Tax paid looks about right", ["No significant over- or underpayment expected from these figures."]);
  }
  $("#cards").innerHTML = cards;

  $("#breakdown").innerHTML = [
    row("Statutory redundancy pay", gbp(r.statutory.total)),
    row("Enhanced or ex gratia pay", gbp(r.enhancedPay)),
    row(`Notice pay: ${r.noticeWeeks} weeks (statutory ${r.statutoryNoticeWeeks})`, gbp(r.noticePay)),
    row(`Holiday pay: ${r.holidayDays.toFixed(1)} days`, gbp(r.holidayPay)),
    row("Total gross", gbp(r.gross), true),
    r.salSac > 0 ? row("Less pension salary sacrifice", gbp(-r.salSac)) : "",
    row("Less income tax", gbp(-r.payslipTax)),
    row("Less employee NI", gbp(-r.ni)),
    r.studentLoan > 0 ? row("Less student loan", gbp(-r.studentLoan)) : "",
    row("Estimated net payment", gbp(r.net), true),
    row("For reference: employer NI on this payslip", gbp(r.employerNi)),
  ].join("");

  $("#service").innerHTML = r.statutory.rows.length
    ? r.statutory.rows.map((y) => `<tr><td>${iso(y.from)} to ${iso(y.to)}</td><td>${y.age}</td><td>${y.band}</td><td>${y.multiplier}</td><td>${gbp(y.amount)}</td></tr>`).join("")
      + row(`Total statutory redundancy pay`, gbp(r.statutory.total), true).replace("<td>", '<td colspan="4">')
    : `<tr><td colspan="5">No qualifying years of service.</td></tr>`;

  setStatus(status, `Figures for ${rates.tax_year}`, "ok");
  $("#results").hidden = false;
  $("#results").scrollIntoView({ behavior: "smooth", block: "start" });
});
