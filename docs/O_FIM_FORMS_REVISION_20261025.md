# O Fim — formas com identidades visuais próprias, 25/10/2026

## Direção visual

As transformações mudam a silhueta e preservam apenas poucos sinais de O Fim: rosto-vazio, fendas rubras, elos dourados e fragmentos de marfim com raízes. Os adornos brancos deixam de cobrir o corpo como no desenho original. Tirano é a única forma com coroa, redesenhada como uma diadema de guerra baixa, larga e assimétrica. A forma original mantém sua silhueta aprovada, mas agora sem coroa.

| Forma | Silhueta | Arquétipo | Essência | Efeito ao entrar |
| --- | --- | --- | --- | --- |
| Original | Soberano esguio, manto escuro e marfim enraizado; sem coroa | Metamorfo | Éter | Escolhe uma manifestação |
| Tirano | Colosso curvado, centro de massa baixo, braços enormes e punhos maciços; coroa de guerra própria | Berserker | Cinza | Recebe 10 de Defesa |
| Predador | Fera rasteira de seis membros, com boca anelar de vazio | Executor | Ruptura | Prepara +8 de dano para o próximo golpe |
| Ruína | Corpo flutuante sem pernas, torso fragmentado e quatro braços espectrais; sem coroa | Interditor | Graça | Gera 1 Graça |

Predador mantém o conjunto visual já aprovado, inclusive a leitura furtiva e móvel. Tirano e Ruína agora transformam o corpo de modo explícito, mas conservam pequenos detalhes que ligam cada forma ao original.

## Padrão de combate

- **Tirano:** Punho de Cinza causa 20 de dano físico e prepara uma carga. Quebra do Trono causa 20 e remove 15 de Defesa antes do dano. Queda Implacável consome cargas para dano extra e fica mais forte conforme O Fim perde Vida.
- **Predador:** Rastro Faminto marca e rouba Vida; Ceifar o Vínculo rouba Vida e consome a marca; Fome dos Reinos consome a marca para um golpe de aflição mais forte e drena Essência.
- **Ruína:** Fio Espectral marca um alvo; Laço dos Ausentes consome o fio para causar dano e Atordoar; Círculo de Interdição enfraquece e sela apoio em toda a linha.

As afinidades alteram o custo das três técnicas da forma. A forma original usa Éter; Tirano, Cinza; Predador, Ruptura; Ruína, Graça. O retorno compartilhado, Fim Inalcançável, recupera 10 de Vida, protege por uma resposta inimiga e restaura a forma original sem reiniciar recargas.

O seletor do Codex mostra arquétipo e afinidade. A busca e os filtros também localizam O Fim por nome de forma, arquétipo e Essência.

## Arte

Os oito arquivos novos substituem as versões anteriores do Tirano e da Ruína: dois retratos e seis cenas de combate. O Tirano aparece como um bruto de pedra e cinza com uma coroa de guerra exclusiva, sem o manto e a cobertura de marfim do original. A Ruína perde a coroa, o manto e as placas simétricas; sua forma fragmentada de quatro braços usa fios violetas para marcar, prender e interditar. Predador permanece inalterado. Dois arquivos adicionais atualizam o retrato original e a cena Fim Inalcançável sem a coroa; as formas mantêm os aros dourados, o manto e os detalhes enraizados de marfim.

Inventário, prompts resumidos, dimensões e hashes das transformações: `ART_O_FIM_TRANSFORMED_20261025.json`. Os dois arquivos originais sem coroa estão em `ART_O_FIM_CROWNLESS_ORIGINAL_20261025.json`. Os inventários anteriores continuam preservados em `ART_O_FIM_COHESIVE_20261024.json` e `ART_O_FIM_DISTINCT_20261024.json`.

## Verificação

Verificação: build com **938 arquivos**; auditoria de 100 personagens, 675 referências e **626 caminhos presentes, nenhum ausente**; `git diff --check` sem erros. A suíte não foi reexecutada após esta última alteração visual; a revisão anterior teve **304 testes aprovados**. O commit `6471ab162d189a1123b430ef2024923e23157636` está publicado na `main`, com deploy de produção `READY`. No Codex público, os retratos carregaram: forma original sem coroa, Tirano com diadema de guerra, Predador com a arte preservada e Ruína sem coroa, flutuante e com quatro braços. Fim Inalcançável também usa a arte original sem coroa.
