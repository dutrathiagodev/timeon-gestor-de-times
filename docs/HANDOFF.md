# TimeOn — contexto para continuar o projeto

Documento de passagem: qualquer pessoa ou agente que assumir o repositório deve ler isto primeiro, depois `CLAUDE.md`/`AGENTS.md` e `docs/architecture/`.

**Para entender o desenho do sistema e como mantê-lo atualizado:** [DOCUMENTO-VIVO.md](DOCUMENTO-VIVO.md) (mapa dos documentos, situação de cada módulo, como atualizar e melhorar) e [architecture/system-design.md](architecture/system-design.md). As regras das modalidades estão em [domain/guia-modalidades-esportivas.md](domain/guia-modalidades-esportivas.md).

## O que é

**TimeOn** (repo `dutrathiagodev/timeon-gestor-de-times`, antes "Falcons"): plataforma de gestão de times esportivos. Hoje atende um time (Falcons Vôlei, Atlética FAP); a meta é multi-time e multi-esporte (vôlei, futsal, fut7/society, campo, basquete, handebol) com conta do atleta, jogo ao vivo, OVR por esporte e escalação salva. Custo zero e segurança são prioridade.

- Produção: https://timeon-painel.vercel.app (projeto Vercel `timeon`, time `risemov-projects`, região `iad1`)
- Banco: Supabase `plataforma-gestao-time` (ref `ncvejypuuorvvhqvbbsa`, us-east-1, plano grátis)
- Trello: quadro "TimeOn - Gestor de Times" (https://trello.com/b/3Pzd4STd) com GitHub Power-Up
- Stack: Next.js 16.4 (App Router), React 19, TypeScript, Tailwind 4, Supabase (Postgres, Auth, Storage), Vitest, GitHub Actions

## Estado atual (2026-11-03)

| Área | Situação |
|---|---|
| Site em produção | marca TimeOn (logo, Inter, laranja/grafite), login com 2FA TOTP. PR #52 (layout completo + Design System v1.1): moldura nova com troca de organização e time, menu por papel, `/acesso` e `/modalidades`; telas antigas só ganharam a paleta e **ainda precisam migrar** para os tokens e o tema claro. Organização, times e papel são **fixos** em `src/lib/teams.ts` até as telas lerem o banco |
| Segurança | RLS só `authenticated`, anon sem privilégios, API com allowlist/CSRF/2FA, fotos privadas com URL assinada, `npm audit` 0 |
| Banco: fundação, acesso e atletas (00017, 00024, 00025, 00038) | **Aplicado em produção em 2026-11-03** (projeto `plataforma-gestao-time`, ref `ncvejypuuorvvhqvbbsa`): 12 migrations coladas no SQL Editor como uma transação só, e `supabase/verify/after-apply.sql` deu **15 de 15 OK**. As tabelas novas estão vazias e nenhuma tela as usa ainda. Gestor, time único por esporte+categoria+faixa, criar time, código do time com aceite, atletas com perfil por time, CPF, telefone e data de nascimento cifrados no servidor, auditoria de leitura. Testes locais: 236 verificações de RLS, auditoria de permissões, verificador e o pacote (`bash supabase/tests/run-local.sh`) |
| Layout novo | aguardando o usuário (card 00031) |
| Plano multi-esporte | decisões do dono em `docs/backlog/2026-11-02-decisoes-acesso-e-jogos.md`, todas aceitas; em 2026-11-03 telefone e nascimento passaram a ser cifrados. Resta só a direção visual (card 00031) |
| Histórico de migrations e integração com o GitHub | O banco **não tem** o schema `supabase_migrations` (nunca usou o CLI), então **não use `supabase db push`**. A integração Supabase↔GitHub foi conectada em 2026-11-03: branches por PR estão **desligadas** (o check `Supabase Preview` aparece como `skipped` nos PRs, sem custo), mas **um push no `main` dispara um deploy de migrations em produção**, que para na primeira migration antiga ("policy ... already exists") e **não aplica nada**; o check fica vermelho no `main`. **Desligue "Deploy to production"** em *Project Settings → Integrations → GitHub* (ou desconecte o repositório) para ele nunca aplicar nada sozinho. Para a próxima migration: `node scripts/build-apply-sql.mjs --from <versão> --out apply.sql`, colar no SQL Editor e rodar o verificador. Roteiro: `docs/runbooks/aplicar-banco-e-chaves.md` |
| Código novo sem uso nas telas | `src/sports` (registro, OVR, ajuste do treinador, escalação, motor ao vivo), `src/lib` (cifra de CPF, telefone e nascimento) e os componentes `rating-card` e `lineup-board`. **Faltam rotas e telas** (inscrição, entrada por código com limite por IP, agenda, jogo ao vivo); dependem das chaves `PII_*` e do layout (00031) |

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

0. **Desligar "Deploy to production"** da integração Supabase↔GitHub (ou desconectar o repositório) e conferir que o check `Supabase Preview` deixa de ficar vermelho no `main`.
1. **Chaves `PII_*`**: gerar no próprio terminal (`npm run keys:generate`), guardar duas cópias no cofre de senhas e configurar na Vercel. Sem elas nenhuma rota de CPF funciona. Perder `PII_ENCRYPTION_KEYS` é perder os dados.
2. **Painel do Supabase**: conferir que `private` não está em *Settings > API > Exposed schemas* (o verificador não conseguiu ler essa configuração) e que o cadastro público está desligado.
3. **Política de privacidade**: revisar e publicar o rascunho de `docs/legal/politica-de-privacidade.md` antes de coletar CPF de verdade.
4. Card 00031: enviar o layout novo (design e animações).
5. **Trello**: criar os cards (texto pronto em `docs/backlog/2026-11-02-cards-para-o-trello.md`) e conferir os números 00019 a 00040, escolhidos sem consultar o quadro.
6. Decidir sobre o arquivo `LICENSE` (o README não declara licença).
7. Opcional: imagem de pré-visualização social do repositório (Settings → Social preview).
