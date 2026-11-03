# Feature Security - Protecao de Dados dos Atletas

O sistema guarda dados pessoais de atletas (CPF, telefone, data de nascimento, peso, altura, fotos) e desempenho individual. Estas regras existem para impedir vazamento e alteracao indevida. Sao obrigatorias para qualquer mudanca.

## Modelo de acesso

- Somente usuarios autenticados no Supabase Auth acessam o sistema. Nao ha acesso anonimo.
- Usuarios sao criados manualmente por quem administra o projeto; o cadastro publico fica desativado no painel do Supabase.
- O navegador nunca fala direto com o banco: leitura nas pages (servidor) e escrita em `/api`.
- Todos os usuarios logados tem o mesmo nivel (comissao tecnica). Se surgir perfil de atleta ou capitao, criar papeis e policies por papel antes de liberar.

## Camadas de defesa

| Camada | Onde | O que faz |
| --- | --- | --- |
| Proxy | `src/proxy.ts` | redireciona sem sessao para `/login` e aplica CSP, X-Frame-Options, nosniff, Referrer-Policy e Permissions-Policy |
| API | `src/lib/api.ts` | `authorize()` exige Origin igual ao host (CSRF) e sessao valida (401 sem login) |
| Allowlist | `resources` | so tabelas e colunas listadas sao gravaveis (evita mass assignment) |
| Validacao | rotas `[id]` | `id` precisa ser UUID; recurso inexistente retorna 404 |
| Banco | `supabase/migrations` | RLS ligado e policies `TO authenticated`; nada para `anon` |
| Storage | bucket `fotos-jogadores` | imagem JPG/PNG/WEBP, ate 2 MB; envio so autenticado; nome do arquivo e UUID |

## Regras obrigatorias

1. Chaves e segredos

- somente `NEXT_PUBLIC_SUPABASE_URL` e a chave publishable vao para o cliente.
- `service_role`, senhas e tokens nunca entram no repositorio, em `NEXT_PUBLIC_*` ou em log.
- `.env*` fica no `.gitignore`; se uma chave vazar, rotacionar no Supabase.

2. Banco

- toda tabela nova: `ENABLE ROW LEVEL SECURITY` + policy `TO authenticated`.
- proibido `USING (true)` para `anon` e `GRANT` para `anon`.
- migration que mexe em policy deve ser revisada como codigo de seguranca.
- tabela por time/organizacao: a policy usa `(select private.can_read_team(...))`, `can_write_team` ou `has_org_role`; funcoes `SECURITY DEFINER` ficam no schema `private` com `search_path` vazio.
- toda mudanca de RLS ganha caso positivo e negativo em `supabase/tests/` (rode `bash supabase/tests/run-local.sh`; o CI roda o mesmo).

3. API

- toda rota de escrita comeca com `authorize(request)`.
- usar `pickFields(body, config.fields)`; nunca repassar o corpo inteiro ao banco.
- resposta de erro generica; `console.error` so com a mensagem do erro, sem dados do atleta.
- rotas de login e logout so checam Origin; o limite de tentativas de login e do Supabase Auth.

4. Dados pessoais

- minimizar: pedir CPF e telefone somente se houver uso real.
- nao exibir CPF completo em listas; mostrar mascarado (`***.***.***-12`) quando precisar identificar.
- nao colocar dado de atleta em URL, query string, `localStorage` ou analytics.
- fotos de menores de idade exigem autorizacao do responsavel antes do upload.
- atender pedido de exclusao: remover atleta (`DELETE /api/players/:id`) e a foto do bucket.

5. Frontend

- sem `dangerouslySetInnerHTML` com dado do banco.
- links externos com `rel="noopener noreferrer"`.
- CSP continua restritiva; liberar novo dominio so com justificativa.

6. Dependencias e deploy

- `npm audit` antes de cada release; atualizar pacotes com vulnerabilidade alta.
- variaveis de ambiente configuradas apenas no painel da Vercel e do Supabase.
- producao e desenvolvimento usam projetos Supabase diferentes.
- ativar backup/PITR no Supabase e conferir periodicamente.

## Papeis, convites e acesso (task 00024)

Decisoes em `docs/backlog/2026-11-02-decisoes-acesso-e-jogos.md`.

- Papeis: admin (`org_memberships`), gestor (`team_staff.manager`), tecnico (`team_staff.coach`) e jogador (`team_players`). Permissao por funcao em `private`: `can_manage_team` (admin, gestor), `can_write_team` e `can_invite_players` (admin, gestor, tecnico), `can_read_team` (tambem jogador). Jogador nao le a comissao nem o elenco dos outros.
- Criar time: so por `public.create_team` (admin, gestor, tecnico). Quem nao e admin entra no time novo com o papel que ja tem; nunca com papel maior.
- Codigo do time: 12 caracteres de alfabeto de 32 (cerca de 60 bits), gerado no banco. **So o hash e guardado** e a coluna `code_hash` nao e legivel pelo cliente (grant por coluna): nunca use `select *` em `team_invites`. O texto aparece uma vez, na resposta de `create_team_invite`.
- Papel fixado no codigo. Gestor e tecnico geram so codigo de jogador do proprio time; codigo de gestor e de tecnico so o admin gera e vale 1 uso.
- `redeem_team_invite` responde igual para codigo errado, vencido, revogado ou esgotado (`invalid`), para nao ensinar nada a quem chuta. **5 erros em 15 minutos travam a pessoa** (`too_many_attempts`). Isso protege usuarios autenticados; a tela de cadastro por codigo (task futura) precisa de limite por IP no servidor, e a conta nova passa por senha e 2FA.
- Aceite: com `requires_approval` (padrao) a pessoa fica pendente; gestor, tecnico ou admin decide. Pedido de gestor ou tecnico so o admin decide. Ninguem decide o proprio pedido.
- Link de convite: o codigo vai depois do `#` (`/entrar#codigo=...`), que o navegador nao envia ao servidor.
- `audit_events` e so de insercao (gatilho barra update e delete) e nunca recebe o codigo. Leitura so para admin.
- Todas as escritas desse fluxo passam por funcoes `SECURITY DEFINER` com `search_path` vazio; as tabelas nao tem INSERT, UPDATE nem DELETE para o cliente (exceto remover jogador, por gestor ou admin).

