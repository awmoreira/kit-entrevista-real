# Registro de validação da edição 1.0.0

Autoria: Allan Winckler. Casos fictícios, materiais em português. O piloto com cinco candidatos reais está **pendente**. As rubricas são autorais e ainda precisam de calibração pedagógica.

## Evidências técnicas

- Testes iniciais: sete cenários de caminho normal e validação na proposta.
- Referência: onze testes de contrato, concorrência, repetição, escopo e proteção da conexão local.
- Cinco defeitos: o relatório [provas-bugs.json](../evidencias/provas-bugs.json) registra a falha específica na proposta e a mesma comparação passando na referência. O código de diagnóstico confere os resultados defeituosos previstos antes de aceitar uma prova.
- Desempenho: [benchmark.json](../evidencias/benchmark.json) e [planos.json](../evidencias/planos.json) registram ambiente, dados, metodologia e planos. Foram comparadas as respostas completas: 51 consultas na versão lenta e duas na corrigida, para uma página de 50 pedidos.
- PDFs: o relatório automático [pdf-verificacao.json](../evidencias/pdf-verificacao.json) registra fonte, texto, navegação e limites de página. A [revisão visual](../evidencias/revisao-visual.json) cobre as 47 páginas; as folhas de contato estão em docs/revisao-visual. A reprodução em cópia limpa tem registro separado.

O arquivo checks.json em evidencias registra a última execução completa dos oito checks da edição. Nenhuma falha de inicialização é aceita como prova de bug. A barreira da corrida não usa atraso arbitrário; a falha intermediária verifica SQLSTATE 22012.

## Alcance

As medições originais são locais, em macOS arm64, com Node 24 e PostgreSQL 17. A integração contínua executa os mesmos contratos em Linux amd64. O fluxo do Windows é documentado para WSL2; não há alegação de teste em Windows nativo.

A redução de consultas é uma propriedade do exercício. Os tempos medidos não representam um serviço de produção, não incluem rede HTTP externa e não demonstram capacidade para os volumes fictícios da discussão de arquitetura.

Os PDFs têm inspeção automática e visual. As fichas são modelos estáticos, editáveis em Markdown ou imprimíveis. Nenhum dado de candidato é coletado pelo kit. A escala 50/50 é uma convenção de prática e não uma regra universal de contratação.
