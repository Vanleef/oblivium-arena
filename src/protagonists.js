import { describeAbility } from "./kits.js";

const protagonistProfiles = [
  {
    "id": "nilo",
    "name": "Nilo",
    "englishName": "Nilo",
    "family": "nilo",
    "version": 1,
    "eloId": "correntes-quebradas",
    "elo": "Anômalo",
    "englishElo": "Anomaly",
    "realm": "Limbo",
    "color": "limbo",
    "symbol": "⟲",
    "affinity": "essence",
    "role": "Receptáculo Instável",
    "englishRole": "Unstable Vessel",
    "combo": "Registre o gasto de Essência inimigo, marque um alvo e escolha quando gastar Resíduos.",
    "englishCombo": "Record enemy Essence spending, mark a target, and choose when to spend Residue.",
    "mechanic": "Nilo começa com uma única habilidade de conversão: Resíduos são acumulados quando inimigos pagam custos altos e só fortalecem Devolver o Eco.",
    "englishMechanic": "Nilo begins with one conversion skill: Residue is recorded when enemies pay high costs and only strengthens Return the Echo.",
    "lore": "Cada alma deixa um vestígio, mas Nilo ainda pode escolher quais ecos transformar em força.",
    "englishLore": "Every soul leaves a trace, but Nilo can still choose which echoes to turn into strength.",
    "synergyEloIds": [
      "correntes-quebradas"
    ],
    "passive": {
      "name": "Registro Aberto",
      "englishName": "Open Record",
      "trigger": "enemyEssenceSpent",
      "repeatPerRound": true,
      "minSpent": 2,
      "effect": {
        "gainResidue": 1
      },
      "description": "Sempre que um inimigo gastar 2 ou mais Essências, Nilo grava 1 Resíduo (máx. 3). Só Devolver o Eco pode gastar Resíduos; gastar é opcional.",
      "englishDescription": "Whenever an enemy spends 2 or more Essence, Nilo records 1 Residue (max 3). Only Return the Echo can spend it; spending is optional."
    },
    "skills": [
      {
        "name": "Toque Receptivo",
        "englishName": "Receptive Touch",
        "damage": 12,
        "costs": {
          "random": 1
        },
        "target": "enemy",
        "damageType": "energy",
        "drain": 1,
        "englishDescription": "Deals 12 spiritual damage, and removes 1 Essence from the enemy reserve."
      },
      {
        "name": "Fio de Memória",
        "englishName": "Memory Thread",
        "damage": 0,
        "costs": {
          "random": 1
        },
        "target": "enemy",
        "mark": "memoria",
        "markTurns": 2,
        "reactive": {
          "trigger": "skill",
          "damage": 6,
          "damageType": "affliction",
          "harmful": true,
          "turns": 1
        },
        "englishDescription": "Marks a target for 2 turns. If it uses a skill next turn, it takes 6 affliction damage."
      },
      {
        "name": "Devolver o Eco",
        "englishName": "Return the Echo",
        "damage": 13,
        "costs": {
          "random": 1,
          "essence": 1
        },
        "target": "enemy",
        "damageType": "energy",
        "spendResidueMax": 2,
        "residueBonusDamage": 3,
        "englishDescription": "Deals 13 damage, and may spend up to 2 Residue for +3 damage each."
      }
    ],
    "defense": {
      "name": "Limiar",
      "englishName": "Threshold",
      "shield": 5
    }
  },
  {
    "id": "nilo-o-prefacio",
    "name": "Nilo, Prefácio de Cinza",
    "englishName": "Nilo, Ash Preface",
    "family": "nilo",
    "version": 2,
    "eloId": "correntes-quebradas",
    "elo": "Anômalo",
    "englishElo": "Anomaly",
    "realm": "Inferno",
    "color": "inferno",
    "symbol": "⟲",
    "affinity": "cinza",
    "role": "Ferida em Sequência",
    "englishRole": "Sequential Wound",
    "combo": "Aplique uma aflição e escolha quando converter a abertura em dano.",
    "englishCombo": "Apply an affliction, then choose when to convert the opening into damage.",
    "mechanic": "Cinza transforma o combate em preparação de feridas: Sangramento ou Queimadura abre uma janela de Defesa ignorada no próximo golpe.",
    "englishMechanic": "Ash turns combat into wound setup: Bleed or Burn opens a window to bypass Defense on the next strike.",
    "lore": "O contato com o Inferno endurece a corrupção em cortes e calor persistente. Nilo ainda tenta conduzir cada efeito antes que a essência o conduza.",
    "englishLore": "Contact with Inferno hardens corruption into cuts and persistent heat. Nilo still tries to direct each effect before it directs him.",
    "synergyEloIds": [
      "correntes-quebradas"
    ],
    "passive": {
      "name": "Ferida Aberta",
      "englishName": "Open Wound",
      "trigger": "statusApplied",
      "condition": "bleedOrBurn",
      "effect": {
        "armNextHitIgnoreDefense": 5
      },
      "description": "Depois de aplicar Sangramento ou Queimadura, o próximo dano de Nilo contra esse alvo ignora 5 de Defesa. Exige sequência; não concede dano automático.",
      "englishDescription": "After applying Bleed or Burn, Nilo's next damage against that target ignores 5 Defense. This requires a follow-up; it grants no automatic damage."
    },
    "skills": [
      {
        "name": "Corte Escarro",
        "englishName": "Spat Cut",
        "damage": 12,
        "costs": {
          "cinza": 1,
          "random": 1
        },
        "target": "enemy",
        "damageType": "physical",
        "dot": {
          "tag": "sangramento",
          "damage": 3,
          "turns": 2
        },
        "absorption": "cinza",
        "englishDescription": "Deals 12 physical damage, and applies Bleed for 3 affliction damage over 2 turns."
      },
      {
        "name": "Brasa Direta",
        "englishName": "Direct Ember",
        "damage": 13,
        "costs": {
          "cinza": 1,
          "random": 1
        },
        "target": "enemy",
        "damageType": "energy",
        "dot": {
          "tag": "queimadura",
          "damage": 3,
          "turns": 2
        },
        "absorption": "cinza",
        "englishDescription": "Deals 13 spiritual damage, and applies Burn for 3 affliction damage over 2 turns."
      },
      {
        "name": "Ferida que Consome",
        "englishName": "Consuming Wound",
        "damage": 15,
        "costs": {
          "cinza": 1,
          "essence": 1
        },
        "target": "enemy",
        "damageType": "physical",
        "bonusIfDotTags": [
          "sangramento",
          "queimadura"
        ],
        "bonusDamage": 5,
        "absorption": "cinza",
        "englishDescription": "Deals 15 physical damage, plus 5 if the target has Bleed or Burn."
      }
    ],
    "defense": {
      "name": "Limiar",
      "englishName": "Threshold",
      "shield": 5
    }
  },
  {
    "id": "nilo-graca-prefacio",
    "name": "Nilo, Prefácio de Graça",
    "englishName": "Nilo, Grace Preface",
    "family": "nilo",
    "version": 2,
    "eloId": "correntes-quebradas",
    "elo": "Anômalo",
    "englishElo": "Anomaly",
    "realm": "Paraíso",
    "color": "paraiso",
    "symbol": "⟲",
    "affinity": "graca",
    "role": "Marcação e Resposta",
    "englishRole": "Mark and Answer",
    "combo": "Marque antes de atacar para recuperar terreno e reforçar a próxima técnica.",
    "englishCombo": "Mark before attacking to regain ground and strengthen the next skill.",
    "mechanic": "Marcar um alvo prepara uma única resposta ofensiva de Nilo: +5 de dano e +3 de Vida na próxima skill contra ele.",
    "englishMechanic": "Marking a target prepares one offensive answer from Nilo: +5 damage and +3 Health on his next skill against it.",
    "lore": "A Graça não apaga a corrupção; ela oferece uma janela para Nilo escolher onde sustentar a vida.",
    "englishLore": "Grace does not erase corruption; it gives Nilo a window to choose where to sustain life.",
    "synergyEloIds": [
      "correntes-quebradas"
    ],
    "passive": {
      "name": "Marca de Caça",
      "englishName": "Hunt Mark",
      "trigger": "markApplied",
      "effect": {
        "markNextSkill": {
          "bonusDamage": 4,
          "heal": 2
        }
      },
      "description": "Quando Nilo marca um alvo, sua próxima skill contra ele causa +4 de dano e restaura 2 de Vida. Exige marcar antes de atacar.",
      "englishDescription": "When Nilo marks a target, his next skill against it deals +4 damage and restores 2 Health. Mark first."
    },
    "skills": [
      {
        "name": "Toque de Clareza",
        "englishName": "Touch of Clarity",
        "target": "self",
        "heal": 10,
        "costs": {
          "graca": 1
        },
        "absorption": "graca",
        "englishDescription": "Restores 10 Health to Nilo."
      },
      {
        "name": "Marca de Caça",
        "englishName": "Hunt Mark",
        "damage": 10,
        "costs": {
          "graca": 1,
          "random": 1
        },
        "target": "enemy",
        "damageType": "energy",
        "mark": "cacada",
        "markTurns": 2,
        "expose": 1,
        "absorption": "graca",
        "englishDescription": "Deals 10 spiritual damage, marks the target for 2 turns, and Exposes it."
      },
      {
        "name": "Luz Contida",
        "englishName": "Contained Light",
        "damage": 12,
        "costs": {
          "graca": 1,
          "essence": 1
        },
        "target": "enemy",
        "damageType": "energy",
        "combo": {
          "condition": "marked",
          "bonusDamage": 4
        },
        "absorption": "graca",
        "englishDescription": "Deals 12 spiritual damage, plus 4 against a target marked by Nilo."
      }
    ],
    "defense": {
      "name": "Limiar",
      "englishName": "Threshold",
      "shield": 5
    }
  },
  {
    "id": "nilo-ruptura-prefacio",
    "name": "Nilo, Prefácio de Ruptura",
    "englishName": "Nilo, Rupture Preface",
    "family": "nilo",
    "version": 2,
    "eloId": "correntes-quebradas",
    "elo": "Anômalo",
    "englishElo": "Anomaly",
    "realm": "Limbo",
    "color": "limbo",
    "symbol": "⟲",
    "affinity": "ruptura",
    "role": "Resíduo de Status",
    "englishRole": "Status Residue",
    "combo": "Aplique estados para acumular Resíduos e decida quanto investir na resposta.",
    "englishCombo": "Apply statuses to collect Residue and decide how much to invest in a response.",
    "mechanic": "Cada status aplicado por Nilo gera 1 Resíduo (máx. 3). Só Resposta do Intervalo pode gastá-los; o gasto é opcional.",
    "englishMechanic": "Each status Nilo applies grants 1 Residue (max 3). Only Interval Response can spend it; spending is optional.",
    "lore": "O Limbo não decide por Nilo; ele deixa fraturas no espaço para que Nilo escolha quando responder.",
    "englishLore": "Limbo does not decide for Nilo; it leaves fractures in space so Nilo can choose when to answer.",
    "synergyEloIds": [
      "correntes-quebradas"
    ],
    "passive": {
      "name": "Resíduo de Status",
      "englishName": "Status Residue",
      "trigger": "statusApplied",
      "repeatPerRound": true,
      "effect": {
        "gainResidue": 1
      },
      "description": "Sempre que Nilo aplica um status, grava 1 Resíduo (máx. 3). Resíduos só podem ser gastos na skill de resposta e o gasto é opcional.",
      "englishDescription": "Whenever Nilo applies a status, he records 1 Residue (max 3). Residue can only be spent on his response skill, and spending is optional."
    },
    "skills": [
      {
        "name": "Corte Residual",
        "englishName": "Residual Cut",
        "damage": 10,
        "costs": {
          "ruptura": 1,
          "random": 1
        },
        "target": "enemy",
        "damageType": "physical",
        "dot": {
          "tag": "sangramento",
          "damage": 3,
          "turns": 2
        },
        "absorption": "ruptura",
        "englishDescription": "Deals 10 physical damage, and applies Bleed for 3 affliction damage over 2 turns."
      },
      {
        "name": "Marca do Vazio",
        "englishName": "Void Mark",
        "damage": 10,
        "costs": {
          "ruptura": 1,
          "random": 1
        },
        "target": "enemy",
        "damageType": "energy",
        "expose": 1,
        "dot": {
          "tag": "decadencia",
          "damage": 3,
          "turns": 2
        },
        "absorption": "ruptura",
        "englishDescription": "Deals 10 spiritual damage, Exposes the target, and applies Decay for 3 affliction damage over 2 turns."
      },
      {
        "name": "Resposta do Intervalo",
        "englishName": "Interval Response",
        "target": "self",
        "costs": {
          "ruptura": 1,
          "random": 1
        },
        "counter": 12,
        "counterFilter": [
          "physical",
          "piercing"
        ],
        "counterDamageType": "physical",
        "spendResidueMax": 3,
        "residueCounterBonus": 2,
        "absorption": "ruptura",
        "englishDescription": "Counters the next physical or piercing skill for 12 damage. May spend up to 3 Residue for +2 counter damage each."
      },
      {
        "name": "Estilhaço",
        "englishName": "Shard",
        "damage": 12,
        "costs": {
          "random": 1
        },
        "target": "enemy",
        "damageType": "physical",
        "bonusIfAnyStatus": 4,
        "absorption": "ruptura",
        "englishDescription": "Deals 12 physical damage, plus 4 if the target has any status."
      }
    ],
    "defense": {
      "name": "Limiar",
      "englishName": "Threshold",
      "shield": 5
    }
  },
  {
    "id": "nilo-cinza-epilogo",
    "name": "Nilo, Epílogo de Cinza",
    "englishName": "Nilo, Ash Epilogue",
    "family": "nilo",
    "version": 3,
    "eloId": "correntes-quebradas",
    "elo": "Anômalo",
    "englishElo": "Anomaly",
    "realm": "Inferno",
    "color": "inferno",
    "symbol": "⟲",
    "affinity": "cinza",
    "role": "Expansão Autodestrutiva",
    "englishRole": "Self-Destructive Expansion",
    "combo": "Ative a Expansão na janela certa e converta Vida em pressão por dois turnos.",
    "englishCombo": "Activate Expansion at the right moment and trade Health for two turns of pressure.",
    "mechanic": "A Expansão de Cinza aumenta o dano de cada técnica ofensiva, mas cobra Vida a cada uso. Pode ser ativada uma vez por combate.",
    "englishMechanic": "Ash Expansion increases each offensive skill's damage, but costs Health each time. It can be activated once per combat.",
    "lore": "A corrupção deixa de ser apenas um ferimento; torna-se uma decisão de quanto Nilo aceita perder para avançar.",
    "englishLore": "Corruption is no longer only a wound; it becomes a decision about how much Nilo will lose to advance.",
    "synergyEloIds": [
      "correntes-quebradas"
    ],
    "passive": {
      "name": "Expansão de Cinza",
      "englishName": "Ash Expansion",
      "trigger": "manual",
      "effect": {},
      "description": "Uma vez por combate, Nilo pode ativar Expansão por 2 turnos. Skills de dano causam +7, mas Nilo perde 5 de Vida por uso.",
      "englishDescription": "Once per combat, Nilo may activate Ash Expansion for 2 turns. Damage skills deal +7, but Nilo loses 5 Health per use."
    },
    "skills": [
      {
        "name": "Lâmina de Sangue e Fogo",
        "englishName": "Blade of Blood and Fire",
        "damage": 12,
        "costs": {
          "cinza": 1,
          "random": 1
        },
        "target": "enemy",
        "damageType": "physical",
        "dots": [
          {
            "tag": "sangramento",
            "damage": 3,
            "turns": 2
          },
          {
            "tag": "queimadura",
            "damage": 3,
            "turns": 2
          }
        ],
        "absorption": "cinza",
        "englishDescription": "Deals 12 physical damage, and applies Bleed and Burn, each for 3 affliction damage over 2 turns."
      },
      {
        "name": "Golpe Mentiroso",
        "englishName": "False Blow",
        "damage": 14,
        "costs": {
          "cinza": 1,
          "random": 1
        },
        "target": "enemy",
        "damageType": "physical",
        "purgeBuffs": 1,
        "damageIfPurged": 5,
        "absorption": "cinza",
        "englishDescription": "Deals 14 physical damage and removes 1 enemy buff. If it removes a buff, it deals 5 more damage."
      },
      {
        "name": "Ativar Expansão",
        "englishName": "Activate Expansion",
        "target": "self",
        "costs": {
          "cinza": 1
        },
        "activateAshExpansion": 2,
        "absorption": "cinza",
        "englishDescription": "Activates Ash Expansion for 2 turns. It can be used once per combat."
      },
      {
        "name": "Carne Aberta",
        "englishName": "Open Flesh",
        "damage": 14,
        "costs": {
          "cinza": 1,
          "essence": 1
        },
        "target": "enemy",
        "damageType": "piercing",
        "dot": {
          "tag": "sangramento",
          "damage": 3,
          "turns": 2
        },
        "requiresAshExpansion": true,
        "absorption": "cinza",
        "englishDescription": "Deals 14 piercing damage, and applies Bleed for 3 affliction damage over 2 turns. Requires Ash Expansion."
      },
      {
        "name": "Execução Prematura",
        "englishName": "Premature Execution",
        "damage": 18,
        "costs": {
          "cinza": 2,
          "essence": 1
        },
        "target": "enemy",
        "damageType": "physical",
        "executeIfHpAtMost": 15,
        "absorption": "cinza",
        "englishDescription": "Deals 18 damage, and executes the target if it has 15 Health or less after the hit."
      }
    ],
    "defense": {
      "name": "Limiar",
      "englishName": "Threshold",
      "shield": 5
    }
  },
  {
    "id": "nilo-graca-epilogo",
    "name": "Nilo, Epílogo de Graça",
    "englishName": "Nilo, Grace Epilogue",
    "family": "nilo",
    "version": 3,
    "eloId": "correntes-quebradas",
    "elo": "Anômalo",
    "englishElo": "Anomaly",
    "realm": "Paraíso",
    "color": "paraiso",
    "symbol": "⟲",
    "affinity": "graca",
    "role": "Clareza Momentânea",
    "englishRole": "Momentary Clarity",
    "combo": "Limpe um buff ou uma aflição; depois escolha se a próxima abertura pede dano ou cura.",
    "englishCombo": "Remove a buff or affliction, then decide whether the next opening calls for damage or healing.",
    "mechanic": "Depois de remover um buff inimigo ou limpar uma aflição de aliado, a próxima skill causa +6 de dano ou restaura +4 de Vida, conforme sua função.",
    "englishMechanic": "After removing an enemy buff or cleansing an ally's affliction, the next skill deals +6 damage or restores +4 Health, depending on its role.",
    "lore": "A graça que Nilo conserva é breve e prática: uma limpeza abre espaço para uma ação deliberada.",
    "englishLore": "The grace Nilo retains is brief and practical: a cleanse creates room for a deliberate action.",
    "synergyEloIds": [
      "correntes-quebradas"
    ],
    "passive": {
      "name": "Clareza Momentânea",
      "englishName": "Momentary Clarity",
      "trigger": "controlCleansed",
      "effect": {
        "clarity": {
          "damage": 6,
          "heal": 4
        }
      },
      "description": "Depois que Nilo remove um buff inimigo ou uma aflição de aliado, sua próxima skill causa +6 ou restaura +4 de Vida, o que for mais relevante.",
      "englishDescription": "After Nilo removes an enemy buff or an ally affliction, his next skill deals +6 damage or restores +4 Health, whichever is relevant."
    },
    "skills": [
      {
        "name": "Sustento",
        "englishName": "Sustain",
        "target": "self",
        "heal": 11,
        "costs": {
          "graca": 1
        },
        "absorption": "graca",
        "englishDescription": "Restores 11 Health to Nilo."
      },
      {
        "name": "Revelação",
        "englishName": "Revelation",
        "damage": 11,
        "costs": {
          "graca": 1,
          "random": 1,
          "essence": 1
        },
        "target": "enemy",
        "damageType": "energy",
        "purgeBuffs": 1,
        "expose": 1,
        "absorption": "graca",
        "englishDescription": "Deals 11 spiritual damage, removes 1 enemy buff, and Exposes the target."
      },
      {
        "name": "Punho de Clareza",
        "englishName": "Fist of Clarity",
        "damage": 13,
        "costs": {
          "graca": 1,
          "essence": 1
        },
        "target": "enemy",
        "damageType": "physical",
        "combo": {
          "condition": "exposed",
          "bonusDamage": 4
        },
        "absorption": "graca",
        "englishDescription": "Deals 13 physical damage, plus 4 if the target is Exposed."
      },
      {
        "name": "Verdade que Prende",
        "englishName": "Binding Truth",
        "damage": 11,
        "costs": {
          "graca": 2
        },
        "target": "enemy",
        "damageType": "energy",
        "weaken": 1,
        "combo": {
          "condition": "exposed",
          "bonusDamage": 4
        },
        "absorption": "graca",
        "englishDescription": "Deals 11 spiritual damage and Weakens the target, plus 4 damage if it is Exposed."
      }
    ],
    "defense": {
      "name": "Limiar",
      "englishName": "Threshold",
      "shield": 5
    }
  },
  {
    "id": "nilo-ruptura-epilogo",
    "name": "Nilo, Epílogo de Ruptura",
    "englishName": "Nilo, Rupture Epilogue",
    "family": "nilo",
    "version": 3,
    "eloId": "correntes-quebradas",
    "elo": "Anômalo",
    "englishElo": "Anomaly",
    "realm": "Limbo",
    "color": "limbo",
    "symbol": "⟲",
    "affinity": "ruptura",
    "role": "Sombra Preparada",
    "englishRole": "Prepared Shadow",
    "combo": "Use furtividade e escolha entre uma abertura ofensiva ou uma resposta mais ampla.",
    "englishCombo": "Use stealth and choose between an offensive opening or a broader response.",
    "mechanic": "Depois de uma skill de furtividade, escolha: +5 na próxima skill de dano ou a próxima resposta anula qualquer tipo de skill.",
    "englishMechanic": "After a stealth skill, choose: +5 on the next damage skill, or the next response cancels any skill type.",
    "lore": "A Ruptura oferece o intervalo; Nilo escolhe se o próximo passo pune ou protege.",
    "englishLore": "Rupture offers the interval; Nilo chooses whether the next step punishes or protects.",
    "synergyEloIds": [
      "correntes-quebradas"
    ],
    "passive": {
      "name": "Sombra Preparada",
      "englishName": "Prepared Shadow",
      "trigger": "stealthUsed",
      "effect": {
        "shadowChoice": true
      },
      "description": "Depois de usar uma skill de furtividade, escolha +4 de dano na próxima skill ou faça a próxima skill de resposta anular qualquer tipo.",
      "englishDescription": "After using a stealth skill, choose +4 damage on the next skill or let the next response cancel any type of skill."
    },
    "skills": [
      {
        "name": "Passo no Vazio",
        "englishName": "Step into the Void",
        "damage": 12,
        "costs": {
          "ruptura": 1
        },
        "target": "enemy",
        "damageType": "physical",
        "stealth": 1,
        "absorption": "ruptura",
        "englishDescription": "Deals 12 damage, and grants Stealth for 1 turn."
      },
      {
        "name": "Corte Silencioso",
        "englishName": "Silent Cut",
        "damage": 12,
        "costs": {
          "ruptura": 1,
          "random": 1
        },
        "target": "enemy",
        "damageType": "physical",
        "dot": {
          "tag": "sangramento",
          "damage": 3,
          "turns": 2
        },
        "stealthBonus": 5,
        "absorption": "ruptura",
        "englishDescription": "Deals 12 physical damage, and applies Bleed for 3 affliction damage over 2 turns. If Nilo is Stealthed, it deals 5 more damage."
      },
      {
        "name": "Armadilha de Sombra",
        "englishName": "Shadow Trap",
        "target": "enemy",
        "costs": {
          "ruptura": 1,
          "random": 1
        },
        "mark": "armadilha-sombra",
        "markTurns": 2,
        "reactive": {
          "trigger": "attack",
          "damage": 9,
          "damageType": "affliction",
          "exposeAttacker": true,
          "harmful": true,
          "turns": 1
        },
        "absorption": "ruptura",
        "englishDescription": "Marks the target for 2 turns, and triggers when it attacks: it takes 9 affliction damage and becomes Exposed."
      },
      {
        "name": "Resposta do Vazio",
        "englishName": "Void Response",
        "target": "self",
        "costs": {
          "ruptura": 1,
          "essence": 1,
          "random": 1
        },
        "counter": 12,
        "counterFilter": [
          "physical",
          "piercing",
          "energy",
          "affliction"
        ],
        "counterDamageType": "physical",
        "counterEffect": {
          "dot": {
            "tag": "decadencia",
            "damage": 3,
            "turns": 2
          }
        },
        "absorption": "ruptura",
        "englishDescription": "Counters the next enemy skill of any type for 12 physical damage and applies Decay for 3 affliction damage over 2 turns."
      }
    ],
    "defense": {
      "name": "Limiar",
      "englishName": "Threshold",
      "shield": 5
    }
  },
  {
    "id": "nilo-cinza-final",
    "name": "Nilo, o Sem Rastro",
    "englishName": "Nilo, the Traceless",
    "family": "nilo",
    "version": 4,
    "eloId": "correntes-quebradas",
    "elo": "Anômalo",
    "englishElo": "Anomaly",
    "realm": "Inferno",
    "color": "inferno",
    "symbol": "⟲",
    "affinity": "cinza",
    "role": "Colapso Voluntário",
    "englishRole": "Voluntary Collapse",
    "combo": "Abra um estado de Colapso, escolha seu custo e feche-o antes que consuma Nilo.",
    "englishCombo": "Open a Collapse state, choose its cost, and close it before it consumes Nilo.",
    "mechanic": "Dois níveis de Colapso elevam o dano e cobram Vida por técnica. O jogador decide quando subir, manter ou encerrar o estado.",
    "englishMechanic": "Two Collapse levels raise damage and cost Health per skill. The player decides when to raise, maintain, or end the state.",
    "lore": "A alma se partiu em uma forma que não deixa rastro. O poder agora depende de manter o colapso sob controle.",
    "englishLore": "The soul fractured into a form that leaves no trace. Power now depends on keeping collapse under control.",
    "synergyEloIds": [
      "correntes-quebradas"
    ],
    "passive": {
      "name": "Limiar de Colapso",
      "englishName": "Collapse Threshold",
      "trigger": "manual",
      "effect": {},
      "description": "Nilo pode abrir Colapso I e depois Colapso II, um nível por vez. Cada nível dura por turnos limitados, aumenta o dano e cobra Vida por skill de dano. Ele pode encerrar o Colapso a qualquer momento.",
      "englishDescription": "Nilo can open Collapse I, then Collapse II, one level at a time. Each level lasts a limited number of turns, increases damage, and costs Health per damage skill. He may end Collapse at any time."
    },
    "skills": [
      {
        "name": "Marca Infernal",
        "englishName": "Infernal Mark",
        "damage": 12,
        "costs": {
          "cinza": 1
        },
        "target": "enemy",
        "damageType": "energy",
        "mark": "infernal",
        "markTurns": 3,
        "absorption": "cinza",
        "englishDescription": "Deals 12 spiritual damage, and marks the target for 3 turns."
      },
      {
        "name": "Devastação",
        "englishName": "Devastation",
        "damage": 13,
        "costs": {
          "cinza": 1,
          "random": 1
        },
        "target": "enemy",
        "damageType": "physical",
        "dots": [
          {
            "tag": "sangramento",
            "damage": 3,
            "turns": 2
          },
          {
            "tag": "queimadura",
            "damage": 3,
            "turns": 2
          }
        ],
        "absorption": "cinza",
        "englishDescription": "Deals 13 physical damage, and applies Bleed and Burn, each for 3 affliction damage over 2 turns."
      },
      {
        "name": "Abrir Colapso I",
        "englishName": "Open Collapse I",
        "target": "self",
        "costs": {
          "cinza": 1
        },
        "activateCollapse": 1,
        "absorption": "cinza",
        "englishDescription": "Opens Collapse I for 3 turns: damage skills deal +6 and cost Nilo 4 Health."
      },
      {
        "name": "Abrir Colapso II",
        "englishName": "Open Collapse II",
        "target": "self",
        "costs": {
          "cinza": 2
        },
        "activateCollapse": 2,
        "requiresCollapseI": true,
        "absorption": "cinza",
        "englishDescription": "After Collapse I, opens Collapse II for 2 turns: damage skills deal +10 and cost Nilo 7 Health."
      },
      {
        "name": "Encerrar Colapso",
        "englishName": "End Collapse",
        "target": "self",
        "costs": {},
        "closeCollapse": true,
        "absorption": "cinza",
        "englishDescription": "Ends the current Collapse state immediately."
      },
      {
        "name": "Mentira Letal",
        "englishName": "Lethal Lie",
        "damage": 14,
        "costs": {
          "cinza": 1,
          "essence": 1,
          "random": 1
        },
        "target": "enemy",
        "damageType": "physical",
        "purgeBuffs": "all",
        "damageIfPurged": 6,
        "absorption": "cinza",
        "englishDescription": "Deals 14 physical damage and removes all enemy buffs. If it removes a buff, it deals 6 more damage."
      },
      {
        "name": "Podridão Devoradora",
        "englishName": "Devouring Rot",
        "damage": 11,
        "costs": {
          "cinza": 1,
          "random": 1
        },
        "target": "enemy",
        "damageType": "affliction",
        "dot": {
          "tag": "decadencia",
          "damage": 3,
          "turns": 2
        },
        "requiresAnyCollapse": true,
        "bonusIfOwnMark": "infernal",
        "bonusDamage": 5,
        "absorption": "cinza",
        "englishDescription": "Deals 11 affliction damage and applies Decay for 3 affliction damage over 2 turns. It deals 5 more if the target bears Nilo's Infernal Mark and gains the active Collapse bonus."
      },
      {
        "name": "Execução Infernal",
        "englishName": "Infernal Execution",
        "damage": 21,
        "costs": {
          "cinza": 2,
          "essence": 1
        },
        "target": "enemy",
        "damageType": "physical",
        "executeIfHpAtMost": 15,
        "absorption": "cinza",
        "englishDescription": "Deals 21 damage, and executes the target if it has 15 Health or less after the hit."
      }
    ],
    "defense": {
      "name": "Silêncio de Cinza",
      "englishName": "Ashen Silence",
      "shield": 4,
      "silenceMarkedHealing": true,
      "englishDescription": "Grants 4 destructible Defense, and makes the user Invulnerable for 1 turn. Enemies with a Mark from Nilo cannot recover Health on their next turn."
    }
  },
  {
    "id": "nilo-graca-final",
    "name": "Nilo, o que Mantém de Pé",
    "englishName": "Nilo, the One Who Holds",
    "family": "nilo",
    "version": 4,
    "eloId": "correntes-quebradas",
    "elo": "Anômalo",
    "englishElo": "Anomaly",
    "realm": "Paraíso",
    "color": "paraiso",
    "symbol": "⟲",
    "affinity": "graca",
    "role": "Pilares Vivos",
    "englishRole": "Living Pillars",
    "combo": "Erga dois Pilares, atraia respostas inimigas e gaste Intervenções no momento decisivo.",
    "englishCombo": "Raise two Pillars, draw enemy responses, and spend Interventions at the decisive moment.",
    "mechanic": "Pilares acumulam Cargas de Intervenção ao sofrer dano. A Forma de Graça habilita respostas que anulam a próxima skill contra um Pilar.",
    "englishMechanic": "Pillars accumulate Intervention Charges when damaged. Grace Form enables answers that cancel the next skill aimed at a Pillar.",
    "lore": "Nilo deixa de absorver sozinho: ele escolhe quem sustenta e onde interrompe a violência.",
    "englishLore": "Nilo no longer absorbs alone: he chooses whom to sustain and where to interrupt violence.",
    "synergyEloIds": [
      "correntes-quebradas"
    ],
    "passive": {
      "name": "Pilares Vivos",
      "englishName": "Living Pillars",
      "trigger": "pillarDamaged",
      "repeatPerRound": true,
      "effect": {
        "gainInterventionCharge": 1
      },
      "description": "Nilo pode manter até 2 Pilares. Quando uma skill inimiga tira Vida de um Pilar, ele ganha 1 Carga de Intervenção (máx. 2). As Cargas são gastas para anular respostas.",
      "englishDescription": "Nilo may keep up to 2 Pillars. When an enemy skill removes Health from a Pillar, he gains 1 Intervention Charge (max 2). Charges are spent to cancel incoming attacks."
    },
    "skills": [
      {
        "name": "Erguer Pilar",
        "englishName": "Raise a Pillar",
        "target": "ally",
        "heal": 12,
        "costs": {
          "graca": 1
        },
        "setPillar": true,
        "absorption": "graca",
        "englishDescription": "Restores 12 Health to an ally, and makes them one of Nilo's Pillars. He can have at most 2."
      },
      {
        "name": "Julgamento",
        "englishName": "Judgment",
        "damage": 13,
        "costs": {
          "graca": 1,
          "essence": 1
        },
        "target": "enemy",
        "damageType": "energy",
        "pillarJudgment": {
          "bonusDamage": 6,
          "weaken": 1
        },
        "absorption": "graca",
        "englishDescription": "Deals 13 spiritual damage. If the target damaged a Pillar this combat, it deals 6 more and Weakens the target."
      },
      {
        "name": "Revelação Forte",
        "englishName": "Forceful Revelation",
        "damage": 10,
        "costs": {
          "graca": 1,
          "random": 1,
          "essence": 1
        },
        "target": "enemy",
        "damageType": "energy",
        "purgeBuffs": 2,
        "expose": 1,
        "absorption": "graca",
        "englishDescription": "Deals 10 spiritual damage, removes up to 2 enemy buffs, and Exposes the target."
      },
      {
        "name": "Forma de Graça",
        "englishName": "Grace Form",
        "target": "self",
        "costs": {
          "graca": 1
        },
        "activateGraceForm": 3,
        "absorption": "graca",
        "englishDescription": "Activates Grace Form for 3 turns."
      },
      {
        "name": "Campo de Controle",
        "englishName": "Control Field",
        "damage": 8,
        "costs": {
          "graca": 1,
          "essence": 1
        },
        "target": "all-enemies",
        "damageType": "energy",
        "weaken": 1,
        "requiresGraceForm": true,
        "absorption": "graca",
        "englishDescription": "Deals 8 spiritual damage to all enemies and Weakens them for 1 turn. Requires Grace Form."
      },
      {
        "name": "Intervenção",
        "englishName": "Intervention",
        "target": "ally",
        "costs": {
          "graca": 1,
          "random": 1
        },
        "requiresGraceForm": true,
        "requiresPillar": true,
        "requiresInterventionCharge": true,
        "counter": 11,
        "counterFilter": [
          "physical",
          "piercing",
          "energy",
          "affliction"
        ],
        "counterDamageType": "affliction",
        "spendInterventionCharge": 1,
        "absorption": "graca",
        "englishDescription": "While Grace Form is active, spend an Intervention Charge on a Pillar to counter the next enemy skill of any type for 11 affliction damage."
      },
      {
        "name": "Verdade Absoluta",
        "englishName": "Absolute Truth",
        "target": "ally",
        "heal": 12,
        "cleanse": true,
        "requiresPillar": true,
        "costs": {
          "graca": 2,
          "essence": 1
        },
        "absorption": "graca",
        "englishDescription": "Restores 12 Health to a Pillar, and removes its harmful effects."
      }
    ],
    "defense": {
      "name": "Limiar Sagrado",
      "englishName": "Sacred Threshold",
      "shield": 4,
      "cleanseOneAffliction": true,
      "englishDescription": "Grants 4 destructible Defense, removes 1 affliction from Nilo, and makes him Invulnerable for 1 turn."
    }
  },
  {
    "id": "nilo-ruptura-final",
    "name": "Nilo, o que se Parte",
    "englishName": "Nilo, the One Who Breaks",
    "family": "nilo",
    "version": 4,
    "eloId": "correntes-quebradas",
    "elo": "Anômalo",
    "englishElo": "Anomaly",
    "realm": "Limbo",
    "color": "limbo",
    "symbol": "⟲",
    "affinity": "ruptura",
    "role": "Contagem de Fraturas",
    "englishRole": "Fracture Count",
    "combo": "Acumule status distintos no alvo e escolha quantas Fraturas gastar em cada ruptura.",
    "englishCombo": "Stack different statuses on a target and choose how many Fractures to spend on each break.",
    "mechanic": "Cada status diferente no alvo conta como 1 Fratura (máx. 3). Skills indicadas podem gastá-las por efeitos extras, nunca como bônus automático.",
    "englishMechanic": "Each different status on the target counts as 1 Fracture (max 3). Listed skills may spend them for extra effects, never as an automatic bonus.",
    "lore": "A forma final não apaga os estados: transforma cada um em uma decisão sobre o que romper primeiro.",
    "englishLore": "The final form does not erase statuses; it turns each into a decision about what to break first.",
    "synergyEloIds": [
      "correntes-quebradas"
    ],
    "passive": {
      "name": "Contagem de Fraturas",
      "englishName": "Fracture Count",
      "trigger": "manual",
      "effect": {},
      "description": "Cada status diferente no alvo conta como 1 Fratura (máx. 3). Nilo pode gastar Fraturas em skills específicas; o bônus não é automático.",
      "englishDescription": "Each different status on a target counts as 1 Fracture (max 3). Nilo may spend Fractures on specific skills; the bonus is not automatic."
    },
    "skills": [
      {
        "name": "Sombra Rachada",
        "englishName": "Cracked Shadow",
        "damage": 13,
        "costs": {
          "ruptura": 1
        },
        "target": "enemy",
        "damageType": "physical",
        "stealth": 1,
        "absorption": "ruptura",
        "englishDescription": "Deals 13 damage, and grants Stealth for 1 turn."
      },
      {
        "name": "Corte do Interstício",
        "englishName": "Interstice Cut",
        "damage": 12,
        "costs": {
          "ruptura": 1,
          "random": 1
        },
        "target": "enemy",
        "damageType": "piercing",
        "dot": {
          "tag": "sangramento",
          "damage": 3,
          "turns": 2
        },
        "stealthBonus": 5,
        "absorption": "ruptura",
        "englishDescription": "Deals 12 piercing damage and applies Bleed for 3 affliction damage over 2 turns. If Nilo is Stealthed, it deals 5 more damage."
      },
      {
        "name": "Marca Residual",
        "englishName": "Residual Mark",
        "damage": 0,
        "costs": {
          "ruptura": 1,
          "essence": 1
        },
        "target": "enemy",
        "expose": 1,
        "dots": [
          {
            "tag": "sangramento",
            "damage": 3,
            "turns": 2
          },
          {
            "tag": "decadencia",
            "damage": 3,
            "turns": 2
          }
        ],
        "mark": "residual",
        "markTurns": 3,
        "absorption": "ruptura",
        "englishDescription": "Marks the target for 3 turns, Exposes it, and applies Bleed and Decay, each for 3 affliction damage over 2 turns."
      },
      {
        "name": "Armadilha Profunda",
        "englishName": "Deep Trap",
        "damage": 0,
        "costs": {
          "ruptura": 1
        },
        "target": "enemy",
        "mark": "armadilha-profunda",
        "markTurns": 2,
        "reactive": {
          "trigger": "skill",
          "damage": 11,
          "damageType": "affliction",
          "harmful": true,
          "stealthSource": 1,
          "turns": 1
        },
        "absorption": "ruptura",
        "englishDescription": "Marks the target for 2 turns, and triggers when it uses a skill: it takes 11 affliction damage and Nilo gains Stealth."
      },
      {
        "name": "Resposta Partida",
        "englishName": "Fractured Response",
        "target": "self",
        "costs": {
          "ruptura": 2,
          "essence": 1
        },
        "counter": 13,
        "counterFilter": [
          "physical",
          "piercing",
          "energy",
          "affliction"
        ],
        "counterDamageType": "physical",
        "counterEffect": {
          "dot": {
            "tag": "sangramento",
            "damage": 3,
            "turns": 2
          }
        },
        "absorption": "ruptura",
        "englishDescription": "Counters the next enemy skill of any type for 13 physical damage and applies Bleed for 3 affliction damage over 2 turns."
      },
      {
        "name": "Despedaçamento",
        "englishName": "Shattering",
        "damage": 9,
        "costs": {
          "ruptura": 2,
          "essence": 1
        },
        "target": "all-enemies",
        "damageType": "physical",
        "spendFracturesMax": 1,
        "fractureBonusDamage": 3,
        "absorption": "ruptura",
        "englishDescription": "Deals 9 physical damage to all enemies, and may spend 1 Fracture per target for +3 damage."
      }
    ],
    "defense": {
      "name": "Último Impulso",
      "englishName": "Final Impulse",
      "shield": 4,
      "nextSkillBonus": 5,
      "nextSkillExpose": 1,
      "englishDescription": "Grants 4 destructible Defense, and makes Nilo Invulnerable for 1 turn. His next skill deals +5 damage and Exposes its target."
    }
  },
  {
    "id": "nilo-o-epilogo",
    "name": "Nilo Purificado",
    "englishName": "Purified Nilo",
    "family": "nilo",
    "version": 3,
    "eloId": "correntes-quebradas",
    "elo": "Anômalo",
    "englishElo": "Anomaly",
    "realm": "Limbo",
    "color": "limbo",
    "symbol": "⟲",
    "affinity": "ruptura",
    "role": "Livre da Corrupção",
    "englishRole": "Free of Corruption",
    "combo": "Cure aflições e prepare respostas com custos Coringa; sobreviva com menos pressão.",
    "englishCombo": "Cleanse afflictions and prepare responses with Wildcard costs; survive with less pressure.",
    "mechanic": "O Expurgo remove as essências da alma. Nilo perde força bruta, mas todas as suas skills usam custo Coringa e privilegiam escolha, cura e resposta.",
    "englishMechanic": "The Purge removes the essences from the soul. Nilo loses raw power, but all skills use Wildcard costs and favor choice, healing, and response.",
    "lore": "Nilo aceita o Expurgo no limiar da história. Pela primeira vez, a alma não responde por vozes alheias.",
    "englishLore": "Nilo accepts the Purge at the story's threshold. For the first time, the soul does not answer in other voices.",
    "synergyEloIds": [
      "correntes-quebradas"
    ],
    "passive": {
      "name": "Alma sem Essências",
      "englishName": "Essence-Free Soul",
      "trigger": "manual",
      "effect": {},
      "description": "A alma está livre da corrupção. O kit é mais fraco e estratégico: todas as skills têm custo Coringa.",
      "englishDescription": "The soul is free of corruption. This weaker, strategic kit has Wildcard costs on every skill."
    },
    "skills": [
      {
        "name": "Âncora Vazia",
        "englishName": "Empty Anchor",
        "target": "self",
        "costs": {
          "random": 2
        },
        "shield": 4,
        "reduce": 4,
        "englishDescription": "Grants 4 Defense, and reduces incoming damage by 4 for 1 turn."
      },
      {
        "name": "Restituir Vestígio",
        "englishName": "Restore a Trace",
        "target": "self",
        "costs": {
          "random": 1
        },
        "heal": 8,
        "cleanseOneAffliction": true,
        "englishDescription": "Restores 8 Health, and removes 1 affliction from Nilo."
      },
      {
        "name": "Resposta Serena",
        "englishName": "Serene Response",
        "target": "self",
        "costs": {
          "random": 2
        },
        "counter": 9,
        "counterFilter": [
          "physical",
          "piercing",
          "energy",
          "affliction"
        ],
        "counterDamageType": "affliction",
        "englishDescription": "Counters the next incoming skill of any type for 9 affliction damage."
      }
    ],
    "defense": {
      "name": "Pausa sem Corrupção",
      "englishName": "Uncorrupted Pause",
      "shield": 3
    }
  },
  {
    "id": "o-eco-de-nilo",
    "name": "Sael",
    "englishName": "Sael",
    "aliases": ["O Eco sem Nome"],
    "identityTitle": "O Eco das Quatro Essências",
    "englishIdentityTitle": "The Echo of Four Essences",
    "family": "nilo",
    "version": 4,
    "eloId": "correntes-quebradas",
    "elo": "Anômalo",
    "englishElo": "Anomaly",
    "realm": "Limbo",
    "color": "limbo",
    "symbol": "⟲",
    "affinity": "ruptura",
    "role": "Condutor de Ressonâncias",
    "englishRole": "Resonance Conduit",
    "combo": "Misture as quatro Essências, vincule um alvo e escolha quando deixar a perda repercutir.",
    "englishCombo": "Mix all four Essences, link a target, and choose when to let loss reverberate.",
    "mechanic": "Cada tipo de Essência gasto no mesmo turno forma Harmonia. O Eco alterna pressão por elemento, Vínculo de Ressonância, proteção e ataques que convertem estados em repercussão.",
    "englishMechanic": "Each Essence type spent in the same turn builds Harmony. The Echo alternates elemental pressure, Resonance Link, protection, and attacks that convert statuses into reverberation.",
    "lore": "Quando a absorção consome o nome Nilo, a consciência que resta escolhe Sael e passa a conduzir Cinza, Graça, Ruptura e Éter em uma única forma difícil de controlar.",
    "englishLore": "When absorption consumes Nilo's name, the remaining consciousness chooses Sael and conducts Ash, Grace, Rupture, and Aether through one difficult-to-control form.",
    "synergyEloIds": [
      "correntes-quebradas"
    ],
    "passive": {
      "name": "Harmonia das Quatro Essências",
      "englishName": "Four-Essence Harmony",
      "trigger": "essenceSpent",
      "repeatPerRound": true,
      "effect": {
        "trackFourEssences": true
      },
      "description": "Cada tipo diferente de Essência gasto no turno forma Harmonia. Ao gastar os quatro tipos no mesmo turno, o Eco recebe 1 Carga (máx. 3); preserve-as para a skill que as converte em dano.",
      "englishDescription": "Each different Essence type spent in a turn builds Harmony. Spending all four types in the same turn grants the Echo 1 Charge (max 3); save it for the skill that converts it into damage."
    },
    "skills": [
      {
        "name": "Vestígio de Cinza",
        "englishName": "Ash Trace",
        "damage": 11,
        "costs": {
          "cinza": 1,
          "random": 1
        },
        "target": "enemy",
        "damageType": "physical",
        "dot": {
          "tag": "queimadura",
          "damage": 3,
          "turns": 2
        },
        "englishDescription": "Deals 11 physical damage, and applies Burn for 3 affliction damage over 2 turns."
      },
      {
        "name": "Amparo Remanescente",
        "englishName": "Remaining Grace",
        "target": "ally",
        "costs": {
          "graca": 1,
          "random": 1
        },
        "heal": 8,
        "shield": 4,
        "englishDescription": "Restores 8 Health and grants 4 Defense to an ally."
      },
      {
        "name": "Fenda Suspensa",
        "englishName": "Suspended Rift",
        "damage": 10,
        "costs": {
          "ruptura": 1,
          "random": 1
        },
        "target": "enemy",
        "damageType": "energy",
        "expose": 1,
        "dot": {
          "tag": "decadencia",
          "damage": 3,
          "turns": 2
        },
        "englishDescription": "Deals 10 spiritual damage, Exposes the target, and applies Decay for 3 affliction damage over 2 turns."
      },
      {
        "name": "Fragmento de Éter",
        "englishName": "Aether Fragment",
        "damage": 10,
        "costs": {
          "essence": 1,
          "random": 1
        },
        "target": "enemy",
        "damageType": "energy",
        "steal": 1,
        "englishDescription": "Deals 10 spiritual damage, and steals 1 enemy Essence."
      },
      {
        "name": "Vínculo de Ressonância",
        "englishName": "Resonance Link",
        "damage": 8,
        "costs": {
          "cinza": 1,
          "ruptura": 1,
          "random": 1
        },
        "target": "enemy",
        "damageType": "piercing",
        "echoLink": {
          "turns": 1
        },
        "mark": "ressonancia",
        "markTurns": 2,
        "englishDescription": "Deals 8 piercing damage, marks the target for 2 turns, and echoes damage Nilo takes to that target for 1 turn."
      },
      {
        "name": "Recompor o Intervalo",
        "englishName": "Recompose the Interval",
        "target": "team",
        "costs": {
          "graca": 1,
          "essence": 1,
          "random": 1
        },
        "shield": 3,
        "cleanse": true,
        "englishDescription": "Grants 3 Defense to the team, and removes their debuffs."
      },
      {
        "name": "Convergência sem Nome",
        "englishName": "Nameless Convergence",
        "damage": 22,
        "costs": {
          "cinza": 1,
          "graca": 1,
          "ruptura": 1,
          "essence": 1
        },
        "target": "enemy",
        "damageType": "piercing",
        "combo": {
          "condition": "marked",
          "bonusDamage": 5
        },
        "englishDescription": "Deals 22 piercing damage, plus 5 against a target marked by the Echo."
      },
      {
        "name": "Desatar a Ressonância",
        "englishName": "Unbind the Resonance",
        "damage": 10,
        "costs": {
          "random": 2
        },
        "target": "enemy",
        "damageType": "affliction",
        "requiresEchoLink": true,
        "perChargeDamage": 3,
        "spendCharge": true,
        "bonusIfAnyStatus": 3,
        "clearEchoLink": true,
        "englishDescription": "Requires an active Resonance Link. Costs 2 Wildcards, deals 10 affliction damage, +3 if the target has any status, and +3 per Charge spent; then clears the Link."
      },
      {
        "name": "Avaliar o Nome",
        "englishName": "Weigh the Name",
        "damage": 10,
        "costs": {
          "random": 2
        },
        "target": "enemy",
        "damageType": "energy",
        "perChargeDamage": 3,
        "spendCharge": true,
        "englishDescription": "Deals 10 spiritual damage, plus 3 per Charge spent."
      }
    ],
    "defense": {
      "name": "Fecho Incompleto",
      "englishName": "Unfinished Close",
      "shield": 4
    }
  },
  {
    "id": "naomi",
    "name": "Naomi",
    "englishName": "Naomi",
    "family": "naomi",
    "version": 1,
    "eloId": "esperanca",
    "elo": "Esperança",
    "englishElo": "Hope",
    "realm": "Paraíso",
    "color": "hope",
    "symbol": "☼",
    "affinity": "graca",
    "role": "Guardiã da Persistência",
    "englishRole": "Guardian of Perseverance",
    "combo": "Permanecer para amparar",
    "englishCombo": "Stay to Support",
    "mechanic": "Naomi mantém o trio de pé e converte apoio em proteção compartilhada.",
    "englishMechanic": "Naomi keeps the team standing and turns support into shared protection.",
    "lore": "Depois de perder a família, Naomi continuou cuidando de desconhecidos. Morreu de exaustão, ainda tentando manter alguém de pé; a esperança dela não aceitou terminar ali.",
    "englishLore": "After losing her family, Naomi kept caring for strangers. She died exhausted, still trying to keep someone standing; her hope refused to end there.",
    "synergyEloIds": [
      "esperanca",
      "uniao"
    ],
    "passive": {
      "name": "Ninguém Fica para Trás",
      "englishName": "No One Left Behind",
      "trigger": "support",
      "requiresOtherAlly": true,
      "effect": {
        "shieldTeam": 2
      },
      "description": "Uma vez por rodada, apoiar outro aliado concede 2 de Defesa a cada membro vivo do trio.",
      "englishDescription": "Once per round, supporting another ally grants 2 Defense to every living team member."
    },
    "skills": [
      {
        "name": "Brasa que Permanece",
        "englishName": "Ember That Remains",
        "damage": 11,
        "cost": 1,
        "damageType": "physical",
        "mark": true,
        "markTurns": 2,
        "englishDescription": "Deals 11 physical damage to one enemy and Marks it for 2 turns."
      },
      {
        "name": "Mão Estendida",
        "englishName": "Outstretched Hand",
        "target": "ally",
        "heal": 13,
        "regen": {
          "heal": 3,
          "turns": 2
        },
        "cost": 2,
        "englishDescription": "Restores 13 Health to one ally and regenerates 3 Health for 2 turns."
      },
      {
        "name": "Roda de Esperança",
        "englishName": "Circle of Hope",
        "target": "team",
        "shield": 7,
        "cleanse": true,
        "cost": 2,
        "englishDescription": "Grants each ally 7 Defense and removes harmful conditions from the team."
      }
    ],
    "defense": {
      "name": "Voto de Permanência",
      "englishName": "Vow to Stay",
      "shield": 6
    }
  },
  {
    "id": "naomi-a-que-permanece",
    "name": "Naomi, a Que Permanece",
    "englishName": "Naomi, the One Who Remains",
    "family": "naomi",
    "version": 2,
    "eloId": "esperanca",
    "elo": "Esperança",
    "englishElo": "Hope",
    "realm": "Paraíso",
    "color": "hope",
    "symbol": "☼",
    "affinity": "graca",
    "role": "Sustentadora Inabalável",
    "englishRole": "Unyielding Sustainer",
    "combo": "Curar sem se retirar",
    "englishCombo": "Heal Without Stepping Away",
    "mechanic": "Curas efetivas alimentam a Graça; Naomi continua na linha enquanto restaura os outros.",
    "englishMechanic": "Effective healing fuels Grace; Naomi stays on the line while restoring others.",
    "lore": "Naomi escolheu ficar mesmo quando cada perda parecia pedir que ela desistisse. Esta forma guarda o instante em que o cuidado deixou de ser obrigação e se tornou escolha.",
    "englishLore": "Naomi chose to stay even when every loss seemed to ask her to give up. This form holds the moment care stopped being an obligation and became a choice.",
    "synergyEloIds": [
      "esperanca",
      "uniao"
    ],
    "passive": {
      "name": "O Cuidado Retorna",
      "englishName": "Care Returns",
      "trigger": "support",
      "requiresOtherAlly": true,
      "minimumHeal": 10,
      "effect": {
        "generateEssence": {
          "resource": "graca",
          "amount": 1
        }
      },
      "description": "Uma vez por rodada, curar pelo menos 10 de Vida de outro aliado gera 1 Graça.",
      "englishDescription": "Once per round, healing another ally for at least 10 Health generates 1 Grace."
    },
    "skills": [
      {
        "name": "Passo que Levanta",
        "englishName": "Step That Lifts",
        "damage": 10,
        "cost": 1,
        "damageType": "piercing",
        "heal": 5,
        "englishDescription": "Deals 10 piercing damage to one enemy and restores 5 Health to Naomi."
      },
      {
        "name": "Vigília Compartilhada",
        "englishName": "Shared Vigil",
        "target": "ally",
        "shield": 10,
        "heal": 8,
        "cost": 2,
        "englishDescription": "Grants one ally 10 Defense and restores 8 Health."
      },
      {
        "name": "Promessa Renovada",
        "englishName": "Renewed Promise",
        "target": "team",
        "regen": {
          "heal": 4,
          "turns": 2
        },
        "cleanse": true,
        "cost": 2,
        "englishDescription": "Removes harmful conditions from the team and regenerates 4 Health for each ally over 2 turns."
      }
    ],
    "defense": {
      "name": "Ainda Aqui",
      "englishName": "Still Here",
      "shield": 6
    }
  },
  {
    "id": "naomi-a-raiz",
    "name": "Naomi, a Raiz",
    "englishName": "Naomi, the Root",
    "family": "naomi",
    "version": 3,
    "eloId": "esperanca",
    "elo": "Esperança",
    "englishElo": "Hope",
    "realm": "Paraíso",
    "color": "hope",
    "symbol": "☼",
    "affinity": "graca",
    "role": "Raiz Protetora",
    "englishRole": "Protective Root",
    "combo": "Apoio que atravessa a queda",
    "englishCombo": "Support Through the Fall",
    "mechanic": "A guarda de Naomi se espalha quando ela recebe dano e prepara a recuperação do trio.",
    "englishMechanic": "Naomi's guard spreads when she takes damage and prepares the team's recovery.",
    "lore": "Naomi, a Raiz, deixa de contar quantas vezes precisou recomeçar. Ela se fixa ao chão do Limbo e oferece abrigo a quem ainda não encontrou onde repousar.",
    "englishLore": "Naomi the Root stops counting how many times she has had to begin again. She anchors herself to Limbo and shelters those who have not yet found a place to rest.",
    "synergyEloIds": [
      "esperanca",
      "uniao"
    ],
    "passive": {
      "name": "Raiz sob Pressão",
      "englishName": "Root Under Pressure",
      "trigger": "damaged",
      "requiresLifeLoss": true,
      "effect": {
        "shieldTeam": 3
      },
      "description": "Uma vez por rodada, depois de perder Vida para uma habilidade, Naomi concede 3 de Defesa ao trio.",
      "englishDescription": "Once per round, after losing Health to an ability, Naomi grants 3 Defense to the team."
    },
    "skills": [
      {
        "name": "Ramo Ascendente",
        "englishName": "Rising Bough",
        "damage": 12,
        "cost": 1,
        "damageType": "physical",
        "weaken": 1,
        "englishDescription": "Deals 12 physical damage to one enemy and Weakens it for 1 turn."
      },
      {
        "name": "Raízes de Amparo",
        "englishName": "Sheltering Roots",
        "target": "team",
        "shield": 8,
        "heal": 5,
        "cost": 2,
        "englishDescription": "Grants each ally 8 Defense and restores 5 Health."
      },
      {
        "name": "Florescer apesar de Tudo",
        "englishName": "Bloom Despite Everything",
        "target": "ally",
        "heal": 16,
        "cleanse": true,
        "regen": {
          "heal": 3,
          "turns": 2
        },
        "cost": 2,
        "englishDescription": "Restores 16 Health to one ally, removes harmful conditions, and regenerates 3 Health for 2 turns."
      }
    ],
    "defense": {
      "name": "Tronco Imóvel",
      "englishName": "Unmoving Trunk",
      "shield": 7
    }
  },
  {
    "id": "kael",
    "name": "Kael",
    "englishName": "Kael",
    "family": "kael",
    "version": 1,
    "eloId": "correntes-quebradas",
    "elo": "Ruptura",
    "englishElo": "Rupture",
    "realm": "Limbo",
    "color": "limbo",
    "symbol": "⟲",
    "affinity": "ruptura",
    "role": "Executor Contido",
    "englishRole": "Restrained Enforcer",
    "combo": "Marca, alcance e consequência",
    "englishCombo": "Mark, Reach, and Consequence",
    "mechanic": "Kael abre uma brecha, prepara a execução e aceita a Ruptura como preço.",
    "englishMechanic": "Kael opens a breach, prepares an execution, and accepts Rupture as its price.",
    "lore": "Kael serviu como soldado e executor até matar a pessoa errada. Entregou-se à morte logo depois; a culpa manteve seu nome inteiro quando a travessia tentou dissolvê-lo.",
    "englishLore": "Kael served as a soldier and enforcer until he killed the wrong person. He surrendered to death soon after; guilt kept his name intact when the crossing tried to dissolve him.",
    "synergyEloIds": [
      "correntes-quebradas"
    ],
    "passive": {
      "name": "Culpa que Alimenta",
      "englishName": "Guilt That Fuels",
      "trigger": "hit",
      "requiresOwnMark": true,
      "effect": {
        "generateEssence": {
          "resource": "ruptura",
          "amount": 1
        },
        "gainCharge": 1
      },
      "description": "Uma vez por rodada, ferir um alvo com a Marca de Kael gera 1 Ruptura e 1 carga.",
      "englishDescription": "Once per round, hitting a target with Kael's Mark generates 1 Rupture and 1 charge."
    },
    "skills": [
      {
        "name": "Dever Mal Cumprido",
        "englishName": "Failed Duty",
        "damage": 13,
        "cost": 1,
        "damageType": "physical",
        "mark": true,
        "markTurns": 2,
        "englishDescription": "Deals 13 physical damage to one enemy and Marks it for 2 turns."
      },
      {
        "name": "Passo do Executor",
        "englishName": "Enforcer's Step",
        "damage": 14,
        "cost": 2,
        "damageType": "piercing",
        "combo": {
          "condition": "marked",
          "bonusDamage": 8,
          "consume": true
        },
        "englishDescription": "Deals 14 piercing damage to one enemy. Against a Marked target, it deals 8 bonus damage and consumes the Mark."
      },
      {
        "name": "Preço da Ordem",
        "englishName": "Price of the Order",
        "damage": 21,
        "cost": 2,
        "damageType": "physical",
        "selfDamage": 5,
        "englishDescription": "Deals 21 physical damage to one enemy; Kael loses 5 Health."
      }
    ],
    "defense": {
      "name": "Ajoelhar não é Ceder",
      "englishName": "Kneeling Is Not Yielding",
      "shield": 5
    }
  },
  {
    "id": "kael-o-quebrado",
    "name": "Kael, o Quebrado",
    "englishName": "Kael, the Broken",
    "family": "kael",
    "version": 2,
    "eloId": "correntes-quebradas",
    "elo": "Ruptura",
    "englishElo": "Rupture",
    "realm": "Limbo",
    "color": "limbo",
    "symbol": "⟲",
    "affinity": "ruptura",
    "role": "Retaliador Fraturado",
    "englishRole": "Fractured Retaliator",
    "combo": "Resistir ao próprio golpe",
    "englishCombo": "Withstand His Own Blow",
    "mechanic": "Kael prepara respostas e transforma uma interrupção inimiga em carga.",
    "englishMechanic": "Kael prepares counters and turns an enemy interruption into charge.",
    "lore": "O Quebrado recorda o momento em que percebeu que não havia ordem capaz de desfazer o que fez. Cada resposta vem tarde demais, mas ainda pode impedir a próxima violência.",
    "englishLore": "The Broken one remembers the moment he realized no order could undo what he had done. Every answer comes too late, but it may still prevent the next act of violence.",
    "synergyEloIds": [
      "correntes-quebradas"
    ],
    "passive": {
      "name": "Resposta à Ruptura",
      "englishName": "Answer to Rupture",
      "trigger": "counter",
      "effect": {
        "generateEssence": {
          "resource": "ruptura",
          "amount": 1
        },
        "gainCharge": 1
      },
      "description": "Uma vez por rodada, ativar um Contra-ataque gera 1 Ruptura e 1 carga.",
      "englishDescription": "Once per round, activating a Counter generates 1 Rupture and 1 charge."
    },
    "skills": [
      {
        "name": "Guarda Estilhaçada",
        "englishName": "Shattered Guard",
        "target": "self",
        "counter": 12,
        "cost": 1,
        "englishDescription": "Counters the next incoming enemy ability and retaliates for 12 damage."
      },
      {
        "name": "Interrupção Tardia",
        "englishName": "Late Interruption",
        "damage": 12,
        "cost": 2,
        "damageType": "piercing",
        "stun": 1,
        "cooldown": 1,
        "englishDescription": "Deals 12 piercing damage to one enemy and Stuns it for 1 turn."
      },
      {
        "name": "Punho sem Ordem",
        "englishName": "Fist Without Orders",
        "damage": 20,
        "cost": 2,
        "damageType": "physical",
        "perChargeDamage": 3,
        "spendCharge": true,
        "englishDescription": "Deals 20 physical damage to one enemy, plus 3 for each charge spent."
      }
    ],
    "defense": {
      "name": "Fragmento de Escudo",
      "englishName": "Shield Fragment",
      "shield": 6
    }
  },
  {
    "id": "kael-o-filhote-de-ferro",
    "name": "Kael, o Filhote de Ferro",
    "englishName": "Kael, the Iron Cub",
    "family": "kael",
    "version": 3,
    "eloId": "correntes-quebradas",
    "elo": "Ruptura",
    "englishElo": "Rupture",
    "realm": "Limbo",
    "color": "limbo",
    "symbol": "⟲",
    "affinity": "ruptura",
    "role": "Baluarte de Ruptura",
    "englishRole": "Rupture Bulwark",
    "combo": "Ficar de pé quando ninguém pede",
    "englishCombo": "Stand When No One Asks",
    "mechanic": "Com pouca Vida, Kael sustenta a linha e compra tempo para o trio.",
    "englishMechanic": "At low Health, Kael holds the line and buys time for the team.",
    "lore": "O Filhote de Ferro é a forma que Kael construiu para a culpa: pequeno diante do que fez, mas decidido a não fugir da próxima consequência.",
    "englishLore": "The Iron Cub is the shape Kael built around his guilt: small beside what he did, yet determined not to flee the next consequence.",
    "synergyEloIds": [
      "correntes-quebradas"
    ],
    "passive": {
      "name": "Último de Pé",
      "englishName": "Last One Standing",
      "trigger": "turnStart",
      "hpAtMost": 50,
      "effect": {
        "shield": 5
      },
      "description": "Com 50 de Vida ou menos, Kael recebe 5 de Defesa no início do próprio turno, uma vez por rodada.",
      "englishDescription": "At 50 Health or below, Kael gains 5 Defense at the start of his turn, once per round."
    },
    "skills": [
      {
        "name": "Pequeno Baluarte",
        "englishName": "Little Bulwark",
        "target": "ally",
        "shield": 12,
        "reduce": 4,
        "cost": 1,
        "englishDescription": "Grants one ally 12 Defense and reduces damage they take by 4 for 1 turn."
      },
      {
        "name": "Garra de Ferro",
        "englishName": "Iron Claw",
        "damage": 14,
        "cost": 2,
        "damageType": "piercing",
        "expose": 1,
        "englishDescription": "Deals 14 piercing damage to one enemy and Exposes it."
      },
      {
        "name": "Promessa de Aço",
        "englishName": "Steel Promise",
        "target": "team",
        "shield": 7,
        "regen": {
          "heal": 3,
          "turns": 2
        },
        "cost": 2,
        "englishDescription": "Grants each ally 7 Defense and regenerates 3 Health for 2 turns."
      }
    ],
    "defense": {
      "name": "Abrigo de Ferro",
      "englishName": "Iron Shelter",
      "shield": 7
    }
  },
  {
    "id": "vaas",
    "name": "Vaas",
    "englishName": "Vaas",
    "family": "vaas",
    "version": 1,
    "eloId": "mentira",
    "elo": "Mentira",
    "englishElo": "Deceit",
    "realm": "Inferno",
    "color": "mirror",
    "symbol": "◇",
    "affinity": "cinza",
    "role": "Manipulador de Brechas",
    "englishRole": "Opening Manipulator",
    "combo": "Preparar a máscara",
    "englishCombo": "Prepare the Mask",
    "mechanic": "Vaas marca intenções, enfraquece respostas e transforma custo em roubo.",
    "englishMechanic": "Vaas Marks intentions, Weakens responses, and turns cost into theft.",
    "lore": "Vaas sobreviveu construindo identidades falsas, até uma mentira desabar e arrastar inocentes com ela. O nome que conservou é a última máscara que não consegue retirar.",
    "englishLore": "Vaas survived by building false identities until one lie collapsed and dragged innocents down with it. The name he kept is the last mask he cannot remove.",
    "synergyEloIds": [
      "mentira",
      "silencio"
    ],
    "passive": {
      "name": "Máscara Predatória",
      "englishName": "Predatory Mask",
      "trigger": "attack",
      "requiresOwnMark": true,
      "effect": {
        "weakenTarget": 1
      },
      "description": "Uma vez por rodada, uma habilidade ofensiva contra um alvo com a Marca de Vaas também o Enfraquece por 1 turno.",
      "englishDescription": "Once per round, an offensive ability against a target with Vaas's Mark also Weakens it for 1 turn."
    },
    "skills": [
      {
        "name": "Verdade Plantada",
        "englishName": "Planted Truth",
        "damage": 9,
        "cost": 1,
        "damageType": "affliction",
        "mark": true,
        "markTurns": 2,
        "englishDescription": "Deals 9 affliction damage to one enemy and Marks it for 2 turns."
      },
      {
        "name": "Véu de Veneno",
        "englishName": "Poison Veil",
        "damage": 11,
        "cost": 2,
        "damageType": "energy",
        "dot": {
          "tag": "veneno",
          "damage": 4,
          "turns": 2
        },
        "steal": 1,
        "englishDescription": "Deals 11 spiritual damage, applies Poison for 4 damage over 2 turns, and steals 1 Essence."
      },
      {
        "name": "O Rosto que Falta",
        "englishName": "The Missing Face",
        "target": "self",
        "shield": 8,
        "cleanse": true,
        "cost": 2,
        "englishDescription": "Grants Vaas 8 Defense and removes harmful conditions from him."
      }
    ],
    "defense": {
      "name": "Última Máscara",
      "englishName": "Last Mask",
      "shield": 5
    }
  },
  {
    "id": "vaas-o-sem-rosto",
    "name": "Vaas, o Sem Rosto",
    "englishName": "Vaas, the Faceless",
    "family": "vaas",
    "version": 2,
    "eloId": "mentira",
    "elo": "Mentira",
    "englishElo": "Deceit",
    "realm": "Inferno",
    "color": "mirror",
    "symbol": "◇",
    "affinity": "cinza",
    "role": "Executor das Mentiras",
    "englishRole": "Deceit Executor",
    "combo": "A máscara não precisa de rosto",
    "englishCombo": "The Mask Needs No Face",
    "mechanic": "Vaas prepara uma abertura para selar apoio, roubar Essência e atravessar Contra-ataques.",
    "englishMechanic": "Vaas prepares an opening to seal support, steal Essence, and bypass Counters.",
    "lore": "Sem Rosto é a máscara que resta quando Vaas para de fingir que existe uma identidade verdadeira por trás das outras. Ele ainda mente; agora sabe que está mentindo.",
    "englishLore": "Faceless is the mask that remains when Vaas stops pretending there is a true identity behind the others. He still lies; now he knows that he is lying.",
    "synergyEloIds": [
      "mentira",
      "silencio"
    ],
    "passive": {
      "name": "Confisco de Identidade",
      "englishName": "Identity Confiscation",
      "trigger": "hit",
      "requiresOwnMark": true,
      "effect": {
        "stealEssence": {
          "amount": 1
        }
      },
      "description": "Uma vez por rodada, ferir um alvo com a Marca própria rouba 1 Essência da reserva inimiga.",
      "englishDescription": "Once per round, hitting a target with Vaas's Mark steals 1 Essence from the enemy reserve."
    },
    "skills": [
      {
        "name": "Sussurro sem Dono",
        "englishName": "Ownerless Whisper",
        "damage": 12,
        "cost": 1,
        "damageType": "energy",
        "weaken": 1,
        "englishDescription": "Deals 12 spiritual damage to one enemy and Weakens it for 1 turn."
      },
      {
        "name": "Silêncio Comprado",
        "englishName": "Purchased Silence",
        "damage": 16,
        "cost": 2,
        "damageType": "piercing",
        "sealSupport": 1,
        "steal": 1,
        "cooldown": 1,
        "englishDescription": "Deals 16 piercing damage, seals the target's support for 1 turn, and steals 1 Essence."
      },
      {
        "name": "Ruptura da Máscara",
        "englishName": "Mask Fracture",
        "damage": 22,
        "cost": 3,
        "damageType": "piercing",
        "ignoreCounters": true,
        "combo": {
          "condition": "marked",
          "bonusDamage": 8
        },
        "englishDescription": "Deals 22 piercing damage, ignores Counters, and deals 8 bonus damage to a Marked target."
      }
    ],
    "defense": {
      "name": "Ausência Calculada",
      "englishName": "Calculated Absence",
      "shield": 5
    }
  },
  {
    "id": "diana",
    "name": "Diana",
    "englishName": "Diana",
    "family": "diana",
    "version": 1,
    "eloId": "cura",
    "elo": "Cura",
    "englishElo": "Healing",
    "realm": "Paraíso",
    "color": "healing",
    "symbol": "✚",
    "affinity": "graca",
    "role": "Médica de Combate",
    "englishRole": "Combat Medic",
    "combo": "Cuidar sem prometer milagre",
    "englishCombo": "Care Without Promising a Miracle",
    "mechanic": "Diana combina cura imediata, limpeza e recuperação gradual para manter o trio ativo.",
    "englishMechanic": "Diana combines immediate healing, cleansing, and gradual recovery to keep the team active.",
    "lore": "Diana foi médica e protetora. Não conseguiu salvar alguém que amava e passou o resto da vida tentando impedir que outras pessoas sofressem a mesma perda.",
    "englishLore": "Diana was a doctor and protector. She could not save someone she loved and spent the rest of her life trying to keep others from suffering the same loss.",
    "synergyEloIds": [
      "cura",
      "carne"
    ],
    "passive": {
      "name": "A Dor é Vista",
      "englishName": "Pain Is Seen",
      "trigger": "support",
      "minimumHeal": 1,
      "effect": {
        "healWeakestAlly": 3
      },
      "description": "Uma vez por rodada, depois de uma cura efetiva, Diana restaura 3 de Vida ao aliado vivo proporcionalmente mais ferido.",
      "englishDescription": "Once per round, after effective healing, Diana restores 3 Health to the living ally with the lowest Health percentage."
    },
    "skills": [
      {
        "name": "Pulso Restaurador",
        "englishName": "Restorative Pulse",
        "target": "ally",
        "heal": 12,
        "cost": 1,
        "englishDescription": "Restores 12 Health to one ally."
      },
      {
        "name": "Diagnóstico Preciso",
        "englishName": "Precise Diagnosis",
        "damage": 10,
        "cost": 2,
        "damageType": "piercing",
        "mark": true,
        "markTurns": 2,
        "englishDescription": "Deals 10 piercing damage to one enemy and Marks it for 2 turns."
      },
      {
        "name": "Sutura de Campo",
        "englishName": "Field Suture",
        "target": "ally",
        "heal": 10,
        "cleanse": true,
        "regen": {
          "heal": 3,
          "turns": 2
        },
        "cost": 2,
        "englishDescription": "Restores 10 Health to one ally, removes harmful conditions, and regenerates 3 Health for 2 turns."
      }
    ],
    "defense": {
      "name": "Respirar Primeiro",
      "englishName": "Breathe First",
      "heal": 5,
      "shield": 4
    }
  },
  {
    "id": "diana-a-guarda",
    "name": "Diana, a Guarda",
    "englishName": "Diana, the Guard",
    "family": "diana",
    "version": 2,
    "eloId": "cura",
    "elo": "Cura",
    "englishElo": "Healing",
    "realm": "Paraíso",
    "color": "healing",
    "symbol": "✚",
    "affinity": "graca",
    "role": "Protetora de Linha",
    "englishRole": "Frontline Protector",
    "combo": "Tomar o impacto e responder",
    "englishCombo": "Take the Impact and Answer",
    "mechanic": "Diana protege um aliado, recebe parte da pressão e abre um contra-ataque.",
    "englishMechanic": "Diana protects an ally, absorbs some pressure, and opens a counterattack.",
    "lore": "A Guarda é a Diana que escolheu ficar entre o perigo e quem ainda podia ser salvo. Ela não confunde proteção com invulnerabilidade; sabe que o impacto também deixa marcas.",
    "englishLore": "The Guard is the Diana who chose to stand between danger and those who could still be saved. She does not mistake protection for invulnerability; she knows impact leaves marks.",
    "synergyEloIds": [
      "cura",
      "carne"
    ],
    "passive": {
      "name": "O Impacto é Dividido",
      "englishName": "The Impact Is Shared",
      "trigger": "damaged",
      "requiresLifeLoss": true,
      "effect": {
        "shieldTeam": 2
      },
      "description": "Uma vez por rodada, quando perde Vida para uma habilidade, Diana concede 2 de Defesa ao trio.",
      "englishDescription": "Once per round, when an ability makes her lose Health, Diana grants 2 Defense to the team."
    },
    "skills": [
      {
        "name": "Guarda de Campo",
        "englishName": "Field Guard",
        "target": "ally",
        "shield": 12,
        "reduce": 5,
        "cost": 1,
        "englishDescription": "Grants one ally 12 Defense and reduces damage they take by 5 for 1 turn."
      },
      {
        "name": "Braço de Contenção",
        "englishName": "Restraining Arm",
        "damage": 13,
        "cost": 2,
        "damageType": "physical",
        "weaken": 1,
        "englishDescription": "Deals 13 physical damage to one enemy and Weakens it for 1 turn."
      },
      {
        "name": "Círculo de Retorno",
        "englishName": "Circle of Return",
        "target": "team",
        "counter": 10,
        "cost": 2,
        "englishDescription": "Prepares a Counter for each ally; each cancels the next incoming enemy ability and retaliates for 10 damage."
      }
    ],
    "defense": {
      "name": "Ficar entre",
      "englishName": "Step Between",
      "shield": 7
    }
  },
  {
    "id": "diana-a-que-ainda-segura",
    "name": "Diana, a Que Ainda Segura",
    "englishName": "Diana, the One Still Holding On",
    "family": "diana",
    "version": 3,
    "eloId": "cura",
    "elo": "Cura",
    "englishElo": "Healing",
    "realm": "Paraíso",
    "color": "healing",
    "symbol": "✚",
    "affinity": "graca",
    "role": "Amparo Persistente",
    "englishRole": "Enduring Support",
    "combo": "Última mão a soltar",
    "englishCombo": "The Last Hand to Let Go",
    "mechanic": "Diana converte cura ampla em Graça e prolonga o fôlego de todos.",
    "englishMechanic": "Diana turns broad healing into Grace and extends everyone's endurance.",
    "lore": "Depois de tentar carregar todas as vidas que podia, Diana chegou ao limite. Esta forma ainda segura os outros — mas aprendeu a pedir ao trio que também a sustente.",
    "englishLore": "After trying to carry every life she could, Diana reached her limit. This form still holds others, but has learned to ask the team to sustain her too.",
    "synergyEloIds": [
      "cura",
      "carne"
    ],
    "passive": {
      "name": "A Mão Ainda Segura",
      "englishName": "The Hand Still Holds",
      "trigger": "support",
      "requiresOtherAlly": true,
      "minimumHeal": 10,
      "effect": {
        "generateEssence": {
          "resource": "graca",
          "amount": 1
        },
        "healWeakestAlly": 4
      },
      "description": "Uma vez por rodada, curar ao menos 10 de Vida de outro aliado gera 1 Graça e restaura 4 de Vida ao aliado vivo mais ferido.",
      "englishDescription": "Once per round, healing another ally for at least 10 Health generates 1 Grace and restores 4 Health to the living ally with the lowest Health percentage."
    },
    "skills": [
      {
        "name": "Cuidado que Atravessa",
        "englishName": "Care That Carries",
        "target": "team",
        "heal": 6,
        "cost": 1,
        "englishDescription": "Restores 6 Health to each ally."
      },
      {
        "name": "Sutura do Limiar",
        "englishName": "Bond Suture",
        "target": "ally",
        "heal": 14,
        "cleanse": true,
        "regen": {
          "heal": 4,
          "turns": 2
        },
        "cost": 2,
        "englishDescription": "Restores 14 Health to one ally, removes harmful conditions, and regenerates 4 Health for 2 turns."
      },
      {
        "name": "Ninguém Cai Só",
        "englishName": "No One Falls Alone",
        "target": "team",
        "shield": 6,
        "heal": 8,
        "cost": 2,
        "englishDescription": "Grants each ally 6 Defense and restores 8 Health."
      }
    ],
    "defense": {
      "name": "Ainda Segurando",
      "englishName": "Still Holding",
      "heal": 5,
      "shield": 5
    }
  }
];

