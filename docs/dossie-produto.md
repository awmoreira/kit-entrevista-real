# Dossiê do produto

Edição 1.0.0 | Autoria: Allan Winckler | Idioma: pt-BR

## A promessa analisada

O post de referência propõe cinco blocos: histórico real, investigação de um endpoint lento, arquitetura com alternativas, revisão de um PR com bugs e comportamento. Promete roteiro de observação, perguntas de fundamentos e comportamento, exercício com testes passando e gabarito, além de uma investigação comentada. O pacote é gratuito e atende preparação individual e treino acompanhado.

O diferencial está na combinação de contexto, tentativa e feedback. Um banco de perguntas isolado não entrega prática; um PR sem reprodução não sustenta seu gabarito; respostas decoradas não demonstram experiência. Este kit transforma cada promessa em uma atividade verificável.

Não reproduzimos relatos pessoais, experiência de contratação ou conclusões do autor do post como se fossem do autor deste kit. Os casos são originais e fictícios. A divisão 50/50 é uma convenção editorial de treinamento, sem alegação de validade preditiva para contratação.

## Público e resultado esperado

Pessoas candidatas a vagas pleno e sênior de backend, que já conhecem TypeScript, APIs HTTP, SQL e testes. O objetivo é produzir seis histórias profissionais organizadas, uma nota de investigação, uma decisão arquitetural, comentários de review e um plano de melhoria. O material também permite a outra pessoa conduzir um simulado; não constitui um processo de seleção validado.

## Hipóteses de valor

| Necessidade | Hipótese | Experimento de tarefa | Experimento de transferência |
| --- | --- | --- | --- |
| Organizar experiência | O roteiro melhora a especificidade e a atribuição da contribuição individual | Comparar relato de dois minutos antes e depois | Pedir uma segunda história sem consultar o roteiro |
| Decidir sob incerteza | Pistas graduais estimulam hipóteses e medição antes da solução | Observar a ordem das ações no endpoint | Aplicar a variação de lentidão por dependência externa |
| Transformar feedback em ação | Rubricas com evidências ajudam a priorizar prática | Comparar autoavaliação com observação de um colega | Revisar nova situação de repetição de requisição |

Essas são hipóteses. Nenhuma entrevista com usuário ou piloto foi realizada nesta produção. O protocolo de piloto acompanha o kit.

## Matriz de rastreabilidade

| Promessa | Material | Exercício | Evidência de qualidade |
| --- | --- | --- | --- |
| Histórico real | Guia e fichas | Seis histórias; relato de dois minutos | Campos de contexto, ação, resultado e reflexão; exemplos rotulados |
| Investigar endpoint lento | Caderno e gabaritos | Listar pedidos com volume crescente | Dados fixos, resultado equivalente, contagem de consultas e medições reais |
| Arquitetura sem resposta única | Caderno e gabaritos | Pedidos com estoque limitado e falha de notificação | Duas alternativas, consequências, falhas e critérios de decisão |
| Review com testes verdes | PR, laboratório e gabarito | Cinco defeitos em proposta de criação de pedidos | Regressão específica falha na proposta e passa na referência |
| Comportamento | Banco de 12 perguntas e fichas | Conflito, feedback, discordância e responsabilidade | Âncoras observáveis; distinção entre ausência de evidência e desempenho |
| Fundamentos | Banco de 24 perguntas | Seis áreas técnicas com aprofundamentos | Intenção, sinais e expectativas pleno/sênior em cada item |
| Treino completo | Quatro PDFs, Markdown e ZIP | Cinco sessões e simulado de 90 minutos | Instruções reproduzidas em cópia limpa e revisão dos PDFs |

## Método de avaliação

Dois eixos de igual peso: técnico e colaboração. Cada competência recebe 1 a 4 ou NO (não observado), com evidência. As expectativas variam por escopo e autonomia, não por anos de carreira ou uso de jargão. Nenhuma nota determina contratação ou senioridade. Clareza diz respeito à compreensão do raciocínio e não a sotaque, carisma ou estilo pessoal.

## Referências e limites

- [OPM: entrevistas estruturadas](https://www.opm.gov/policy-data-oversight/assessment-and-selection/structured-interviews/): relação entre competências, perguntas e escalas de avaliação.
- [Google: comentários de code review](https://google.github.io/eng-practices/review/reviewer/comments.html): respeito, justificativa e distinção de prioridade.
- [PostgreSQL 17: EXPLAIN](https://www.postgresql.org/docs/17/using-explain.html): planos de execução e cautela ao comparar estimativas e tempos.
- [GitLab: entrevista técnica](https://handbook.gitlab.com/handbook/hiring/interviewing/technical/): exemplo público de exercício contextualizado em merge request.

Consulta das referências: 30/10/2026. As rubricas e os exercícios são autorais. Verificação técnica e calibração pedagógica são registradas separadamente em `docs/validacao.md`.
