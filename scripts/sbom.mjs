// Builds the complete SBOM: npm packages (served to browsers), Ruby gems
// (used to build the site) and GitHub Actions (used in CI).
//
// Writes:
//   sbom.json         CycloneDX 1.5, every component
//   _data/sbom.json   the same, simplified for the /sbom page

import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

/** [{ name, version }] from the GEM specs section, one per gem. */
export function parseGemfileLock(text) {
  const specs = text.split(/^GEM$/m)[1]?.split(/^\S/m)[0] ?? "";
  const seen = new Map();
  for (const [, name, version] of specs.matchAll(/^ {4}([^\s(]+) \(([^)-]+)(?:-[^)]+)?\)$/gm)) {
    if (!seen.has(name)) seen.set(name, { name, version });
  }
  return [...seen.values()].sort((a, b) => a.name.localeCompare(b.name));
}

/** [{ name, version, workflows }] from a map of workflow filename -> YAML text. */
export function parseWorkflowActions(files) {
  const found = new Map();
  for (const [file, text] of Object.entries(files)) {
    for (const [, name, version] of text.matchAll(/^\s*-?\s*uses:\s*([\w.-]+\/[\w./-]+)@([\w.-]+)/gm)) {
      const key = `${name}@${version}`;
      if (!found.has(key)) found.set(key, { name, version, workflows: [] });
      if (!found.get(key).workflows.includes(file)) found.get(key).workflows.push(file);
    }
  }
  return [...found.values()]
    .map((a) => ({ ...a, workflows: a.workflows.sort() }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

const licences = (ids = []) => ids.map((id) => ({ license: { id } }));

export function gemComponent(g) {
  return {
    type: "library", name: g.name, version: g.version, purl: `pkg:gem/${g.name}@${g.version}`,
    scope: "excluded", licenses: licences(g.licenses), properties: [{ name: "toolkit:used-for", value: "build" }],
  };
}

export function actionComponent(a) {
  const [owner, repo, ...path] = a.name.split("/");
  return {
    type: "application", name: a.name, version: a.version,
    purl: `pkg:github/${owner}/${repo}@${a.version}${path.length ? `#${path.join("/")}` : ""}`,
    scope: "excluded", properties: [{ name: "toolkit:used-for", value: "ci" }],
  };
}

/** Gem details from the installed specs (licences, homepage); falls back to the lockfile. */
export function readGems(root) {
  const lock = parseGemfileLock(readFileSync(join(root, "Gemfile.lock"), "utf8"));
  try {
    const json = execFileSync("bundle", ["exec", "ruby", "-rjson", "-e",
      "puts Bundler.load.specs.map { |s| { name: s.name, version: s.version.to_s, licenses: s.licenses, homepage: s.homepage, summary: s.summary } }.to_json"],
      { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
    const specs = new Map(JSON.parse(json).map((s) => [s.name, s]));
    return lock.map((g) => ({ ...g, ...specs.get(g.name), version: g.version }));
  } catch {
    return lock; // Ruby not set up: names and versions only
  }
}

export function readActions(root) {
  const dir = join(root, ".github", "workflows");
  const files = Object.fromEntries(readdirSync(dir).filter((f) => /\.ya?ml$/.test(f)).map((f) => [f, readFileSync(join(dir, f), "utf8")]));
  return parseWorkflowActions(files);
}

/** Merge gems and actions into npm's CycloneDX output. */
export function completeSbom(npmSbom, gems, actions) {
  const bom = JSON.parse(npmSbom);
  for (const c of bom.components ?? []) {
    c.properties = [...(c.properties ?? []), { name: "toolkit:used-for", value: "browser" }];
  }
  bom.components = [...(bom.components ?? []), ...gems.map(gemComponent), ...actions.map(actionComponent)];
  return bom;
}
