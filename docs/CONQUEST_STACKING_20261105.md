# Aprimoramentos acumulados e técnicas de apoio — 05/11/2026

Cada melhoria de casa objetivo deve acrescentar o valor anunciado à habilidade do coletor. Os limites secundários de 36 para dano direto, 32 para cura/Escudo/contra-ataque e 9 para aflições podiam reduzir ou anular incrementos de coletas posteriores. Esses limites foram removidos da aplicação de aprimoramentos; o balanceamento das habilidades base permanece em `conquestTechnique`.

Cada instância de cura ou Escudo ao acertar ativa uma vez por rodada. Removidos os orçamentos compartilhados por ativação de 10 de cura e 18 de Escudo, que cortavam bônus de instâncias diferentes. Vida máxima, bloqueio de cura e o limite normal de Escudo de metade da Vida máxima continuam valendo. Textos de técnicas mostram o total de aflição e os benefícios de cura/Escudo ao acertar, incluindo sua frequência.

## Novas famílias de casas objetivo

| Família | Efeito sobre a técnica escolhida | Prata | Ouro | Prismático |
| --- | --- | ---: | ---: | ---: |
| Ímpeto | Aumenta o bônus de dano concedido | +5 | +8 | +12 |
| Resiliência | Aumenta a redução de dano concedida | +5 | +8 | +12 |
| Renovação | Aumenta a regeneração de Vida por rodada | +5 | +8 | +12 |

As opções só aparecem em habilidades que já possuem o efeito correspondente. Cada melhoria continua vinculada ao coletor e ao identificador da habilidade durante este combate. Regeneração mantém a duração da técnica. As três famílias também ganham opções de assinatura no catálogo legado.

As recompensas de travessia que ainda concediam magnitudes entre 1 e 4 foram atualizadas: bônus Prata de pelo menos 5, Ouro de 8 para cura/Escudo de técnica e cura ao mover, Prismático de 12. Pele de Mármore concede 5 de Armadura; Pacto do Bastião inicia o confronto com 16 de Escudo. Textos e efeitos são verificados juntos no teste de recompensas de travessia. Essas recompensas de expedição são distintas das coletas individuais dentro do combate.

## Validação

`tests/conquest-stacking.test.js` verifica cinco coletas sucessivas em cada opção modificadora dos três tiers, em 150 personagens e 216 configurações contando formas: 16.440 verificações de incrementos. Verifica também isolamento por portador/equipe, preservação da habilidade original, descrições de aflições sem substituição em cascata, efeitos ao acertar dos dois lados, limite normal de Vida/Escudo, bloqueio de cura e resolução real de dano, bônus, redução e regeneração.

`tests/conquest-minimum-values.test.js` cobre as novas magnitudes e as 13 recompensas de travessia, comparando os números anunciados com os efeitos do encontro seguinte.

Suíte tática e de Conquista: 187 testes aprovados. Os testes automatizados verificam funcionamento; não substituem avaliação de balanceamento por jogadores. Esta revisão não adiciona atlas ou quadros de animação. A cobertura visual registrada na revisão anterior continua em 39/150 atlas base e 167/689 técnicas/formas animadas.
