# Continuidade do atlas da Myra

Atualizado em 10/11/2026. Use este resumo para retomar a tarefa sem colar o histórico inteiro ou o prompt mestre de 36 KB.

## Projeto e branch

- Repositório: `Vanleef/oblivium-arena`
- Branch de trabalho: `fix/compact-card-readability-20261110`
- Base observada: `b2b8d079d8825c2b7c94c3707fc8472886468a09`
- Não alterar `main`.

## Estado da Myra

- Nome usado pelo usuário: **Myra**. ID canônico atual no código: `a-rainha-dos-fungos`; o catálogo mostra **Beatrix Potter, A Rainha dos Fungos**. Não renomear sem pedido.
- Retrato, passiva e artes estáticas de impulso/técnica/voto/despertar já estão registrados em `src/character-art-registry.js`.
- Paleta e VFX próprios estão em `src/tactical-visual-palette.js`, `src/tactical-character-vfx.js` e `src/tactical-effects-layer.js`.
- O atlas de combate da Myra continua pendente (0/6 em `docs/TACTICAL_ANIMATION_COVERAGE.md`). O atlas `mire.webp` pertence a Mire / `a-praga-andante`; não reutilizar para Myra.
- Tentativas recentes de gerar o atlas da Myra apresentaram halo/franja colorida ou fundo não transparente. Não integrar essas versões. Manter a Myra fora do mapeamento de atlas até existir uma folha limpa, transparente e sem halo.

## Próximos passos

1. Criar atlas 6×6 transparente, consistente e sem pixels soltos: linhas para idle, movimento, impulso, técnica (Bloom), voto (Cloud) e despertar.
2. Manter silhueta e identidade: mulher adulta de pele lavanda, cabelo preto curto, vestido marfim de gola alta, manto de cogumelos violeta e cetro de raiz; poderes físicos de fungos, raízes e esporos. Sem tecnologia, feixes finos, pose para câmera ou anatomia impossível.
3. Mapear o arquivo exclusivamente para `a-rainha-dos-fungos`; preservar o atlas de Mire.
4. Atualizar testes e auditoria; a contagem de atlas sobe de 44 para 45 depois da integração.
5. Validar build, smoke test, dimensões/transparência e a animação no campo compacto antes de publicar a atualização do branch.

## Contexto para chats novos

Envie somente: “Continue o atlas da Myra no branch `fix/compact-card-readability-20261110`. Leia `docs/CONTINUIDADE_ATLAS_MYRA.md`, confira o branch atual e prossiga a partir de Próximos passos. Não cole o prompt mestre nem o histórico completo.”

Se uma conversa recém-aberta acusar limite após uma mensagem curta, trate como possível problema do ChatGPT: teste uma janela privada e consulte `status.openai.com`.