# Contatos físicos por personagem — combate compacto (07/11/2026)

## Objetivo

Diferenciar a **materialidade do impacto** de técnicas dos personagens do confronto compacto 6×6. As formas abaixo são desenhadas no Canvas sobre a célula atingida durante o replay resolvido, sem criar dano, cura, buffs, ações ou informações estratégicas adicionais.

## Identidades integradas

| Personagem (ID canônico) | Motivo físico de contato |
| --- | --- |
| `o-acougueiro` | `cleaver` — lâmina de peso, cortes largos e fragmentos |
| `a-viuva-escarlate` | `crimson` — fitas de sangue que cercam o alvo |
| `o-escudo-vivo` | `bastion` — placas protetoras que se encaixam |
| `o-passo-interrompido` | `stutter` — silhuetas deslocadas de um mesmo instante |
| `o-odio-encarnado` | `rage` — punho comprimido, cinzas e estilhaçamento |
| `a-arquiteta-verde` | `architect` — arco e raízes de sustentação |
| `nilo` | `memory` — fio ritual ancorado por um nó |

As quatro posições `impulso`, `tecnica`, `voto` e `despertar` ajustam o peso da manifestação. Formas alternativas acrescentam peso visual sem alterar mecânicas; o ataque básico de fortaleza mantém o tratamento genérico. **Não são 28 novas animações quadro a quadro**: os sete motivos são desenhos procedurais específicos por personagem e intensidade por posição.

As assinaturas antigas de partículas dos demais personagens continuam funcionando.

## Correções de precisão

- O contato compara a **casa original** com as células resolvidas para determinar o acerto, mas sua partícula e o número correspondente são desenhados na **casa de chegada** quando houve deslocamento.
- As listas `affectedTargetIds` e `targets` são combinadas. Com técnica sem células explícitas, o feedback fica restrito aos alvos conhecidos, evitando números de unidades irrelevantes.
- Cure e proteção genéricas mantêm um sinal visual próprio; o motivo físico não deve tornar uma cura indistinguível de um ataque.
- As animações respeitam o orçamento global de partículas, os tamanhos responsivos e movimento reduzido.

## Arquivos

- `src/tactical-character-vfx.js` — catálogo, variação por posição e desenho de silhuetas.
- `src/tactical-effects-layer.js` — composição sobre o contato resolvido.
- `src/tactical-feedback.js` — filtragem precisa de feedback.
- `tests/tactical-character-vfx.test.js`, `tests/tactical-effects-layer.test.js`, `tests/tactical-feedback.test.js` — regressões.

## Verificação e limites

Foi feita uma verificação isolada em JavaScript dos sete desenhos e da composição de um contato com deslocamento; o resultado não substitui executar a suíte Node no checkout completo. Executar, nesta ordem:

```sh
node --test tests/tactical-character-vfx.test.js tests/tactical-effects-layer.test.js tests/tactical-feedback.test.js
npm run test:compact
npm run build
npm test
```

Esta etapa **não gera novos atlas** nem cobre todas as técnicas/formas do catálogo. A continuação adequada é usar o mesmo sistema para outras identidades, revisar técnicas com assinaturas semelhantes e criar sprites exclusivos com keyframes `antecipação → movimento → contato → reação → recuperação` sem repetição mecânica de silhuetas.

**Não integrar à `main` até classificar as falhas da suíte global e revisar a leitura visual em celular real.**