const supportingProfiles = [
  {
    "id": "teras",
    "name": "Teras",
    "englishName": "Teras",
    "family": "teras",
    "version": 1,
    "eloId": "vazio",
    "elo": "Vazio",
    "englishElo": "Void",
    "realm": "Inferno",
    "color": "void",
    "symbol": "◍",
    "affinity": "essence",
    "role": "Observador do Vazio",
    "englishRole": "Void Observer",
    "combo": "Observar antes de intervir",
    "englishCombo": "Observe Before Intervening",
    "mechanic": "Teras lê as aflições deixadas pelo trio inimigo e converte observação em Essência.",
    "englishMechanic": "Teras reads afflictions left by the opposing team and turns observation into Essence.",
    "lore": "Teras entende apenas uma parte do que Nilo é. Observa as almas sem pressa, como se procurasse no vazio uma regra que ainda não foi escrita.",
    "englishLore": "Teras understands only part of what Nilo is. He watches souls without hurry, as if searching the void for a rule that has not yet been written.",
    "synergyEloIds": [
      "vazio",
      "correntes-quebradas"
    ],
    "passive": {
      "name": "Nota de Campo",
      "englishName": "Field Note",
      "trigger": "turnStart",
      "ifEnemyAfflicted": true,
      "ownDotPopulation": {
        "tag": "decadencia",
        "minimum": 1
      },
      "effect": {
        "generateEssence": {
          "resource": "essence",
          "amount": 1
        },
        "drainEssence": {
          "amount": 1
        }
      },
      "description": "No início do turno, se ao menos um inimigo ainda tiver Decadência de Teras, gera 1 Éter e drena 1 Essência inimiga; uma vez por rodada.",
      "englishDescription": "At turn start, if at least one enemy still has Teras's Decay, he generates 1 Aether and drains 1 enemy Essence, once per round."
    },
    "skills": [
      {
        "name": "Olhar de Anomalia",
        "englishName": "Anomaly's Gaze",
        "damage": 10,
        "cost": 1,
        "damageType": "energy",
        "mark": true,
        "markTurns": 2,
        "englishDescription": "Deals 10 spiritual damage to one enemy and Marks it for 2 turns."
      },
      {
        "name": "Registro de Decadência",
        "englishName": "Decay Record",
        "damage": 11,
        "cost": 2,
        "damageType": "affliction",
        "dot": {
          "tag": "decadencia",
          "damage": 4,
          "turns": 2
        },
        "expose": 1,
        "englishDescription": "Deals 11 affliction damage, applies Decay for 4 damage over 2 turns, and Exposes one enemy."
      },
      {
        "name": "Pergunta sem Resposta",
        "englishName": "Question Without an Answer",
        "damage": 15,
        "cost": 2,
        "damageType": "energy",
        "sealSupport": 1,
        "cooldown": 1,
        "englishDescription": "Deals 15 spiritual damage to one enemy and seals its support for 1 turn."
      }
    ],
    "defense": {
      "name": "Vigília Imóvel",
      "englishName": "Unmoving Watch",
      "shield": 5
    }
  },
  {
    "id": "teras-o-observador",
    "name": "Teras, o Observador",
    "englishName": "Teras, the Observer",
    "family": "teras",
    "version": 2,
    "eloId": "vazio",
    "elo": "Vazio",
    "englishElo": "Void",
    "realm": "Inferno",
    "color": "void",
    "symbol": "◍",
    "affinity": "essence",
    "role": "Leitor de Fendas",
    "englishRole": "Rift Reader",
    "combo": "Revelar sem se expor",
    "englishCombo": "Reveal Without Exposure",
    "mechanic": "Teras prepara um alvo Exposto e toma a Essência que escapa pela fenda.",
    "englishMechanic": "Teras prepares an Exposed target and takes the Essence escaping through the rift.",
    "lore": "Ao compreender que Nilo não pertence a nenhum Reino, Teras deixa de apenas observar. Esta forma passa a testar a fronteira para descobrir o que tenta atravessá-la.",
    "englishLore": "After realizing Nilo belongs to no Kingdom, Teras stops merely observing. This form tests the boundary to learn what is trying to cross it.",
    "synergyEloIds": [
      "vazio",
      "correntes-quebradas"
    ],
    "passive": {
      "name": "Leitura da Fenda",
      "englishName": "Rift Reading",
      "trigger": "hit",
      "requiresExposed": true,
      "effect": {
        "stealEssence": {
          "amount": 1
        },
        "gainCharge": 1
      },
      "description": "Uma vez por rodada, ferir um alvo Exposto rouba 1 Essência inimiga e concede 1 carga.",
      "englishDescription": "Once per round, hitting an Exposed target steals 1 enemy Essence and grants 1 charge."
    },
    "skills": [
      {
        "name": "Margem Exposta",
        "englishName": "Exposed Margin",
        "damage": 12,
        "cost": 1,
        "damageType": "piercing",
        "expose": 1,
        "englishDescription": "Deals 12 piercing damage to one enemy and Exposes it."
      },
      {
        "name": "Vazio em Suspenso",
        "englishName": "Suspended Void",
        "damage": 16,
        "cost": 2,
        "damageType": "energy",
        "combo": {
          "condition": "exposed",
          "bonusDamage": 8
        },
        "englishDescription": "Deals 16 spiritual damage to one enemy, plus 8 against an Exposed target."
      },
      {
        "name": "Coleta Silenciosa",
        "englishName": "Silent Collection",
        "damage": 10,
        "cost": 2,
        "damageType": "energy",
        "steal": 1,
        "weaken": 1,
        "englishDescription": "Deals 10 spiritual damage, steals 1 Essence, and Weakens one enemy for 1 turn."
      }
    ],
    "defense": {
      "name": "Passo para Trás",
      "englishName": "Step Back",
      "shield": 5
    }
  },
  {
    "id": "victor",
    "name": "Victor",
    "englishName": "Victor",
    "family": "victor",
    "version": 1,
    "eloId": "coroa",
    "elo": "Coroa",
    "englishElo": "Crown",
    "realm": "Inferno",
    "color": "crown",
    "symbol": "♜",
    "affinity": "ruptura",
    "role": "Regente sem Reino",
    "englishRole": "Ruler Without a Realm",
    "combo": "Comandar o que restou",
    "englishCombo": "Command What Remains",
    "mechanic": "Victor protege a formação e converte a agressão recebida em autoridade para a próxima ação.",
    "englishMechanic": "Victor protects the formation and turns incoming aggression into authority for the next action.",
    "lore": "Victor já liderou algo que não existe mais. A Coroa que carrega não lhe devolve o reino; apenas lembra que ainda há pessoas sob sua responsabilidade.",
    "englishLore": "Victor once led something that no longer exists. The Crown he carries will not restore his realm; it only reminds him that people still depend on him.",
    "synergyEloIds": [
      "coroa",
      "protecao"
    ],
    "passive": {
      "name": "Autoridade Residual",
      "englishName": "Residual Authority",
      "trigger": "damaged",
      "requiresLifeLoss": true,
      "effect": {
        "shieldTeam": 2,
        "gainCharge": 1
      },
      "description": "Uma vez por rodada, depois de perder Vida para uma habilidade, Victor concede 2 de Defesa ao trio e ganha 1 carga.",
      "englishDescription": "Once per round, after losing Health to an ability, Victor grants the team 2 Defense and gains 1 charge."
    },
    "skills": [
      {
        "name": "Decreto Final",
        "englishName": "Final Decree",
        "damage": 14,
        "cost": 1,
        "damageType": "physical",
        "weaken": 1,
        "englishDescription": "Deals 14 physical damage to one enemy and Weakens it for 1 turn."
      },
      {
        "name": "Trono sem Reino",
        "englishName": "Throne Without a Realm",
        "target": "team",
        "shield": 8,
        "cost": 2,
        "englishDescription": "Grants each ally 8 Defense."
      },
      {
        "name": "Sucessão Forçada",
        "englishName": "Forced Succession",
        "damage": 16,
        "cost": 2,
        "damageType": "piercing",
        "stripShield": 12,
        "mark": true,
        "markTurns": 2,
        "englishDescription": "Removes 12 Defense, then deals 16 piercing damage to one enemy and Marks it for 2 turns."
      }
    ],
    "defense": {
      "name": "Último Mandato",
      "englishName": "Last Mandate",
      "shield": 6
    }
  },
  {
    "id": "silas",
    "name": "Silas",
    "englishName": "Silas",
    "family": "silas",
    "version": 1,
    "eloId": "carne",
    "elo": "Carne",
    "englishElo": "Flesh",
    "realm": "Inferno",
    "color": "flesh",
    "symbol": "⌘",
    "affinity": "cinza",
    "role": "Guarda de Nervos",
    "englishRole": "Nerve Guard",
    "combo": "Fidelidade que protege",
    "englishCombo": "Loyalty That Protects",
    "mechanic": "Silas prende a ameaça e protege quem escolheu manter ao seu lado.",
    "englishMechanic": "Silas binds the threat and protects those he has chosen to keep beside him.",
    "lore": "Silas encontrou na lealdade uma forma de resistir à Carne. Cada laço que cria é uma promessa de que não vai abandonar quem confiou nele.",
    "englishLore": "Silas found a way to resist Flesh through loyalty. Every bond he forms is a promise that he will not abandon those who trust him.",
    "synergyEloIds": [
      "carne",
      "uniao"
    ],
    "passive": {
      "name": "Laço de Vigília",
      "englishName": "Vigil Bond",
      "trigger": "support",
      "requiresOtherAlly": true,
      "effect": {
        "shieldTarget": 3
      },
      "description": "Uma vez por rodada, apoiar outro aliado também lhe concede 3 de Defesa.",
      "englishDescription": "Once per round, supporting another ally also grants them 3 Defense."
    },
    "skills": [
      {
        "name": "Laço de Tendão",
        "englishName": "Tendon Bond",
        "damage": 11,
        "cost": 1,
        "damageType": "affliction",
        "weaken": 1,
        "englishDescription": "Deals 11 affliction damage to one enemy and Weakens it for 1 turn."
      },
      {
        "name": "Pele de Vigia",
        "englishName": "Watchful Skin",
        "target": "ally",
        "shield": 10,
        "counter": 10,
        "cost": 2,
        "englishDescription": "Grants one ally 10 Defense and prepares a Counter that retaliates for 10 damage."
      },
      {
        "name": "Nervo Contido",
        "englishName": "Bound Nerve",
        "damage": 16,
        "cost": 2,
        "damageType": "piercing",
        "sealAttack": 1,
        "cooldown": 1,
        "englishDescription": "Deals 16 piercing damage to one enemy and seals its offensive abilities for 1 turn."
      }
    ],
    "defense": {
      "name": "Corpo entre Nós",
      "englishName": "Body Between Us",
      "shield": 6
    }
  },
  {
    "id": "silas-o-leal",
    "name": "Silas, o Leal",
    "englishName": "Silas, the Loyal",
    "family": "silas",
    "version": 2,
    "eloId": "carne",
    "elo": "Carne",
    "englishElo": "Flesh",
    "realm": "Inferno",
    "color": "flesh",
    "symbol": "⌘",
    "affinity": "graca",
    "role": "Protetor Vinculado",
    "englishRole": "Bound Protector",
    "combo": "Responder pelo outro",
    "englishCombo": "Answer for Another",
    "mechanic": "O dano sofrido por Silas reforça o trio; sua defesa também prepara respostas coletivas.",
    "englishMechanic": "Damage taken by Silas strengthens the team; his guard also prepares group responses.",
    "lore": "O Leal já não protege por dívida ou medo. A forma que assume nasce da escolha de ficar, mesmo quando o corpo é puxado para longe de quem ama.",
    "englishLore": "The Loyal no longer protects out of debt or fear. This form comes from choosing to stay, even when his body is pulled away from those he loves.",
    "synergyEloIds": [
      "carne",
      "uniao"
    ],
    "passive": {
      "name": "Promessa que Aguenta",
      "englishName": "A Promise That Holds",
      "trigger": "damaged",
      "requiresLifeLoss": true,
      "effect": {
        "shieldTeam": 2,
        "heal": 3
      },
      "description": "Uma vez por rodada, depois de perder Vida para uma habilidade, Silas concede 2 de Defesa ao trio e recupera 3 de Vida.",
      "englishDescription": "Once per round, after losing Health to an ability, Silas grants the team 2 Defense and restores 3 Health."
    },
    "skills": [
      {
        "name": "Pele Partilhada",
        "englishName": "Shared Skin",
        "target": "ally",
        "shield": 12,
        "reduce": 4,
        "cost": 1,
        "englishDescription": "Grants one ally 12 Defense and reduces damage they take by 4 for 1 turn."
      },
      {
        "name": "Nó de Lealdade",
        "englishName": "Knot of Loyalty",
        "target": "team",
        "shield": 6,
        "cleanse": true,
        "cost": 2,
        "englishDescription": "Grants each ally 6 Defense and removes harmful conditions from the team."
      },
      {
        "name": "Devolver a Agressão",
        "englishName": "Return the Aggression",
        "damage": 18,
        "cost": 2,
        "damageType": "physical",
        "combo": {
          "condition": "weakened",
          "bonusDamage": 7
        },
        "englishDescription": "Deals 18 physical damage to one enemy, plus 7 against a Weakened target."
      }
    ],
    "defense": {
      "name": "Abrigo Vinculado",
      "englishName": "Bound Shelter",
      "shield": 7
    }
  },
  {
    "id": "orion",
    "name": "Orion",
    "englishName": "Orion",
    "family": "orion",
    "version": 1,
    "eloId": "verdade",
    "elo": "Verdade",
    "englishElo": "Truth",
    "realm": "Paraíso",
    "color": "truth",
    "symbol": "✧",
    "affinity": "essence",
    "role": "Caçador de Anomalias",
    "englishRole": "Anomaly Hunter",
    "combo": "Revelar e decidir",
    "englishCombo": "Reveal and Decide",
    "mechanic": "Orion marca o que considera impossível e precisa escolher entre capturar ou ajudar.",
    "englishMechanic": "Orion Marks what he considers impossible and must choose whether to capture it or help it.",
    "lore": "Orion rastreia almas que escapam às regras dos Reinos. Às vezes ajuda Nilo; às vezes parece estar calculando a forma mais segura de capturá-lo.",
    "englishLore": "Orion tracks souls that escape the Kingdoms' rules. Sometimes he helps Nilo; sometimes he seems to be calculating the safest way to capture him.",
    "synergyEloIds": [
      "verdade",
      "correntes-quebradas"
    ],
    "passive": {
      "name": "Prova Irrefutável",
      "englishName": "Irrefutable Evidence",
      "trigger": "hit",
      "requiresOwnMark": true,
      "effect": {
        "weakenTarget": 1
      },
      "description": "Uma vez por rodada, ferir um alvo com a Marca própria também o Enfraquece por 1 turno.",
      "englishDescription": "Once per round, hitting a target with Orion's Mark also Weakens it for 1 turn."
    },
    "skills": [
      {
        "name": "Rastro de Éter",
        "englishName": "Aether Trail",
        "damage": 10,
        "cost": 1,
        "damageType": "piercing",
        "mark": true,
        "markTurns": 2,
        "englishDescription": "Deals 10 piercing damage to one enemy and Marks it for 2 turns."
      },
      {
        "name": "Captura Vetorial",
        "englishName": "Vector Capture",
        "damage": 14,
        "cost": 2,
        "damageType": "energy",
        "stun": 1,
        "combo": {
          "condition": "marked",
          "bonusDamage": 6,
          "consume": true
        },
        "englishDescription": "Deals 14 spiritual damage to one enemy. Against a Marked target, it deals 6 bonus damage, consumes the Mark, and Stuns for 1 turn."
      },
      {
        "name": "Dúvida Calculada",
        "englishName": "Calculated Doubt",
        "target": "ally",
        "shield": 8,
        "cleanse": true,
        "cost": 2,
        "englishDescription": "Grants one ally 8 Defense and removes harmful conditions."
      }
    ],
    "defense": {
      "name": "Janela de Contenção",
      "englishName": "Containment Window",
      "shield": 6
    }
  },
  {
    "id": "doggo",
    "name": "Doggo",
    "englishName": "Doggo",
    "family": "doggo",
    "version": 1,
    "eloId": "fome",
    "elo": "Fome",
    "englishElo": "Hunger",
    "realm": "Inferno",
    "color": "hunger",
    "symbol": "◉",
    "affinity": "cinza",
    "role": "Sobrevivente Pragmático",
    "englishRole": "Practical Survivor",
    "combo": "Tomar só o necessário",
    "englishCombo": "Take Only What Is Needed",
    "mechanic": "Doggo rouba recursos de quem ameaça o grupo e usa o que obtém para continuar de pé.",
    "englishMechanic": "Doggo steals resources from anyone threatening the group and uses what he gets to stay standing.",
    "lore": "Doggo não finge que é nobre. Faz contas, encontra comida e sabe exatamente quando fugir — até perceber que alguém do grupo não consegue acompanhá-lo.",
    "englishLore": "Doggo does not pretend to be noble. He counts, finds food, and knows exactly when to run, until he realizes someone in the group cannot keep up.",
    "synergyEloIds": [
      "fome"
    ],
    "passive": {
      "name": "Ração de Emergência",
      "englishName": "Emergency Ration",
      "trigger": "kill",
      "effect": {
        "heal": 5,
        "generateEssence": {
          "resource": "cinza",
          "amount": 1
        }
      },
      "description": "Ao derrubar uma alma, recupera 5 de Vida e gera 1 Cinza; uma vez por rodada.",
      "englishDescription": "When he defeats a soul, Doggo restores 5 Health and generates 1 Ash, once per round."
    },
    "skills": [
      {
        "name": "Mordida de Cobrança",
        "englishName": "Collection Bite",
        "damage": 12,
        "cost": 1,
        "damageType": "physical",
        "lifesteal": 0.2,
        "englishDescription": "Deals 12 physical damage to one enemy and restores 20% of damage dealt as Health."
      },
      {
        "name": "Mão que Toma",
        "englishName": "Taking Hand",
        "damage": 10,
        "cost": 2,
        "damageType": "piercing",
        "steal": 1,
        "englishDescription": "Deals 10 piercing damage to one enemy and steals 1 Essence."
      },
      {
        "name": "Reserva Escondida",
        "englishName": "Hidden Stash",
        "target": "self",
        "heal": 8,
        "shield": 8,
        "generateEssence": {
          "resource": "cinza",
          "amount": 1
        },
        "cost": 2,
        "englishDescription": "Restores 8 Health to Doggo, grants him 8 Defense, and generates 1 Ash."
      }
    ],
    "defense": {
      "name": "Fingir de Morto",
      "englishName": "Play Dead",
      "shield": 5
    }
  },
  {
    "id": "hans",
    "name": "Hans",
    "englishName": "Hans",
    "family": "hans",
    "version": 1,
    "eloId": "podridao",
    "elo": "Podridão",
    "englishElo": "Rot",
    "realm": "Inferno",
    "color": "rot",
    "symbol": "✹",
    "affinity": "cinza",
    "role": "Informante da Podridão",
    "englishRole": "Rot Informant",
    "combo": "Deixar a praga falar",
    "englishCombo": "Let the Blight Speak",
    "mechanic": "Hans espalha Decadência e transforma a persistência das aflições em Cinza.",
    "englishMechanic": "Hans spreads Decay and turns persistent afflictions into Ash.",
    "lore": "Hans troca informação por abrigo e comenta a desgraça alheia com humor ácido. Ele conhece a Podridão o bastante para saber que nada apodrece sozinho.",
    "englishLore": "Hans trades information for shelter and comments on other people's misery with acid humor. He knows Rot well enough to know that nothing decays alone.",
    "synergyEloIds": [
      "podridao"
    ],
    "passive": {
      "name": "Juros de Decadência",
      "englishName": "Decay Interest",
      "trigger": "turnStart",
      "ifEnemyAfflicted": true,
      "ownDotPopulation": {
        "tag": "decadencia",
        "minimum": 2
      },
      "effect": {
        "generateEssence": {
          "resource": "cinza",
          "amount": 1
        },
        "heal": 3
      },
      "description": "Se dois ou mais inimigos vivos mantêm Decadência de Hans, no início do turno ele gera 1 Cinza e recupera 3 de Vida; uma vez por rodada.",
      "englishDescription": "If at least two living enemies still have Hans's Decay, he generates 1 Ash and restores 3 Health at turn start, once per round."
    },
    "skills": [
      {
        "name": "Informação Venenosa",
        "englishName": "Poisoned Information",
        "damage": 8,
        "cost": 1,
        "damageType": "affliction",
        "dot": {
          "tag": "veneno",
          "damage": 4,
          "turns": 2
        },
        "englishDescription": "Deals 8 affliction damage and applies Poison for 4 damage over 2 turns."
      },
      {
        "name": "Decadência Compartilhada",
        "englishName": "Shared Decay",
        "damage": 12,
        "cost": 2,
        "damageType": "energy",
        "dot": {
          "tag": "decadencia",
          "damage": 5,
          "turns": 2
        },
        "target": "all-enemies",
        "englishDescription": "Deals 12 spiritual damage to all enemies and applies Decay for 5 damage over 2 turns."
      },
      {
        "name": "Hospitalidade Negada",
        "englishName": "Hospitality Denied",
        "damage": 14,
        "cost": 2,
        "damageType": "piercing",
        "healingBlock": 0.5,
        "sealSupport": 1,
        "cooldown": 1,
        "englishDescription": "Deals 14 piercing damage, halves healing received, and seals support for 1 turn."
      }
    ],
    "defense": {
      "name": "Esconderijo Insalubre",
      "englishName": "Unwholesome Hideout",
      "shield": 5
    }
  },
  {
    "id": "xian",
    "name": "Xian",
    "englishName": "Xian",
    "family": "xian",
    "version": 1,
    "eloId": "silencio",
    "elo": "Silêncio",
    "englishElo": "Silence",
    "realm": "Inferno",
    "color": "silence",
    "symbol": "◌",
    "affinity": "essence",
    "role": "Isolado que Revida",
    "englishRole": "Isolated Retaliator",
    "combo": "Silêncio como resposta",
    "englishCombo": "Silence as an Answer",
    "mechanic": "Xian pune quem rompe sua quietude e sela a próxima abertura do agressor.",
    "englishMechanic": "Xian punishes anyone who breaks his quiet and seals the aggressor's next opening.",
    "lore": "Xian quase nunca fala. Não é timidez: aprendeu que cada palavra vira uma promessa que alguém pode usar contra ele.",
    "englishLore": "Xian almost never speaks. It is not shyness; he learned that every word becomes a promise someone can use against him.",
    "synergyEloIds": [
      "silencio"
    ],
    "passive": {
      "name": "Resposta Muda",
      "englishName": "Silent Answer",
      "trigger": "damaged",
      "requiresLifeLoss": true,
      "effect": {
        "damageAttacker": 5
      },
      "description": "Uma vez por rodada, quando perde Vida para uma habilidade, causa 5 de dano de aflição ao agressor.",
      "englishDescription": "Once per round, when an ability makes Xian lose Health, he deals 5 affliction damage to the attacker."
    },
    "skills": [
      {
        "name": "Passo sem Ruído",
        "englishName": "Soundless Step",
        "damage": 11,
        "cost": 1,
        "damageType": "piercing",
        "weaken": 1,
        "englishDescription": "Deals 11 piercing damage to one enemy and Weakens it for 1 turn."
      },
      {
        "name": "Porta Fechada",
        "englishName": "Closed Door",
        "damage": 13,
        "cost": 2,
        "damageType": "energy",
        "sealSupport": 1,
        "englishDescription": "Deals 13 spiritual damage to one enemy and seals its support for 1 turn."
      },
      {
        "name": "Vácuo de Resposta",
        "englishName": "Response Vacuum",
        "target": "self",
        "counter": 13,
        "cost": 2,
        "counterEffect": {
          "drainEssence": {
            "amount": 1
          }
        },
        "englishDescription": "Counters the next incoming enemy ability, retaliates for 13 damage, and drains 1 Essence when it triggers."
      }
    ],
    "defense": {
      "name": "Quarto Vazio",
      "englishName": "Empty Room",
      "shield": 5
    }
  },
  {
    "id": "xian-o-imovel",
    "name": "Xian, o Imóvel",
    "englishName": "Xian, the Unmoving",
    "family": "xian",
    "version": 2,
    "eloId": "silencio",
    "elo": "Silêncio",
    "englishElo": "Silence",
    "realm": "Inferno",
    "color": "silence",
    "symbol": "◌",
    "affinity": "ruptura",
    "role": "Sentinela do Vazio",
    "englishRole": "Void Sentinel",
    "combo": "Permanecer até a ameaça cessar",
    "englishCombo": "Stay Until the Threat Ends",
    "mechanic": "Xian aguenta a pressão, interrompe respostas e recolhe Essência do silêncio deixado.",
    "englishMechanic": "Xian withstands pressure, interrupts responses, and gathers Essence from the silence left behind.",
    "lore": "O Imóvel é Xian depois de desistir de fugir. Não fala, não recua e não oferece aos outros a reação que esperam encontrar.",
    "englishLore": "The Unmoving one is Xian after giving up on running. He does not speak, retreat, or offer others the reaction they expect.",
    "synergyEloIds": [
      "silencio",
      "correntes-quebradas"
    ],
    "passive": {
      "name": "Quietude Inquebrável",
      "englishName": "Unbroken Quiet",
      "trigger": "counter",
      "effect": {
        "gainCharge": 1,
        "generateEssence": {
          "resource": "ruptura",
          "amount": 1
        },
        "sealSupportTarget": 1
      },
      "description": "Uma vez por rodada, ativar um Contra-ataque concede 1 carga, gera 1 Ruptura e sela o apoio do agressor por 1 turno.",
      "englishDescription": "Once per round, activating a Counter grants 1 charge, generates 1 Rupture, and seals the attacker's support for 1 turn."
    },
    "skills": [
      {
        "name": "Vigília de Pedra",
        "englishName": "Stone Vigil",
        "target": "self",
        "counter": 15,
        "counterFilter": [
          "physical",
          "piercing"
        ],
        "cost": 1,
        "englishDescription": "Counters the next incoming physical or piercing ability and retaliates for 15 damage."
      },
      {
        "name": "Selo de Omissão",
        "englishName": "Seal of Omission",
        "damage": 14,
        "cost": 2,
        "damageType": "energy",
        "sealAttack": 1,
        "englishDescription": "Deals 14 spiritual damage to one enemy and seals its offensive abilities for 1 turn."
      },
      {
        "name": "Ninguém Responde",
        "englishName": "No One Answers",
        "damage": 18,
        "cost": 2,
        "damageType": "piercing",
        "combo": {
          "condition": "weakened",
          "bonusDamage": 8
        },
        "englishDescription": "Deals 18 piercing damage to one enemy, plus 8 against a Weakened target."
      }
    ],
    "defense": {
      "name": "Não Dar um Passo",
      "englishName": "Not One Step",
      "shield": 7
    }
  },
  {
    "id": "seraphim",
    "name": "Seraphim",
    "englishName": "Seraphim",
    "family": "seraphim",
    "version": 1,
    "eloId": "protecao",
    "elo": "Graça",
    "englishElo": "Grace",
    "realm": "Paraíso",
    "color": "guard",
    "symbol": "⬡",
    "affinity": "graca",
    "role": "Eco de Paraíso",
    "englishRole": "Paradise Echo",
    "combo": "Amparar sem exigir fé",
    "englishCombo": "Shelter Without Demanding Faith",
    "mechanic": "Seraphim fortalece a defesa e restaura quem recebeu o peso do combate.",
    "englishMechanic": "Seraphim strengthens defenses and restores those who have borne the weight of battle.",
    "lore": "Seraphim é um eco de Paraíso, uma presença de pureza que incomoda até quem acredita estar fazendo o bem. Seu cuidado não pergunta se a pessoa merece.",
    "englishLore": "Seraphim is an echo of Paradise, a presence of purity that unsettles even those who believe they are doing good. Its care does not ask whether someone deserves it.",
    "synergyEloIds": [
      "protecao",
      "cura"
    ],
    "passive": {
      "name": "Graça sem Julgamento",
      "englishName": "Grace Without Judgment",
      "trigger": "support",
      "minimumHeal": 1,
      "effect": {
        "generateEssence": {
          "resource": "graca",
          "amount": 1
        },
        "healWeakestAlly": 3
      },
      "description": "Uma vez por rodada, depois de uma cura efetiva, gera 1 Graça e restaura 3 de Vida ao aliado vivo mais ferido.",
      "englishDescription": "Once per round, after effective healing, Seraphim generates 1 Grace and restores 3 Health to the living ally with the lowest Health percentage."
    },
    "skills": [
      {
        "name": "Manto de Asas",
        "englishName": "Wing Mantle",
        "target": "team",
        "shield": 7,
        "cost": 1,
        "englishDescription": "Grants each ally 7 Defense."
      },
      {
        "name": "Toque sem Culpa",
        "englishName": "Blameless Touch",
        "target": "ally",
        "heal": 12,
        "cleanse": true,
        "cost": 2,
        "englishDescription": "Restores 12 Health to one ally and removes harmful conditions."
      },
      {
        "name": "Luz que Permanece",
        "englishName": "Light That Remains",
        "target": "team",
        "regen": {
          "heal": 4,
          "turns": 2
        },
        "shield": 5,
        "cost": 2,
        "englishDescription": "Grants each ally 5 Defense and regenerates 4 Health for 2 turns."
      }
    ],
    "defense": {
      "name": "Asa Fechada",
      "englishName": "Folded Wing",
      "shield": 7
    }
  },
  {
    "id": "seraphim-o-eco",
    "name": "Seraphim, o Eco",
    "englishName": "Seraphim, the Echo",
    "family": "seraphim",
    "version": 2,
    "eloId": "protecao",
    "elo": "Graça",
    "englishElo": "Grace",
    "realm": "Paraíso",
    "color": "guard",
    "symbol": "⬡",
    "affinity": "graca",
    "role": "Vigília Celeste",
    "englishRole": "Celestial Vigil",
    "combo": "Converter proteção em retorno",
    "englishCombo": "Turn Protection Into Recovery",
    "mechanic": "Cada guarda erguida por Seraphim prepara cura para quem ainda está ferido.",
    "englishMechanic": "Every guard Seraphim raises prepares healing for those still wounded.",
    "lore": "O Eco é o que resta quando a presença de Seraphim se afasta. A pureza permanece, mas agora parece uma lembrança que cada aliado precisa aprender a carregar.",
    "englishLore": "The Echo is what remains when Seraphim's presence withdraws. Its purity remains, now like a memory each ally must learn to carry.",
    "synergyEloIds": [
      "protecao",
      "cura"
    ],
    "passive": {
      "name": "Refrão de Vigília",
      "englishName": "Vigil Chorus",
      "trigger": "support",
      "minimumShield": 5,
      "effect": {
        "healTeam": 2
      },
      "description": "Uma vez por rodada, depois de conceder ao menos 5 de Defesa em uma habilidade de apoio, restaura 2 de Vida a cada aliado.",
      "englishDescription": "Once per round, after granting at least 5 Defense with a support ability, Seraphim restores 2 Health to each ally."
    },
    "skills": [
      {
        "name": "Círculo de Guarda",
        "englishName": "Circle of Guard",
        "target": "team",
        "shield": 9,
        "cost": 1,
        "englishDescription": "Grants each ally 9 Defense."
      },
      {
        "name": "Reverso da Queda",
        "englishName": "Fall Reversed",
        "target": "ally",
        "heal": 10,
        "shield": 8,
        "cost": 2,
        "englishDescription": "Restores 10 Health to one ally and grants them 8 Defense."
      },
      {
        "name": "Cântico de Retorno",
        "englishName": "Return Hymn",
        "target": "team",
        "heal": 5,
        "cleanse": true,
        "cost": 2,
        "englishDescription": "Restores 5 Health to each ally and removes harmful conditions from the team."
      }
    ],
    "defense": {
      "name": "Última Vigília",
      "englishName": "Last Vigil",
      "shield": 8
    }
  },
  {
    "id": "eiremir",
    "name": "Eiremir",
    "englishName": "Eiremir",
    "family": "eiremir",
    "version": 1,
    "eloId": "correntes-quebradas",
    "elo": "Limbo",
    "englishElo": "Limbo",
    "realm": "Limbo",
    "color": "limbo",
    "symbol": "⟲",
    "affinity": "ruptura",
    "role": "Anomalia Espelhada",
    "englishRole": "Mirrored Anomaly",
    "combo": "Devolver a Essência recebida",
    "englishCombo": "Return the Essence Received",
    "mechanic": "Eiremir marca o fluxo e converte a energia absorvida em Ruptura.",
    "englishMechanic": "Eiremir Marks the flow and converts absorbed energy into Rupture.",
    "lore": "Eiremir é outra anomalia rara do Limbo. Para Nilo, pode ser a primeira prova de que ele não está sozinho — ou um espelho de tudo que pode se tornar.",
    "englishLore": "Eiremir is another rare Limbo anomaly. To Nilo, they may be the first proof that he is not alone, or a mirror of everything he might become.",
    "synergyEloIds": [
      "correntes-quebradas",
      "vazio"
    ],
    "passive": {
      "name": "Reflexo de Essência",
      "englishName": "Essence Reflection",
      "trigger": "hit",
      "requiresOwnMark": true,
      "effect": {
        "generateEssence": {
          "resource": "ruptura",
          "amount": 1
        }
      },
      "description": "Uma vez por rodada, ferir um alvo com a Marca própria gera 1 Ruptura.",
      "englishDescription": "Once per round, hitting a target with Eiremir's Mark generates 1 Rupture."
    },
    "skills": [
      {
        "name": "Fenda que Observa",
        "englishName": "Watching Rift",
        "damage": 11,
        "cost": 1,
        "damageType": "energy",
        "mark": true,
        "markTurns": 2,
        "englishDescription": "Deals 11 spiritual damage to one enemy and Marks it for 2 turns."
      },
      {
        "name": "Fluxo Reverso",
        "englishName": "Reverse Flow",
        "damage": 12,
        "cost": 2,
        "damageType": "piercing",
        "convertEssence": {
          "from": "any",
          "to": "ruptura",
          "amount": 1
        },
        "englishDescription": "Converts 1 available Essence into Rupture, then deals 12 piercing damage to one enemy."
      },
      {
        "name": "Ressonância Impossível",
        "englishName": "Impossible Resonance",
        "damage": 17,
        "cost": 2,
        "damageType": "energy",
        "combo": {
          "condition": "marked",
          "bonusDamage": 8,
          "consume": true
        },
        "englishDescription": "Deals 17 spiritual damage to one enemy. Against a Marked target, it deals 8 bonus damage and consumes the Mark."
      }
    ],
    "defense": {
      "name": "Reflexo de Limbo",
      "englishName": "Limbo Reflection",
      "shield": 6
    }
  },
  {
    "id": "eiremir-o-espelho-partido",
    "name": "Eiremir, o Espelho Partido",
    "englishName": "Eiremir, the Broken Mirror",
    "family": "eiremir",
    "version": 2,
    "eloId": "correntes-quebradas",
    "elo": "Limbo",
    "englishElo": "Limbo",
    "realm": "Limbo",
    "color": "limbo",
    "symbol": "⟲",
    "affinity": "ruptura",
    "role": "Fenda de Retorno",
    "englishRole": "Returning Rift",
    "combo": "Devolver a ruptura",
    "englishCombo": "Return the Rupture",
    "mechanic": "Quando Eiremir é ferido, a fenda devolve carga e Ruptura ao trio.",
    "englishMechanic": "When Eiremir is hurt, the rift returns charge and Rupture to the team.",
    "lore": "O Espelho Partido absorveu fragmentos de muitas almas e já não sabe qual delas iniciou o reflexo. Sua forma lembra Nilo, mas cada repetição parece levá-lo a um resultado diferente.",
    "englishLore": "The Broken Mirror absorbed fragments from many souls and no longer knows which one began the reflection. Its form recalls Nilo, but each repetition seems to lead somewhere else.",
    "synergyEloIds": [
      "correntes-quebradas",
      "vazio"
    ],
    "passive": {
      "name": "Estilhaço Reativo",
      "englishName": "Reactive Shard",
      "trigger": "damaged",
      "requiresLifeLoss": true,
      "effect": {
        "gainCharge": 1,
        "generateEssence": {
          "resource": "ruptura",
          "amount": 1
        }
      },
      "description": "Uma vez por rodada, depois de perder Vida para uma habilidade, Eiremir ganha 1 carga e gera 1 Ruptura.",
      "englishDescription": "Once per round, after losing Health to an ability, Eiremir gains 1 charge and generates 1 Rupture."
    },
    "skills": [
      {
        "name": "Estilhaço de Retorno",
        "englishName": "Returning Shard",
        "damage": 13,
        "cost": 1,
        "damageType": "piercing",
        "expose": 1,
        "englishDescription": "Deals 13 piercing damage to one enemy and Exposes it."
      },
      {
        "name": "Espelho de Correntes",
        "englishName": "Chain Mirror",
        "target": "self",
        "counter": 14,
        "cost": 2,
        "counterEffect": {
          "generateEssence": {
            "resource": "ruptura",
            "amount": 1
          },
          "expose": 1
        },
        "englishDescription": "Counters the next incoming enemy ability, retaliates for 14 damage, generates 1 Rupture, and Exposes the attacker when triggered."
      },
      {
        "name": "Ruptura Recursiva",
        "englishName": "Recursive Rupture",
        "damage": 19,
        "cost": 2,
        "damageType": "piercing",
        "perChargeDamage": 3,
        "spendCharge": true,
        "englishDescription": "Deals 19 piercing damage to one enemy, plus 3 for each charge spent."
      }
    ],
    "defense": {
      "name": "Caco Invulnerável",
      "englishName": "Invulnerable Shard",
      "shield": 7
    }
  },
  {
    "id": "khoren-caminho",
    "name": "Zalmoxis",
    "englishName": "Zalmoxis",
    "identityTitle": "O Caminho",
    "englishIdentityTitle": "The Path",
    "family": "cosmic-leaders",
    "version": 1,
    "eloId": "correntes-quebradas",
    "elo": "Anômalo",
    "englishElo": "Anomaly",
    "realm": "Limbo",
    "color": "limbo",
    "symbol": "⟲",
    "affinity": "ruptura",
    "role": "Lorde do Limbo",
    "englishRole": "Lord of Limbo",
    "combo": "Marque um alvo, acerte-o para ganhar uma Carga e escolha quando consumi-la.",
    "englishCombo": "Mark a target, hit it to gain a Charge, and choose when to spend it.",
    "mechanic": "Zalmoxis abre uma Rota ao marcar um inimigo. Atingir esse alvo gera uma Carga uma vez por rodada; sua técnica final pode consumi-las para ampliar o golpe.",
    "englishMechanic": "Zalmoxis opens a Route by Marking an enemy. Hitting that target grants a Charge once per round; his final technique can spend them to strengthen the strike.",
    "lore": "Zalmoxis é o Lorde do Limbo e vigia as passagens entre existências. Não escolhe destinos: revela as rotas e cobra de quem força a travessia.",
    "englishLore": "Zalmoxis is the Lord of Limbo and watches the passages between lives. He does not choose destinations; he reveals the routes and exacts a price from those who force their way through.",
    "synergyEloIds": [
      "correntes-quebradas",
      "vazio"
    ],
    "passive": {
      "name": "Marco de Passagem",
      "englishName": "Waymark",
      "trigger": "hit",
      "requiresOwnMark": true,
      "requiresLifeLoss": true,
      "effect": {
        "gainCharge": 1
      },
      "description": "Ao causar dano a um inimigo com sua Marca, ganha 1 Carga. Ativa uma vez por rodada.",
      "englishDescription": "Once per round, dealing damage to an enemy with his Mark grants Zalmoxis 1 Charge."
    },
    "skills": [
      {
        "name": "Traçar Rota",
        "englishName": "Trace a Route",
        "damage": 10,
        "target": "enemy",
        "damageType": "energy",
        "mark": "rota-caminho",
        "markTurns": 2,
        "costs": {
          "ruptura": 1
        },
        "englishDescription": "Deals 10 spiritual damage to one enemy and Marks it with a Route for 2 turns."
      },
      {
        "name": "Cobrar Travessia",
        "englishName": "Exact the Crossing",
        "damage": 12,
        "target": "enemy",
        "damageType": "piercing",
        "expose": 1,
        "combo": {
          "condition": "mark:rota-caminho",
          "bonusDamage": 5
        },
        "costs": {
          "ruptura": 1,
          "random": 1
        },
        "cooldown": 1,
        "englishDescription": "Deals 12 piercing damage and Exposes one enemy. Against Zalmoxis's Route, it deals 5 more damage."
      },
      {
        "name": "Desfecho de Trajeto",
        "englishName": "Route's End",
        "damage": 13,
        "target": "enemy",
        "damageType": "piercing",
        "perChargeDamage": 4,
        "spendCharge": true,
        "costs": {
          "ruptura": 1,
          "random": 1
        },
        "cooldown": 2,
        "englishDescription": "Deals 13 piercing damage, plus 4 for each Charge spent."
      }
    ],
    "defense": {
      "name": "Travessia Reversa",
      "englishName": "Reversed Crossing",
      "shield": 7
    }
  },
  {
    "id": "elaris-prologo",
    "name": "Elaris",
    "englishName": "Elaris",
    "identityTitle": "O Prólogo",
    "englishIdentityTitle": "The Prologue",
    "family": "cosmic-leaders",
    "version": 1,
    "eloId": "criacao",
    "elo": "Criação",
    "englishElo": "Creation",
    "realm": "Paraíso",
    "color": "creation",
    "symbol": "✧",
    "affinity": "graca",
    "role": "Guardião do Paraíso",
    "englishRole": "Guardian of Paradise",
    "combo": "Restaure um aliado para gerar Graça; proteja-o ou enfraqueça a ameaça.",
    "englishCombo": "Restore an ally to generate Grace; protect them or weaken the threat.",
    "mechanic": "Elaris converte o primeiro amparo bem-sucedido de cada rodada em Graça. A equipe decide entre sustentar aliados, remover aflições ou interromper a ofensiva inimiga.",
    "englishMechanic": "Once per round, Elaris turns a successful act of support into Grace. The team chooses between restoring allies, cleansing afflictions, and interrupting enemy pressure.",
    "lore": "Elaris protege o Paraíso e preserva a possibilidade de recomeçar. Sua tutela não apaga as perdas, mas impede que elas determinem o próximo passo.",
    "englishLore": "Elaris protects Paradise and preserves the possibility of a new beginning. This shelter does not erase loss, but keeps it from deciding the next step.",
    "synergyEloIds": [
      "criacao",
      "cura",
      "esperanca"
    ],
    "passive": {
      "name": "Primeira Graça",
      "englishName": "First Grace",
      "trigger": "support",
      "minimumHeal": 10,
      "requiresOtherAlly": true,
      "nonDefensive": true,
      "effect": {
        "generateEssence": {
          "resource": "graca",
          "amount": 1
        }
      },
      "description": "Uma vez por rodada, curar ao menos 10 de Vida de outro aliado gera 1 Graça.",
      "englishDescription": "Once per round, healing another ally for at least 10 Health generates 1 Grace."
    },
    "skills": [
      {
        "name": "Primeiro Fôlego",
        "englishName": "First Breath",
        "target": "ally",
        "heal": 12,
        "costs": {
          "graca": 1
        },
        "englishDescription": "Restores 12 Health to one ally."
      },
      {
        "name": "Véu do Amanhecer",
        "englishName": "Dawn Veil",
        "target": "ally",
        "shield": 9,
        "cleanse": true,
        "costs": {
          "graca": 1,
          "random": 1
        },
        "cooldown": 1,
        "englishDescription": "Grants one ally 9 Defense and removes harmful conditions from them."
      },
      {
        "name": "Adiar o Crepúsculo",
        "englishName": "Defer the Dusk",
        "target": "enemy",
        "damage": 12,
        "damageType": "energy",
        "weaken": 1,
        "costs": {
          "graca": 1,
          "random": 1
        },
        "cooldown": 1,
        "englishDescription": "Deals 12 spiritual damage to one enemy and Weakens it for 1 turn."
      }
    ],
    "defense": {
      "name": "Amparo Primordial",
      "englishName": "Primordial Shelter",
      "shield": 8
    }
  }
];

