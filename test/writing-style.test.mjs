import { test } from "node:test";
import assert from "node:assert/strict";
import { analyse } from "../_tools/writing-style/analyse.js";

const lists = { weasel_words: ["very", "clearly"], irregular_verbs: ["written", "done"] };

test("finds weasel words, ignoring case and punctuation", () => {
  const r = analyse("This is Very good. Clearly, it works.", lists);
  assert.deepEqual(r.weasel.map((f) => f.text), ["Very", "Clearly"]);
});

test("finds passive voice with -ed endings and irregular verbs", () => {
  const r = analyse("The bug was fixed. It is written badly. They were done. He is red.", lists);
  assert.deepEqual(r.passive.map((f) => f.text), ["was fixed", "is written", "were done", "is red"]);
});

test("finds a word repeated across a line break", () => {
  const r = analyse("We went to the\nthe shop and and back.", lists);
  assert.deepEqual(r.duplicates.map((f) => f.text), ["the", "and"]);
});

test("returns character offsets that point at the match", () => {
  const text = "It is very nice.";
  const [f] = analyse(text, lists).weasel;
  assert.equal(text.slice(f.start, f.end), "very");
});
