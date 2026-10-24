import test from "node:test";
import assert from "node:assert/strict";
import { fallbackArtwork, handleArtworkError } from "../src/art-fallback.js";

test("artes ausentes viram runas vetoriais próprias por personagem e técnica", () => {
  const portrait = fallbackArtwork("/art/characters/o-soberano-quebrado/portrait.webp");
  const passive = fallbackArtwork("/art/characters/o-soberano-quebrado/passive.webp");
  const rival = fallbackArtwork("/art/characters/a-juiza-de-ferro/portrait.webp");
  assert.match(portrait, /^data:image\/svg\+xml;charset=UTF-8,/);
  assert.notEqual(portrait, passive);
  assert.notEqual(portrait, rival);
  const svg = decodeURIComponent(portrait.split(",")[1]);
  assert.match(svg, /<svg[^>]+viewBox="0 0 512 512"/);
  assert.match(svg, />SQ<\/text>/);
  assert.equal(fallbackArtwork(portrait), null);
});

test("a falha de imagem é substituída uma vez e não cria ciclo de erro", () => {
  const image = {
    tagName: "IMG",
    dataset: {},
    src: "/art/characters/a-brasa-eterna/skill-voto.webp",
    getAttribute(name) { return name === "src" ? this.src : null; },
    classList: { add(name) { this.addedClass = name; } }
  };
  assert.equal(handleArtworkError({ target: image }), true);
  const fallback = image.src;
  assert.match(fallback, /^data:image\/svg\+xml/);
  assert.equal(image.classList.addedClass, "art-fallback-image");
  assert.equal(handleArtworkError({ target: image }), false);
  assert.equal(image.src, fallback);
});
