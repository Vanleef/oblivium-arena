# Continuidade do atlas da Myra

Atualizado em 11/11/2026. Este handoff substitui a colagem do histórico completo e do prompt mestre.

## Projeto

- Repositório: `Vanleef/oblivium-arena`
- Branch: `fix/compact-card-readability-20261110`
- Integração iniciada no checkpoint `becd3465e69c6bc4379c2c981f3371eed5d63905`
- Não alterar `main`.

## Estado

- Myra é o nome usado pelo usuário. Preservar o ID canônico `a-rainha-dos-fungos`; não renomear.
- Retrato, passiva, quatro artes de habilidade, paleta e VFX já estão registrados.
- O atlas de Mire/`a-praga-andante` é separado e não deve ser reutilizado.
- Myra segue em 0/6 animações de atlas; a cobertura registrada é 44/150.
- Atlas Myra integrado em `art/animations/tactical-compact-20261110/myra.webp`, registrado apenas em `a-rainha-dos-fungos`. Mire segue separado em `mire.webp`. A folha mantém algumas franjas coloridas e raízes que cruzam quadros; refinar isso em passagem visual posterior sem desfazer a integração. Myra está em 6/6; cobertura global 45/150.

## Próximos passos

1. Próximo atlas pendente na ordem do elenco: Elias (`o-que-observou`); localizar as artes do kit e seguir o mesmo mapeamento 6×6.
2. Continuar personagem a personagem sem aguardar aprovação entre kits, mantendo a direção de arte e sem reutilizar atlas de outro personagem.
3. Refinar transparência e efeitos que cruzam células na folha da Myra durante a rodada visual seguinte.

## Limite de chat e continuidade

O projeto não pode alterar os limites do ChatGPT. Para reduzir o contexto repetido, comece o próximo chat só com:

> Continue o atlas da Myra no branch `fix/compact-card-readability-20261110`. Leia `docs/CONTINUIDADE_ATLAS_MYRA.md` e prossiga pelos próximos passos. Não cole o histórico nem o prompt mestre.

Se o aviso de conversa cheia aparecer após uma única mensagem curta em um chat novo, isso não é resolvido encurtando este handoff: consulte `status.openai.com` e tente a mesma mensagem numa janela privada. Se persistir, envie ao suporte o horário, modelo e URL/ID da conversa.
