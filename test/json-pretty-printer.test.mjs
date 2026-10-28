import { test } from "node:test";
import assert from "node:assert/strict";
import { formatJson, sortKeys } from "../_tools/json-pretty-printer/format.js";

test("pretty prints with two spaces by default", () => {
  assert.equal(formatJson('{"a":1,"b":[1,2]}').text, '{\n  "a": 1,\n  "b": [\n    1,\n    2\n  ]\n}');
});

test("supports four spaces and tabs", () => {
  assert.equal(formatJson('{"a":1}', { indent: "4" }).text, '{\n    "a": 1\n}');
  assert.equal(formatJson('{"a":1}', { indent: "tab" }).text, '{\n\t"a": 1\n}');
});

test("minifies", () => {
  assert.equal(formatJson('{ "a" : [ 1 , 2 ] }', { mode: "min" }).text, '{"a":[1,2]}');
});

test("sorts keys at every depth but keeps array order", () => {
  assert.deepEqual(Object.keys(sortKeys({ b: 1, a: { d: 1, c: 2 } })), ["a", "b"]);
  assert.deepEqual(Object.keys(sortKeys({ a: { d: 1, c: 2 } }).a), ["c", "d"]);
  assert.deepEqual(sortKeys([3, 1, 2]), [3, 1, 2]);
});

test("reports invalid JSON without throwing", () => {
  const r = formatJson('{"a":1,}');
  assert.equal(r.ok, false);
  assert.match(r.error, /JSON/);
});

test("empty input is not an error", () => {
  assert.deepEqual(formatJson("   "), { ok: true, text: "", error: "" });
});
