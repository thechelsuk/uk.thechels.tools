import { test } from "node:test";
import assert from "node:assert/strict";
import { gridSize } from "../_tools/podcast-grid/layout.js";

test("picks a near-square grid for the artwork", () => {
  assert.deepEqual(gridSize(1), { cols: 1, rows: 1 });
  assert.deepEqual(gridSize(10), { cols: 4, rows: 3 });
  assert.deepEqual(gridSize(16), { cols: 4, rows: 4 });
  assert.deepEqual(gridSize(0), { cols: 0, rows: 0 });
});