const antagonistProfiles = [
  {
    "id": "cain",
    "name": "Cain",
    "englishName": "Cain",
    "family": "cain",
    "version": 1,
    "eloId": "sangria",
    "elo": "Sangria",
    "englishElo": "Bloodshed",
    "realm": "Inferno",
    "color": "blood",
    "symbol": "✦",
    "affinity": "cinza",
    "npcOnly": true,
    "role": "Espelho de Violência",
    "englishRole": "Mirror of Violence",
    "combo": "Cobrar a culpa em sangue",
    "englishCombo": "Make Guilt Pay in Blood",
    "mechanic": "Cain marca o alvo, fere a própria guarda e acelera a execução quando encontra uma abertura.",
    "englishMechanic": "Cain Marks a target, wounds his own guard, and speeds up execution when he finds an opening.",
    "lore": "Cain é o espelho sombrio de Kael: a violência que não busca reparar o erro e transforma culpa em justificativa para continuar.",
    "englishLore": "Cain is Kael's dark mirror: violence that seeks no repair and turns guilt into an excuse to continue.",
    "synergyEloIds": [
      "sangria",
      "correntes-quebradas"
    ],
    "passive": {
      "name": "Culpa que Morde",
      "englishName": "Biting Guilt",
      "trigger": "hit",
      "requiresOwnMark": true,
      "effect": {
        "gainCharge": 1
      },
      "description": "Uma vez por rodada, ferir um alvo com a Marca de Cain concede 1 carga.",
      "englishDescription": "Once per round, hitting a target with Cain's Mark grants 1 charge."
    },
    "skills": [
      {
        "name": "Marca do Primeiro Erro",
        "englishName": "Mark of the First Mistake",
        "damage": 12,
        "cost": 1,
        "damageType": "physical",
        "mark": true,
        "markTurns": 2,
        "englishDescription": "Deals 12 physical damage to one enemy and Marks it for 2 turns."
      },
      {
        "name": "Repetir a Sentença",
        "englishName": "Repeat the Sentence",
        "damage": 15,
        "cost": 2,
        "damageType": "piercing",
        "combo": {
          "condition": "marked",
          "bonusDamage": 8,
          "consume": true
        },
        "englishDescription": "Deals 15 piercing damage to one enemy. Against a Marked target, it deals 8 bonus damage and consumes the Mark."
      },
      {
        "name": "Ferida Consentida",
        "englishName": "Willing Wound",
        "damage": 20,
        "cost": 2,
        "damageType": "physical",
        "selfDamage": 5,
        "englishDescription": "Deals 20 physical damage to one enemy; Cain loses 5 Health."
      }
    ],
    "defense": {
      "name": "Cicatriz de Sangue",
      "englishName": "Blood Scar",
      "shield": 6
    }
  },
  {
    "id": "lilith",
    "name": "Lilith",
    "englishName": "Lilith",
    "family": "lilith",
    "version": 1,
    "eloId": "vazio",
    "elo": "Vazio",
    "englishElo": "Void",
    "realm": "Inferno",
    "color": "void",
    "symbol": "◍",
    "affinity": "cinza",
    "npcOnly": true,
    "role": "Negação Radical",
    "englishRole": "Radical Refusal",
    "combo": "Apagar a esperança do plano",
    "englishCombo": "Erase Hope from the Plan",
    "mechanic": "Lilith interrompe apoio e castiga aliados que tentam se recuperar.",
    "englishMechanic": "Lilith interrupts support and punishes allies who try to recover.",
    "lore": "Lilith é a antítese de Naomi. Onde Naomi insiste em permanecer, Lilith recusa qualquer promessa de que ficar possa mudar alguma coisa.",
    "englishLore": "Lilith is Naomi's antithesis. Where Naomi insists on staying, Lilith refuses any promise that remaining can change anything.",
    "synergyEloIds": [
      "vazio",
      "esperanca"
    ],
    "passive": {
      "name": "Amanhã Negado",
      "englishName": "Tomorrow Denied",
      "trigger": "hit",
      "requiresExposed": true,
      "effect": {
        "sealSupportTarget": 1
      },
      "description": "Uma vez por rodada, ferir um alvo Exposto sela o apoio dele por 1 turno.",
      "englishDescription": "Once per round, hitting an Exposed target seals its support for 1 turn."
    },
    "skills": [
      {
        "name": "Recusa de Aurora",
        "englishName": "Dawn Refusal",
        "damage": 11,
        "cost": 1,
        "damageType": "energy",
        "weaken": 1,
        "englishDescription": "Deals 11 spiritual damage to one enemy and Weakens it for 1 turn."
      },
      {
        "name": "Esperança Interrompida",
        "englishName": "Interrupted Hope",
        "damage": 14,
        "cost": 2,
        "damageType": "piercing",
        "sealSupport": 1,
        "englishDescription": "Deals 14 piercing damage to one enemy and seals its support for 1 turn."
      },
      {
        "name": "Nada a Restaurar",
        "englishName": "Nothing to Restore",
        "damage": 18,
        "cost": 2,
        "damageType": "affliction",
        "healingBlock": 0.5,
        "dot": {
          "tag": "decadencia",
          "damage": 4,
          "turns": 2
        },
        "englishDescription": "Deals 18 affliction damage, halves healing received, and applies Decay for 4 damage over 2 turns."
      }
    ],
    "defense": {
      "name": "Véu sem Amanhã",
      "englishName": "Veil Without Tomorrow",
      "shield": 5
    }
  },
  {
    "id": "caliope",
    "name": "Calíope",
    "englishName": "Calliope",
    "family": "caliope",
    "version": 1,
    "eloId": "mentira",
    "elo": "Mentira",
    "englishElo": "Deceit",
    "realm": "Inferno",
    "color": "mirror",
    "symbol": "◇",
    "affinity": "essence",
    "npcOnly": true,
    "role": "Artista da Mentira",
    "englishRole": "Artist of Deceit",
    "combo": "Escrever a abertura antes da vítima",
    "englishCombo": "Write the Opening Before the Victim",
    "mechanic": "Calíope monta uma máscara, expõe o alvo e converte a própria marca em roubo.",
    "englishMechanic": "Calliope builds a mask, Exposes the target, and turns her Mark into theft.",
    "lore": "Calíope trata a mentira como arte e considera Vaas um imitador que parou antes de aprender a composição inteira.",
    "englishLore": "Calliope treats deception as an art and considers Vaas an imitator who stopped before learning the full composition.",
    "synergyEloIds": [
      "mentira",
      "silencio"
    ],
    "passive": {
      "name": "Assinatura Falsa",
      "englishName": "False Signature",
      "trigger": "hit",
      "requiresOwnMark": true,
      "effect": {
        "stealEssence": {
          "amount": 1
        }
      },
      "description": "Uma vez por rodada, ferir um alvo com a Marca própria rouba 1 Essência da reserva inimiga.",
      "englishDescription": "Once per round, hitting a target with Calliope's Mark steals 1 Essence from the enemy reserve."
    },
    "skills": [
      {
        "name": "Verso Plantado",
        "englishName": "Planted Verse",
        "damage": 9,
        "cost": 1,
        "damageType": "energy",
        "mark": true,
        "markTurns": 2,
        "englishDescription": "Deals 9 spiritual damage to one enemy and Marks it for 2 turns."
      },
      {
        "name": "Rima de Exposição",
        "englishName": "Exposing Rhyme",
        "damage": 13,
        "cost": 2,
        "damageType": "piercing",
        "expose": 1,
        "combo": {
          "condition": "marked",
          "bonusDamage": 6
        },
        "englishDescription": "Deals 13 piercing damage and Exposes one enemy, plus 6 damage if it has Calliope's Mark."
      },
      {
        "name": "Refrão Roubado",
        "englishName": "Stolen Refrain",
        "damage": 16,
        "cost": 2,
        "damageType": "affliction",
        "steal": 1,
        "sealSupport": 1,
        "englishDescription": "Deals 16 affliction damage, steals 1 Essence, and seals the target's support for 1 turn."
      }
    ],
    "defense": {
      "name": "Cortina de Espelhos",
      "englishName": "Mirror Curtain",
      "shield": 5
    }
  },
  {
    "id": "serena",
    "name": "Serena",
    "englishName": "Serena",
    "family": "serena",
    "version": 1,
    "eloId": "carne",
    "elo": "Carne",
    "englishElo": "Flesh",
    "realm": "Inferno",
    "color": "flesh",
    "symbol": "⌘",
    "affinity": "cinza",
    "npcOnly": true,
    "role": "Sombra do Passado",
    "englishRole": "Shadow of the Past",
    "combo": "Transformar perda em controle",
    "englishCombo": "Turn Loss Into Control",
    "mechanic": "Serena usa marcas nervosas e bloqueio de cura para reabrir as feridas de Diana.",
    "englishMechanic": "Serena uses nerve Marks and healing denial to reopen Diana's wounds.",
    "lore": "Serena liga-se ao passado de Diana e conhece a perda que ensinou a médica a proteger os outros. Usa essa lembrança como uma arma precisa.",
    "englishLore": "Serena is tied to Diana's past and knows the loss that taught the doctor to protect others. She uses that memory as a precise weapon.",
    "synergyEloIds": [
      "carne",
      "cura"
    ],
    "passive": {
      "name": "Lembrança Invasiva",
      "englishName": "Intrusive Memory",
      "trigger": "hit",
      "requiresOwnMark": true,
      "effect": {
        "weakenTarget": 1
      },
      "description": "Uma vez por rodada, ferir um alvo com a Marca Nervosa própria o Enfraquece por 1 turno.",
      "englishDescription": "Once per round, hitting a target with Serena's Nerve Mark Weakens it for 1 turn."
    },
    "skills": [
      {
        "name": "Marca Nervosa",
        "englishName": "Nerve Mark",
        "damage": 10,
        "cost": 1,
        "damageType": "affliction",
        "mark": true,
        "markTurns": 2,
        "englishDescription": "Deals 10 affliction damage to one enemy and Marks it for 2 turns."
      },
      {
        "name": "Memória Reaberta",
        "englishName": "Reopened Memory",
        "damage": 14,
        "cost": 2,
        "damageType": "piercing",
        "combo": {
          "condition": "marked",
          "bonusDamage": 7
        },
        "englishDescription": "Deals 14 piercing damage to one enemy, plus 7 against a target with Serena's Mark."
      },
      {
        "name": "Pulso de Interdição",
        "englishName": "Pulse of Interdiction",
        "damage": 18,
        "cost": 2,
        "damageType": "energy",
        "healingBlock": 0.5,
        "sealSupport": 1,
        "englishDescription": "Deals 18 spiritual damage, halves healing received, and seals support for 1 turn."
      }
    ],
    "defense": {
      "name": "Pele de Lembrança",
      "englishName": "Skin of Memory",
      "shield": 6
    }
  },
  {
    "id": "placido",
    "name": "Plácido",
    "englishName": "Placido",
    "family": "placido",
    "version": 1,
    "eloId": "coroa",
    "elo": "Coroa",
    "englishElo": "Crown",
    "realm": "Inferno",
    "color": "crown",
    "symbol": "♜",
    "affinity": "ruptura",
    "npcOnly": true,
    "role": "Arquiteto da Ordem",
    "englishRole": "Architect of Order",
    "combo": "Manter o sistema a qualquer custo",
    "englishCombo": "Preserve the System at Any Cost",
    "mechanic": "Plácido marca uma infração, sela o apoio e protege a estrutura que pretende conservar.",
    "englishMechanic": "Placido Marks an infraction, seals support, and protects the structure he means to preserve.",
    "lore": "Plácido defende a ordem dos Reinos a qualquer custo. Para ele, uma regra injusta ainda é preferível a um mundo que não possa ser controlado.",
    "englishLore": "Placido defends the order of the Kingdoms at any cost. To him, an unjust rule is still preferable to a world he cannot control.",
    "synergyEloIds": [
      "coroa",
      "justica"
    ],
    "passive": {
      "name": "Regra Aplicada",
      "englishName": "Rule Enforced",
      "trigger": "attack",
      "requiresOwnMark": true,
      "effect": {
        "sealSupportTarget": 1
      },
      "description": "Uma vez por rodada, atacar um alvo com a Marca de Plácido também sela o apoio dele por 1 turno.",
      "englishDescription": "Once per round, attacking a target with Placido's Mark also seals its support for 1 turn."
    },
    "skills": [
      {
        "name": "Artigo de Ferro",
        "englishName": "Iron Article",
        "damage": 12,
        "cost": 1,
        "damageType": "physical",
        "mark": true,
        "markTurns": 2,
        "englishDescription": "Deals 12 physical damage to one enemy and Marks it for 2 turns."
      },
      {
        "name": "Interdição Formal",
        "englishName": "Formal Interdiction",
        "damage": 15,
        "cost": 2,
        "damageType": "piercing",
        "sealAttack": 1,
        "englishDescription": "Deals 15 piercing damage to one enemy and seals its offensive abilities for 1 turn."
      },
      {
        "name": "Cláusula de Continuidade",
        "englishName": "Continuity Clause",
        "target": "team",
        "shield": 8,
        "reduce": 3,
        "cost": 2,
        "englishDescription": "Grants each ally 8 Defense and reduces damage they take by 3 for 1 turn."
      }
    ],
    "defense": {
      "name": "Estado de Exceção",
      "englishName": "State of Exception",
      "shield": 7
    }
  },
  {
    "id": "baal",
    "name": "Baal",
    "englishName": "Baal",
    "family": "baal",
    "version": 1,
    "eloId": "chama",
    "elo": "Chama",
    "englishElo": "Flame",
    "realm": "Inferno",
    "color": "ember",
    "symbol": "♨",
    "affinity": "cinza",
    "npcOnly": true,
    "role": "Fanático de Inferno",
    "englishRole": "Inferno Zealot",
    "combo": "Queimar para provar devoção",
    "englishCombo": "Burn to Prove Devotion",
    "mechanic": "Baal espalha Queimadura, sacrifica a própria Vida e ganha força quando alguém cai.",
    "englishMechanic": "Baal spreads Burn, sacrifices his own Health, and gains strength when someone falls.",
    "lore": "Baal é um fanático de Inferno. A crueldade é sua devoção; ele não busca redenção nem acredita que a violência precise de uma justificativa.",
    "englishLore": "Baal is an Inferno zealot. Cruelty is his devotion; he seeks no redemption and believes violence needs no justification.",
    "synergyEloIds": [
      "chama",
      "coroa"
    ],
    "passive": {
      "name": "Liturgia da Brasa",
      "englishName": "Ember Liturgy",
      "trigger": "kill",
      "effect": {
        "generateEssence": {
          "resource": "cinza",
          "amount": 1
        },
        "gainCharge": 1
      },
      "description": "Ao derrubar uma alma, gera 1 Cinza e ganha 1 carga; uma vez por rodada.",
      "englishDescription": "When he defeats a soul, Baal generates 1 Ash and gains 1 charge, once per round."
    },
    "skills": [
      {
        "name": "Sermão Incendiário",
        "englishName": "Incendiary Sermon",
        "damage": 9,
        "cost": 1,
        "damageType": "affliction",
        "dot": {
          "tag": "queimadura",
          "damage": 5,
          "turns": 2
        },
        "englishDescription": "Deals 9 affliction damage and applies Burn for 5 damage over 2 turns."
      },
      {
        "name": "Fé a Ferro e Fogo",
        "englishName": "Faith by Fire and Iron",
        "damage": 15,
        "cost": 2,
        "damageType": "physical",
        "selfDamage": 4,
        "dot": {
          "tag": "queimadura",
          "damage": 4,
          "turns": 2
        },
        "englishDescription": "Deals 15 physical damage, applies Burn for 4 damage over 2 turns, and costs Baal 4 Health."
      },
      {
        "name": "Pira dos Fiéis",
        "englishName": "Pyre of the Faithful",
        "target": "all-enemies",
        "damage": 10,
        "cost": 2,
        "damageType": "energy",
        "dot": {
          "tag": "queimadura",
          "damage": 3,
          "turns": 2
        },
        "englishDescription": "Deals 10 spiritual damage to all enemies and applies Burn for 3 damage over 2 turns."
      }
    ],
    "defense": {
      "name": "Manto de Cinzas",
      "englishName": "Ash Mantle",
      "shield": 5
    }
  },
  {
    "id": "atlas",
    "name": "Atlas",
    "englishName": "Atlas",
    "family": "atlas",
    "version": 1,
    "eloId": "coroa",
    "elo": "Coroa",
    "englishElo": "Crown",
    "realm": "Inferno",
    "color": "crown",
    "symbol": "♜",
    "affinity": "ruptura",
    "npcOnly": true,
    "role": "Carregador do Sistema",
    "englishRole": "Bearer of the System",
    "combo": "Conter tudo sob um único comando",
    "englishCombo": "Contain Everything Under One Command",
    "mechanic": "Atlas acumula carga, protege o trio e converte pressão em dano pesado.",
    "englishMechanic": "Atlas builds charge, protects the team, and converts pressure into heavy damage.",
    "lore": "Atlas quer carregar ou controlar o sistema inteiro. Acredita que, se suportar peso suficiente, ninguém mais precisará escolher o que fazer.",
    "englishLore": "Atlas wants to carry or control the entire system. He believes that if he bears enough weight, no one else will need to choose what to do.",
    "synergyEloIds": [
      "coroa",
      "vazio"
    ],
    "passive": {
      "name": "Peso Acumulado",
      "englishName": "Accumulated Weight",
      "trigger": "damaged",
      "requiresLifeLoss": true,
      "effect": {
        "gainCharge": 1,
        "shield": 3
      },
      "description": "Uma vez por rodada, depois de perder Vida para uma habilidade, Atlas ganha 1 carga e 3 de Defesa.",
      "englishDescription": "Once per round, after losing Health to an ability, Atlas gains 1 charge and 3 Defense."
    },
    "skills": [
      {
        "name": "Ombro do Mundo",
        "englishName": "World-Bearing Shoulder",
        "target": "team",
        "shield": 8,
        "cost": 1,
        "englishDescription": "Grants each ally 8 Defense."
      },
      {
        "name": "Peso sem Medida",
        "englishName": "Measureless Weight",
        "damage": 15,
        "cost": 2,
        "damageType": "physical",
        "shieldToDamage": {
          "ratio": 0.25,
          "cap": 10,
          "consume": true
        },
        "englishDescription": "Deals 15 physical damage, adds 25% of Atlas's Defense to the hit (up to 10), and consumes his Defense."
      },
      {
        "name": "Colapso de Autoridade",
        "englishName": "Collapse of Authority",
        "damage": 21,
        "cost": 2,
        "damageType": "piercing",
        "stun": 1,
        "combo": {
          "condition": "exposed",
          "bonusDamage": 6
        },
        "englishDescription": "Deals 21 piercing damage and Stuns one enemy for 1 turn, plus 6 damage against an Exposed target."
      }
    ],
    "defense": {
      "name": "Sustentar o Céu",
      "englishName": "Hold Up the Sky",
      "shield": 8
    }
  },
  {
    "id": "merlindrope",
    "name": "Merlindrope",
    "englishName": "Merlindrope",
    "family": "merlindrope",
    "version": 1,
    "eloId": "coroa",
    "elo": "Coroa",
    "englishElo": "Crown",
    "realm": "Inferno",
    "color": "crown",
    "symbol": "♜",
    "affinity": "essence",
    "npcOnly": true,
    "role": "Arquiteto de Prisões",
    "englishRole": "Architect of Prisons",
    "combo": "Escrever a regra e fechar a saída",
    "englishCombo": "Write the Rule and Close the Exit",
    "mechanic": "Merlindrope altera o acesso a apoio, controla a reserva e prende o alvo em condições sucessivas.",
    "englishMechanic": "Merlindrope restricts access to support, controls the reserve, and traps targets in successive conditions.",
    "lore": "Merlindrope arquitetou regras e prisões existenciais. Não precisa vencer uma disputa se puder redesenhar o espaço em que ela acontece.",
    "englishLore": "Merlindrope designed rules and existential prisons. He does not need to win a contest if he can redesign the space where it takes place.",
    "synergyEloIds": [
      "coroa",
      "silencio"
    ],
    "passive": {
      "name": "Cláusula de Prisão",
      "englishName": "Prison Clause",
      "trigger": "hit",
      "minimumShield": 5,
      "effect": {
        "sealSupportTarget": 1
      },
      "description": "Uma vez por rodada, ferir um alvo com a Marca própria sela o apoio dele por 1 turno.",
      "englishDescription": "Once per round, hitting a target with Merlindrope's Mark seals its support for 1 turn.",
      "requiresOwnMark": true
    },
    "skills": [
      {
        "name": "Grade de Éter",
        "englishName": "Aether Grate",
        "damage": 11,
        "cost": 1,
        "damageType": "energy",
        "mark": true,
        "markTurns": 2,
        "englishDescription": "Deals 11 spiritual damage to one enemy and Marks it for 2 turns."
      },
      {
        "name": "Porta que Não Abre",
        "englishName": "Door That Will Not Open",
        "damage": 14,
        "cost": 2,
        "damageType": "piercing",
        "sealSupport": 1,
        "sealAttack": 1,
        "cooldown": 1,
        "englishDescription": "Deals 14 piercing damage and seals offensive abilities and support for 1 turn."
      },
      {
        "name": "Celas Concêntricas",
        "englishName": "Concentric Cells",
        "target": "all-enemies",
        "damage": 9,
        "cost": 2,
        "damageType": "energy",
        "weaken": 1,
        "englishDescription": "Deals 9 spiritual damage to all enemies and Weakens them for 1 turn."
      }
    ],
    "defense": {
      "name": "Parede de Regras",
      "englishName": "Wall of Rules",
      "shield": 7
    }
  },
  {
    "id": "bulkir",
    "name": "Bulkir",
    "englishName": "Bulkir",
    "family": "bulkir",
    "version": 1,
    "eloId": "fome",
    "elo": "Fome",
    "englishElo": "Hunger",
    "realm": "Inferno",
    "color": "hunger",
    "symbol": "◉",
    "affinity": "ruptura",
    "npcOnly": true,
    "role": "Devorador de Identidade",
    "englishRole": "Identity Devourer",
    "combo": "Quebrar até o nome desaparecer",
    "englishCombo": "Break Until the Name Disappears",
    "mechanic": "Bulkir quebra Defesa, ganha carga e concentra dano no alvo que já está ferido.",
    "englishMechanic": "Bulkir breaks Defense, gains charge, and concentrates damage on an already wounded target.",
    "lore": "Bulkir consome identidade pela força bruta. O golpe não termina quando o corpo cai: ele continua até que ninguém lembre quem estava ali.",
    "englishLore": "Bulkir consumes identity through brute force. The blow does not end when the body falls; it continues until no one remembers who was there.",
    "synergyEloIds": [
      "fome",
      "carne"
    ],
    "passive": {
      "name": "Fome de Nomes",
      "englishName": "Hunger for Names",
      "trigger": "kill",
      "effect": {
        "heal": 6,
        "gainCharge": 1
      },
      "description": "Ao derrubar uma alma, Bulkir recupera 6 de Vida e ganha 1 carga; uma vez por rodada.",
      "englishDescription": "When he defeats a soul, Bulkir restores 6 Health and gains 1 charge, once per round."
    },
    "skills": [
      {
        "name": "Punho que Apaga",
        "englishName": "Erasing Fist",
        "damage": 15,
        "cost": 1,
        "damageType": "physical",
        "stripShield": 10,
        "englishDescription": "Removes 10 Defense, then deals 15 physical damage to one enemy."
      },
      {
        "name": "Mordida de Identidade",
        "englishName": "Identity Bite",
        "damage": 17,
        "cost": 2,
        "damageType": "piercing",
        "lifesteal": 0.15,
        "englishDescription": "Deals 17 piercing damage to one enemy and restores 15% of damage dealt as Health."
      },
      {
        "name": "Esmagar o Último Vestígio",
        "englishName": "Crush the Last Trace",
        "damage": 23,
        "cost": 2,
        "damageType": "physical",
        "missingHpDamage": {
          "step": 25,
          "amount": 3,
          "cap": 9
        },
        "englishDescription": "Deals 23 physical damage to one enemy, plus 3 damage for each 25 Health Bulkir has lost, up to 9."
      }
    ],
    "defense": {
      "name": "Carapaça Faminta",
      "englishName": "Hungry Carapace",
      "shield": 7
    }
  },
  {
    "id": "voronir",
    "name": "Voronir",
    "englishName": "Voronir",
    "family": "voronir",
    "version": 1,
    "eloId": "vazio",
    "elo": "Vazio",
    "englishElo": "Void",
    "realm": "Inferno",
    "color": "void",
    "symbol": "◍",
    "affinity": "essence",
    "npcOnly": true,
    "role": "Caçador de Receptáculos",
    "englishRole": "Vessel Hunter",
    "combo": "Rastrear o que não pertence",
    "englishCombo": "Track What Does Not Belong",
    "mechanic": "Voronir marca anomalias, rouba Essência e sela a tentativa de escapar.",
    "englishMechanic": "Voronir Marks anomalies, steals Essence, and seals attempts to escape.",
    "lore": "Voronir caça almas receptivas e representa uma ameaça direta a Nilo. Não quer entender a anomalia; quer capturá-la antes que ela contamine o sistema.",
    "englishLore": "Voronir hunts receptive souls and poses a direct threat to Nilo. He does not want to understand the anomaly; he wants to capture it before it contaminates the system.",
    "synergyEloIds": [
      "vazio",
      "correntes-quebradas"
    ],
    "passive": {
      "name": "Rastreamento de Anomalia",
      "englishName": "Anomaly Tracking",
      "trigger": "hit",
      "requiresOwnMark": true,
      "effect": {
        "stealEssence": {
          "amount": 1
        },
        "gainCharge": 1
      },
      "description": "Uma vez por rodada, ferir um alvo com a Marca de Voronir rouba 1 Essência e concede 1 carga.",
      "englishDescription": "Once per round, hitting a target with Voronir's Mark steals 1 Essence and grants 1 charge."
    },
    "skills": [
      {
        "name": "Marca de Captura",
        "englishName": "Capture Mark",
        "damage": 10,
        "cost": 1,
        "damageType": "piercing",
        "mark": true,
        "markTurns": 2,
        "englishDescription": "Deals 10 piercing damage to one enemy and Marks it for 2 turns."
      },
      {
        "name": "Rede de Contenção",
        "englishName": "Containment Net",
        "damage": 15,
        "cost": 2,
        "damageType": "energy",
        "stun": 1,
        "englishDescription": "Deals 15 spiritual damage to one enemy and Stuns it for 1 turn."
      },
      {
        "name": "Captura do Receptáculo",
        "englishName": "Vessel Capture",
        "damage": 18,
        "cost": 2,
        "damageType": "piercing",
        "steal": 1,
        "sealSupport": 1,
        "combo": {
          "condition": "marked",
          "bonusDamage": 7
        },
        "englishDescription": "Deals 18 piercing damage, steals 1 Essence, seals support for 1 turn, and deals 7 bonus damage to a Marked target."
      }
    ],
    "defense": {
      "name": "Armadilha de Vazio",
      "englishName": "Void Snare",
      "shield": 6
    }
  },
  {
    "id": "icarus",
    "name": "Icarus",
    "englishName": "Icarus",
    "family": "icarus",
    "version": 1,
    "eloId": "correntes-quebradas",
    "elo": "Limbo",
    "englishElo": "Limbo",
    "realm": "Limbo",
    "color": "limbo",
    "symbol": "⟲",
    "affinity": "ruptura",
    "npcOnly": true,
    "role": "Portador da Fenda",
    "englishRole": "Rift Bearer",
    "combo": "Tocar o proibido e arrastar outros",
    "englishCombo": "Touch the Forbidden and Drag Others Along",
    "mechanic": "Icarus usa a própria ruptura como arma e espalha o risco para o trio inimigo.",
    "englishMechanic": "Icarus uses his own rupture as a weapon and spreads the risk to the opposing team.",
    "lore": "Icarus quis tocar algo que não devia. A fenda que abriu nunca se fechou por completo e agora arrasta outras almas para perto do mesmo limite.",
    "englishLore": "Icarus tried to touch something he should not have. The rift he opened never fully closed and now drags other souls toward the same edge.",
    "synergyEloIds": [
      "correntes-quebradas",
      "chama"
    ],
    "passive": {
      "name": "Queda Compartilhada",
      "englishName": "Shared Fall",
      "trigger": "damaged",
      "requiresLifeLoss": true,
      "effect": {
        "generateEssence": {
          "resource": "ruptura",
          "amount": 1
        },
        "damageAttacker": 4
      },
      "description": "Uma vez por rodada, depois de perder Vida para uma habilidade, Icarus gera 1 Ruptura e causa 4 de dano de aflição ao agressor.",
      "englishDescription": "Once per round, after losing Health to an ability, Icarus generates 1 Rupture and deals 4 affliction damage to the attacker."
    },
    "skills": [
      {
        "name": "Asa Fraturada",
        "englishName": "Fractured Wing",
        "damage": 13,
        "cost": 1,
        "damageType": "piercing",
        "expose": 1,
        "englishDescription": "Deals 13 piercing damage to one enemy and Exposes it."
      },
      {
        "name": "Sol Proibido",
        "englishName": "Forbidden Sun",
        "damage": 16,
        "cost": 2,
        "damageType": "energy",
        "selfDamage": 4,
        "stun": 1,
        "englishDescription": "Deals 16 spiritual damage to one enemy, Stuns it for 1 turn, and costs Icarus 4 Health."
      },
      {
        "name": "Fenda que Arrasta",
        "englishName": "Dragging Rift",
        "target": "all-enemies",
        "damage": 12,
        "cost": 2,
        "damageType": "affliction",
        "dot": {
          "tag": "queimadura",
          "damage": 4,
          "turns": 2
        },
        "englishDescription": "Deals 12 affliction damage to all enemies and applies Burn for 4 damage over 2 turns."
      }
    ],
    "defense": {
      "name": "Altitude Impossível",
      "englishName": "Impossible Altitude",
      "shield": 6
    }
  }
];

