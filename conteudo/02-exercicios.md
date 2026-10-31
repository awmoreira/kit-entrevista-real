# Caderno de exercícios

## Antes da primeira tentativa

Edição 1.0.0. Leia o guia, prepare o ambiente e copie as fichas para minhas-respostas. Separe o volume de gabaritos até terminar sua tentativa. Os enunciados deste caderno são fictícios. No bloco de histórico e nas perguntas comportamentais, responda com experiências reais suas.

Em cada bloco, registre o que você sabe, o que supõe e o que gostaria de perguntar. Sua tarefa é tornar seu raciocínio verificável. Há informações suficientes para começar e espaço para pedir esclarecimentos.

## Bloco 1: histórico real

Escolha uma entrega que você conhece profundamente. Em dois minutos, explique qual problema existia, quem era afetado, sua responsabilidade e o resultado. Depois responda aos aprofundamentos: qual decisão teve maior custo? Que alternativa você descartou? O que deu errado? Que evidência sustenta o resultado? O que faria diferente hoje?

Prepare também um incidente ou falha de sua trajetória. Inclua a detecção, a mitigação imediata e a mudança posterior. Se sua ação ajudou mas não resolveu completamente o problema, explique o limite. Você pode usar um projeto pessoal, acadêmico ou de equipe, deixando o contexto explícito.

Entrega: seis histórias mapeadas e uma narrativa com contribuição individual, alternativas e aprendizado. Tempo do simulado: 15 minutos, incluindo aprofundamentos.

## Contexto comum: a Central de Pedidos

A Central atende Aurora Papelaria e Brisa Escritório. Cada empresa tem seu catálogo, estoque e pedidos. Um produto pertence a uma empresa. O serviço atual consulta pedidos confirmados e itens; o PR propõe criar pedidos e reservar estoque. As identidades locais são empresa-aurora e empresa-brisa.

O laboratório é um recorte: a criação recebe um produto e uma quantidade; pedidos históricos podem conter vários itens. Não há pagamento, carrinho, frete, cancelamento HTTP ou notificação implementados. A discussão de arquitetura considera a evolução desse recorte.

### Contrato de consulta

GET /orders aceita limit inteiro entre 1 e 100, com padrão 20. Requer o header x-test-identity. Retorna pedidos confirmados da empresa em ordem decrescente de data e id, com seus itens. A consulta representa uma primeira página limitada; não há cursor nem promessa de navegação por todas as páginas nesta edição.

O header x-lab-sql-count informa o número de consultas SQL realizadas pela listagem. Ele existe para o exercício, não como substituto de telemetria de produção.

```sh
curl -i -H 'x-test-identity: empresa-aurora' 'http://127.0.0.1:3337/orders?limit=20'
```

### Contrato de criação

POST /orders recebe productId e quantity de 1 a 20. Requer x-test-identity e idempotency-key de 1 a 100 caracteres alfanuméricos, ponto, sublinhado, dois-pontos ou hífen. priceCents é um campo legado opcional e deve ser ignorado no cálculo autoritativo: o preço vem do catálogo. A versão proposta precisa ser revisada em relação a esse contrato.

Uma resposta de criação ou repetição bem-sucedida usa HTTP 201 e contém id, tenantId, productId, quantity, unitPriceCents e totalCents. Mesma empresa, chave e conteúdo devem retornar o mesmo pedido. Mesma chave com outro produto ou quantidade deve resultar em 409. Empresas diferentes podem usar a mesma chave. Valores monetários são centavos inteiros.

```sh
curl -i -X POST 'http://127.0.0.1:3337/orders' -H 'content-type: application/json' -H 'x-test-identity: empresa-aurora' -H 'idempotency-key: meu-treino-1' -d '{"productId":"prod-aurora","quantity":2}'
```

Status previstos: 400 para entrada inválida; 401 para identidade ausente ou desconhecida; 404 para produto inexistente ou de outra empresa; 409 para estoque insuficiente ou conflito de chave; 500 para falha interna. A versão base responde 501 à criação. As identidades e credenciais locais são dados didáticos públicos, sem integração com contas reais.

## Bloco 2: este endpoint está lento

O suporte relata que a listagem de pedidos fica mais lenta quando a tela solicita mais registros. Não há relato de perda de dados. Sua primeira tarefa é escolher o que investigar. Não presuma que a origem está no banco; formule hipóteses sobre aplicação, banco, dependências e carga.

Perguntas iniciais: o que significa "lento" para o usuário? A lentidão começou após uma mudança? Afeta todas as empresas? Há aumento de erros? Como p50, p95 e volume variam? Qual correlação você precisa para seguir uma requisição?

Prepare uma amostra maior no laboratório. Este comando substitui apenas os pedidos sintéticos do schema de prática; faça isso antes de começar suas próprias compras de teste.

```sh
npm run lab:reset
npm run lab:volume
npm run lab:start
```

Compare limit=1, limit=20 e limit=50. Anote resposta, consultas e condições da execução. Leia o código da listagem, proponha a menor mudança que atende à hipótese e diga como provar equivalência. Só depois de sua proposta rode npm run bench e compare o relatório com sua expectativa.

