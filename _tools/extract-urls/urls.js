// Matches http(s) URLs in plain text; trailing punctuation is trimmed afterwards.
const URL_PATTERN = /https?:\/\/[^\s<>"'`]+/g;

export function urlsFromText(text) {
  return (text.match(URL_PATTERN) || []).map((u) => u.replace(/[.,;:!?)\]}]+$/, ""));
}

export const uniqueUrls = (urls) => [...new Set(urls)];
