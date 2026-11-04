import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { characters } from "../src/data.js";

test("os 100 personagens têm seis artes-base próprias e sem arquivos duplicados", async () => {
  const pathOwners = new Map();
  const contentOwners = new Map();

  for (const character of characters) {
    const assets = [character.art?.portrait, character.art?.passive, ...character.abilities.map(ability => ability.art)];
    assert.equal(assets.length, 6, `${character.name}: retrato, passiva e quatro técnicas`);
    assert.ok(assets.every(path => typeof path === "string" && path.startsWith("/art/")), `${character.name}: arte referenciada`);
    assert.equal(new Set(assets).size, 6, `${character.name}: seis caminhos distintos`);

    for (const path of assets) {
      const previousOwner = pathOwners.get(path);
      assert.ok(!previousOwner || previousOwner === character.id, `${path} também usado por ${character.name}`);
      pathOwners.set(path, character.id);

      try {
        const bytes = await readFile(new URL(`..${path}`, import.meta.url));
        const hash = createHash("sha256").update(bytes).digest("hex");
        const previousAsset = contentOwners.get(hash);
        assert.ok(!previousAsset, `${path} tem o mesmo conteúdo de ${previousAsset}`);
        contentOwners.set(hash, path);
      } catch (error) {
        if (error.code !== "ENOENT") throw error;
      }
    }
  }

  assert.equal(pathOwners.size, characters.length * 6);
});
