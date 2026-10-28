import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { MANIFEST, repoUrl, vendor } from "./vendor.mjs";

const pkg = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));

test("every vendored library is a pinned dependency in package.json", () => {
  for (const name of Object.keys(MANIFEST)) {
    const version = pkg.dependencies[name];
    assert.ok(version, `${name} missing from package.json`);
    assert.match(version, /^\d+\.\d+\.\d+$/, `${name} should be pinned to an exact version`);
  }
});

test("vendor copies each file into a versioned folder with its licence", () => {
  const out = mkdtempSync(join(tmpdir(), "vendor-"));
  const data = vendor({ out });
  for (const [name, entry] of Object.entries(data)) {
    assert.equal(entry.version, pkg.dependencies[name]);
    assert.ok(entry.files.length > 0);
    for (const url of entry.files) {
      assert.ok(url.startsWith(`/assets/vendor/${name}@${entry.version}/`), url);
      assert.ok(existsSync(join(out, url.replace("/assets/vendor/", ""))), `${url} not copied`);
    }
    assert.ok(entry.licence, `${name} has no licence`);
  }
});

test("repoUrl normalises npm repository formats", () => {
  assert.equal(repoUrl({ repository: { url: "git+https://github.com/a/b.git" } }), "https://github.com/a/b");
  assert.equal(repoUrl({ repository: "github:a/b" }), "https://github.com/a/b");
  assert.equal(repoUrl({}), null);
});
