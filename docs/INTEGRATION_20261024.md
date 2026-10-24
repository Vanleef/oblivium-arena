# Integração na main — 24/10/2026

O trabalho de clareza, arquétipos, progressão, campanha autoritativa, IA e tradução foi integrado sobre a main `21b92bf51f21bf9eae790c16f81120d903a64042`. Arquivos de arte e documentação existentes apenas na main foram preservados, sem exclusão por ausência no checkout parcial.

## Conciliação dos aprimoramentos

O checkpoint local continha 23 poderes de trilha e a main continha 35. A união preserva os 49 identificadores distintos. Cada poder tem contexto narrativo, ícone e glifo SVG próprios e tradução editorial em inglês. Os efeitos de 26 poderes antigos foram associados a efeitos efetivamente suportados pelo motor; suas descrições foram ajustadas junto das regras, evitando promessas de efeitos não executados. Ofertas continuam priorizando categorias distintas e respeitando a composição viva do trio.

O catálogo de eventos de combate continua com 51 eventos, e os 50 Legados de campanha permanecem separados dos poderes de trilha. A geração de Essência segue os cinco tipos e a troca 5:1. Coringa é Wildcard em inglês; Post Mortem Arena permanece igual nos dois idiomas.

## Defesa e publicação

A Defesa inicial e a Defesa concedida por habilidades respeitam metade da Vida máxima, inclusive em elites e com bônus de campanha. A simulação valida esse limite proporcional à Vida, em vez de um teto fixo de 80.

O build publica somente conteúdo de navegador em dist; APIs e módulos de servidor são compilados como funções pela Vercel.

## Validação

- Suíte completa: 247 testes, sem falhas.
- Simulação: 300 combates, 100 personagens, 32.262 etapas e 433 técnicas exercitadas.
- Quatro simulações atingiram o limite de 100 rodadas; esse limite não é considerado vitória ou derrota.
- O cenário de chefe em Ruptura VI registrou 1 vitória, 97 derrotas e dois limites em 100 partidas. O cenário de elite em Ruptura III registrou 4 vitórias, 95 derrotas e um limite. São controles entre heurísticas sem build humana otimizada, não evidência de equilíbrio final. Playtests de builds continuam necessários.