## Atletas e CPF (task 00025)

- Um cadastro por pessoa (`athletes`, com sexo e nascimento) e **um perfil esportivo por time** (`team_members`: posicao validada por `sport_positions`, camisa unica por time, status). Sexo e nascimento so admin e gestor corrigem; a pessoa nao muda depois de inscrita.
- **CPF so existe em claro na memoria do servidor** (`src/lib/cpf.ts`). No banco ficam o texto cifrado (AES-256-GCM, 40 bytes: versao, IV, tag e conteudo, com o id do atleta como dado autenticado) e um indice cego (HMAC-SHA-256 com o id da organizacao) para achar duplicado sem decifrar.
- Chaves so em variavel de ambiente do servidor (Vercel), nunca no repositorio nem no navegador: `CPF_ENCRYPTION_KEYS` (JSON versao para chave de 32 bytes em base64), `CPF_KEY_VERSION` e `CPF_HASH_KEY` (base64, 32 bytes ou mais). Rotacao: acrescente a chave nova, mude `CPF_KEY_VERSION` e recifre aos poucos; as antigas continuam decifrando. Trocar `CPF_HASH_KEY` obriga recalcular todos os indices.
- `athlete_private` nao tem policy nem grant: so as funcoes `set_athlete_private`, `read_athlete_private`, `find_athlete_by_cpf_index` e `delete_athlete_private` acessam. O tamanho fixo (40 e 32 bytes) barra CPF em claro.
- **Toda leitura do CPF e gravada em `audit_events` na mesma transacao**, antes de devolver. Leitura negada nao grava. A auditoria nunca guarda CPF, indice, telefone nem nome.
- Quem acessa o CPF: a propria pessoa, admin da organizacao, gestor de um time em que a pessoa joga e quem cadastrou a pessoa (se ainda e admin ou gestor). **Tecnico nunca.** Apagar: so admin ou a propria pessoa.
- Armadilha ja vista: funcao booleana que devolve nulo para quem nao tem papel (`org_staff_role(...) = 'manager'`). Em `if ... or not funcao(...)` o nulo nao barra ninguem. Use `coalesce(..., false)` e teste o caso sem vinculo.

## Checklist de PR

- [ ] Tabela nova tem RLS e policy `TO authenticated`
- [ ] Policy nova usa `private.can_*` / `has_org_role` e tem teste em `supabase/tests/`
- [ ] Tabela com segredo (hash, chave) nao concede SELECT na coluna secreta ao cliente
- [ ] Funcao de permissao usada em `if not ...` nunca devolve nulo (teste o usuario sem vinculo)
- [ ] Recurso novo esta em `resources` com colunas minimas
- [ ] Rota nova chama `authorize()` e usa `pickFields`
- [ ] Nenhum `createBrowserClient` ou chave secreta no cliente
- [ ] Nenhum dado de atleta em log, URL ou analytics
- [ ] Upload valida tipo e tamanho
- [ ] `npm run lint`, `npm run build` e `npm audit` sem problemas altos

## Como reportar vazamento

1. Revogar sessoes e rotacionar as chaves no Supabase.
2. Desligar o acesso afetado (policy ou rota) ate corrigir.
3. Avisar a comissao tecnica e os atletas envolvidos.
4. Registrar o que vazou, a causa e a correcao.

## Configuracao obrigatoria no Supabase (painel)

O codigo nao consegue garantir estes pontos sozinho; sem eles o banco fica exposto.

1. **Migrations aplicadas** em ordem, incluindo `20261030120000_lock_down_rls.sql` (fecha o acesso anonimo) e `20261030140000_private_photos.sql` (fotos privadas).
2. **Cadastro publico desativado**: Authentication → Sign In / Providers → desligar "Allow new users to sign up". Usuarios sao criados manualmente.
3. **Chaves novas**: Settings → API Keys → usar as chaves `publishable`/`secret` e desativar as chaves JWT antigas (`anon`/`service_role`). Uma chave `anon` antiga aparece no historico publico do repositorio.
4. **2FA para administradores**: cada admin ativa em `/conta/seguranca` (TOTP, gratis).
5. **Senha minima**: Authentication → Policies → tamanho minimo 10 e exigir letras e numeros.

## Garantias no codigo

- `next` sempre na ultima versao corrigida; `npm audit --omit=dev` sem vulnerabilidades.
- CPF e telefone nunca vao em lista: so `GET /api/players/:id/private` ao abrir um atleta para editar, sem cache.
- Fotos em bucket privado; o banco guarda so o caminho e as telas recebem URL assinada de 1 hora.
- Contas com 2FA: o proxy e a API so liberam a sessao depois do codigo (nivel `aal2`).
- O header `x-powered-by` e desligado. `server: Vercel` e o certificado `*.vercel.app` vem da hospedagem e so somem com dominio proprio.
