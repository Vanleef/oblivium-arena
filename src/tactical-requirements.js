// Prerequisites belong to the actor, independently of whether the target stays in the area.
export function tacticalRequirementReason(s,actor,ability){
 if(!actor||!ability)return 'Técnica indisponível.';
 const link=actor.resonanceTargetId&&actor.resonanceTurns>0&&[...s.allies,...s.enemies].some(u=>u.id===actor.resonanceTargetId&&u.hp>0&&u.side!==actor.side);
 if(ability.requiresEchoLink&&!link)return 'Requer Vínculo de Ressonância ativo.';
 if(ability.resonantWound&&actor.hp<=1)return 'Requer mais de 1 de Vida.';
 if(ability.requiresAshExpansion&&!actor.ashExpansionTurns)return 'Requer Expansão de Cinza ativa.';
 if(ability.requiresAnyCollapse&&!actor.collapseLevel)return 'Requer Colapso ativo.';
 if(ability.requiresCollapseI&&actor.collapseLevel!==1)return 'Requer Colapso I.';
 if(ability.requiresGraceForm&&!actor.graceFormTurns)return 'Requer Forma de Graça ativa.';
 if(ability.requiresPillar&&![...s.allies,...s.enemies].some(u=>u.hp>0&&u.side===actor.side&&u.pillarOwnerId===actor.id))return 'Requer um Pilar aliado ativo.';
 if(ability.requiresInterventionCharge&&actor.interventionCharge<1)return 'Requer Carga de Intervenção.';
 if(ability.activateAshExpansion&&actor.ashExpansionUsed)return 'Expansão de Cinza já utilizada neste combate.';
 if(ability.activateCollapse===1&&(actor.collapse1Used||actor.collapseLevel))return 'Colapso I indisponível neste combate.';
 if(ability.activateCollapse===2&&(!actor.collapse1Used||actor.collapse2Used||actor.collapseLevel!==1))return 'Colapso II exige Colapso I ativo e ainda não utilizado.';
 if(ability.closeCollapse&&!actor.collapseLevel)return 'Não há Colapso para encerrar.';
 return '';
}
