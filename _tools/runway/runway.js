// Drawdown runway: spend a fixed amount each month, taken from the pots in
// order, while each pot earns its own rate (savings interest taxed at the
// chosen marginal rate). Ported unchanged from the original calculator.

export function runway(pots, monthlyExpense, { maxMonths = 1200 } = {}) {
  const state = pots.map((p) => ({ ...p, monthlyRate: p.rate / 100 / 12, taxRate: (p.tax || 0) / 100 }));
  const balance = () => state.reduce((s, p) => s + p.balance, 0);
  const rows = [];
  let interest = 0, tax = 0, month = 0;
  while (balance() > 0.005 && month < maxMonths) {
    month++;
    let need = monthlyExpense, withdrawal = 0;
    for (const p of state) {
      if (need <= 0.0001) break;
      const take = Math.min(p.balance, need);
      p.balance -= take; need -= take; withdrawal += take;
    }
    const row = { month, withdrawal };
    for (const p of state) {
      const gross = p.balance * p.monthlyRate;
      const t = gross * p.taxRate;
      p.balance += gross - t;
      interest += gross - t; tax += t;
      row[p.key] = p.balance;
    }
    row.total = balance();
    rows.push(row);
  }
  const partial = rows.length > 0 && rows.at(-1).withdrawal < monthlyExpense - 0.01;
  return { rows, months: month, years: Math.floor(month / 12), monthsLeft: month % 12, interest, tax, partial, endless: month >= maxMonths };
}
