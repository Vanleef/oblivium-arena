import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { characters } from "../src/data.js";

test("as seis artes de O Suserano estão íntegras e ligadas ao kit", () => {
  const root = new URL("../", import.meta.url);
  const manifest = JSON.parse(readFileSync(new URL("docs/ART_SUSERANO_20261024.json", root), "utf8"));
  const character = characters.find(item => item.id === "o-trono-vazio");
  const activePaths = new Set([character.art.portrait, character.passive.art, ...character.abilities.map(ability => ability.art)]);
  assert.equal(manifest.assets.length, 6);
  assert.deepEqual(new Set(manifest.assets.map(asset => `/${asset.path}`)), activePaths);

  for (const asset of manifest.assets) {
    const bytes = readFileSync(new URL(asset.path, root));
    assert.equal(bytes.length, asset.bytes, asset.path);
    assert.equal(bytes.toString("ascii", 0, 4), "RIFF", asset.path);
    assert.equal(bytes.toString("ascii", 8, 12), "WEBP", asset.path);
    assert.equal(createHash("sha256").update(bytes).digest("hex"), asset.sha256, asset.path);
    assert.equal(asset.width, 512, asset.path);
    assert.equal(asset.height, 512, asset.path);
  }
});