Entrega: nota de investigação com três hipóteses, medidas para distingui-las, evidência encontrada, alteração proposta, riscos e verificação. Tempo do simulado: 20 minutos. Não é necessário implementar tudo nesse intervalo.

### Pista 1: amplie a observação

Compare número de consultas com o número de pedidos retornados. O comportamento se mantém quando você usa uma empresa com poucos pedidos? Uma consulta individual rápida pode participar de uma requisição lenta.

### Pista 2: delimite o custo

Siga o caminho entre buscar pedidos e anexar seus itens. Verifique quantidade de viagens ao banco, paralelismo e limite do pool. Distinguir quantidade de trabalho de duração é útil antes de aumentar recursos.

### Pista 3: proponha e verifique

Você consegue obter os itens de uma página em uma consulta? Como preservará a ordem dos pedidos, a ordenação dos itens, a empresa e o resultado vazio? Na extensão para sênior, examine o plano da consulta de pedidos e discuta um índice que combine filtro e ordenação.

## Bloco 3: arquitetura com alternativas

Após validar o produto, a Central pretende atender 500 empresas, 50.000 pedidos por dia e picos de 100 criações por segundo. Esses números são condições fictícias do exercício, não resultados do benchmark. A equipe tem três engenheiros e oito semanas para a primeira entrega. Pode operar uma API e PostgreSQL em uma região; operar novos componentes consome capacidade da equipe.

Metas de projeto: disponibilidade mensal de 99,9%; p95 de até 300 ms para criar ou listar pedidos em condição normal; estoque nunca negativo; nenhuma compra pode consumir produto de outra empresa; repetir uma requisição não deve criar outro pedido. O escopo aceita que notificações cheguem depois da confirmação. O provedor de notificação pode ficar indisponível por duas horas e aceitar mensagens duplicadas.

Desenhe o fluxo de criação. Declare o significado de "pedido confirmado" e quais dados devem mudar juntos. Discuta reserva concorrente da última unidade, queda da API após o commit, timeout no cliente e falha do provedor. Identifique o estado autoritativo e os pontos em que pode haver repetição.

Compare uma solução com núcleo transacional e uma evolução com processamento assíncrono de notificações. Escolha uma, indique o que entrega nas oito semanas e defina um sinal que justificaria evoluí-la. Explique como mediria as metas e como voltaria atrás de uma mudança de aplicação sem desfazer pedidos válidos.

Entrega: decisão de uma página com requisitos, alternativas, escolha, custos, falhas, observabilidade e evolução. Tempo do simulado: 20 minutos. Perguntas de esclarecimento fazem parte da atividade.

## Bloco 4: revisar o PR

Título do PR: "Permitir criar pedido e reservar estoque". A empresa de teste deve receber um pedido confirmado com preço do catálogo e débito de estoque. A criação deve atender às regras do contrato, inclusive duas requisições simultâneas e repetição após timeout. As consultas existentes devem continuar funcionando.

Leia exercicios/review/proposta.diff, src/versions/proposta.ts e tests/iniciais.test.ts. A versão anterior está em src/versions/base.ts. Os hooks são pontos internos para sincronizar transações e injetar uma falha SQL durante os diagnósticos; não são parâmetros HTTP nem funcionalidades de clientes.

```sh
npm run lab:reset
npm test
npm run pr:diff
```

Prepare a revisão por 30 minutos. Escreva comentários com condição de reprodução e impacto. Marque o que considera bloqueante, pergunta de esclarecimento ou sugestão opcional. Escolha um caso para transformar em teste. No simulado, use 20 minutos para explicar a revisão e discutir prioridades.

Depois da tentativa, consulte o gabarito e execute npm run verify:bugs. Você também pode executar um caso específico, por exemplo npm run verify:bugs -- B01. O diagnóstico não faz parte dos testes iniciais: ele verifica as condições que esses testes não cobrem.

Entrega: comentários priorizados, ao menos uma reprodução e uma decisão fundamentada sobre o PR. Encontrar um problema real que não esteja no gabarito também é válido se você demonstrar condição, consequência e limite.

## Bloco 5: comportamento

Escolha uma pergunta sobre conflito e outra sobre feedback no banco a seguir. Responda com situações reais. Explique o que a outra pessoa buscava, como você verificou sua interpretação e que decisão foi tomada. Diga o que mudou na sua atuação depois do episódio.

Situação adicional, fictícia: faltam dois dias para uma entrega. Você encontra um risco de duplicação de pedidos. Uma colega propõe adiar a correção e o gerente teme perder um cliente. Como você torna o risco compreensível, busca alternativas e participa de uma decisão com responsabilidade explícita?

Entrega: respostas com ações e consequências; na situação fictícia, uma proposta que considera risco técnico, prazo e comunicação. Tempo do simulado: 15 minutos. Discordar é compatível com colaborar. Clareza não exige um estilo pessoal específico.

## Como encerrar a tentativa

Complete as fichas antes de abrir o gabarito. Registre uma evidência forte, uma incerteza e um próximo exercício por bloco. Marque competências não observadas e planeje outra oportunidade. Use os bancos de perguntas para variar os aprofundamentos; o simulado não exige responder às 36 perguntas na mesma sessão.
