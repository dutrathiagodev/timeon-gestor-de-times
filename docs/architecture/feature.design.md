# Feature Design - Design System TimeOn

Marca e sistema visual do TimeOn, derivados da logo. Toda cor, fonte e forma do site nasce daqui. Segue [feature.spec.md](feature.spec.md) (estrutura) e [feature.security.md](feature.security.md) (dados).

> **Design System vigente: v1.1** ([design-system-v1.1.md](design-system-v1.1.md), direção de evolução, enviado pelo dono em 2026-11-03). A [v1.0](design-system-v1.0.md) fica como referência de componentes e acessibilidade; onde divergirem (cor laranja `#FF641A`, menos cartões, faixa de título compacta, menu só com o que existe), vale a v1.1. Fonte da marca: Inter no lugar de Sora na interface; o logo continua o mesmo.

> Fonte da verdade da marca: o desenho da logo (arquivo "TimeOn" no Claude Design). Este documento descreve como ela vira codigo. O layout das telas e provisorio (moldura base do card 00046) e sera redesenhado depois; marca, cor e fonte ja valem.

## Marca

| Item | Valor |
| --- | --- |
| Nome | **TimeOn** (escrito assim: T maiusculo so no texto corrido) |
| Descritor | Gestao de times |
| Ideia | o "O" e a bola do esporte do time; a bola de volei e a principal e pode trocar por modalidade (futsal, basquete...) |
| Icone do app | atleta saltando com bola, em quadrado de cantos arredondados (raio 23% do lado) |

### Versoes e arquivos

| Uso | Arquivo | Observacao |
| --- | --- | --- |
| Logo (wordmark) | `src/components/ui/brand-logo.tsx` (`<BrandLogo />`) | SVG inline; letras em `currentColor`, bola e "n" final em `--brand`, costuras em `--logo-ink` |
| Favicon | `src/app/favicon.ico` (16, 32, 48) | gerado do icone |
| Icone SVG / PNG | `src/app/icon.svg`, `icon.png` (512) | o Next publica sozinho |
| Icone iOS | `src/app/apple-icon.png` (180) | |
| Foto do time | `public/falcons-team-hero.jpg` | conteudo do time, nao e marca |

### Regras de uso

- Fundo escuro: letras `--paper`, bola e "n" `--brand`, costuras `--ink`. Fundo claro: letras `--ink`, costuras `--paper`.
- Area de respeito: metade da altura do "T" em volta.
- Largura minima do wordmark: 96 px. Abaixo disso, usar so o icone.
- Nao esticar, girar, trocar a cor da bola nem usar a bola em outra posicao.
- Logo e nome do time (ex.: Falcons Volei) sao coisas diferentes: o time aparece como conteudo, a marca TimeOn aparece como plataforma.

## Cores

Tokens em `src/app/globals.css` (`:root`).

| Token | Valor | Uso |
| --- | --- | --- |
| `--brand` | `#ff6a1a` | acao principal, destaque, bola da logo |
| `--brand-strong` | `#e5560a` | hover e estados pressionados |
| `--ink` / `--background` | `#101217` | fundo do app, texto sobre laranja |
| `--paper` / `--text` | `#f5f3ee` | texto sobre fundo escuro, fundo claro |
| `--canvas` | `#eceae4` | fundo de pagina clara (marketing, impressao) |
| `--line` | `#d3d0c7` | bordas em fundo claro |
| `--muted` | `#5b5f68` | texto secundario em fundo claro |
| `--success` | `#2fd883` | **so** significado de sucesso (vitoria, disponivel, ok) |
| `--danger` | `#ff6b70` | erro e perigo |
| `--gold`, `--blue` | `#f0c55c`, `#63b7ff` | apoio (ranking, informacao) |

Regra: laranja e a marca, verde e significado. Nao usar verde como cor de marca nem laranja para indicar sucesso.

### Contraste (WCAG)

| Par | Razao | Pode usar para |
| --- | --- | --- |
| `--paper` sobre `--ink` | 16,9 : 1 | qualquer texto |
| `--brand` sobre `--ink` | 6,5 : 1 | texto e icones em fundo escuro |
| `--ink` sobre `--brand` | 6,5 : 1 | texto de botao primario |
| `--success` sobre `--ink` | 10,1 : 1 | texto e icones |
| `--muted` sobre `--paper` | 5,8 : 1 | texto secundario |
| `--brand` sobre `--paper` | **2,6 : 1** | **nunca texto**; so formas grandes ou decorativas |
| `#b8470a` sobre `--paper` | 4,8 : 1 | laranja para texto em fundo claro |

