// Pension-pot FIRE planner, ported from the original. The ages that were
// fixed in the old version (start 43, contributions and sick pay to 48,
// DB and lump sum at 65, State Pension at 68) are now inputs; the page's
// defaults keep the original figures.

export function simulate(i) {
  const { startAge, retireAge, spendEarly, spendLate, spendChangeAge, dc: dc0, dcMonthly, sipp: sipp0, isa: isa0,
    dbAmount, dbAge, dbLump, spAmount, spAge, otherIncome, otherIncomeUntil, contributionsUntil, growth } = i;
  let dc = dc0, sipp = sipp0, isa = isa0, lumpDone = false;
  const rows = [];
  for (let age = startAge; age <= 100; age++) {
    dc *= 1 + growth; sipp *= 1 + growth; isa *= 1 + growth;
    if (age < contributionsUntil && age < retireAge) dc += dcMonthly * 12;
    if (age === dbAge && !lumpDone) { isa += dbLump; lumpDone = true; }
    const db = age >= dbAge ? dbAmount : 0;
    const sp = age >= spAge ? spAmount : 0;
    const guaranteed = db + sp;
    const retired = age >= retireAge;
    const spend = retired && age > spendChangeAge ? spendLate : spendEarly;
    let drawdown = 0, income = 0, surplus = 0;
    if (retired) {
      const needed = Math.max(0, spend - guaranteed);
      const pot = Math.max(0, dc + sipp + isa);
      if (pot > 0 && needed > 0) {
        drawdown = Math.min(needed, pot);
        const ratio = drawdown / pot;
        dc = Math.max(0, dc - dc * ratio); sipp = Math.max(0, sipp - sipp * ratio); isa = Math.max(0, isa - isa * ratio);
      }
      income = guaranteed + drawdown;
      surplus = income - spend;
    } else {
      income = age < otherIncomeUntil ? otherIncome : 0;
    }
    rows.push({ age, dc: Math.max(0, dc), sipp: Math.max(0, sipp), isa: Math.max(0, isa), total: Math.max(0, dc + sipp + isa), drawdown, db, sp, income, surplus, retired, guaranteed, spend });
  }
  return rows;
}

/** Earliest retirement age, up to `latest`, at which the pots last to 100. */
export function earliestAge(i, latest = 67) {
  for (let age = i.startAge; age <= latest; age++) {
    if (simulate({ ...i, retireAge: age }).at(-1).total > 0) return age;
  }
  return null;
}
