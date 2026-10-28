// Checks every tool's front matter, so a typo can't quietly break a page.
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import * as yaml from "js-yaml";
import { MANIFEST } from "../scripts/vendor.mjs";

const root = new URL("../", import.meta.url);
const read = (p) => readFileSync(new URL(p, root), "utf8");
const categories = new Set(yaml.load(read("_data/categories.yml")).map((c) => c.id));
const front = (text) => yaml.load(text.split(/^---$/m)[1]);
const tools = readdirSync(new URL("_tools/", root)).filter((d) => existsSync(new URL(`_tools/${d}/index.html`, root)));
const permalinks = new Map();

for (const slug of tools) {
  test(`tool ${slug} has valid front matter`, () => {
    const fm = front(read(`_tools/${slug}/index.html`));
    for (const key of ["title", "permalink", "category", "summary", "description", "tags", "how_to", "about"]) {
      assert.ok(fm[key], `${slug}: missing ${key}`);
    }
    assert.ok(categories.has(fm.category), `${slug}: unknown category ${fm.category}`);
    assert.ok(fm.summary.length <= 140, `${slug}: summary over 140 characters`);
    assert.ok(fm.description.length <= 160, `${slug}: description over 160 characters`);
    assert.ok(!fm.seo_title || fm.seo_title.length <= 60, `${slug}: seo_title over 60 characters`);
    assert.ok(Array.isArray(fm.tags) && fm.tags.every((t) => /^[a-z0-9-]+$/.test(t)), `${slug}: tags must be lower-case words`);
    for (const v of fm.vendor || []) assert.ok(MANIFEST[v], `${slug}: vendor ${v} not in scripts/vendor.mjs`);
    for (const s of fm.scripts || []) assert.ok(existsSync(new URL(`_tools/${slug}/${s}`, root)), `${slug}: script ${s} missing`);
    for (const f of fm.faq || []) assert.ok(f.q && f.a, `${slug}: FAQ entries need q and a`);
    assert.ok(!permalinks.has(fm.permalink), `${slug}: permalink ${fm.permalink} also used by ${permalinks.get(fm.permalink)}`);
    permalinks.set(fm.permalink, slug);
  });
}

test("ensemble roles each have a list of prompts", () => {
  const { roles } = front(read("_tools/teaming/index.html")).config;
  assert.equal(roles.length, 7);
  for (const r of roles) assert.ok(r.prompts.length >= 4 && r.prompts.every((p) => typeof p === "string" && p.length > 10), r.name);
});
