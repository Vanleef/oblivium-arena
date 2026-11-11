# Continuidade do atlas da Myra

Atualizado em 11/11/2026. Este handoff substitui a colagem do histórico completo e do prompt mestre.

## Projeto

- Repositório: `Vanleef/oblivium-arena`
- Branch: `fix/compact-card-readability-20261110`
- Atlases integrados no branch: Myra, Elias e Voss; a execução partiu do checkpoint `9932c2dd40cca694dba47f8d0d8d31b32d63c6b4`.
- Não alterar `main`.

## Estado

- Myra é o nome usado pelo usuário. Preservar o ID canônico `a-rainha-dos-fungos`; não renomear.
- Retrato, passiva, quatro artes de habilidade, paleta e VFX já estão registrados.
- O atlas de Mire/`a-praga-andante` é separado e não deve ser reutilizado.
- Myra segue em 0/6 animações de atlas; a cobertura registrada é 44/150.
- Atlases 6×6 conectados individualmente: Myra (`a-rainha-dos-fungos`), Elias (`o-que-observou`) e Voss (`o-surdo`); Mire continua separado em `mire.webp`.
- Formas especiais mapeadas em linhas próprias: Bloom, Cloud, Witness e Echo. Cobertura global: 47/150 atlas base e 203/689 técnicas/formas; contagens em `docs/TACTICAL_ANIMATION_COVERAGE.md`.

## Próximos passos

1. Próximo atlas pendente na ordem do elenco: Iris (`a-testemunha-cega`).
2. Continuar personagem a personagem sem aguardar aprovação entre kits; localizar as artes existentes, gerar atlas 6×6 e mapear formas especiais por linha.
3. Preservar cada atlas no ID canônico e manter a direção de arte do projeto.

## Limite de chat e continuidade

O projeto não pode alterar os limites do ChatGPT. Para reduzir o contexto repetido, comece o próximo chat só com:

> Continue o atlas da Myra no branch `fix/compact-card-readability-20261110`. Leia `docs/CONTINUIDADE_ATLAS_MYRA.md` e prossiga pelos próximos passos. Não cole o histórico nem o prompt mestre.

Se o aviso de conversa cheia aparecer após uma única mensagem curta em um chat novo, isso não é resolvido encurtando este handoff: consulte `status.openai.com` e tente a mesma mensagem numa janela privada. Se persistir, envie ao suporte o horário, modelo e URL/ID da conversa.
