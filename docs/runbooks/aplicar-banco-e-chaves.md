# Roteiro: aplicar o banco e configurar as chaves

**Quem faz:** o dono do projeto (Thiago). **Nenhuma sessão de IA aplica migration em nenhum banco**: o conector de Supabase que as sessões usam enxerga outra conta, não a do TimeOn.

O objetivo é aplicar as migrations de `supabase/migrations/` (fundação, acesso e atletas) no projeto certo, sem perder nada, e deixar o CPF e os outros dados pessoais cifrados de verdade.

> **Regra de ouro:** antes de qualquer comando que altere o banco, confirme o nome e o *ref* do projeto na tela. O projeto do TimeOn é `plataforma-gestao-time` (ref `ncvejypuuorvvhqvbbsa`). Se o nome ou o ref não baterem, **pare**.

## 0. Antes de começar

- Docker instalado (para rodar os testes locais) e o terminal na pasta do repositório, branch `develop` ou `main` atualizada.
- Rode os testes locais. Tudo precisa passar:

```bash
bash supabase/tests/run-local.sh
```

Esperado no fim: `TODOS OS TESTES DE RLS PASSARAM`, `TODOS OS TESTES DE ACESSO PASSARAM`, `TODOS OS TESTES DE ATLETAS PASSARAM`, `AUDITORIA DE PERMISSOES PASSOU`, `verificador: 15 checagens OK` e `ok - a migration de cifra para sem apagar...`.

## 1. Descobrir se algo já foi aplicado sozinho

Se o projeto tiver a integração do Supabase com o GitHub ligada, o merge em `main` pode ter aplicado migrations.

1. No painel do Supabase, abra o projeto `plataforma-gestao-time` (confira o nome no topo).
2. *Project Settings → Integrations → GitHub*: veja se está conectada a este repositório.
3. No *SQL Editor*, rode (só lê):

```sql
select version, name from supabase_migrations.schema_migrations order by version;
```

Compare com os arquivos de `supabase/migrations/`. As migrations de 2026-11-01 em diante são as novas:

| Começa com | Assunto |
|---|---|
| `20261101…` | fundação multi-time (esportes, organizações, times, permissões) |
| `20261102…` | acesso (gestor, código do time, auditoria) e permissões de tabela |
| `20261103…` | atletas, posições, CPF cifrado, telefone e nascimento cifrados |

- **Nenhuma das novas aparece:** ótimo, siga para o passo 2.
- **Algumas aparecem:** anote quais. O `db push` do passo 4 aplica só as que faltam. Se a `20261103120100_athletes_core` já tiver sido aplicada **e existir algum atleta cadastrado**, a migration `20261103140000` vai parar de propósito, sem apagar nada (veja "Se der erro").
- **Quer evitar aplicação automática:** desligue a integração do GitHub enquanto estiver fazendo isso.

## 2. Ensaiar num projeto de desenvolvimento (recomendado)

1. No Supabase, crie um projeto novo só para teste (o plano grátis permite dois). Dê um nome que não deixe dúvida, como `timeon-dev`.
2. Aplique nele primeiro (passos 3 a 6, trocando o ref). Se o verificador do passo 6 passar lá, repita no projeto do TimeOn.

## 3. Ligar o terminal ao projeto certo

```bash
npx supabase login
npx supabase projects list
```

Na lista, confira a linha do projeto (nome e *ref*). Depois:

```bash
npx supabase link --project-ref ncvejypuuorvvhqvbbsa
```

(Para o ensaio, use o *ref* do `timeon-dev`.) O comando pede a senha do banco; ela fica no painel em *Project Settings → Database*.

## 4. Ver o que vai ser aplicado, sem aplicar

```bash
npx supabase migration list
npx supabase db push --dry-run
```

O `--dry-run` só lista. Confira que:

- a lista tem **só** migrations novas (as de `20261101…` a `20261103…`) e nenhuma antiga;
- o ref mostrado é o do projeto certo.

## 5. Guardar uma cópia antes

```bash
npx supabase db dump -f backup-antes-$(date +%Y%m%d).sql
```

Guarde esse arquivo fora do repositório (ele pode conter dados). No plano grátis não há restauração para um ponto no tempo, então esta cópia é o seu "desfazer".

## 6. Aplicar e verificar

```bash
npx supabase db push
```

Depois, no *SQL Editor* do **mesmo projeto**, cole o conteúdo de `supabase/verify/after-apply.sql` e rode. **Todas as 15 linhas precisam dizer `OK`.** Se alguma disser `FALHOU`, a coluna `detalhe` mostra o que está errado: não use o sistema e me mande a saída (sem dados pessoais, ela só tem nomes de tabelas e funções).

Confira também no painel:

- *Authentication → Providers / Sign In*: **cadastro público desligado**.
- *Project Settings → API → Exposed schemas*: só `public` (e `graphql_public`). **`private` não pode estar na lista.**
- *Table Editor*: as tabelas novas aparecem com RLS ligado.

## 7. Chaves do CPF e dos dados pessoais

Rode **no seu terminal**, não em chat nem em sessão de IA:

```bash
npm run keys:generate
```

Saem três variáveis: `PII_ENCRYPTION_KEYS`, `PII_KEY_VERSION` e `PII_HASH_KEY`.

1. Copie a saída direto para o **cofre de senhas**, em duas cópias (por exemplo, no gerenciador e num backup offline). **Perder `PII_ENCRYPTION_KEYS` é perder todos os CPFs, telefones e datas de nascimento**: sem a chave não há como decifrar.
2. Na Vercel (*Settings → Environment Variables*), crie as três variáveis em *Production* e *Preview*, marcadas como sensíveis.
3. Redeploy do projeto.
4. Em desenvolvimento use **outras** chaves (rode o comando de novo para o `.env.local`). Chave de produção nunca vai para o computador de desenvolvimento nem para o repositório.
5. Apague o histórico do terminal se ele guarda o que foi impresso.

**Rotação** (trocar a chave de cifra): `npm run keys:generate -- --rotate 2` imprime só a entrada nova. Acrescente-a ao JSON de `PII_ENCRYPTION_KEYS` **sem remover a antiga**, e só depois mude `PII_KEY_VERSION` para `2`. Os dados antigos continuam sendo lidos. **Não troque `PII_HASH_KEY`**: isso invalida todos os índices de CPF.

## 8. Política de privacidade

Antes de coletar CPF de verdade, publique a política. Há um rascunho em `docs/legal/politica-de-privacidade.md`, com o que precisa ser preenchido e revisado por quem entende de LGPD.

## Se der erro

- **`athletes already has rows` / `plaintext phones`** na migration `20261103140000`: ela parou de propósito para não apagar dado. Não force. Os dados precisam ser cifrados antes por um script no servidor; me avise.
- **Outro erro:** copie a mensagem inteira. O `db push` roda cada migration numa transação, então a que falhou não deixa meio-feito.
- **Desfazer:** não há migrations de volta. No projeto de desenvolvimento, apague e recrie. No projeto de produção, restaure da cópia do passo 5 e me avise antes de tentar de novo.

## Depois

Com o verificador todo `OK` e as chaves na Vercel, falta construir as rotas e telas (inscrição, entrada por código, agenda e jogo ao vivo). Elas só funcionam de verdade depois deste roteiro.
