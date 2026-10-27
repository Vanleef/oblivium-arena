# Arena online

A API em `api/arena.js` usa Redis REST persistente. Sem as duas variáveis abaixo, responde 503; não há adversário artificial, classificação local ou armazenamento em memória como substituto.

## Ativação no projeto existente

Conectar Upstash Redis ao projeto **oblivium-arena** no Vercel Marketplace, habilitar o ambiente Preview da branch `feature/combat-trails-20261021` e disponibilizar as variáveis `UPSTASH_REDIS_REST_URL` e `UPSTASH_REDIS_REST_TOKEN`. Redeployar essa branch. Credenciais ficam apenas no ambiente do servidor. Não inserir no frontend, em commits ou em mensagens.

A integração consultada nesta sessão retornou 403 para listar instalações. Por isso a conexão não foi criada automaticamente. A API preparada é uma implementação em preview; não foi validada contra um banco real nem liberada em produção.

## Regras

- Identidade de visitante vinculada a cookie HttpOnly, Secure, SameSite Strict. Não há login, recuperação de conta nem compartilhamento entre dispositivos nesta versão. Apagar o cookie perde acesso à alma visitante.
- A Arena valida três personagens distintos do catálogo, sem buffs da trilha. O progresso local de desbloqueios não é uma fonte confiável de autorização no servidor. Esta modalidade usa catálogo aberto; sincronizar desbloqueios competitivos exigirá contas e progressão de campanha no servidor.
- Matchmaking inicialmente dentro de 150 pontos, ampliado por tempo de espera. Não usa bots para preencher fila.
- Cada lado escolhe entre três eventos pertinentes à partida no início. Cada personagem que cai gera uma escolha para seu próprio lado, inclusive por aflição ou reação. Efeitos beneficiam destinatários elegíveis de ambos os trios e se acumulam; não revivem personagens. O efeito de Vida é temporário e não aumenta a Vida persistente na trilha.
- Eventos ligados a Elos, técnicas de cura, Defesa, aflição ou bônus universais. Somente eventos com destinatários vivos são ofertados durante o combate; após eliminação total são mantidas três opções universais para concluir a escolha da última baixa.
- Energia, custos, alvos, formas, recargas, uma ação por personagem, turnos e resultado são validados no servidor. Payloads de dano/resultado/rating não são aceitos.
- Prazo de 120 segundos por turno ou escolha, mantido no banco; inatividade derrota quem devia agir. Retorno ao mesmo navegador permite reconectar dentro do prazo.
- Pontuação Elo inicial 1000, variação K28 e mínimo de 8 pontos. Vitória concede 70 XP da Arena; derrota 30. Estatísticas de vitórias, derrotas e sequência são separadas do nível da trajetória contra IA.
- Resultado e dois perfis são atualizados na mesma transação CAS Redis. Repetir polling ou reconectar não duplica pontos/XP.
- Perfis e sessão: 365 dias de retenção deslizante ao serem atualizados; partidas: 24 horas; fila: 10 minutos com presença renovada em 20 segundos. Classificação armazena os 100 melhores registros; interface mostra 25. Essa versão de visitante não oferece garantia contra criação de múltiplas identidades, collusion ou win trading; não usar para premiações sem contas e mitigação adicional.

## Verificação

`node --test tests/world-influences.test.js tests/online.test.js` testa a máquina de combate e dois clientes com adaptador transacional exclusivo dos testes. O código de produção importa apenas o RedisStore. `GET /api/arena` informa `configured`; o frontend nunca recebe credenciais.

Após conectar um banco real, validar duas sessões de navegador: conectar → buscar com trios diferentes → escolher um evento em cada lado → alternar turnos → perder um personagem → escolher evento → reconectar → concluir → conferir os dois resultados, XP e classificação. Verificar também corrida de fila, expiração, retries CAS e reconexão durante uma escolha antes de publicar em produção.

Referências de implementação: https://upstash.com/docs/redis/features/restapi ; https://upstash.com/docs/redis/sdks/ts/commands/scripts/eval ; https://vercel.com/docs/project-configuration/vercel-json .
