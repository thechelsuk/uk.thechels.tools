// Classic ciphers. All work on upper-case A–Z; other characters pass through.

const MORSE = {
  A: ".-", B: "-...", C: "-.-.", D: "-..", E: ".", F: "..-.", G: "--.", H: "....",
  I: "..", J: ".---", K: "-.-", L: ".-..", M: "--", N: "-.", O: "---", P: ".--.",
  Q: "--.-", R: ".-.", S: "...", T: "-", U: "..-", V: "...-", W: ".--", X: "-..-",
  Y: "-.--", Z: "--..",
  0: "-----", 1: ".----", 2: "..---", 3: "...--", 4: "....-",
  5: ".....", 6: "-....", 7: "--...", 8: "---..", 9: "----.",
};
const FROM_MORSE = Object.fromEntries(Object.entries(MORSE).map(([k, v]) => [v, k]));

const isLetter = (c) => c >= "A" && c <= "Z";
const shift = (c, by) => (isLetter(c) ? String.fromCharCode(((((c.charCodeAt(0) - 65 + by) % 26) + 26) % 26) + 65) : c);

export const caesar = (text, by) => [...text].map((c) => shift(c, by)).join("");

export const atbash = (text) => [...text].map((c) => (isLetter(c) ? String.fromCharCode(155 - c.charCodeAt(0)) : c)).join("");

/** The key only advances on letters, so spaces and punctuation don't use it up. */
export function vigenere(text, keyword, direction) {
  const shifts = [...keyword.toUpperCase()].filter(isLetter).map((c) => c.charCodeAt(0) - 65);
  if (!shifts.length) throw new Error("Enter a keyword using the letters A to Z.");
  let i = 0;
  return [...text].map((c) => (isLetter(c) ? shift(c, direction * shifts[i++ % shifts.length]) : c)).join("");
}

export const toMorse = (text) =>
  text.split(/\s+/).filter(Boolean)
    .map((word) => [...word].map((c) => MORSE[c]).filter(Boolean).join(" "))
    .filter(Boolean).join(" / ");

export function fromMorse(text) {
  const unknown = [];
  const result = text.trim().split(/\s*\/\s*/).map((word) =>
    word.split(/\s+/).filter(Boolean).map((code) => {
      if (FROM_MORSE[code]) return FROM_MORSE[code];
      unknown.push(code);
      return "?";
    }).join("")
  ).join(" ");
  return { result, unknown };
}

/** Run the chosen cipher. Returns { result, warning }; throws on bad settings. */
export function runCipher({ method, mode, text, shift: by = "3", keyword = "" }) {
  const upper = text.toUpperCase();
  const dir = mode === "encrypt" ? 1 : -1;
  switch (method) {
    case "caesar": {
      const n = Number.parseInt(by, 10);
      if (!Number.isInteger(n)) throw new Error("Enter a whole number for the shift.");
      return { result: caesar(upper, dir * n), warning: "" };
    }
    case "atbash":
      return { result: atbash(upper), warning: "" };
    case "vigenere":
      return { result: vigenere(upper, keyword, dir), warning: "" };
    case "morse": {
      if (mode === "encrypt") return { result: toMorse(upper), warning: "" };
      const { result, unknown } = fromMorse(upper);
      return { result, warning: unknown.length ? `Not recognised (shown as ?): ${[...new Set(unknown)].join(" ")}` : "" };
    }
    default:
      throw new Error(`Unknown cipher: ${method}`);
  }
}
