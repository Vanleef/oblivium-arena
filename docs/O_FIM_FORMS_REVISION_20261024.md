> **Registro histórico.** Nomes, títulos, contagens, regras e direções visuais deste relatório refletem sua etapa de produção. Para o estado vigente, consulte [o índice canônico](PROJECT_CANON.md), [o catálogo atual](CHARACTER_CATALOG.md) e [a direção de arte](ART_DIRECTION.md). IDs e caminhos antigos permanecem por compatibilidade.

# O Fim — formas com identidade compartilhada, 24/10/2026

## Direção visual

As formas mantêm sinais do desenho aprovado de O Fim: rosto de vazio, coroa estreita, dois aros dourados, manto escuro, marfim rachado com raízes verdes e pequenas fissuras rubras. A transformação muda o corpo e o jeito de lutar sem trocar esses sinais por construções desconectadas.

| Forma | Silhueta | Arquétipo | Essência | Efeito ao entrar |
| --- | --- | --- | --- | --- |
| Original | Soberano esguio, manto, coroa e armadura assimétrica | Metamorfo | Éter | Escolhe uma manifestação |
| Tirano | Humanoide largo e encouraçado, com punhos pesados | Berserker | Cinza | Recebe 10 de Defesa |
| Predador | Fera rasteira de seis membros, com boca anelar de vazio | Executor | Ruptura | Prepara +8 de dano para o próximo golpe |
| Ruína | Conjurador esguio e flutuante, guiando fios espectrais | Interditor | Graça | Gera 1 Graça |

As três manifestações têm arquétipos e Essências diferentes. O Predador conserva o visual anterior, que já combinava identidade e transformação.

## Padrão de combate

- **Tirano:** Punho de Cinza causa 20 de dano físico e prepara uma carga. Quebra do Trono causa 20 e remove 15 de Defesa antes do dano. Queda Implacável consome cargas para dano extra e fica mais forte conforme O Fim perde Vida.
- **Predador:** Rastro Faminto marca e rouba Vida; Ceifar o Vínculo rouba Vida e consome a marca; Fome dos Reinos consome a marca para um golpe de aflição mais forte e drena Essência.
- **Ruína:** Fio Espectral marca um alvo; Laço dos Ausentes consome o fio para causar dano e Atordoar; Círculo de Interdição enfraquece e sela apoio em toda a linha.

As afinidades alteram o custo das três técnicas da forma. A forma original usa Éter; Tirano, Cinza; Predador, Ruptura; Ruína, Graça. O retorno compartilhado, Fim Inalcançável, recupera 10 de Vida, protege por uma resposta inimiga e restaura a forma original sem reiniciar recargas.

O seletor do Codex mostra arquétipo e afinidade. A busca e os filtros também localizam O Fim por nome de forma, arquétipo e Essência.

## Arte

O novo conjunto troca os retratos desconexos do Tirano e da Ruína por duas novas transformações humanoides. As seis ilustrações de técnicas também mostram os personagens executando seus efeitos: golpes físicos de força bruta no Tirano e marcas, vínculos e círculos espectrais na Ruína. As três artes do Predador foram mantidas.

Inventário dos oito arquivos novos, prompts resumidos e hashes: `ART_O_FIM_COHESIVE_20261024.json`. O inventário anterior dos 12 arquivos ainda usados em parte está em `ART_O_FIM_DISTINCT_20261024.json`.

## Verificação

Validação local desta revisão: **304 testes aprovados**, build com **928 arquivos**, auditoria com 100 personagens, 675 referências e **626 caminhos presentes, nenhum ausente**. As oito artes novas têm hashes e dimensões verificados. O deploy de artes e kits `4618cbfe1360369a01c42b9bb060544384547f2d` ficou READY. No Codex público, conferi os retratos, os sinais visuais compartilhados, arquétipos, Essências e técnicas. A revisão identificou que o resumo do Laço dos Ausentes ocultava seu bônus e Atordoamento condicionais. A correção do resumo está no commit `59a5d49bfe42646d5e22513d28968cd8e2fd794a`, também READY; conferi os rótulos em português e inglês e o selo de apoio no Círculo de Interdição.

