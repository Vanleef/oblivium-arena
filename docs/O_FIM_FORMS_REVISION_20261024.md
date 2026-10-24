# O Fim — formas distintas, 24/10/2026

## Identidade de cada forma

| Forma | Silhueta | Arquétipo | Essência | Efeito ao entrar |
| --- | --- | --- | --- | --- |
| Original | Soberano esguio, coroa, rosto vazio, manto e raízes | Metamorfo | Éter | Escolhe qual forma vai financiar e manifestar |
| Tirano | Bastião de prisão largo, coroado e preso por correntes | Interditor | Cinza | Recebe 10 de Defesa |
| Predador | Fera rasteira de seis membros, com boca de vazio em forma de anel | Executor | Ruptura | Prepara +8 de dano para o próximo golpe |
| Ruína | Arco de catedral partido, suspenso e sem corpo humano | Especialista em Aflições | Graça | Gera 1 Graça |

As afinidades alteram os custos das três técnicas da forma, pois elas pagam o custo de Afinidade usando `bodyResource`. A forma original usa Éter; as outras três usam tipos distintos.

## Padrão de combate

- **Tirano:** Fenda do Véu marca um alvo. Decreto do Fim consome essa marca para causar dano e Atordoar; Coroa que Não Cai protege o trio.
- **Predador:** todas as técnicas atacam um alvo. Rastro Faminto marca e rouba Vida; Ceifar o Vínculo rouba Vida e consome a marca; Fome dos Reinos consome a marca para um golpe de aflição mais forte e drena Essência.
- **Ruína:** Cinza de Ninguém aplica Decadência persistente; Nome Extinto expõe e sela apoio; Última Fronteira atinge a linha inteira e recompensa inimigos já afligidos.

Cada manifestação troca o efeito de entrada, as três técnicas, os ícones, o retrato, o arquétipo e a fonte do custo. Fim Inalcançável continua compartilhada; as recargas seguem as quatro posições entre formas.

O seletor do Codex agora apresenta nome, ícone de arquétipo e afinidade para cada forma. Os filtros de arquétipo, função e busca também encontram O Fim por qualquer uma das três manifestações.

## Arte

Os retratos novos separam as silhuetas antes da cor: bastião, fera baixa de seis membros e arquitetura suspensa. Os nove ícones de habilidade usam cenas próprias para controle, caça e deterioração. O conjunto foi exportado completo para WebP, sem recorte, e os retratos e técnicas anteriores permanecem preservados.

Manifesto com resumo dos prompts, caminhos, fontes e hashes: `ART_O_FIM_DISTINCT_20261024.json`.

## Verificação

Validação local concluída: **304 testes aprovados**, nenhuma falha; build com **920 arquivos**; auditoria com 100 personagens, 675 referências e **626 caminhos presentes, nenhum ausente**; `git diff --check` limpo. A suíte cobre arquétipos, afinidades e descrições em inglês no Codex, os efeitos de entrada, os kits e os 12 arquivos de arte.

O estado do deploy e a conferência visual em português e inglês serão acrescentados após a publicação.
