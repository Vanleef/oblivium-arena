import test from 'node:test';
import assert from 'node:assert/strict';
import {tacticalAreaDiagram,tacticalAreaDiagramMarkup} from '../src/tactical-area-diagram.js';

test('seven-cell miniature reproduces every canonical attack footprint',()=>{
 const expected={self:1,cell:1,line:3,cone:8,cross:5,square:9,x:5,ring:8};
 for(const [pattern,count] of Object.entries(expected)){
  const diagram=tacticalAreaDiagram({pattern,range:2,length:pattern==='line'?3:2});
  assert.equal(diagram.cells.length,49,pattern);
  assert.equal(diagram.cells.filter(cell=>cell==='origin').length,1,pattern);
  assert.equal(diagram.count,count,pattern);
  assert.equal(diagram.pattern,pattern);
 }
});
test('forward-facing line and cone show their actual directions without guessing target cells',()=>{
 const line=tacticalAreaDiagram({pattern:'line',length:3,range:2});
 assert.equal(line.cells[3*7+4],'hit');
 assert.equal(line.cells[3*7+5],'hit');
 assert.equal(line.cells[3*7+6],'hit');
 assert.equal(line.cells[3*7+2],'empty');
 const cone=tacticalAreaDiagram({pattern:'cone',length:2,range:2});
 assert.equal(cone.cells[3*7+4],'hit');
 assert.equal(cone.cells[2*7+4],'hit');
 assert.equal(cone.cells[4*7+4],'hit');
 assert.equal(cone.cells[3*7+2],'empty');
});
test('movement miniature shows eight adjacent possibilities rather than attacking targets',()=>{
 const move=tacticalAreaDiagram(null,{movement:true});
 assert.equal(move.pattern,'move');
 assert.equal(move.count,8);
 assert.equal(move.cells[3*7+3],'origin');
 const html=tacticalAreaDiagramMarkup(null,{movement:true});
 assert.match(html,/data-mini-pattern="move"/);
 assert.equal((html.match(/data-mini-cell=/g)||[]).length,49);
 assert.equal((html.match(/data-mini-cell="hit"/g)||[]).length,8);
 assert.ok(!html.includes('<img'),'a miniature is geometry, not a copied card image');
});
