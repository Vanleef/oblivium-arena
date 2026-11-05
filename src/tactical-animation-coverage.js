import {tacticalSpriteFrame,tacticalSkillAtlases} from './tactical-sprites.js';
import {tacticalAnimationFrames} from './tactical-animation.js';

// A returned idle fallback is not an animated technique. Count actual distinct
// action frames; distinguish reused slot artwork from a dedicated skill/form.
export function tacticalClipCoverage(actor,ability,form=ability){
 const effective={...ability,...form},formKey=form.formKey||'base';
 const event={type:'skill',abilityId:ability.id,formKey};
 const frames=tacticalAnimationFrames(effective).slice(0,-1).map(frame=>tacticalSpriteFrame(actor,{...event,...frame}));
 const distinct=new Set(frames.filter(frame=>frame?.bodyClip&&frame.clip!=='idle').map(frame=>[frame.src,frame.row,frame.column].join(':')));
 const mappedAtlas=distinct.size>=3;
 const dedicatedAtlas=mappedAtlas&&Boolean(tacticalSkillAtlases[[(actor.sourceId||actor.id),ability.id,formKey].join('/')]);
 return {mappedAtlas,dedicatedAtlas,atlasKind:mappedAtlas?(dedicatedAtlas?'dedicated':'slot'):'none'};
}