## Tipografia

Fonte unica: **Sora** (pesos 400 a 700), a mesma da logo. Carregada com `next/font/google` em `src/app/layout.tsx`: o arquivo e baixado no build e servido do proprio dominio (sem chamada ao Google em producao, sem custo).

| Papel | Peso | Detalhes |
| --- | --- | --- |
| Titulo de pagina e de hero | 700 | `letter-spacing: -0.02em`, `clamp(2rem, 4vw, 3rem)` |
| Numeros de destaque (stats, overall) | 700 | `letter-spacing: -0.02em` |
| Subtitulos e rotulos de secao | 600 | rotulos pequenos em caixa alta com `0.08em` a `0.1em` |
| Texto corrido | 400 | 14 a 16 px, linha 1,5 |
| Texto de apoio | 400 | 12 a 13 px, `--text-muted` |

Tokens: `--font-heading` e `--font-body` apontam para `--font-sora`. Para trocar a fonte da marca, mude so `src/app/layout.tsx` e esses dois tokens.

## Formas e componentes

| Elemento | Regra |
| --- | --- |
| Raio | cards 22 a 24 px; botoes e campos 14 px; selos 999 px; icone do app 23% |
| Cartao (`.panel`, `.card`) | vidro escuro `--surface`, borda `--border`, sombra `--shadow` |
| Botao primario (`.btn-primary`) | gradiente `--brand` para `#ff8f4d`, texto `--ink`, minimo 44 px de altura |
| Selo (`.page-hero-kicker`) | texto `--brand`, fundo `--brand-soft`, caixa alta |
| Campo (`.form-input`) | fundo `rgba(255,255,255,.05)`, foco com anel laranja |
| Sucesso | `.tone-success`, `.skill-high`, `.feedback-box.success` usam `--success` |
| Escalacao (`LineupBoard`, `.board-*`) | slots sao botoes posicionados pelas coordenadas da formacao em `src/sports`; clique, teclado (Esc cancela) e arrastar; alerta de posicao em dourado com texto (nao so cor); botao de 46 a 68 px; texto no tabuleiro acima de 6,5:1; nomes em selo escuro para ler sobre qualquer campo |
| Card de nota (`RatingCard`, `.overall-card`) | papel claro em degradê por faixa (elite 90+, ouro 80+, prata 70+, bronze), texto `#34260d` acima de 6:1; a forma vai num selo claro (`#fffaeb`) com verde/vermelho fechados, porque `--success` e `--danger` nao passam de 3:1 sobre o dourado; a posicao vai num selo escuro (`#34260d`, 14:1), pois as classes `event-type-*` sao para fundo escuro e davam 1,1:1 sobre o papel |

## Implementacao e verificacao

- Cores e fonte vivem em `globals.css` e `layout.tsx`; nenhum componente define cor ou fonte propria.
- A logo e sempre o componente `<BrandLogo />`, nunca uma imagem copiada.
- Antes de aceitar uma mudanca visual: contraste dos pares novos na tabela acima, `npm run lint` e `npm run build` sem erros.
- Layout, animacoes e telas novas por esporte seguem o plano em `docs/backlog/` e dependem do layout que o Thiago enviar.

## Moldura base (provisoria)

Criada para ter onde pendurar as telas multi-esporte; o desenho final vem em outra demanda.

- `src/components/layout/app-frame.tsx`: cabecalho + menu lateral + conteudo; `/login` fica sem moldura.
- `app-header.tsx`: marca, **organizacao** e **time** ativos (selects) e "Sair". Abaixo de 1100 px os seletores passam para o topo do menu lateral.
- `active-context.tsx`: organizacao e time ativos, guardados no navegador (`timeon.activeOrganization`, `timeon.activeTeam`). Trocar de organizacao limpa o time. Papel do usuario (`role`) vem do servidor.
- Menu em secoes (Principal, Gerenciar, Sistema) filtrado por papel: jogador nao ve Modalidades nem Gestao de acesso. Rodape do menu: cartao "Acesso atual", "Trocar acesso" (dialogo com organizacao e time) e "Sair".
- `/acesso` (so administracao e gestor): esqueleto da gestao de acesso (codigo do time, pedidos pendentes, pessoas e papeis); ainda nao le nem grava no banco (card 00042).
- Acabamento: scrolls escuros, foco visivel, "Ir para o conteudo", selos "Em breve", alvos de toque de 44 px.
- Inicio (`/`): escolha de organizacao e lista de times por modalidade; "Criar time" so aparece para administracao, gestor e tecnico (hoje desligado, "em breve"); "Entrar com codigo" idem.
- `src/lib/teams.ts`: de onde vem a lista. **Hoje e fixa** (so o time de volei do modelo antigo); troca pela leitura do banco novo nos cards 00042 e 00043.

