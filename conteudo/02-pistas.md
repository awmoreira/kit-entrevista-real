# Pistas graduais da investigação

## Antes de abrir uma pista

Edição 1.1.0. Volte aqui apenas depois de registrar hipótese e próxima medida no bloco do endpoint. No simulado acompanhado, peça a informação ao entrevistador. Leia uma pista, escreva o que mudou e só então escolha se precisa da próxima. Elas orientam estudo e não formam um teste secreto.

## Pista 1: amplie a observação

Compare número de consultas com número de pedidos retornados. O comportamento muda com limites 1, 20 e 50? Que outra medida você buscaria para separar trabalho no banco, espera por conexão e espera por dependência? Uma consulta individual rápida pode participar de uma requisição custosa.

## Pista 2: delimite o custo

Siga o caminho entre buscar pedidos e anexar seus itens. Verifique viagens ao banco, paralelismo e limite do pool. Distinga quantidade de trabalho e duração antes de aumentar recursos. Registre a evidência que enfraqueceria sua hipótese.

## Pista 3: proponha e verifique

Você consegue obter os itens de uma página em lote? Como preservará ordem dos pedidos, ordem dos itens, empresa e resultado vazio? Na extensão para sênior, examine separadamente o plano da consulta e o custo de um índice que combine filtro e ordenação.

## Depois da tentativa

Finalize a nota de investigação antes de abrir o volume de gabaritos. Use npm run bench para comparar sua expectativa com a medição do laboratório, sabendo que esse comando revela as versões e a solução de referência. Uma conclusão diferente da referência precisa explicar a evidência e a forma de verificá-la.
