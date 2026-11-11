# Continuidade do atlas da Myra

Atualizado em 11/11/2026. Este resumo substitui a colagem de históricos extensos.

## Projeto

- Repositório: `Vanleef/oblivium-arena`
- Branch de trabalho: `fix/compact-card-readability-20261110`; não alterar `main`.
- O checkpoint anterior, com Sable, era `0d57f0f4ab88197c11b704e7fe66b260bdaa39b0`. Noctis foi conectado nesta continuação.
- Atlases táticos conectados: Myra, Elias, Voss, Iris, Hollow, Efialtes/O Desertor, Andriscus/O Usurpador, Quill/A Metamorfa, Desire/Tarquínio, Liora/A Marionetista, Echo/O Simulacro, Sable/A Suturadora e Noctis/O Anulador.

## Estado atual

- Noctis (`o-que-apaga`) tem atlas transparente 6×7: repouso, movimento, quatro ações e a forma especial `impulso:erase` na sétima linha.
- Os outros mapeamentos de forma continuam sem emprestar arte a formas desconhecidas.
- Cobertura registrada: 57/150 atlas base, 253/689 técnicas/formas e 26 recortes específicos de habilidade. Consulte `docs/TACTICAL_ANIMATION_COVERAGE.md`.
- Mantêm-se os kits e as diretrizes de arte do projeto. Noctis usa efeitos físicos de cinza, pedra e brasas, sem feixes genéricos.

## Próximos passos

1. Próximo atlas pendente: Vespera (`a-ausencia`), kit 4/4.
2. Continuar sequencialmente pelos personagens, integrando os atlases ao renderer, cobertura e checkpoint, sem pedir aprovação entre kits.
3. Trabalhar somente na branch indicada e confirmar a ponta antes de cada atualização.

## Limite de contexto do chat

O limite interno do ChatGPT não pode ser alterado pelo projeto. Para reduzir o contexto repetido, em um chat novo envie apenas: “Continue a partir de `docs/CONTINUIDADE_ATLAS_MYRA.md` na branch `fix/compact-card-readability-20261110`.” Não cole o histórico completo nem o prompt mestre.
