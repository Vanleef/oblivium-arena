# Continuidade do atlas da Myra

Atualizado em 13/11/2026. Este resumo substitui a colagem de históricos extensos.

## Projeto

- Repositório: `Vanleef/oblivium-arena`
- Branch de trabalho: `fix/compact-card-readability-20261110`; não alterar `main`.
- Checkpoint anterior à leva Erebus/Ashen (Vespera integrado): `cc02253d87a04455a275335b847fc2ee19fa02f0`.
- Atlases táticos conectados: Myra, Elias, Voss, Iris, Hollow, Efialtes/O Desertor, Andriscus/O Usurpador, Quill/A Metamorfa, Desire/Tarquínio, Liora/A Marionetista, Echo/O Simulacro, Sable/A Suturadora, Noctis/O Anulador, Vespera/A Ausência, Erebus/O Arauto, Ashen/O Desolador, Soren/A Escriba e Niith/O Fim.

## Estado atual

- Noctis (`o-que-apaga`): atlas transparente 6×7; a forma `impulso:erase` usa a sétima linha dedicada.
- Vespera (`a-ausencia`): atlas transparente 6×6 para repouso, movimento e quatro ações.
- Erebus (`o-fim-silencioso`): atlas transparente 6×7; quatro técnicas base usam as linhas de ação padrão e `voto:residual` usa a sétima linha dedicada.
- Ashen (`o-menino-sem-sombra`): atlas transparente 6×7; quatro técnicas base usam as linhas de ação padrão e `tecnica:hide` usa a sétima linha dedicada.
- Soren (`a-ultima-pagina`): atlas transparente 6×6; repouso, caminhada e quatro técnicas base, sem formas alternativas. As técnicas são mapeadas às linhas de slot do atlas.
- Niith (`o-lugar-de-ninguem`): atlas transparente 6×6; repouso, caminhada e quatro técnicas base. O atlas também cobre Niith quando aparece como oposição de campanha; ele segue indisponível no seletor do piloto.
- Os atlases usam quadros compactos; formas especiais permanecem mapeadas para seus próprios recortes, sem empréstimo de arte.
- Cobertura registrada: 62/150 atlas base, 275/689 técnicas/formas e 28 recortes específicos de habilidade. Consulte `docs/TACTICAL_ANIMATION_COVERAGE.md`.
- Siga a direção de arte do projeto: anime 2.5D pictórico, anatomia coerente, sem olhar para câmera, poderes físicos e paletas próprias dos mundos.

## Próximos passos

1. Próximo atlas pendente: Bastion (`a-muralha`), kit 0/4.
2. Continuar pelo elenco e integrar cada atlas ao renderer, cobertura e checkpoint sem aguardar aprovação entre kits.
3. Trabalhar somente na branch indicada e conferir sua ponta antes de cada atualização.

## Limite de contexto do chat

O limite interno do ChatGPT não pode ser alterado pelo projeto. Para reduzir contexto repetido, em um chat novo envie apenas: “Continue a partir de `docs/CONTINUIDADE_ATLAS_MYRA.md` na branch `fix/compact-card-readability-20261110`.” Não cole o histórico completo nem o prompt mestre.
