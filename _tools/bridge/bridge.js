// ISA bridge maths, ported unchanged from the original calculator.
// All values are in today's money with a real (after-inflation) growth rate.

/** Balance plus yearly contributions (added at year end) after `years`. */
export function futureValue(balance, contribution, rate, years) {
  if (years <= 0) return balance;
  if (rate === 0) return balance + contribution * years;
  const g = (1 + rate) ** years;
  return balance * g + (contribution * (g - 1)) / rate;
}

/** The apex: the pot needed to pay `withdrawal` at each year end for `years`, ending near zero. */
export function requiredApex(withdrawal, rate, years) {
  if (years <= 0) return 0;
  if (rate === 0) return withdrawal * years;
  return (withdrawal * (1 - (1 + rate) ** -years)) / rate;
}

/** Yearly contribution needed to grow `balance` to `target` in `years`. */
export function requiredContribution(balance, target, rate, years) {
  if (years <= 0) return null;
  if (rate === 0) return (target - balance) / years;
  const g = (1 + rate) ** years;
  if (g - 1 === 0) return null;
  return ((target - balance * g) * rate) / (g - 1);
}

/** Year-by-year path: growing to the FIRE age, then drawing down to the end age. */
export function buildPath(currentAge, balance, contribution, withdrawal, rate, fireAge, endAge) {
  const path = [];
  let value = balance;
  for (let age = currentAge; age <= fireAge; age++) {
    path.push({ age, value, phase: "accumulation" });
    if (age < fireAge) value = value * (1 + rate) + contribution;
  }
  for (let age = fireAge + 1; age <= endAge; age++) {
    value = Math.max(0, value * (1 + rate) - withdrawal);
    path.push({ age, value, phase: "withdrawal" });
  }
  return path;
}

/** Earliest whole-year FIRE age where the projected ISA covers the apex, or null. */
export function earliestFireAge(currentAge, balance, contribution, withdrawal, rate, endAge) {
  for (let fireAge = currentAge + 1; fireAge < endAge; fireAge++) {
    const projected = futureValue(balance, contribution, rate, fireAge - currentAge);
    const required = requiredApex(withdrawal, rate, endAge - fireAge);
    if (projected >= required) return { fireAge, projected, required };
  }
  return null;
}

/** The same, as a fractional age found by bisection, to show differences that round away. */
export function earliestFireAgeExact(currentAge, balance, contribution, withdrawal, rate, endAge) {
  const span = endAge - currentAge;
  const gap = (t) => futureValue(balance, contribution, rate, t) - requiredApex(withdrawal, rate, span - t);
  if (gap(span - 0.001) < 0) return null;
  let lo = 0, hi = span;
  if (gap(lo) >= 0) return currentAge;
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    if (gap(mid) >= 0) hi = mid; else lo = mid;
  }
  return currentAge + hi;
}

/** "52y 3m". */
export function formatAge(age) {
  let years = Math.floor(age), months = Math.round((age - years) * 12);
  if (months === 12) { months = 0; years += 1; }
  return months ? `${years}y ${months}m` : `${years}y`;
}
