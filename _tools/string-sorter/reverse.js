const segmenter = new Intl.Segmenter("en", { granularity: "grapheme" });
const graphemes = (text) => Array.from(segmenter.segment(text), (s) => s.segment);

/** Reverse text by visible character, so emoji and accents survive. */
export const reverseText = (text) => graphemes(text).reverse().join("");

/** Reverse the order of words, keeping the spacing between them. */
export const reverseWords = (text) => text.split(/(\s+)/).reverse().join("");

/** Sort the characters A–Z. */
export const sortCharacters = (text) => graphemes(text).sort((a, b) => a.localeCompare(b, "en-GB")).join("");
