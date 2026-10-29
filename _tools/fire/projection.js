// FIRE projection with separate pots (for example Cash, an ISA and a DC
// pension). Each year, from today to 100:
//   1. once retired, take what pensions don't cover from the pots in the
//      chosen order, skipping any pot whose from age hasn't arrived;
//      anything still missing is a shortfall for that year
//   2. add each pot's contributions, until its own stop age
//   3. grow every pot at its own rate, whether or not it can be drawn yet
// Spending, pensions and contributions are entered in today's money terms
// (contributions stay fixed in cash). The model runs in cash terms and
// divides by inflation when showing today's money. There is no tax: all
// figures are gross.

const MAX_AGE = 100;
const PENNY = 0.005;

export function projectRetirement(i) {
  const { currentAge, retirementAge, spendingEarly, spendingLater, spendingChangeAge = 75, inflationRate, realTerms, pots, order, db, state } = i;
  const balance = Object.fromEntries(pots.map((p) => [p.key, p.value]));
  const byKey = Object.fromEntries(pots.map((p) => [p.key, p]));
  const drawOrder = [...order.filter((k) => byKey[k]), ...pots.map((p) => p.key).filter((k) => !order.includes(k))];
  const rows = [];

  for (let age = currentAge; age <= MAX_AGE; age++) {
    const prices = (1 + inflationRate) ** (age - currentAge);
    const show = (v) => (realTerms ? v / prices : v);
    const start = { ...balance };
    const withdrawals = Object.fromEntries(pots.map((p) => [p.key, 0]));
    const retired = age >= retirementAge;
    let spending = 0, dbIncome = 0, spIncome = 0, shortfall = 0;

    if (retired) {
      dbIncome = db && age >= db.startAge ? db.amount * prices : 0;
      spIncome = state && age >= state.startAge ? state.amount * prices : 0;
      spending = (age < spendingChangeAge ? spendingEarly : spendingLater) * prices;
      let need = Math.max(0, spending - dbIncome - spIncome);
      for (const key of drawOrder) {
        if (need <= 0) break;
        if (age < (byKey[key].fromAge || 0)) continue;
        const take = Math.min(need, balance[key]);
        withdrawals[key] = take;
        balance[key] -= take;
        need -= take;
      }
      shortfall = need > PENNY ? need : 0;
    }

    for (const p of pots) {
      const until = p.until ?? retirementAge;
      if (age < until) balance[p.key] += p.monthly * 12;
      balance[p.key] = balance[p.key] < PENNY ? 0 : balance[p.key] * (1 + p.growth);
    }

    const shown = (obj) => Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, show(v)]));
    const fromPortfolio = Object.values(withdrawals).reduce((a, b) => a + b, 0);
    rows.push({
      age, phase: retired ? "withdrawal" : "accumulation",
      balances: shown(start), total: show(Object.values(start).reduce((a, b) => a + b, 0)),
      withdrawals: shown(withdrawals), fromPortfolio: show(fromPortfolio), shortfall: show(shortfall),
      spending: show(spending), db: show(dbIncome), state: show(spIncome),
    });
  }

  // Runs of consecutive years where spending couldn't be met. Each run is
  // split into steps wherever the reason for the yearly shortfall changes:
  // the pots stop paying, a pension starts, or spending steps down.
  const gaps = [];
  rows.forEach((r, n) => {
    if (r.shortfall <= 0) return;
    const prev = rows[n - 1];
    const step = { age: r.age, shortfall: r.shortfall };
    const last = gaps.at(-1);
    if (!last || last.to !== r.age - 1) { gaps.push({ from: r.age, to: r.age, total: r.shortfall, steps: [step] }); return; }
    last.to = r.age;
    last.total += r.shortfall;
    const changed = prev.fromPortfolio > 0 || (r.db > 0 && !prev.db) || (r.state > 0 && !prev.state) || (r.age === spendingChangeAge && spendingLater !== spendingEarly);
    if (changed) last.steps.push(step);
  });
  const final = gaps.at(-1);

  return {
    rows, gaps,
    firstShortAge: gaps[0]?.from ?? null,
    runsOutAge: final && final.to === MAX_AGE ? final.from : null,
    atRetirement: rows.find((r) => r.age === retirementAge)?.total || 0,
    at100: rows.find((r) => r.age === MAX_AGE)?.total || 0,
  };
}
