import { test } from "node:test";
import assert from "node:assert/strict";
import { normalise, merge, search, levenshtein } from "../_tools/film/films.js";

const films = normalise([
  { title: "The Lair", year: "2022", imdb: "tt13468602", rating: 10 },
  { Title: "Lair of the White Worm", Year: 1988, Imdb: "tt0095488" },
  { Title: "Duchess", Year: "2024", Imdb: "tt18300732" },
  { Title: "No ID film", Year: "1999" },
  { Year: "2000" },
]);

test("normalises key case and drops records without a title", () => {
  assert.equal(films.length, 4);
  assert.deepEqual(films[0], { Title: "The Lair", Year: "2022", Imdb: "tt13468602", Rating: "10" });
});

test("merges by IMDb ID, or title and year when there's no ID", () => {
  const merged = merge(films, normalise([{ Title: "The Lair", Year: "2022", Imdb: "TT13468602", Rating: 8 }, { Title: "No ID film", Year: "1999" }, { Title: "New one" }]));
  assert.equal(merged.length, 5);
  assert.equal(merged.find((f) => f.Title === "The Lair").Rating, "8");
});

test("substring matches rank first, earliest position first, then fuzzy matches", () => {
  assert.deepEqual(search(films, "lair").map((f) => f.Title).slice(0, 2), ["Lair of the White Worm", "The Lair"]);
  assert.equal(search(films, "duches")[0].Title, "Duchess");
  assert.equal(search(films, "dutchess")[0].Title, "Duchess");
  assert.deepEqual(search(films, "  "), []);
});

test("Levenshtein distance", () => {
  assert.equal(levenshtein("kitten", "sitting"), 3);
  assert.equal(levenshtein("", "abc"), 3);
});
