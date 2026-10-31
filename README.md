# Kit Entrevista Real

Preparação prática para entrevistas de backend pleno e sênior, em português. Cinco blocos conectam experiência, investigação, arquitetura, code review e colaboração.

**[Baixar o kit](https://github.com/awmoreira/kit-entrevista-real/releases/latest)** · **[Começar como candidato](conteudo/01-guia.md)** · **[Conduzir como entrevistador](conteudo/03-conducao.md)**

Gratuito, sem cadastro. Autoria: Allan Winckler. Edição **1.1.0**. A [revisão crítica](docs/revisao-critica-1.1.0.md) documenta lacunas e correções; a release 1.0.0 permanece disponível.

## O que você recebe

- Quatro PDFs e suas fontes Markdown: preparação, exercícios, gabaritos/condução e fichas/piloto.
- Cinco sessões de estudo e um simulado de 90 minutos, com roteiro comum para quem conduz.
- Um caso conectado de pedidos e estoque, PR autocontido, exercícios executáveis e espaço de correção do candidato.
- 24 perguntas técnicas, 12 comportamentais e exemplos comentados para as dez competências das rubricas.

| Bloco | Trabalho produzido | Simulado |
| --- | --- | --- |
| Histórico real | Relato com contribuição, resultado e aprendizado | 15 min |
| Endpoint | Hipóteses e investigação apoiada em evidências | 20 min |
| Arquitetura | Decisão com alternativas e consequências | 20 min |
| Code review | Comentários priorizados e reprodução | 20 min |
| Comportamento | Ações, consequências e plano de melhoria | 15 min |

Prepare o review por 30 minutos e o ambiente antes da sessão. O debrief de 15 minutos ocorre depois dos 90 minutos. O simulado não exige implementar todas as correções ao vivo.

## Percurso do candidato

1. [Leia o guia](conteudo/01-guia.md), organize seis histórias reais e copie [as fichas](conteudo/04-fichas.md) para minhas-respostas, ignorada pelo Git.
2. [Tente os enunciados](conteudo/02-exercicios.md) e registre suas decisões. As [pistas](conteudo/02-pistas.md) ficam em um apêndice separado.
3. Use os [fundamentos](conteudo/02-fundamentos.md) e o [banco comportamental](conteudo/02-comportamento.md) como estudo; eles já mostram sinais esperados. Para uma primeira tentativa, responda antes de ler esses sinais.
4. Após os cinco blocos do simulado, consulte o [gabarito](conteudo/03-gabaritos.md), os [exemplos de calibração](conteudo/03-calibracao.md) e prepare duas próximas ações.

Os gabaritos são públicos e separados por finalidade pedagógica. Quem já leu as soluções pode usar as variações do piloto ou fazer um estudo comentado. Não é necessário cadastro ou envio de respostas.

## Executar o laboratório

Instale **Node.js 24** e **Docker com Compose v2**. No Windows, use WSL2 integrado ao Docker Desktop. Extraia o ZIP ou clone o repositório e, num terminal na pasta, execute:

```sh
node --version
docker compose version
npm ci
npm run lab:setup
npm test
npm run lab:start
```

A instalação inicial baixa dependências e imagem do PostgreSQL; o tempo depende da conexão. A API usa http://127.0.0.1:3337; o banco, a porta 55437. O atendimento é local. As identidades empresa-aurora e empresa-brisa são fixtures públicas de teste. O [contrato do caderno](conteudo/02-exercicios.md) e o [OpenAPI](docs/openapi.json) descrevem as entradas.

```sh
curl -i -H 'x-test-identity: empresa-aurora' 'http://127.0.0.1:3337/orders?limit=20'
```

Sem Docker, é possível praticar na modalidade documental: o entrevistador fornece os cartões do seu roteiro, e a pessoa explica SQL, testes ou pseudocódigo. Registre a modalidade e as condições da sessão.

## Praticar sua correção

Revise primeiro o [diff original](exercicios/review/proposta.diff). Depois edite **src/versions/candidato.ts**, uma cópia destinada à prática, e execute:

```sh
npm run test:candidate
npm run lab:start -- candidato
```

O teste do candidato deve começar vermelho: a cópia inicial contém os mesmos defeitos intencionais do PR. O comando executa contratos contra sua implementação e pode ficar verde após suas correções. Ele não altera a proposta original nem a referência. Passar nos contratos não dispensa explicar a solução e seus limites.

| Comando de prática | Efeito |
| --- | --- |
| npm run lab:setup | Sobe PostgreSQL e reinicia a amostra de kit_lab |
| npm run lab:reset | Restaura a amostra pequena de kit_lab |
| npm run lab:volume | Substitui pedidos de kit_lab por 20.000 pedidos sintéticos |
| npm run lab:start | Serve a proposta original |
| npm run lab:start -- candidato | Serve sua implementação de prática |
| npm test | Testes iniciais, verdes na proposta original |
| npm run test:candidate | Contratos da implementação do candidato; inicialmente vermelhos |
| npm run lab:stop | Para contêineres e preserva o volume do kit |

Testes usam kit_test; medição usa kit_bench. Execute suítes que usam kit_test em sequência. A listagem do modo candidato continua sendo a do exercício; test:candidate avalia a criação do pedido, e não uma implementação de otimização da listagem. As fichas locais não são apagadas por reset.

## Se algo impedir a instalação

- Node diferente de 24: use a versão de .nvmrc num gerenciador de versões e confira no mesmo terminal.
- Docker indisponível: abra Docker Desktop ou inicie o serviço; confira docker info e repita lab:setup.
- Porta 55437 ocupada: identifique o serviço antes de encerrá-lo. Para escolher outra porta, altere a porta publicada em compose.yaml e exporte KIT_DATABASE_URL com a mesma porta local, mantendo o banco kit_entrevista_real.
- Porta 3337 ocupada: encerre com Ctrl+C o servidor que você iniciou nessa porta.
- Erro de conexão nos testes: execute lab:setup e confira docker compose ps. Isso é uma falha de ambiente, não prova de bug do exercício.
- Dados diferentes do início: execute lab:reset; para investigar volume, execute depois lab:volume.

KIT_DATABASE_URL só é lida se exportada explicitamente; o arquivo .env.example é uma referência, não um carregador de ambiente. As rotinas recusam destinos externos, nomes de banco diferentes e parâmetros adicionais. DATABASE_URL de outro projeto é ignorada.

## Percurso do entrevistador

Use o [roteiro comum](conteudo/03-conducao.md): abertura, perguntas centrais, cartões de evidência, aprofundamentos, tempo e mapa das dez competências. Compare os [exemplos de calibração](conteudo/03-calibracao.md) antes da sessão. Registre oportunidade, ajuda e trecho observado; NO significa falta de oportunidade suficiente, não zero ou uma lacuna escondida.

Os dois eixos têm igual peso editorial e permanecem separados. As notas descrevem qualidade no escopo pleno ou sênior combinado; uma nota não determina senioridade. Um risco central continua registrado mesmo com média alta. As rubricas orientam treino e não definem aprovação em seleção.

<details>
<summary>Curadoria e evidências técnicas - contém soluções</summary>

Os [gabaritos](conteudo/03-gabaritos.md) e as [medições](conteudo/medicoes.md) revelam as soluções. Os cinco bugs do PR são intencionais e permanecem na proposta original. O teste de concorrência da edição 1.1 aceita atualização condicional e lock de linha; uma regressão reproduz o falso negativo do avaliador da edição anterior.

| Comando de curadoria | Efeito |
| --- | --- |
| npm run test:reference | Verifica a referência e o próprio avaliador |
| npm run verify:bugs | Prova os cinco defeitos da proposta original |
| npm run verify:bugs -- B03 | Verifica apenas esse caso, com relatório em tmp |
| npm run bench | Captura comparação, cartões e planos e atualiza o capítulo de medições |
| npm run pr:diff | Gera o diff base para proposta original |
| npm run lab:start -- referencia | Serve a referência corrigida |
| npm run lab:start -- base | Serve a consulta anterior ao PR; criação retorna 501 |

O benchmark preserva respostas e reduz 51 consultas para duas numa página de 50 pedidos. Tempos são contextuais. Provas e medições registram hashes dos arquivos usados; uma alteração relevante exige nova captura.

Para reconstruir documentos, instale Python 3.11 ou superior e Poppler. O ambiente do mantenedor precisa de:

```sh
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements-docs.txt
npm run verify:bugs
npm run bench
npm run pr:diff
npm run docs:build
npm run docs:verify -- --render
npm run docs:review-info
```

Inspecione todas as páginas renderizadas em tmp/pdfs. Registre reviewer, pagesInspected, version e sourcesSha256 em evidencias/revisao-visual.json, com approved=true somente após a inspeção. docs:review-info fornece os dados atuais sem aprovar nada. Copie as folhas de contato para docs/revisao-visual. Depois:

```sh
npm run release:check
npm run release:pack
npm run release:verify-archive
npm run release:pack
npm run release:verify-archive -- --no-record
```

Os PDFs ficam em output/pdf; os ativos, em dist/1.1.0. Cada edição possui sua pasta para evitar misturar ZIPs. O gerador aceita KIT_PYTHON para selecionar outro Python configurado. A cópia limpa verifica o manifesto, instala dependências, testa o percurso do candidato vermelho/verde e faz chamadas HTTP reais. --database-ready usa um banco local já preparado em vez de iniciar outro contêiner; é o modo usado pela CI. O relatório usa hashes de fontes para evitar autorreferência no ZIP.

</details>

## Estado da validação e licenças

Consulte o [registro técnico](docs/validacao.md), o [dossiê](docs/dossie-produto.md) e a [revisão crítica](docs/revisao-critica-1.1.0.md). O [piloto pedagógico](conteudo/04-piloto.md) com pessoas reais continua pendente. A revisão documental e os testes não equivalem à observação de candidatos ou à validação preditiva das rubricas.

Código: [MIT](LICENSE). Materiais educacionais: [CC BY-NC 4.0](LICENSE-CONTENT.md), com atribuição e restrição de uso comercial. [Terceiros e fontes](docs/terceiros.md) mantêm seus próprios termos. Use os modelos de issue para relatar edição, trecho, ambiente e resultado; preserve relatos pessoais e credenciais de outros projetos fora das issues.
