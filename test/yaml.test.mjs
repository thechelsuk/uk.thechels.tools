import { test } from "node:test";
import assert from "node:assert/strict";
import yaml from "js-yaml";
import { convert } from "../_tools/json-to-yaml/convert.js";
import { describe as describeValue } from "../_tools/yaml-explorer/tree.js";

test("JSON to block YAML", () => {
  const r = convert('{"a":1,"b":["x","z"]}', { direction: "json-yaml", style: "block" }, yaml);
  assert.deepEqual(r, { ok: true, text: "a: 1\nb:\n- x\n- z\n", error: "" });
});

test("JSON to flow and quoted YAML", () => {
  assert.equal(convert('{"a":{"b":1}}', { direction: "json-yaml", style: "flow" }, yaml).text, "a: {b: 1}\n");
  assert.equal(convert('{"a":"x"}', { direction: "json-yaml", style: "quoted" }, yaml).text, 'a: "x"\n');
});

test("YAML back to JSON", () => {
  const r = convert("a: 1\nb:\n  - x\n", { direction: "yaml-json" }, yaml);
  assert.equal(r.text, '{\n  "a": 1,\n  "b": [\n    "x"\n  ]\n}');
});

test("reports parse errors with the format name", () => {
  const r = convert("{bad", { direction: "json-yaml" }, yaml);
  assert.equal(r.ok, false);
  assert.match(r.error, /^Invalid JSON/);
  assert.match(convert("a: [", { direction: "yaml-json" }, yaml).error, /^Invalid YAML/);
});

test("describes values for the YAML tree", () => {
  assert.deepEqual(describeValue([1, 2]), { kind: "array", label: "2 items" });
  assert.deepEqual(describeValue({ a: 1 }), { kind: "object", label: "1 key" });
  assert.deepEqual(describeValue(null), { kind: "null", label: "null" });
  assert.deepEqual(describeValue("hi"), { kind: "string", label: '"hi"' });
});
