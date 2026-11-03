import { spawnSync } from "node:child_process";
import { cp, mkdir, readFile, readdir, rm, stat, writeFile } from "node:fs/promises";
import { dirname, extname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const output = resolve(root, "dist");
const runtimeRoots = ["src", "art", "api", "server"];
const staticRoots = ["src", "art"];
const rootFiles = [
  "index.html", "tactical.html", "tactical.css", "tactical-hand.css", "vercel.json",
  "styles.css", "official-theme.css", "augment-cards.css", "identity.css", "realm-identity.css",
  "moth-theme.css", "account.css", "anime-ui.css", "brand-transparency.css", "manifest.webmanifest", "icon.svg", "favicon-32.png",
  "favicon-64.png", "apple-touch-icon.png", "icon-192.png", "icon-512.png"
];

async function walk(directory) {
  const result = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) result.push(...await walk(path));
    else if (entry.isFile()) result.push(path);
  }
  return result;
}

async function assertFile(path, context) {
  try {
    if (!(await stat(path)).isFile()) throw new Error("not a file");
  } catch {
    throw new Error(`${context} points to missing file: ${relative(root, path)}`);
  }
}

function localRootPath(value) {
  const clean = decodeURIComponent(value.split(/[?#]/, 1)[0]);
  if (!clean.startsWith("/") || clean.startsWith("//")) return null;
  return resolve(root, `.${clean}`);
}

const runtimeFiles = (await Promise.all(runtimeRoots.map(path => walk(join(root, path))))).flat()
  .filter(path => extname(path) === ".js");

for (const path of runtimeFiles) {
  const check = spawnSync(process.execPath, ["--check", path], { encoding: "utf8" });
  if (check.status !== 0) throw new Error(`JavaScript syntax check failed for ${relative(root, path)}\n${check.stderr || check.stdout}`);
  const source = await readFile(path, "utf8");
  const importPattern = /(?:\bfrom\s*|\bimport\s*\(\s*)["'](\.[^"']+)["']/g;
  for (const match of source.matchAll(importPattern)) {
    const dependency = resolve(dirname(path), match[1]);
    await assertFile(dependency, `${relative(root, path)} import`);
  }
}

const html = await readFile(join(root, "index.html"), "utf8");
const htmlRefs = [...html.matchAll(/(?:href|src)=["']([^"']+)["']/gi)].map(match => match[1]);
for (const ref of htmlRefs) {
  const path = localRootPath(ref);
  if (path) await assertFile(path, "index.html");
}

const cssFiles = rootFiles.filter(file => extname(file) === ".css").map(file => join(root, file));
for (const path of cssFiles) {
  const css = await readFile(path, "utf8");
  for (const match of css.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/gi)) {
    const ref = match[1].trim();
    const absolute = localRootPath(ref);
    if (absolute) await assertFile(absolute, `${relative(root, path)} CSS`);
    else if (ref.startsWith("./") || ref.startsWith("../")) {
      await assertFile(resolve(dirname(path), ref.split(/[?#]/, 1)[0]), `${relative(root, path)} CSS`);
    }
  }
}

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
for (const file of rootFiles) await cp(join(root, file), join(output, file));
for (const directory of staticRoots) await cp(join(root, directory), join(output, directory), { recursive: true });

const encodedArtRoot = join(root, "docs", "art-encoded", "hybrid-rework-20261027");
let decodedArtAssets = 0;
for (const manifestPath of await walk(encodedArtRoot)) {
  if (extname(manifestPath) !== ".json") continue;
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  if (manifest.schemaVersion !== 1 || manifest.encoding !== "base64-webp" || !manifest.artifacts) {
    throw new Error(`Invalid encoded-art manifest: ${relative(root, manifestPath)}`);
  }
  for (const [assetPath, encoded] of Object.entries(manifest.artifacts)) {
    if (!assetPath.startsWith("art/") || assetPath.split("/").includes("..")) {
      throw new Error(`Invalid encoded-art output path: ${assetPath}`);
    }
    const destination = resolve(output, assetPath);
    if (!destination.startsWith(`${output}${sep}`)) throw new Error(`Encoded art escapes build output: ${assetPath}`);
    await mkdir(dirname(destination), { recursive: true });
    await writeFile(destination, Buffer.from(encoded, "base64"));
    decodedArtAssets++;
  }
}
const sourcePackage = JSON.parse(await readFile(join(root, "package.json"), "utf8"));
await writeFile(join(output, "package.json"), `${JSON.stringify({
  name: sourcePackage.name,
  version: sourcePackage.version,
  private: sourcePackage.private,
  type: sourcePackage.type,
  engines: sourcePackage.engines
}, null, 2)}\n`);

const outputHtml = await readFile(join(output, "index.html"), "utf8");
for (const ref of [...outputHtml.matchAll(/(?:href|src)=["']([^"']+)["']/gi)].map(match => match[1])) {
  const path = localRootPath(ref);
  if (path) await assertFile(resolve(output, `.${ref.split(/[?#]/, 1)[0]}`), "built index.html");
}

const builtFiles = (await walk(output)).map(path => relative(output, path).split(sep).join("/"));
const manifest = {
  name: "Oblivium Arena",
  version: JSON.parse(await readFile(join(root, "package.json"), "utf8")).version,
  entrypoint: "index.html",
  runtime: ["src/", "art/"],
  fileCount: builtFiles.length,
  decodedArtAssets
};
await writeFile(join(output, "build-manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
process.stdout.write(`Build concluído: ${builtFiles.length} arquivos em dist/ (entrada: index.html).\n`);

