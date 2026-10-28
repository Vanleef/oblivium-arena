import test from 'node:test';
import assert from 'node:assert/strict';
import { tutorialView } from '../src/tutorial.js';
import { localizeMarkup } from '../src/i18n.js';

test('tutorial usa os Reinos atuais em português e inglês',()=>{
 for(const step of [0,4]){
  const html=tutorialView(step,{publicPage:true});
  assert.doesNotMatch(html,/\bElos?\b/);
  assert.match(html,/Reino/);
  assert.match(localizeMarkup(html,'en'),/Kingdom/);
 }
});
