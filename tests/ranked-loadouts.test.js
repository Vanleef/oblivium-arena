import test from "node:test";
import assert from "node:assert/strict";
import {normalizeRankedLoadouts} from "../src/ranked-loadouts.js";
const actor=id=>({id,abilities:["cut","block","dash","curse"].map(id=>({id,name:id}))});
const trio=[actor("a"),actor("b"),actor("c")],catalog=Object.fromEntries(trio.map(a=>[a.id,a]));
const normalized=()=>normalizeRankedLoadouts(["a","b","c"],{},catalog);
test("each ranked character starts with eight independent, validated cards",()=>{
 const decks=normalized();
 for(const u of trio){
  assert.equal(decks[u.id].length,8);
  assert.equal(new Set(decks[u.id].map(c=>c.abilityId)).size,4);
  assert.ok(decks[u.id].every(c=>!c.upgrades));
 }
});
test("custom loadouts accept 8–10 legal cards without changing teammates",()=>{
 const cards=["cut","block","dash","curse","cut","block","dash","curse","cut"].map(abilityId=>({abilityId}));
 const decks=normalizeRankedLoadouts(["a","b","c"],{a:cards},catalog);
 assert.equal(decks.a.length,9);
 assert.equal(decks.b.length,8);
 assert.equal(decks.c.length,8);
 assert.equal(decks.a.filter(c=>c.abilityId==="cut").length,3);
});
test("ranked rejects forged campaign upgrades, unknown abilities and injected characters",()=>{
 assert.throws(()=>normalizeRankedLoadouts(["a","b","c"],{a:Array(8).fill({abilityId:"cut",upgrades:["damage"]})},catalog),/aprimoramentos/i);
 assert.throws(()=>normalizeRankedLoadouts(["a","b","c"],{a:Array(8).fill({abilityId:"unknown"})},catalog),/inválida/i);
 assert.throws(()=>normalizeRankedLoadouts(["a","b","c"],{intruder:[]},catalog),/fora do trio/i);
});
test("ranked rejects excess duplicate copies and overly short decks",()=>{
 assert.throws(()=>normalizeRankedLoadouts(["a","b","c"],{a:Array(8).fill({abilityId:"cut"})},catalog),/3 cópias/i);
 assert.throws(()=>normalizeRankedLoadouts(["a","b","c"],{a:[{abilityId:"block"}]},catalog),/8 e 10/i);
});
