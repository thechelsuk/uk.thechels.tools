import { test } from "node:test";
import assert from "node:assert/strict";
import { caesar, atbash, vigenere, toMorse, fromMorse, runCipher } from "../_tools/cipher/cipher.js";
import { parseHex, toHsl, contrastRatio, bestTextColour } from "../_tools/hex-codes/colour.js";

test("Caesar shifts letters and round-trips", () => {
  assert.equal(caesar("HELLO, WORLD", 3), "KHOOR, ZRUOG");
  assert.equal(caesar(caesar("ABC XYZ", 5), -5), "ABC XYZ");
});

test("Atbash mirrors the alphabet", () => {
  assert.equal(atbash("ABC XYZ"), "ZYX CBA");
});

test("Vigenère matches the classic LEMON example and skips non-letters", () => {
  assert.equal(vigenere("ATTACK AT DAWN", "LEMON", 1), "LXFOPV EF RNHR");
  assert.equal(vigenere("LXFOPV EF RNHR", "lemon", -1), "ATTACK AT DAWN");
  assert.throws(() => vigenere("X", "123", 1), /keyword/);
});

test("Morse encodes words with slashes and decodes unknowns as ?", () => {
  assert.equal(toMorse("SOS HI"), "... --- ... / .... ..");
  assert.deepEqual(fromMorse("... --- ... / .... .."), { result: "SOS HI", unknown: [] });
  assert.deepEqual(fromMorse(".- ......"), { result: "A?", unknown: ["......"] });
});

test("runCipher upper-cases input and checks the shift", () => {
  assert.equal(runCipher({ method: "caesar", mode: "encrypt", text: "abc", shift: "1" }).result, "BCD");
  assert.throws(() => runCipher({ method: "caesar", mode: "encrypt", text: "a", shift: "x" }), /whole number/);
});

test("parses 3- and 6-digit hex codes with or without #", () => {
  assert.deepEqual(parseHex("#005ca3"), { hex: "#005CA3", r: 0, g: 92, b: 163 });
  assert.deepEqual(parseHex("fa0"), { hex: "#FFAA00", r: 255, g: 170, b: 0 });
  assert.equal(parseHex("12345"), null);
  assert.equal(parseHex("gggggg"), null);
});

test("converts to HSL", () => {
  assert.deepEqual(toHsl({ r: 255, g: 0, b: 0 }), { h: 0, s: 100, l: 50 });
  assert.deepEqual(toHsl({ r: 128, g: 128, b: 128 }), { h: 0, s: 0, l: 50 });
});

test("works out WCAG contrast and the readable text colour", () => {
  assert.equal(contrastRatio({ r: 0, g: 0, b: 0 }, { r: 255, g: 255, b: 255 }).toFixed(1), "21.0");
  assert.equal(bestTextColour(parseHex("#005ca3")), "white");
  assert.equal(bestTextColour(parseHex("#cec452")), "black");
});
