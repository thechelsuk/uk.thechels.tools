import { test } from "node:test";
import assert from "node:assert/strict";
import { simulate, cumulative, percentile, parseNumbers } from "../_tools/monte-carlo/simulate.js";
import { rollingAverage, mean } from "../_tools/rolling-average/rolling.js";
import { pickRandom } from "../_tools/refinement/pick.js";
import { rotate } from "../_tools/teaming/rotate.js";

// Small deterministic random number generator for repeatable tests.
const seeded = (seed = 1) => () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;

test("parses comma, space or newline separated numbers and skips junk", () => {
  assert.deepEqual(parseNumbers("3, 5\n7 x 2"), [3, 5, 7, 2]);
});

test("Monte Carlo: constant throughput always takes the same number of sprints", () => {
  const runs = simulate([5], 20, { iterations: 100, random: seeded() });
  assert.ok(runs.every((n) => n === 4));
});

test("Monte Carlo: refuses throughput that can never finish", () => {
  assert.throws(() => simulate([0, 0], 10), /above zero/);
  assert.throws(() => simulate([], 10), /throughput/);
});

test("Monte Carlo: cumulative chance and percentiles", () => {
  const runs = [2, 2, 3, 3, 3, 4, 4, 5, 6, 8];
  assert.deepEqual(cumulative(runs).slice(0, 3), [{ sprints: 2, chance: 0.2 }, { sprints: 3, chance: 0.5 }, { sprints: 4, chance: 0.7 }]);
  assert.equal(percentile(runs, 0.8), 5);
  assert.equal(percentile(runs, 0.5), 3);
});

test("rolling average lines up with the end of each window", () => {
  assert.deepEqual(rollingAverage([1, 2, 3, 4, 5], 3), [null, null, 2, 3, 4]);
  assert.deepEqual(rollingAverage([2, 4], 1), [2, 4]);
  assert.equal(mean([1, 2, 3, 6]), 3);
});

test("picks distinct random items", () => {
  const picked = pickRandom(["a", "b", "c", "d"], 3, seeded(7));
  assert.equal(picked.length, 3);
  assert.equal(new Set(picked).size, 3);
});

test("rotating moves everyone one role along and keeps blanks in place", () => {
  assert.deepEqual(rotate(["Ann", "Bo", "Cy"]), ["Cy", "Ann", "Bo"]);
  assert.deepEqual(rotate(["Ann", "", "Cy", ""]), ["Cy", "", "Ann", ""]);
});
