// Copies third-party browser libraries from node_modules into assets/vendor/
// and writes _data/vendor.json (used by layouts and the SBOM page)
// plus the complete SBOM (see scripts/sbom.mjs).
//
// Versions come from package.json, so Dependabot updates flow through here.

import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { completeSbom, readActions, readGems } from "./sbom.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

// Which files from each package the site serves, and what they're for.
export const MANIFEST = {
  "chart.js": { files: ["dist/chart.umd.min.js"], purpose: "Charts in the finance and planning calculators" },
  "chartjs-plugin-annotation": { files: ["dist/chartjs-plugin-annotation.min.js"], purpose: "Target lines on Monte Carlo charts" },
  "exif-js": { files: ["exif.js"], purpose: "Reading photo metadata" },
  "imagetracerjs": { files: ["imagetracer_v1.2.6.js"], purpose: "Tracing bitmaps into SVG" },
  "js-yaml": { files: ["dist/browser/js-yaml.umd.min.js", "dist/js-yaml.mjs"], purpose: "Reading and writing YAML" },
  "jsqr": { files: ["dist/jsQR.js"], purpose: "Decoding QR codes" },
  "qrcode-generator": { files: ["dist/qrcode.js"], purpose: "Making QR codes" },
  "sql-formatter": { files: ["dist/sql-formatter.min.js"], purpose: "Formatting SQL" },
};

const LICENCE_NAMES = ["LICENSE", "LICENSE.md", "LICENSE.txt", "LICENCE", "license", "license.md"];

export function readPackage(name, base = root) {
  return JSON.parse(readFileSync(join(base, "node_modules", name, "package.json"), "utf8"));
}

export function repoUrl(pkg) {
  const r = typeof pkg.repository === "string" ? pkg.repository : pkg.repository?.url;
  if (!r) return null;
  // npm shorthand: "owner/repo" means GitHub; "gitlab:" and "bitbucket:" name other hosts
  if (/^[\w.-]+\/[\w.-]+$/.test(r)) return `https://github.com/${r}`;
  return r
    .replace(/^git\+/, "")
    .replace(/\.git$/, "")
    .replace(/^git:\/\//, "https://")
    .replace(/^github:/, "https://github.com/")
    .replace(/^gitlab:/, "https://gitlab.com/")
    .replace(/^bitbucket:/, "https://bitbucket.org/");
}

export function vendor({ base = root, out = join(root, "assets", "vendor") } = {}) {
  rmSync(out, { recursive: true, force: true });
  const data = {};

  for (const [name, { files, purpose }] of Object.entries(MANIFEST)) {
    const pkg = readPackage(name, base);
    const dir = `${name}@${pkg.version}`;
    const src = join(base, "node_modules", name);
    mkdirSync(join(out, dir), { recursive: true });

    const served = files.map((file) => {
      const from = join(src, file);
      if (!existsSync(from)) throw new Error(`${name}: ${file} not found in package`);
      const target = file.split("/").pop();
      cpSync(from, join(out, dir, target));
      return `/assets/vendor/${dir}/${target}`;
    });

    const licence = LICENCE_NAMES.find((f) => existsSync(join(src, f)));
    if (licence) cpSync(join(src, licence), join(out, dir, "LICENSE.txt"));

    data[name] = {
      version: pkg.version,
      licence: pkg.license ?? "See package",
      description: pkg.description ?? "",
      homepage: pkg.homepage ?? repoUrl(pkg),
      repository: repoUrl(pkg),
      purpose,
      files: served,
      licence_file: licence ? `/assets/vendor/${dir}/LICENSE.txt` : null,
    };
  }
  return data;
}

function main() {
  const data = vendor();
  mkdirSync(join(root, "_data"), { recursive: true });
  writeFileSync(join(root, "_data", "vendor.json"), JSON.stringify(data, null, 2) + "\n");

  // Complete SBOM: npm (with transitive dependencies), Ruby gems and GitHub Actions.
  const npmSbom = execFileSync("npm", ["sbom", "--sbom-format", "cyclonedx", "--omit", "dev"], { cwd: root, encoding: "utf8" });
  const gems = readGems(root);
  const actions = readActions(root);
  const bom = completeSbom(npmSbom, gems, actions);
  writeFileSync(join(root, "sbom.json"), JSON.stringify(bom, null, 2) + "\n");

  const direct = new Set(Object.keys(MANIFEST));
  const npm = JSON.parse(npmSbom).components.map((c) => ({
    name: c.name, version: c.version, licence: c.licenses?.[0]?.license?.id ?? c.licenses?.[0]?.expression ?? "",
    direct: direct.has(c.name),
  })).sort((a, b) => Number(b.direct) - Number(a.direct) || a.name.localeCompare(b.name));
  const summary = {
    generated: new Date().toISOString(),
    npm,
    gems: gems.map(({ name, version, licenses = [], homepage = null, summary = "" }) => ({ name, version, licence: licenses.join(", "), homepage, summary })),
    actions,
  };
  writeFileSync(join(root, "_data", "sbom.json"), JSON.stringify(summary, null, 2) + "\n");

  console.log(`Vendored ${Object.keys(data).length} libraries; SBOM lists ${bom.components.length} components`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main();
