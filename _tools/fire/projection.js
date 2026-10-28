// FIRE projection, ported unchanged from the original calculator:
// grow the portfolio until retirement, then each year draw what pensions
// don't cover. Spending can step down from age 75.

const MAX_AGE = 100;
const REDUCED_SPENDING_AGE = 75;

export function projectRetirement(i) {
  const { currentAge, retirementAge, spendingBefore75, spendingAfter75, assets: startAssets, monthlyContributions,
    growthRate, inflationRate, db, state, realTerms } = i;
  const realGrowth = (1 + growthRate) / (1 + inflationRate) - 1;
  const rows = [];
  let value = startAssets;
  let exhaustedAge = null;

  for (let age = currentAge; age < retirementAge; age++) {
    rows.push({ age, value: realTerms ? value / (1 + inflationRate) ** (age - currentAge) : value, phase: "accumulation", state: 0, db: 0, fromPortfolio: 0, spending: 0 });
    value = value * (1 + growthRate) + monthlyContributions * 12;
  }

  for (let age = retirementAge; age <= MAX_AGE; age++) {
    const dbIncome = db && age >= db.startAge ? db.amount : 0;
    const spIncome = state && age >= state.startAge ? state.amount : 0;
    const base = age < REDUCED_SPENDING_AGE ? spendingBefore75 : spendingAfter75;
    let spending;
    if (age < REDUCED_SPENDING_AGE) spending = realTerms ? base : base * (1 + inflationRate) ** (age - retirementAge);
    else spending = realTerms ? base : base * (1 + inflationRate) ** (age - retirementAge);
    const need = Math.max(0, spending - dbIncome - spIncome);
    const row = { age, phase: "withdrawal", state: spIncome, db: dbIncome, spending };

    if (exhaustedAge !== null) { rows.push({ ...row, value: null, fromPortfolio: 0, exhausted: true }); continue; }
    if (value <= need) {
      exhaustedAge = age;
      rows.push({ ...row, value: 0, fromPortfolio: value, exhausted: true });
      value = 0;
      continue;
    }
    rows.push({ ...row, value: realTerms ? value / (1 + inflationRate) ** (age - currentAge) : value, fromPortfolio: need });
    value = Math.max(0, (value - need) * (1 + (realTerms ? realGrowth : growthRate)));
  }

  const atRetirement = rows.find((r) => r.age === retirementAge - 1)?.value || 0;
  return { rows, exhaustedAge, at100: rows.find((r) => r.age === MAX_AGE)?.value || 0, atRetirement, reducedSpendingAge: REDUCED_SPENDING_AGE };
}

/** Classic FIRE number: yearly spending divided by the safe withdrawal rate. */
export const fireNumber = (spending, withdrawalRate) => (withdrawalRate > 0 ? spending / withdrawalRate : Infinity);
