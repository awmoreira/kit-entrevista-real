# Kit Entrevista Real

Preparação prática para entrevistas de backend pleno e sênior, em português. Cinco blocos conectam experiência profissional, investigação, arquitetura, code review e colaboração.

**[Baixar o kit completo](https://github.com/awmoreira/kit-entrevista-real/releases/latest)** · **[Começar pelo guia](conteudo/01-guia.md)** · **[Entender a proposta](docs/dossie-produto.md)**

Gratuito, sem cadastro. Autoria: Allan Winckler. Edição **1.0.0**.

## O que você recebe

- Guia de preparação com cinco sessões, seis histórias profissionais e método de autoavaliação.
- Caderno com investigação de endpoint, arquitetura, PR para revisar, 24 perguntas técnicas e 12 comportamentais.
- Gabaritos comentados, cinco bugs comprovados em PostgreSQL real e roteiro do facilitador.
- Fichas editáveis, simulado de 90 minutos e protocolo de piloto com cinco participantes.
- Quatro PDFs, fontes Markdown, laboratório e evidências no ZIP da release.

| Bloco | Trabalho produzido | Simulado |
| --- | --- | --- |
| Histórico real | Relatos com contribuição, resultado e aprendizado | 15 min |
| Endpoint lento | Hipóteses e investigação com evidências | 20 min |
| Arquitetura | Decisão com alternativas e consequências | 20 min |
| Code review | Comentários priorizados e reprodução | 20 min |
| Comportamento | Ações, consequências e plano de melhoria | 15 min |

Prepare o review por 30 minutos e teste o ambiente antes do simulado. O debrief de 15 minutos ocorre depois dos 90 minutos.

## Começar em dez minutos

Para ler, baixe os PDFs ou abra o guia. Para executar, instale **Node.js 24** e **Docker com Compose v2**. No Windows, use WSL2 com integração do Docker Desktop. Extraia o ZIP da release ou clone este repositório. Em um terminal na pasta:

```sh
node --version
docker compose version
npm ci
npm run lab:setup
npm test
npm run lab:start
```

A primeira instalação baixa dependências e a imagem do PostgreSQL; sua duração depende da conexão. A API fica em http://127.0.0.1:3337 e o banco na porta 55437. O laboratório atende apenas no computador local.

```sh
curl -i -H 'x-test-identity: empresa-aurora' 'http://127.0.0.1:3337/orders?limit=20'
```

As identidades empresa-aurora e empresa-brisa são fixtures públicas. Não representam autenticação de produção. Os contratos estão no [caderno](conteudo/02-exercicios.md) e em [OpenAPI](docs/openapi.json).

## Percurso

1. [Leia o guia e mapeie seis histórias](conteudo/01-guia.md).
2. [Faça os exercícios e use as pistas gradualmente](conteudo/02-exercicios.md).
3. [Pratique os fundamentos](conteudo/02-fundamentos.md) e [as perguntas comportamentais](conteudo/02-comportamento.md).
4. [Registre as respostas nas fichas](conteudo/04-fichas.md), copiadas para minhas-respostas, que é ignorada pelo Git.
5. [Após a tentativa, compare com os gabaritos](conteudo/03-gabaritos.md) e [as medições](conteudo/medicoes.md).

O [diff do PR](exercicios/review/proposta.diff) compara as versões [base](src/versions/base.ts) e [proposta](src/versions/proposta.ts). A [referência corrigida](src/versions/referencia.ts) fica disponível para consulta após sua revisão.

## Comandos de prática

| Comando | Efeito |
| --- | --- |
| npm run lab:setup | Sobe o PostgreSQL dedicado e reinicia kit_lab |
| npm run lab:reset | Restaura a amostra pequena de kit_lab |
| npm run lab:volume | Substitui pedidos de kit_lab por 20.000 pedidos sintéticos |
| npm run lab:start | Serve a proposta em 127.0.0.1:3337 |
| npm run lab:start -- referencia | Serve a referência corrigida |
| npm run lab:start -- base | Serve a consulta anterior ao PR; criação responde 501 |
| npm test | Executa os testes iniciais, verdes na proposta |
| npm run test:reference | Verifica contratos e falhas na referência |
| npm run verify:bugs | Prova os cinco bugs; sobrescreve o relatório de evidências |
| npm run verify:bugs -- B03 | Verifica um caso e grava relatório em tmp |
| npm run bench | Mede N+1 e índice em kit_bench e atualiza as evidências e o capítulo de medições |
| npm run pr:diff | Atualiza o diff base para proposta |
| npm run lab:stop | Para os contêineres; preserva o volume do kit |

Testes usam kit_test e a medição usa kit_bench. Rode suítes que usam kit_test em sequência. Reiniciar o laboratório não apaga suas fichas. As rotinas recusam destinos externos, bancos com outro nome e parâmetros adicionais. A variável DATABASE_URL é ignorada. KIT_DATABASE_URL, se exportada explicitamente, só aceita banco local chamado kit_entrevista_real.

## Se algo impedir a instalação

- Node diferente de 24: use um gerenciador de versões com a versão em .nvmrc; confira node --version no mesmo terminal que executará npm.
- Docker indisponível: abra Docker Desktop ou inicie seu serviço Docker, confirme docker info e repita lab:setup.
- Porta 55437 ocupada: identifique o serviço existente antes de encerrar algo. Para usar outra porta, altere apenas a porta publicada em compose.yaml e exporte KIT_DATABASE_URL com a mesma porta local. Mantenha o nome do banco e os dados didáticos. No WSL2, use export como no Linux.
- Porta 3337 ocupada: encerre o servidor de laboratório que você iniciou com Ctrl+C e tente novamente.
- Erro de conexão em testes: execute lab:setup e confirme docker compose ps. Uma falha de ambiente não comprova um bug do exercício.
- Campos ou pedidos diferentes do início: execute lab:reset. Para investigar volume, rode lab:volume depois do reset.

## Reconstruir os PDFs e o ZIP

Quem apenas lê os PDFs e executa o laboratório não precisa de Python. Para reconstruir os documentos, instale Python 3.11 ou superior e Poppler (pdfinfo e pdftoppm). Use um ambiente virtual:

```sh
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements-docs.txt
npm run docs:check
npm run docs:build
npm run docs:verify
npm run release:check
npm run release:pack
npm run release:verify-archive
```

No WSL2, os mesmos comandos funcionam no terminal Linux. O gerador também aceita KIT_PYTHON apontando para um Python com as dependências instaladas. Os PDFs ficam em output/pdf e a distribuição em dist. A construção usa os Markdown declarados em conteudo/volumes.json, gera sumário e marcadores e registra hashes das fontes. A verificação de arquivo extrai uma cópia em tmp, confere o manifesto, instala dependências, executa os checks do laboratório e faz chamadas HTTP reais. Depois de gerar seu relatório, execute release:pack novamente para incluí-lo no ZIP; release:verify-archive -- --no-record permite verificar o arquivo final sem alterar esse registro.

## Qualidade, fontes e limites

Consulte o [registro da validação](docs/validacao.md), as [provas dos bugs](evidencias/provas-bugs.json) e o [benchmark capturado](evidencias/benchmark.json). O piloto pedagógico com participantes reais está pendente; o [protocolo](conteudo/04-piloto.md) acompanha a edição. As rubricas são autorais e orientam prática, sem corte de aprovação ou alegação de validade para seleção.

A divisão 50/50 entre técnica e colaboração é uma convenção do kit. Cada competência exige evidência, e NO significa não observado. O resultado preserva os dois eixos e conduz a um próximo exercício.

As referências incluem [OPM](https://www.opm.gov/policy-data-oversight/assessment-and-selection/structured-interviews/), [Google Engineering Practices](https://google.github.io/eng-practices/review/reviewer/comments.html), [PostgreSQL](https://www.postgresql.org/docs/17/using-explain.html) e [node-postgres](https://node-postgres.com/features/transactions). O [dossiê](docs/dossie-produto.md) descreve a ligação entre a promessa e as evidências.

## Licenças e contribuições

Código em src, scripts e tests: [MIT](LICENSE). Textos, exercícios, rubricas, relatórios, diagramas e PDFs: [CC BY-NC 4.0](LICENSE-CONTENT.md). Respeite os créditos e a restrição de uso comercial dos materiais. As [notas de terceiros](docs/terceiros.md) identificam dependências e fontes.

Use os modelos de issue para problemas técnicos e retorno pedagógico. Inclua edição, comando, ambiente e resultado observado. Relatos pessoais e credenciais de outros projetos devem ficar fora das issues. Contribuições de código seguem MIT; contribuições de conteúdo seguem CC BY-NC 4.0.
