# TimeOn — contexto para continuar o projeto

Documento de passagem: qualquer pessoa ou agente que assumir o repositório deve ler isto primeiro, depois `CLAUDE.md`/`AGENTS.md` e `docs/architecture/`.

## O que é

**TimeOn** (repo `dutrathiagodev/timeon-gestor-de-times`, antes "Falcons"): plataforma de gestão de times esportivos. Hoje atende um time (Falcons Vôlei, Atlética FAP); a meta é multi-time e multi-esporte (vôlei, futsal, fut7/society, campo, basquete, handebol) com conta do atleta, jogo ao vivo, OVR por esporte e escalação salva. Custo zero e segurança são prioridade.

- Produção: https://timeon-painel.vercel.app (projeto Vercel `timeon`, time `risemov-projects`, região `iad1`)
- Banco: Supabase `plataforma-gestao-time` (ref `ncvejypuuorvvhqvbbsa`, us-east-1, plano grátis)
- Trello: quadro "TimeOn - Gestor de Times" (https://trello.com/b/3Pzd4STd) com GitHub Power-Up
- Stack: Next.js 16.4 (App Router), React 19, TypeScript, Tailwind 4, Supabase (Postgres, Auth, Storage), Vitest, GitHub Actions

## Estado atual (2026-11-01)

| Área | Situação |
|---|---|
| Site em produção | marca TimeOn (logo, Sora, laranja/grafite), login com 2FA TOTP, painel com design antigo |
| Segurança | RLS só `authenticated`, anon sem privilégios, API com allowlist/CSRF/2FA, fotos privadas com URL assinada, `npm audit` 0 |
| Fundação multi-time (00017) e acesso (00024) | migrations (fundação e `*_access_*`: gestor, time único por esporte+categoria+faixa, criar time, código do time com aceite, auditoria) e 236 verificações de RLS, uma auditoria de permissões e um verificador prontos; **não aplicadas ao banco de produção** |
| Layout novo | aguardando o usuário (card 00031) |
| Plano multi-esporte | decisões do dono registradas em `docs/backlog/2026-11-02-decisoes-acesso-e-jogos.md` (papéis, CPF seguro, convite por código, jogos); faltam 4 confirmações na seção 8 do documento |
| Atletas e dados cifrados (00025, 00038) | migrations `*_athletes_*` (atletas, perfil por time, CPF, telefone e data de nascimento cifrados no servidor, leitura auditada), `src/lib/field-crypto.ts` e `npm run keys:generate`; **não aplicadas ao banco de produção**. Roteiro para aplicar: `docs/runbooks/aplicar-banco-e-chaves.md` (o banco de produção **não tem histórico de migrations do CLI**: não use `db push`; cole o pacote de `node scripts/build-apply-sql.mjs --out apply.sql` no SQL Editor); verificador para rodar no Supabase: `supabase/verify/after-apply.sql`. Estado verificado em 2026-11-03: produção só tem as três tabelas antigas e a função `rls_auto_enable` do Supabase. Nenhuma sessão de IA aplica migration: o dono aplica no Supabase do projeto (o conector da sessão vê outra conta) |
| Código novo sem uso nas telas | `src/sports` (registro, OVR, ajuste do treinador, escalação) e componentes `rating-card` e `lineup-board`; ligar às telas depende do banco novo e do layout (00031) |

Backlog (cards 00017 a 00028) em `docs/backlog/2026-10-30-gestor-multi-esporte.md` (+ `-flow.html` e `-scheme.html`). Próximo passo técnico: **00018, registro de esportes em `src/sports`**.

## Fluxo de trabalho (obrigatório)

- Trabalho em `develop`; `main` é produção. Um PR por task, de branch para `develop`; o release `develop → main` é aberto pelo agente e **mergeado pelo usuário**.
- Branch: `TimeOn/<NNNNN>-<slug>` (ex.: `TimeOn/00018-registro-esportes`). Task com **5 dígitos**, igual ao card do Trello.
- Commits: Conventional Commits (`feat|fix|docs|test|chore|ci(escopo): resumo`), corpo explicando o porquê, rodapé `Refs: NNNNN`. Commits pequenos e com conteúdo; sem commits artificiais.
- Autoria: commitar na identidade do git do dono; nunca adicionar coautor nem atribuição de ferramenta em commits, PRs ou docs.
- Antes de PR: `npm run lint`, `npm test`, `npm run build` e, se mexeu em RLS, `bash supabase/tests/run-local.sh` (precisa de Docker). O CI roda tudo.
- Trello (modelo do projeto fapbooks): colunas Backlog, To Do, In Progress, Blocked, Awaiting PR, Awaiting Build, Awaiting QA, QA Rejected, Done. Etiquetas de tipo (ÉPICO, FEATURE, BUG, TASK, CONFIG), prioridade (P0, P1, P2) e área. Critérios de aceite em checklist; épicos têm o checklist "Cards filhos". Descrições curtas: "O que é / Por quê / Pai / Depende de".

## Regras de código e segurança

- Next 16: `middleware` virou `src/proxy.ts`; leia `node_modules/next/dist/docs/` antes de usar APIs que você não conhece.
- O navegador nunca fala direto com o banco: leitura no servidor (RSC), escrita por `/api/*` (`src/lib/api.ts`: `resources`, `authorize`, `pickFields`, CSRF por Origin, `getUser()` + aal2 nas escritas). Proxy valida a sessão com `getClaims()` (local).
- Toda tabela nova: RLS + policy `TO authenticated`; policies por time usam `(select private.can_read_team(...))`, `can_write_team`, `has_org_role` (schema `private`, `SECURITY DEFINER`, `search_path` vazio). Nunca `GRANT` para `anon`.
- CPF/telefone só via `GET /api/players/:id/private`. Nada de dado de atleta em log ou URL.
- Detalhes: `docs/architecture/feature.security.md`. Marca e design system: `docs/architecture/feature.design.md` (laranja é marca, verde só significa sucesso; laranja sobre papel claro nunca como texto).
- Segredos nunca no repositório; `.env.local` é local (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`). Supabase com cadastro público desligado: usuários são criados pela administração.

## Como rodar

```bash
npm install
npm run dev      # http://localhost:3000 (precisa do .env.local)
npm run lint && npm test && npm run build
bash supabase/tests/run-local.sh   # RLS em Postgres 17 efêmero (Docker)
```

Para tirar print/inspecionar telas sem login, use uma **cópia** do projeto fora do repositório com um desvio temporário de sessão em `src/lib/supabase/middleware.ts` e `.env.local` falso. Nunca commitar esse desvio. Copie `node_modules` (Turbopack não aceita symlink).

## Armadilhas já encontradas

- Em PRs empilhados o merge vai para a branch pai, não para `develop`: abra cada PR contra `develop`.
- `pkill -f` com um padrão que aparece no próprio comando encerra o shell; encerre por PID (`ss -ltnp | grep :PORTA`).
- Python com `-I` ignora pacotes do usuário (Pillow); rode sem `-I` quando precisar de PIL/cairo.
- `next dev` reescreve o bloco do `AGENTS.md`; descarte essa mudança se não for intencional.
- Conector do Trello: cria e edita cards, listas, etiquetas anexadas e checklists, mas **não** marca itens de checklist, não cria etiquetas nem renomeia quadro; isso foi feito pela interface web (navegador).
- Vercel: o domínio `*.vercel.app` do projeto não muda sozinho ao renomear; o domínio ativo hoje é `timeon-painel.vercel.app`.

## Pendências do dono do projeto

1. Mergear os releases abertos para `main` (produção).
2. Card 00030: responder as 4 perguntas da seção 8 de `docs/backlog/2026-11-02-decisoes-acesso-e-jogos.md` (gestor revela CPF? código de 1 uso para técnico e gestor? aceitar convite libera na hora? telefone sem criptografia de campo?).
3. Card 00031: enviar o layout novo (design e animações).
4. Aplicar a migration da 00017 no Supabase só depois de validar o plano (`supabase db push`).
5. Decidir sobre o arquivo `LICENSE` (o README não declara licença).
6. Opcional: imagem de pré-visualização social do repositório (Settings → Social preview).
