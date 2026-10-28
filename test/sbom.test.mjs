import { test } from "node:test";
import assert from "node:assert/strict";
import { parseGemfileLock, parseWorkflowActions, gemComponent, actionComponent } from "../scripts/sbom.mjs";

const LOCK = `GEM
  remote: https://rubygems.org/
  specs:
    addressable (2.9.0)
      public_suffix (>= 2.0.2, < 8.0)
    ffi (1.17.4)
    ffi (1.17.4-arm64-darwin)
    jekyll (4.4.1)

PLATFORMS
  arm64-darwin

DEPENDENCIES
  jekyll (~> 4.4)
`;

test("reads each gem once from Gemfile.lock, ignoring platform builds and requirements", () => {
  assert.deepEqual(parseGemfileLock(LOCK), [
    { name: "addressable", version: "2.9.0" },
    { name: "ffi", version: "1.17.4" },
    { name: "jekyll", version: "4.4.1" },
  ]);
});

test("lists each action and version with the workflows that use it", () => {
  const files = {
    "pages.yml": "steps:\n  - uses: actions/checkout@v7\n  - uses: ruby/setup-ruby@v1 # comment\n",
    "codeql.yml": "      uses: actions/checkout@v7\n      uses: github/codeql-action/init@v4.39.1\n",
  };
  assert.deepEqual(parseWorkflowActions(files), [
    { name: "actions/checkout", version: "v7", workflows: ["codeql.yml", "pages.yml"] },
    { name: "github/codeql-action/init", version: "v4.39.1", workflows: ["codeql.yml"] },
    { name: "ruby/setup-ruby", version: "v1", workflows: ["pages.yml"] },
  ]);
});

test("builds CycloneDX components with package URLs", () => {
  assert.deepEqual(gemComponent({ name: "jekyll", version: "4.4.1", licenses: ["MIT"] }), {
    type: "library", name: "jekyll", version: "4.4.1", purl: "pkg:gem/jekyll@4.4.1",
    scope: "excluded", licenses: [{ license: { id: "MIT" } }], properties: [{ name: "toolkit:used-for", value: "build" }],
  });
  assert.equal(actionComponent({ name: "github/codeql-action/init", version: "v4.39.1" }).purl, "pkg:github/github/codeql-action@v4.39.1#init");
});
