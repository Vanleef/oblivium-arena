# Técnicas alternativas do PMA

Os 100 kits têm estruturas autorais de preparação, troca, reação, crescimento ou apoio. Há 56 técnicas alternativas além das 400 técnicas principais. Todos conservam quatro espaços e uma ação por personagem por turno. A quarta defesa mantém Invulnerável por uma resposta adversária e quatro turnos próprios de recarga.

| Estrutura | Exemplos do PMA | Decisão |
| --- | --- | --- |
| Sequência no mesmo espaço | Passo Interrompido, Três Irmãos | Continuar a sequência ou usar outra técnica antes de a janela fechar |
| Transformação de várias técnicas | Ódio Encarnado | Arriscar mais Vida; terminar a forma com o desfecho ou esperar que expire |
| Postura reversível | Pele Alheia, Voz | Manter os ataques alterados ou desfazer a postura para obter recuperação |
| Forma condicionada à Vida | Devorador | O tipo, o custo e a utilidade do ataque mudam quando a Vida cruza 50 |
| Forma condicionada a cargas | Filho da Cinza, Restaurador, Semente | Gastar a reserva numa versão diferente ou conservar as outras opções |
| Resposta a um contra-ataque ativado | Viúva, Espelho, Observador, Eco | A agressão recebida abre uma técnica; algumas ficam vinculadas ao agressor |
| Desfechos mutuamente exclusivos | Rainha dos Fungos | Usar a mesma colônia para amparo coletivo ou dano de aflição em área |
| Uso limitado por combate | Colecionador de Cabeças, Fim Silencioso | Escolher quando gastar os dois usos fortes; depois há uma técnica de menor impacto |
| Controle com vínculo | Marionetista de Nervos | Manter a interrupção na mesma vítima ou usar o desfecho; perder contato encerra a continuação |
| Armadilhas de decisão | Sussurro, Incendiário, Credor | Punir ofensiva, apoio, qualquer técnica ou inatividade, uma única vez |
| Selos seletivos | Trono Vazio, Juíza, Porta Fechada | Interditar ofensiva ou apoio; o selo de apoio preserva a defesa pessoal |
| Recuperação futura | Mãe Rubra, Médico de Vermes, Senhora do Último Pão | Receber cura imediata menor e manter recuperação pelos turnos seguintes |
| Crescimento interrompível | Boca de Vidro, Lâmina Justa, Andarilho de Vidro | Repetir uma técnica até um teto; Atordoamento zera o bônus |
| Conversão de Defesa | Estômago sem Fundo, Muralha, Arquiteta | Converter Defesa removida em guarda própria ou consumir guarda para acrescentar dano |
| Manipulação de recargas | Sentinela Azul, Portador da Aurora, Primeiro Canto | Adiantar técnicas de apoio ou ofensiva sem reduzir a recarga da quarta defesa |
| Alternância de alvo e função | Linha Partida, Cartógrafa, Equilíbrio | Transformar preparação ofensiva em cuidado, ou cuidado em ataque |

## Referências de estrutura

Foram consultadas as atualizações do Naruto Arena Classic com estilos de Lee, transformação de Mizuki, golpe alternado de Sakura, continuação de Shikamaru e técnicas de Kakashi. São referências para a estrutura de decisões; efeitos, custos, conceitos e nomes foram adaptados ao PMA.

- https://www.naruto-arena.site/balance-changes/3-new-characters-major-balance-120
- https://www.naruto-arena.site/balance-changes/new-characters-major-balance-124
- https://www.naruto-arena.site/balance-changes/new-characters-balance-update-140

## Implementação

- `src/combat-effects.js` controla reações, regeneração, selos e cálculos adicionais. Cada reação ativa uma vez; reações não ativam outras reações. Limpeza remove armadilhas hostis e condições novas, preservando os efeitos de apoio.
- `src/kit-expansion.js` define a segunda passagem de identidade dos 64 kits restantes.
- `src/kit-evolutions.js` define as alterações autorais por Elo e índice, sem substituir o catálogo básico por um novo ciclo genérico de arquétipos.
- `src/kits.js` compila técnicas principais e alternativas com descrições, custos, classes e recargas completos.
- `src/skill-state.js` mantém formas, usos e janelas por combatente. O catálogo original não é modificado durante a luta. Um novo encontro começa com as formas e os usos reiniciados.
- `shift` muda um ou mais espaços após uma habilidade não anulada; `counterShift` muda o kit do criador quando seu contra-ataque é ativado, inclusive quando aplicado a um aliado.
- `formRule` seleciona uma alternativa por Vida ou cargas. `maxUses` e `depletedForm` controlam as técnicas limitadas.
- Janelas de N turnos dão acesso durante os N planejamentos próprios seguintes. A interface informa o turno limite. Posturas sem prazo só terminam pela reversão explícita.
- Uma continuação no mesmo espaço adia a recarga da preparação até ser usada, expirar ou perder seu vínculo. Preparação e continuação não concedem ações extras.
- A fila registra a forma confirmada. Se outra ação mudar essa forma antes da execução, a ação é cancelada e seus recursos são preservados, evitando executar um efeito que o jogador não confirmou.
- Vínculos limitam alvos; uma vítima derrotada restaura a técnica principal. Controles ligados também terminam por Atordoamento do usuário ou Invulnerável da vítima.
- As alternativas inimigas recebem a escala do encontro e da Ruptura. A IA avalia as formas disponíveis e valoriza preparações que abrem novas opções.
- O combate mostra a troca no mesmo ícone, com marca, destaque e animação. Descrições de variações ficam recolhidas no painel; o Codex exibe todas ao abrir a técnica. Movimento reduzido desliga a animação.

## Verificação

`tests/skill-forms.test.js` cobre as famílias acima, os 56 efeitos alternativos, custos reservados, anulações, troca após confirmação, recargas adiadas, janelas completas, quebra de vínculos, IA e apresentação. `tests/kits-audit.test.js` mantém a cobertura das 76 continuações básicas. `tests/reactive-kits.test.js` cobre selos, condições de reação, limpeza, regeneração, crescimento, conversões e a preservação da defesa pessoal. O equilíbrio entre equipes e Rupturas continua sujeito a partidas de avaliação.
