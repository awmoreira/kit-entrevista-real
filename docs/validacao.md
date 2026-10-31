# Registro de validação da edição 1.1.0

Autoria: Allan Winckler. Casos fictícios, materiais em português. O piloto com cinco candidatos reais está **pendente**. As rubricas são autorais e ainda precisam de calibração pedagógica.

## Evidências técnicas

- Testes iniciais: sete cenários de caminho normal e validação na proposta.
- Referência: treze testes de contrato, concorrência, repetição, escopo, proteção da conexão local e correção do avaliador.
- Cinco defeitos: o relatório [provas-bugs.json](../evidencias/provas-bugs.json) registra a falha específica na proposta e a mesma comparação passando na referência. O código de diagnóstico confere os resultados defeituosos previstos antes de aceitar uma prova.
- Desempenho: [benchmark.json](../evidencias/benchmark.json) e [planos.json](../evidencias/planos.json) registram ambiente, dados, metodologia e planos. Foram comparadas as respostas completas: 51 consultas na versão lenta e duas na corrigida, para uma página de 50 pedidos.
- PDFs: o relatório automático [pdf-verificacao.json](../evidencias/pdf-verificacao.json) registra fontes, texto, navegação, links da edição e limites de página. A [revisão visual](../evidencias/revisao-visual.json) lista as páginas inspecionadas; as folhas de contato estão em docs/revisao-visual.
- Percurso do candidato: a [cópia limpa](../evidencias/copia-limpa.json) confere a solução inicial vermelha, uma solução válida verde e a restauração do arquivo de prática. A CI executa esse percurso e chamadas HTTP reais num pacote extraído.

O arquivo checks.json em evidencias registra a última execução completa dos oito checks da edição. Nenhuma falha de inicialização é aceita como prova de bug. A corrida observa duas operações esperando o lock no PostgreSQL antes de liberá-las; aceita atualização condicional e SELECT FOR UPDATE. A falha intermediária verifica SQLSTATE 22012. Provas e medições incluem fingerprints das fontes relevantes.

## Alcance

As medições originais são locais, em macOS arm64, com Node 24 e PostgreSQL 17. A integração contínua executa os mesmos contratos em Linux amd64. O fluxo do Windows é documentado para WSL2; não há alegação de teste em Windows nativo.

A redução de consultas é uma propriedade do exercício. Os tempos medidos não representam um serviço de produção, não incluem rede HTTP externa e não demonstram capacidade para os volumes fictícios da discussão de arquitetura.

Os PDFs têm inspeção automática e visual. As fichas são modelos estáticos, editáveis em Markdown ou imprimíveis. Nenhum dado de candidato é coletado pelo kit. A escala 50/50 é uma convenção de prática e não uma regra universal de contratação.