const slotIds = ["impulso", "tecnica", "voto", "despertar"];
const phraseCopy = {};
export const protagonistCharacterNames = Object.fromEntries([...protagonistProfiles, ...supportingProfiles, ...antagonistProfiles].map((profile) => [profile.name, profile.englishName]));

function costsFor(ability) {
  if (ability.costs) return ability.costs;
  if (ability.cost === 0) return {};
  if (ability.cost === 1) return { affinity: 1 };
  if (ability.cost === 2) return { affinity: 1, essence: 1 };
  return { affinity: 2, essence: 1 };
}
function abilityKind(ability) {
  if (ability.defense) return "defense";
  if (ability.damage) return ability.stun || ability.weaken || ability.mark ? "control" : "strike";
  return ability.shield || ability.counter || ability.reduce ? "guard" : "support";
}
function registerPhrase(source, target) {
  if (source && target) phraseCopy[source] = target;
}
function compileProfile(profile, index) {
  const raw = [...profile.skills, { ...profile.defense, target: "self", costs: { random: 1 }, invulnerable: 1, cooldown: 4, defense: true }];
  const abilities = raw.map((source, abilityIndex) => {
    const { englishName, englishDescription, ...ability } = source;
    const compiled = {
      ...ability,
      ...(ability.target ? {} : ability.damage ? { target: "enemy" } : {}),
      id: ability.defense ? "despertar" : (slotIds[abilityIndex] || `tecnica-${abilityIndex+1}`),
      costs: costsFor(ability),
      cooldown: ability.cooldown || 0,
      kind: abilityKind(ability),
      description: describeAbility(ability)
    };
    registerPhrase(source.name, englishName);
    const translatedDescription = englishDescription || [
      ability.heal ? "Restores " + ability.heal + " Health." : "",
      ability.shield ? "Grants " + ability.shield + " destructible Defense." : "",
      ability.invulnerable ? "The user is Invulnerable for 1 turn." : ""
    ].filter(Boolean).join(" ");
    registerPhrase(compiled.description, translatedDescription);
    return compiled;
  });
  registerPhrase(profile.name, profile.englishName);
  if (profile.identityTitle && profile.englishIdentityTitle) registerPhrase(profile.identityTitle, profile.englishIdentityTitle);
  registerPhrase(profile.elo, profile.englishElo);
  registerPhrase(profile.role, profile.englishRole);
  registerPhrase(profile.combo, profile.englishCombo);
  registerPhrase(profile.mechanic, profile.englishMechanic);
  registerPhrase(profile.lore, profile.englishLore);
  registerPhrase(profile.passive.name, profile.passive.englishName);
  registerPhrase(profile.passive.description, profile.passive.englishDescription);

  return {
    id: profile.id,
    name: profile.name,
    aliases: profile.aliases || [],
    realm: profile.realm,
    elo: profile.elo,
    eloId: profile.eloId,
    title: profile.role,
    englishName: profile.englishName,
    identityTitle: profile.identityTitle || null,
    englishIdentityTitle: profile.englishIdentityTitle || null,
    role: profile.role,
    roleHint: profile.combo,
    combo: profile.combo,
    mechanic: profile.mechanic,
    passive: { ...profile.passive, type: "triggered" },
    abilities,
    indexInElo: index,
    color: profile.color,
    symbol: profile.symbol,
    affinity: profile.affinity,
    art: null,
    maxHp: 100,
    starter: false,
    unlockedByDefault: false,
    protagonist: profile.protagonist !== false,
    storyCharacter: true,
    protagonistFamily: profile.family,
    protagonistVersion: profile.version,
    storyFamily: profile.family,
    storyVersion: profile.version,
    synergyEloIds: [...new Set([profile.eloId, ...profile.synergyEloIds])],
    flavor: profile.lore,
    lore: profile.lore,
    risk: profile.realm === "Limbo",
    npcOnly: Boolean(profile.npcOnly)
  };
}

const indexes = { "correntes-quebradas": 11, esperanca: 5, mentira: 6, cura: 5, vazio: 6, coroa: 6, carne: 6, verdade: 5, fome: 6, podridao: 6, silencio: 6, protecao: 5, sangria: 6, chama: 6 };
const compileList = list => list.map(profile => {
  const index = indexes[profile.eloId] || 0;
  indexes[profile.eloId] = index + 1;
  return compileProfile(profile, index);
});
export const protagonistCharacters = compileList(protagonistProfiles);
export const supportingCharacters = compileList(supportingProfiles.map(profile => ({ ...profile, protagonist: false })));
export const antagonistCharacters = compileList(antagonistProfiles.map(profile => ({ ...profile, protagonist: false, npcOnly: true })));
export const protagonistEnglishPhrases = Object.freeze({ ...phraseCopy });
