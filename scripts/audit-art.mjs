import { access } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { characters } from "../src/data.js";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const references = [];
const add = (character, slot, source) => {
  if (typeof source === "string" && source.startsWith("/art/")) references.push({ character: character.name, id: character.id, slot, path: source });
};

for (const character of characters) {
  for (const [slot, source] of Object.entries(character.art || {})) add(character, slot, source);
  for (const ability of character.abilities || []) {
    add(character, ability.name, ability.art);
    for (const form of ability.forms || []) add(character, `${ability.name} · ${form.name}`, form.art);
  }
  for (const form of character.bodyForms || []) add(character, `Forma · ${form.name}`, form.portrait);
}

const unique = new Map();
for (const reference of references) if (!unique.has(reference.path)) unique.set(reference.path, reference);
const missing = [];
for (const reference of unique.values()) {
  try { await access(resolve(root, reference.path.slice(1))); }
  catch { missing.push(reference); }
}
const affected = new Set(missing.map(reference => reference.id));
const report = {
  characters: characters.length,
  references: references.length,
  uniquePaths: unique.size,
  existingPaths: unique.size - missing.length,
  missingPaths: missing.length,
  affectedCharacters: affected.size,
  ...(process.argv.includes("--list-missing") ? { missing } : {})
};
process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
