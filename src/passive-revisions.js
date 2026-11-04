// Specific combat hooks for the remaining original roster passives.
export const passiveRevisions = {
  "o-escudo-vivo": {
    "trigger": "hit",
    "requiresLifeLoss": true,
    "requiresRemainingShield": true,
    "effect": {
      "shield": 4
    },
    "description": "Ao causar dano a um inimigo enquanto ainda tem Defesa, recebe 4 de Defesa. Ativa uma vez por rodada."
  },
  "o-que-ficou": {
    "trigger": "support",
    "minimumHeal": 10,
    "requiresOtherAlly": true,
    "nonDefensive": true,
    "effect": {
      "shieldTarget": 5
    },
    "description": "Quando um apoio restaura ao menos 10 de Vida de outro aliado, concede 5 de Defesa a ele. Ativa uma vez por rodada; a defesa pessoal não ativa a passiva."
  },
  "a-sentinela-azul": {
    "trigger": "hit",
    "requiresExposed": true,
    "requiresLifeLoss": true,
    "effect": {
      "gainCharge": 1
    },
    "description": "Ao causar dano a um inimigo Exposto, ganha 1 carga. Ativa uma vez por rodada."
  },
  "a-mao-que-cura": {
    "trigger": "support",
    "minimumCleansed": 1,
    "requiresOtherAlly": true,
    "nonDefensive": true,
    "effect": {
      "healSource": 4
    },
    "description": "Quando um apoio remove ao menos uma aflição de outro aliado, recupera 4 de Vida. Ativa uma vez por rodada; a defesa pessoal não ativa a passiva."
  },
  "a-luz-que-restaura": {
    "trigger": "support",
    "minimumHeal": 20,
    "requiresOtherAlly": true,
    "nonDefensive": true,
    "effect": {
      "generateEssence": {
        "resourceFromForm": true,
        "amount": 1
      }
    },
    "description": "Quando um apoio restaura ao menos 20 de Vida de outro aliado, gera 1 Graça para a equipe. Ativa uma vez por rodada; a defesa pessoal não ativa a passiva."
  },
  "o-pulso-sereno": {
    "trigger": "hit",
    "requiresWeakened": true,
    "requiresLifeLoss": true,
    "effect": {
      "healWeakestAlly": 5
    },
    "description": "Ao causar dano a um inimigo Enfraquecido, restaura 5 de Vida ao aliado mais ferido. Ativa uma vez por rodada."
  },
  "o-equilibrio": {
    "trigger": "hit",
    "requiresExposed": true,
    "requiresLifeLoss": true,
    "effect": {
      "weakenTarget": 1
    },
    "description": "Ao causar dano a um inimigo Exposto, enfraquece-o por 1 turno. Ativa uma vez por rodada."
  },
  "a-lamina-justa": {
    "trigger": "firstHit",
    "oncePerBattle": true,
    "effect": {
      "gainCharge": 1,
      "shield": 4
    },
    "description": "Na primeira habilidade ofensiva que causa dano no combate, ganha 1 carga e 4 de Defesa. Uma vez por combate."
  },
  "a-testemunha-integra": {
    "trigger": "hit",
    "requiresOwnMark": true,
    "requiresLifeLoss": true,
    "effect": {
      "generateEssence": {
        "resourceFromForm": true,
        "amount": 1
      }
    },
    "description": "Ao causar dano a um inimigo que já tem sua Marca, gera 1 Graça. Ativa uma vez por rodada."
  },
  "a-voz": {
    "trigger": "support",
    "minimumShield": 10,
    "nonDefensive": true,
    "effect": {
      "healTeam": 3
    },
    "description": "Quando um apoio concede ao menos 10 de Defesa, restaura 3 de Vida a cada aliado vivo. Ativa uma vez por rodada; a defesa pessoal não ativa a passiva."
  },
  "o-portador-da-aurora": {
    "trigger": "firstHit",
    "oncePerBattle": true,
    "effect": {
      "gainCharge": 1
    },
    "description": "Na primeira habilidade ofensiva que causa dano no combate, ganha 1 carga. Uma vez por combate."
  },
  "a-mensageira-do-amanha": {
    "trigger": "support",
    "minimumHeal": 10,
    "requiresOtherAlly": true,
    "nonDefensive": true,
    "effect": {
      "shieldTarget": 5
    },
    "description": "Quando um apoio restaura ao menos 10 de Vida a outro aliado, concede 5 de Defesa a ele. Ativa uma vez por rodada; a defesa pessoal não ativa a passiva."
  },
  "o-espelho": {
    "trigger": "damaged",
    "requiresLifeLoss": true,
    "requiresRemainingShield": true,
    "damageTypes": [
      "physical",
      "piercing"
    ],
    "effect": {
      "damageAttacker": 4
    },
    "description": "Ao perder Vida para uma habilidade física ou perfurante e ainda manter Defesa, causa 4 de dano de aflição ao agressor. Ativa uma vez por rodada."
  },
  "a-cartografa-da-clareza": {
    "trigger": "hit",
    "requiresOwnMark": true,
    "requiresLifeLoss": true,
    "effect": {
      "gainCharge": 1
    },
    "description": "Ao causar dano a um inimigo que já tem sua Marca, ganha 1 carga. Ativa uma vez por rodada."
  },
  "o-olho-desarmado": {
    "trigger": "support",
    "minimumCleansed": 1,
    "requiresOtherAlly": true,
    "nonDefensive": true,
    "effect": {
      "shieldTarget": 4
    },
    "description": "Quando um apoio remove ao menos uma aflição de outro aliado, concede 4 de Defesa a ele. Ativa uma vez por rodada; a defesa pessoal não ativa a passiva."
  },
  "o-elo-dourado": {
    "trigger": "hit",
    "requiresOwnMark": true,
    "requiresLifeLoss": true,
    "effect": {
      "healWeakestAlly": 4
    },
    "description": "Ao causar dano a um inimigo que já tem sua Marca, restaura 4 de Vida ao aliado mais ferido. Ativa uma vez por rodada."
  },
  "o-vinculo": {
    "trigger": "turnStart",
    "ifDamagedLastTurn": true,
    "effect": {
      "shield": 5
    },
    "description": "Se perdeu Vida para uma habilidade na rodada anterior, recebe 5 de Defesa no início do turno. Ativa uma vez por rodada."
  },
  "a-guardia-das-promessas": {
    "trigger": "support",
    "minimumShield": 20,
    "requiresOtherAlly": true,
    "nonDefensive": true,
    "effect": {
      "healTarget": 5
    },
    "description": "Quando um apoio concede ao menos 20 de Defesa a outro aliado, restaura 5 de Vida a ele. Ativa uma vez por rodada; a defesa pessoal não ativa a passiva."
  },
  "o-cultivador": {
    "trigger": "chargeSpent",
    "minimumChargesSpent": 1,
    "offensive": true,
    "effect": {
      "generateEssence": {
        "resourceFromForm": true,
        "amount": 1
      }
    },
    "description": "Ao consumir ao menos 1 carga com uma habilidade ofensiva, gera 1 Graça. Ativa uma vez por rodada."
  },
  "a-arquiteta-verde": {
    "trigger": "stripShield",
    "minimumStripped": 10,
    "effect": {
      "shieldTeam": 3
    },
    "description": "Ao remover pelo menos 10 de Defesa com uma habilidade, concede 3 de Defesa ao trio. Ativa uma vez por rodada."
  },
  "o-primeiro-canto": {
    "trigger": "support",
    "minimumHeal": 15,
    "nonDefensive": true,
    "effect": {
      "gainCharge": 1
    },
    "description": "Quando um apoio restaura ao menos 15 de Vida, ganha 1 carga. Ativa uma vez por rodada; a defesa pessoal não ativa a passiva."
  },
  "a-linha-partida": {
    "trigger": "hit",
    "requiresOwnMark": true,
    "requiresLifeLoss": true,
    "effect": {
      "heal": 4,
      "gainCharge": 1
    },
    "description": "Ao causar dano a um inimigo que já tem sua Marca, recupera 4 de Vida e ganha 1 carga. Ativa uma vez por rodada."
  },
  "o-eco-sem-dono": {
    "trigger": "damaged",
    "requiresLifeLoss": true,
    "requiresRemainingShield": true,
    "effect": {
      "damageAttacker": 5
    },
    "description": "Se ainda tem Defesa após perder Vida para uma habilidade inimiga, causa 5 de dano de aflição ao agressor. Ativa uma vez por rodada."
  },
  "a-porta-que-flutua": {
    "trigger": "support",
    "minimumCleansed": 1,
    "requiresOtherAlly": true,
    "nonDefensive": true,
    "effect": {
      "healTeam": 3
    },
    "description": "Quando um apoio remove ao menos uma aflição de um aliado, recupera 3 de Vida para cada aliado vivo. Ativa uma vez por rodada; a defesa pessoal não ativa a passiva."
  },
  "o-nome-esquecido": {
    "trigger": "turnStart",
    "hpAtMost": 50,
    "effect": {
      "heal": 3,
      "generateEssence": {
        "resourceFromForm": true,
        "amount": 1
      }
    },
    "description": "Com 50 de Vida ou menos, recupera 3 de Vida e gera 1 Ruptura no início do turno. Ativa uma vez por rodada."
  },
  "a-asa-invertida": {
    "trigger": "hit",
    "requiresWeakened": true,
    "requiresLifeLoss": true,
    "effect": {
      "gainCharge": 1
    },
    "description": "Ao causar dano a um inimigo Enfraquecido, ganha 1 carga. Ativa uma vez por rodada."
  },
  "a-sombra-inconstante": {
    "trigger": "hit",
    "requiresOwnMark": true,
    "requiresLifeLoss": true,
    "effect": {
      "heal": 5
    },
    "description": "Ao causar dano a um inimigo que já tem sua Marca, restaura 5 de Vida. Ativa uma vez por rodada."
  },
  "a-ponte-rasgada": {
    "trigger": "hit",
    "requiresExposed": true,
    "requiresLifeLoss": true,
    "effect": {
      "drainEssence": {
        "amount": 1
      }
    },
    "description": "Ao causar dano a um inimigo Exposto, remove 1 Essência disponível da reserva adversária, se houver. Ativa uma vez por rodada."
  },
  "a-alma-em-suspenso": {
    "trigger": "turnStart",
    "ifDamagedLastTurn": true,
    "effect": {
      "heal": 5,
      "gainCharge": 1
    },
    "description": "Se perdeu Vida para uma habilidade na rodada anterior, recupera 5 de Vida e ganha 1 carga no início do turno. Ativa uma vez por rodada."
  }
};

export function revisePassive(kit,id){
  const revision=passiveRevisions[id];
  if(!revision)return kit;
  const {type:_type,amount:_amount,condition:_condition,...base}=kit.passive||{};
  return {...kit,passive:{...base,...revision,type:"triggered",archetypeType:_type,...(_condition?{archetypeCondition:_condition}:{})}};
}
