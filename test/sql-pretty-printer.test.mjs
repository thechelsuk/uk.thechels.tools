import { test } from "node:test";
import assert from "node:assert/strict";
import { buildOptions, formatSql } from "../_tools/sql-pretty-printer/format.js";
import { format } from "sql-formatter";

test("builds sql-formatter options from the form values", () => {
  assert.deepEqual(buildOptions({ dialect: "postgresql", tabWidth: "4", keywordCase: "upper", indentStyle: "standard" }), {
    language: "postgresql", tabWidth: 4, keywordCase: "upper", indentStyle: "standard",
  });
});

test("keeps tab width between 1 and 8", () => {
  assert.equal(buildOptions({ tabWidth: "0" }).tabWidth, 1);
  assert.equal(buildOptions({ tabWidth: "99" }).tabWidth, 8);
  assert.equal(buildOptions({ tabWidth: "abc" }).tabWidth, 2);
});

test("formats with the library it is given", () => {
  const r = formatSql("select a,b from t where x=1", { keywordCase: "upper" }, format);
  assert.equal(r.ok, true);
  assert.match(r.text, /^SELECT\n  a,\n  b\nFROM\n  t\nWHERE\n  x = 1$/);
});

test("reports formatter errors without throwing", () => {
  const r = formatSql("select", {}, () => { throw new Error("boom"); });
  assert.deepEqual(r, { ok: false, text: "", error: "boom" });
});

test("empty input gives empty output", () => {
  assert.deepEqual(formatSql("  ", {}, format), { ok: true, text: "", error: "" });
});
