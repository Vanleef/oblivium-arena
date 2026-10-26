import { describeAbility } from "./kits.js";

const profiles = [
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
    "combo": "Absorção sem escolha",
    "englishCombo": "Unchosen Absorption",
    "mechanic": "Nilo absorve Essências ao gastar recursos; alterna entre roubo, guarda e descarga.",
    "englishMechanic": "Nilo absorbs Essence when he spends resources, shifting between theft, guard, and discharge.",
    "lore": "Passou a vida em coma e nunca pôde ser vinculado a um Elo. No Limbo, seu corpo se tornou receptivo às quatro Essências — mesmo quando ele tenta recusá-las.",
    "englishLore": "He spent his life in a coma and could never be bound to a Bond. In Limbo, his body became receptive to all four Essences, even when he tried to refuse them.",
    "synergyEloIds": [
      "correntes-quebradas"
    ],
    "passive": {
      "name": "Receptáculo Aberto",
      "englishName": "Open Vessel",
      "trigger": "essenceSpent",
      "effect": {
        "generateEssence": {
          "resourceFromForm": true,
          "amount": 1
        }
      },
      "description": "A primeira vez por rodada que Nilo gasta Essência, gera 1 Essência de sua afinidade.",
      "englishDescription": "The first time each round Nilo spends Essence, he generates 1 Essence matching his affinity."
    },
    "skills": [
      {
        "name": "Sucção de Éter",
        "englishName": "Aether Draw",
        "damage": 10,
        "cost": 1,
        "damageType": "energy",
        "steal": 1,
        "englishDescription": "Deals 10 spiritual damage to one enemy and steals 1 Essence from the enemy reserve."
      },
      {
        "name": "Recipiente Rachado",
        "englishName": "Cracked Vessel",
        "target": "self",
        "shield": 9,
        "gainCharge": 1,
        "cost": 2,
        "englishDescription": "Grants Nilo 9 Defense and 1 charge."
      },
      {
        "name": "Descarga Indócil",
        "englishName": "Unruly Discharge",
        "damage": 16,
        "cost": 2,
        "damageType": "piercing",
        "perChargeDamage": 3,
        "spendCharge": true,
        "englishDescription": "Deals 16 piercing damage to one enemy, plus 3 for each charge spent."
      }
    ],
    "defense": {
      "name": "Pele do Limbo",
      "englishName": "Limbo Skin",
      "shield": 5
    }
  },
  {
    "id": "nilo-o-prefacio",
    "name": "Nilo, o Prefácio",
    "englishName": "Nilo, the Preface",
    "family": "nilo",
    "version": 2,
    "eloId": "correntes-quebradas",
    "elo": "Anômalo",
    "englishElo": "Anomaly",
    "realm": "Limbo",
    "color": "limbo",
    "symbol": "⟲",
    "affinity": "essence",
    "role": "Abertura Improvável",
    "englishRole": "Unlikely Opening",
    "combo": "A primeira palavra",
    "englishCombo": "The First Word",
    "mechanic": "As primeiras ações de Nilo marcam a rota e alimentam a próxima escolha.",
    "englishMechanic": "Nilo's opening actions mark the route and fuel the next choice.",
    "lore": "O Prefácio é a lembrança de Nilo antes de qualquer nome para o que lhe acontecia: uma alma desperta, ainda sem saber o que o Limbo cobraria.",
    "englishLore": "The Preface is Nilo's memory from before he had a name for what was happening: an awakened soul, still unaware of what Limbo would demand.",
    "synergyEloIds": [
      "correntes-quebradas"
    ],
    "passive": {
      "name": "Primeira Centelha",
      "englishName": "First Spark",
      "trigger": "firstHit",
      "oncePerBattle": true,
      "effect": {
        "generateEssence": {
          "resource": "essence",
          "amount": 1
        }
      },
      "description": "O primeiro golpe ofensivo de Nilo em cada combate gera 1 Éter.",
      "englishDescription": "Nilo's first offensive hit in each battle generates 1 Aether."
    },
    "skills": [
      {
        "name": "Palavra Inicial",
        "englishName": "Opening Word",
        "damage": 10,
        "cost": 1,
        "damageType": "energy",
        "mark": true,
        "markTurns": 2,
        "englishDescription": "Deals 10 spiritual damage to one enemy and Marks it for 2 turns."
      },
      {
        "name": "Frase de Passagem",
        "englishName": "Passage Phrase",
        "damage": 14,
        "cost": 2,
        "damageType": "piercing",
        "combo": {
          "condition": "marked",
          "bonusDamage": 7,
          "consume": true
        },
        "englishDescription": "Deals 14 piercing damage to one enemy. Against a Marked target, it deals 7 bonus damage and consumes the setup."
      },
      {
        "name": "Margem Reescrita",
        "englishName": "Rewritten Margin",
        "target": "self",
        "shield": 8,
        "generateEssence": {
          "resource": "random",
          "amount": 1
        },
        "cost": 2,
        "englishDescription": "Grants Nilo 8 Defense and generates 1 random Essence."
      }
    ],
    "defense": {
      "name": "Pausa entre Linhas",
      "englishName": "Pause Between Lines",
      "shield": 5
    }
  },
  {
    "id": "nilo-o-epilogo",
    "name": "Nilo, o Epílogo",
    "englishName": "Nilo, the Epilogue",
    "family": "nilo",
    "version": 3,
    "eloId": "correntes-quebradas",
    "elo": "Anômalo",
    "englishElo": "Anomaly",
    "realm": "Limbo",
    "color": "limbo",
    "symbol": "⟲",
    "affinity": "ruptura",
    "role": "Sobrevivente do Eco",
    "englishRole": "Echo Survivor",
    "combo": "O fim que ainda responde",
    "englishCombo": "An Ending That Answers",
    "mechanic": "A agressão sofrida vira carga e permite devolver a pressão sem apagar o custo.",
    "englishMechanic": "Incoming harm becomes charge, letting Nilo return pressure without erasing its cost.",
    "lore": "Quando a travessia parecia terminada, Nilo continuou respondendo. O Epílogo não encerra a história: ele transforma o que restou em força para o próximo ato.",
    "englishLore": "When the crossing seemed over, Nilo kept answering. The Epilogue does not end the story; it turns what remains into strength for the next act.",
    "synergyEloIds": [
      "correntes-quebradas"
    ],
    "passive": {
      "name": "Depois do Impacto",
      "englishName": "After the Impact",
      "trigger": "damaged",
      "requiresLifeLoss": true,
      "effect": {
        "gainCharge": 1,
        "heal": 4
      },
      "description": "Uma vez por rodada, depois de perder Vida para uma habilidade, Nilo ganha 1 carga e recupera 4 de Vida.",
      "englishDescription": "Once per round, after losing Health to an ability, Nilo gains 1 charge and restores 4 Health."
    },
    "skills": [
      {
        "name": "Última Nota",
        "englishName": "Last Note",
        "damage": 8,
        "cost": 1,
        "damageType": "affliction",
        "dot": {
          "tag": "decadencia",
          "damage": 4,
          "turns": 2
        },
        "englishDescription": "Deals 8 affliction damage to one enemy and applies Decay for 4 damage over 2 turns."
      },
      {
        "name": "Fôlego Recolhido",
        "englishName": "Gathered Breath",
        "target": "self",
        "heal": 8,
        "shield": 8,
        "cost": 2,
        "englishDescription": "Restores 8 Health to Nilo and grants him 8 Defense."
      },
      {
        "name": "Ponto sem Retorno",
        "englishName": "Point of No Return",
        "damage": 18,
        "cost": 2,
        "damageType": "piercing",
        "missingHpDamage": {
          "step": 25,
          "amount": 3,
          "cap": 9
        },
        "englishDescription": "Deals 18 piercing damage to one enemy, plus 3 damage for each 25 Health Nilo has lost, up to 9."
      }
    ],
    "defense": {
      "name": "Fecho Incompleto",
      "englishName": "Unfinished Close",
      "shield": 6
    }
  },
  {
    "id": "o-eco-de-nilo",
    "name": "O Eco de Nilo",
    "englishName": "Nilo's Echo",
    "family": "nilo",
    "version": 4,
    "eloId": "correntes-quebradas",
    "elo": "Anômalo",
    "englishElo": "Anomaly",
    "realm": "Limbo",
    "color": "limbo",
    "symbol": "⟲",
    "affinity": "ruptura",
    "role": "Ressonância Anômala",
    "englishRole": "Anomalous Resonance",
    "combo": "Devolver o que foi tomado",
    "englishCombo": "Return What Was Taken",
    "mechanic": "O Eco explora alvos preparados e devolve parte da Essência que atravessou Nilo.",
    "englishMechanic": "The Echo exploits prepared targets and returns some of the Essence that passed through Nilo.",
    "lore": "Já não é possível separar Nilo do que ele absorveu. O Eco luta como uma presença própria, repetindo os gestos que Nilo ainda não reconhece como seus.",
    "englishLore": "Nilo can no longer be separated from what he absorbed. The Echo fights as its own presence, repeating gestures Nilo does not yet recognize as his.",
    "synergyEloIds": [
      "correntes-quebradas"
    ],
    "passive": {
      "name": "Ressonância Devolvida",
      "englishName": "Returned Resonance",
      "trigger": "hit",
      "requiresExposed": true,
      "effect": {
        "drainEssence": {
          "amount": 1
        }
      },
      "description": "Uma vez por rodada, ferir um alvo Exposto drena 1 Essência da reserva inimiga.",
      "englishDescription": "Once per round, hitting an Exposed target drains 1 Essence from the enemy reserve."
    },
    "skills": [
      {
        "name": "Réplica Instável",
        "englishName": "Unstable Replica",
        "damage": 12,
        "cost": 1,
        "damageType": "energy",
        "weaken": 1,
        "englishDescription": "Deals 12 spiritual damage to one enemy and Weakens it for 1 turn."
      },
      {
        "name": "Roubo de Contorno",
        "englishName": "Borrowed Outline",
        "damage": 11,
        "cost": 2,
        "damageType": "piercing",
        "stripShield": 12,
        "expose": 1,
        "englishDescription": "Removes 12 Defense from one enemy, then deals 11 piercing damage and Exposes it."
      },
      {
        "name": "Pulso Repetido",
        "englishName": "Repeated Pulse",
        "damage": 17,
        "cost": 2,
        "damageType": "energy",
        "combo": {
          "condition": "exposed",
          "bonusDamage": 8
        },
        "englishDescription": "Deals 17 spiritual damage to one enemy, plus 8 against an Exposed target."
      }
    ],
    "defense": {
      "name": "Forma de Retorno",
      "englishName": "Returning Form",
      "shield": 5
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
    "lore": "Kael serviu como soldado e executor até matar a pessoa errada. Entregou-se à morte logo depois; a culpa manteve seu nome inteiro quando o Elo tentou dissolvê-lo.",
    "englishLore": "Kael served as a soldier and enforcer until he killed the wrong person. He surrendered to death soon after; guilt kept his name intact when the Bond tried to dissolve him.",
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
        "name": "Sutura do Elo",
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

const slotIds = ["impulso", "tecnica", "voto", "despertar"];
const phraseCopy = {};
export const protagonistCharacterNames = Object.fromEntries(profiles.map((profile) => [profile.name, profile.englishName]));

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
      id: slotIds[abilityIndex],
      costs: costsFor(ability),
      cooldown: ability.cooldown || 0,
      kind: abilityKind(ability),
      classes: [ability.damage ? ability.damageType === "physical" ? "Física" : ability.damageType === "piercing" ? "Perfurante" : ability.damageType === "affliction" ? "Aflição" : "Espiritual" : "Estratégica", ability.dot ? "Persistente" : "Instantânea"],
      description: describeAbility(ability)
    };
    registerPhrase(source.name, englishName);
    registerPhrase(compiled.description, englishDescription);
    return compiled;
  });
  registerPhrase(profile.name, profile.englishName);
  registerPhrase(profile.elo, profile.englishElo);
  registerPhrase(profile.role, profile.englishRole);
  registerPhrase(profile.combo, profile.englishCombo);
  registerPhrase(profile.mechanic, profile.englishMechanic);
  registerPhrase(profile.lore, profile.englishLore);
  registerPhrase(profile.passive.name, profile.passive.englishName);
  registerPhrase(profile.passive.description, profile.passive.englishDescription);
  registerPhrase(profile.role + " do Elo " + profile.elo, profile.englishRole + " of " + profile.englishElo);
  return {
    id: profile.id,
    name: profile.name,
    aliases: [],
    realm: profile.realm,
    elo: profile.elo,
    eloId: profile.eloId,
    title: profile.role + " do Elo " + profile.elo,
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
    protagonist: true,
    protagonistFamily: profile.family,
    protagonistVersion: profile.version,
    synergyEloIds: [...new Set([profile.eloId, ...profile.synergyEloIds])],
    flavor: profile.lore,
    lore: profile.lore,
    risk: profile.realm === "Limbo"
  };
}

const indexes = { "correntes-quebradas": 11, esperanca: 5, mentira: 6, cura: 5 };
export const protagonistCharacters = profiles.map((profile) => {
  const index = indexes[profile.eloId] || 0;
  indexes[profile.eloId] = index + 1;
  return compileProfile(profile, index);
});
export const protagonistEnglishPhrases = Object.freeze({ ...phraseCopy });
