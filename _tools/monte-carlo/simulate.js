// Monte Carlo forecasting: how many sprints to finish `target` items, if each
// sprint delivers one of the team's past throughput figures at random.

export const parseNumbers = (text) => (text.match(/-?\d+(?:\.\d+)?/g) || []).map(Number);

export function simulate(throughput, target, { iterations = 10000, random = Math.random } = {}) {
  if (!throughput.length) throw new Error("Enter at least one past throughput figure.");
  if (!throughput.some((n) => n > 0)) throw new Error("At least one throughput figure must be above zero.");
  if (!(target > 0)) throw new Error("Enter how many items are left, above zero.");
  const runs = new Array(iterations);
  for (let i = 0; i < iterations; i++) {
    let done = 0, sprints = 0;
    while (done < target) {
      done += throughput[Math.floor(random() * throughput.length)];
      sprints++;
      if (sprints > 10000) break; // safety net for very small averages
    }
    runs[i] = sprints;
  }
  return runs;
}

/** [{ sprints, chance }]: the chance of finishing within each number of sprints. */
export function cumulative(runs) {
  const sorted = [...runs].sort((a, b) => a - b);
  const out = [];
  sorted.forEach((n, i) => {
    if (sorted[i + 1] !== n) out.push({ sprints: n, chance: (i + 1) / sorted.length });
  });
  return out;
}

/** The smallest number of sprints that finishes in at least `p` of the runs. */
export function percentile(runs, p) {
  return cumulative(runs).find((c) => c.chance >= p - 1e-9)?.sprints ?? null;
}