## Design System v1.1 aplicado (base provisória)

Primeira aplicação, feita em 2026-11-03; o dono vai refinar depois.

- **Tokens** em `src/app/globals.css` (`:root` e `[data-theme="dark"|"light"]`): `--color-brand`, `--color-bg`, `--color-surface`, `--color-surface-soft`, `--color-border`, `--color-text*`, semânticas, `--radius-sm|md|lg|xl`. Os nomes antigos (`--surface`, `--border`, `--brand`...) apontam para eles, então as telas antigas já usam a paleta nova.
- **Tema escuro** é o ativo. Os tokens do **tema claro estão prontos**, mas **não ligados**: as telas antigas (painel, atletas, jogos, estatísticas, escalação, login) ainda têm cores escuras escritas direto no CSS. Antes de ligar o tema claro é preciso migrá-las para os tokens.
- **Fonte:** Inter (`next/font`), números tabulares.
- **Faixa de título compacta** (`TopBar`): etiqueta de contexto, título 28/650, frase curta e uma ação; sem banner.
- **Menu lateral** recolhível (216 px / 68 px em ícones), com o logo no topo e só os itens que existem para o papel. Módulo sem tela não aparece no menu.
- **Tabelas** (`.data-table`) para dados comparáveis (times por modalidade, pessoas e papéis); em tela pequena escondem colunas opcionais (`.col-optional`).
- **Botões** de 40 px, primário laranja liso com texto escuro (contraste), secundário com borda; **cartões** só com superfície e borda de 1 px, sem sombra.
- **Foco visível** laranja, "Ir para o conteúdo", `prefers-reduced-motion`, alvos de 40 a 44 px.
- **Ainda falta** migrar as telas antigas para os tokens e para o padrão de faixa/tabela, ligar o tema claro, e criar os estados de carregamento, erro e sucesso padronizados (toast).

## Cartas dos atletas

Componente `RatingCard` (`src/components/rating-card`), igual ao desenho aprovado no Claude Design ("Cartas TimeOn"): escudo com cantos chanfrados e ponta rasa, borda dupla, estilhaços e listras pretas no canto direito, brilho nas bordas de baixo, nota e posição em fonte condensada (Barlow Condensed, só nas cartas), bola da modalidade, silhueta (masculina ou feminina) ou foto, nome, até seis estatísticas e a logo do TimeOn (ícone e marca) no pé. O cartão antigo do vôlei (`OverallCard`) agora só adapta os dados e usa o mesmo componente.

| Variante | Nota | Visual |
| --- | --- | --- |
| Especial | 90 ou mais | fundo preto, destaque laranja, reflexo animado |
| Ouro | 80 a 89 | fundo preto, destaque dourado |
| Prata | 70 a 79 | fundo preto, destaque prata |
| Bronze | abaixo de 70 (iniciantes) | fundo preto, destaque bronze |

Bolas: estrelas na de futebol, gomos na de basquete, painéis azul e amarelo no vôlei, gomos no handebol. Inspiradas nas bolas oficiais, sem logos de marcas (UEFA, Wilson etc.). Animações respeitam "reduzir movimento".

- **Estatísticas por posição** (`face.ts`): cada posição mostra só o que vale para ela. Goleiro vê "Goleiro" primeiro e nenhuma de ataque; o líbero do vôlei não tem saque, ataque nem bloqueio; no máximo seis por carta.
- **Galeria** (`/cartas`): uma linha por posição e as quatro variantes, por modalidade, com atletas e notas de exemplo.
- Os cortes de nota estão em `tier.ts`; as cores, em `globals.css` (bloco "Carta do atleta"), por variáveis `--card-*` de cada variante.
- **Ainda não existe** na nota: as estatísticas finas que as referências mostram (reflexo, posicionamento, velocidade, marcação, jogo aéreo, recepção do líbero etc.). Hoje a carta mostra as estatísticas que a nota calcula. Acrescentá-las pede definir, com o dono, quais entram em cada posição e como são calculadas (guia de modalidades, seção 11).
- **Fonte:** a carta usa a Inter da interface (as referências usam uma fonte condensada); trocar é decisão de design.
