import test from 'node:test';
import assert from 'node:assert/strict';
import {characters,characterById} from '../src/data.js';
import {tacticalSpriteFrame} from '../src/tactical-sprites.js';
import {tacticalFigureFraming,tacticalFigureStyle} from '../src/tactical-figure-framing.js';
import {objectiveGrowth} from '../src/conquest-objectives.js';

test('atlas padding is compensated without stretching the drawing or exhausting growth room',()=>{
 for(const actor of characters.filter(c=>tacticalSpriteFrame(c))){
  const f=tacticalFigureFraming(actor);
  assert.ok(f.width>0&&f.height>0,actor.id);
  assert.ok(f.scale>=.95&&f.scale<=1.7);
  const base=.9*f.scale,maximum=(.9+(objectiveGrowth(1e6)-1)*.2)*f.scale;
  assert.ok(base*f.width<=.861,actor.id);
  assert.ok(maximum*f.width<.92,actor.id);
  assert.ok(base*f.height<=1.101,actor.id);
  assert.ok(maximum>base);
  assert.deepEqual(tacticalFigureFraming({...actor,id:'opponent',sourceId:actor.id}),f);
 }
});
test('initial fighters receive a substantial increase and unknown artwork keeps its original frame',()=>{
 for(const id of ['o-acougueiro','a-viuva-escarlate','o-escudo-vivo']){
  const actor=characterById[id];assert.ok(tacticalFigureFraming(actor).scale>1.4);
  assert.match(tacticalFigureStyle(actor),/^--figure-scale:[\d.]+;--figure-center:-?[\d.]+;$/);
 }
 assert.deepEqual(tacticalFigureFraming({id:'unmapped'}),{scale:1,center:0});
});
