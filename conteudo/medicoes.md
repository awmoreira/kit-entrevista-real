# Medições capturadas

Edição 1.0.0. Captura: 2026-10-31T01:02:56.504Z.

Ambiente: darwin 25.2.0, arm64, Apple M5; Node v24.22.1; PostgreSQL 17.10; pool máximo 8.

Dados sintéticos: 20.000 pedidos e 20.000 itens; duas empresas; 8.000 pedidos confirmados por empresa. Página de 50 pedidos, três aquecimentos e 20 amostras por versão, concorrência 1. Transporte: Fastify inject, com PostgreSQL por TCP local. A comparação ocorreu sem o índice composto nas duas versões.

| Versão | Consultas por requisição | p50 | p95 |
| --- | --- | --- | --- |
| lento | 51 | 8 ms | 9.74 ms |
| corrigido | 2 | 2.57 ms | 2.9 ms |

As respostas completas foram comparadas a cada amostra e preservam conteúdo e ordem. O número de consultas caiu de 51 para 2. A versão lenta paraleliza as consultas de itens, limitada pelo pool; ainda executa uma consulta adicional por pedido.

Os tempos descrevem esta execução, sem rede HTTP externa ou tráfego concorrente. Não representam um SLO nem garantem o mesmo ganho em outra máquina. A extensão de índice foi medida separadamente com EXPLAIN ANALYZE e buffers, antes e depois da criação do índice, em evidencias/planos.json.

Para reproduzir: execute npm run bench com o PostgreSQL do kit ativo. O comando reescreve as evidências e este capítulo; não altera o schema kit_lab.
