import { test } from "node:test";
import assert from "node:assert/strict";
import { totals } from "../_tools/invoice/totals.js";

test("adds line totals, tax and the grand total, in pence to avoid rounding drift", () => {
  const t = totals([{ qty: 3, price: 0.1 }, { qty: 1, price: 250 }], 20);
  assert.deepEqual(t.lines, [0.3, 250]);
  assert.equal(t.subtotal, 250.3);
  assert.equal(t.tax, 50.06);
  assert.equal(t.total, 300.36);
});

test("ignores blank or invalid numbers", () => {
  assert.deepEqual(totals([{ qty: "", price: "x" }], 0), { lines: [0], subtotal: 0, tax: 0, total: 0 });
});
