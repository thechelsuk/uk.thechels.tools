import { test } from "node:test";
import assert from "node:assert/strict";
import { escapeHtml, unescapeHtml } from "../_tools/escape-entities/entities.js";
import { sortLines } from "../_tools/list-sorter/sort.js";
import { reverseText, reverseWords, sortCharacters } from "../_tools/string-sorter/reverse.js";
import { generateSlug, SLIDER_LENGTHS } from "../_tools/slug/slug.js";
import { lorem } from "../_tools/lorem/lorem.js";
import { urlsFromText, uniqueUrls } from "../_tools/extract-urls/urls.js";

test("escapes and unescapes the five HTML special characters", () => {
  assert.equal(escapeHtml(`<a href="x">Tom & Jerry's</a>`), "&lt;a href=&quot;x&quot;&gt;Tom &amp; Jerry&#39;s&lt;/a&gt;");
  assert.equal(unescapeHtml("&lt;b&gt; &amp;amp; &quot;q&quot; &#39;s&#39; &#x27;h&#x27; &apos;a&apos;"), `<b> &amp; "q" 's' 'h' 'a'`);
});

test("sorts lines A–Z ignoring case and blank lines", () => {
  assert.deepEqual(sortLines("banana\n\nApple\ncherry"), ["Apple", "banana", "cherry"]);
  assert.deepEqual(sortLines("b\na\nc", { order: "desc" }), ["c", "b", "a"]);
});

test("sorts numbers naturally and can dedupe and trim", () => {
  assert.deepEqual(sortLines("item 10\nitem 2\nitem 1"), ["item 1", "item 2", "item 10"]);
  assert.deepEqual(sortLines(" a \na\nb", { unique: true, trim: true }), ["a", "b"]);
  assert.deepEqual(sortLines("x\ny\nz", { order: "reverse" }), ["z", "y", "x"]);
});

test("reverses text without breaking emoji", () => {
  assert.equal(reverseText("abc"), "cba");
  assert.equal(reverseText("hi 👋🏽"), "👋🏽 ih");
});

test("reverses word order and sorts characters", () => {
  assert.equal(reverseWords("one two  three"), "three  two one");
  assert.equal(sortCharacters("banana"), "aaabnn");
});

test("slugs have the requested length, alphabet and letter start", () => {
  let i = 0;
  const rng = () => i++; // deterministic
  const s = generateSlug(12, { letterStart: true, random: rng });
  assert.equal(s.length, 12);
  assert.match(s, /^[a-z][a-z0-9]{11}$/);
  assert.equal(SLIDER_LENGTHS.at(-1), 64);
  assert.equal(generateSlug(0), "");
});

test("lorem returns the requested number of paragraphs", () => {
  const text = lorem(7);
  assert.equal(text.split("\n\n").length, 7);
  assert.match(text, /^Lorem ipsum/);
});

test("finds URLs in plain text and removes duplicates", () => {
  const found = urlsFromText("See https://a.com/x, and (http://b.org/y?q=1). Again https://a.com/x.");
  assert.deepEqual(uniqueUrls(found), ["https://a.com/x", "http://b.org/y?q=1"]);
});
