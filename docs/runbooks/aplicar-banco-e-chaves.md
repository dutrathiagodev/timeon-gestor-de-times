# Roteiro: aplicar o banco e configurar as chaves

**Quem faz:** o dono do projeto (Thiago). **Nenhuma sessão de IA aplica migration em nenhum banco**: o conector de Supabase que as sessões usam enxerga outra conta, não a do TimeOn.

O objetivo é colocar no projeto certo as migrations novas (fundação multi-time, acesso, atletas e dados cifrados), sem perder nada, e deixar CPF, telefone e data de nascimento cifrados de verdade.

> **Regra de ouro:** antes de qualquer coisa que altere o banco, confirme o **nome** e o **ref** do projeto na tela. O projeto do TimeOn é `plataforma-gestao-time`, ref `ncvejypuuorvvhqvbbsa` (aparece no fim do endereço: `supabase.com/dashboard/project/ncvejypuuorvvhqvbbsa`). Se não bater, **pare**.

## Situação verificada em 2026-11-03

Consulta feita no projeto certo: o banco tem **só as três tabelas antigas** (`estatisticas_individuais`, `jogadores_leilao`, `jogos`, todas com RLS ligada) e a função `rls_auto_enable` (recurso "ligar RLS automaticamente" do próprio Supabase). **Não existe** o schema `supabase_migrations`: o banco nunca recebeu migrations pelo CLI nem pela integração com o GitHub. Por isso **não use `supabase db push`**: ele trataria todas as migrations como pendentes e tentaria refazer as tabelas antigas. O caminho abaixo cola um pacote só com as migrations novas.

As migrations novas **só criam objetos novos** e não mexem nas três tabelas antigas.

## Resultado: aplicado em 2026-11-03

O pacote de 12 migrations foi colado no SQL Editor do `plataforma-gestao-time` (`Success. No rows returned`) e o verificador `supabase/verify/after-apply.sql` deu **15 de 15 `OK`**. O que resta deste roteiro é a parte das **chaves** (passo 5), a **política** (passo 6) e a conferência manual do painel (passo 4). Os passos 1 a 3 só precisam ser repetidos para migrations futuras (`--from <versão>` gera o pacote só com as novas).

## Aviso: a integração com o GitHub (aprendido em 2026-11-03)

O projeto Supabase está conectado a este repositório. Duas configurações dela importam:

- **Branches por PR: desligadas.** Nos PRs o check `Supabase Preview` aparece como `skipped` ("Creating a new preview branch per PR is disabled"). Nada a fazer, e sem custo.
- **"Deploy to production": precisa ficar DESLIGADO.** Com ela ligada, todo push no `main` tenta aplicar as migrations do repositório no banco de produção, a partir da mais antiga. Como o banco foi montado à mão e não tem `supabase_migrations`, ela **para na primeira** (`ERROR: policy "Autenticados gerenciam jogadores" for table "jogadores_leilao" already exists`) e **não aplica nada**: o check `Supabase Preview` fica vermelho no `main`, e só.

Isso é inofensivo hoje, mas se o histórico de migrations for "consertado" de um jeito que a deixe passar do começo, ela passaria a aplicar migrations em produção sozinha, sem o verificador e sem você olhar. Por isso: *Project Settings → Integrations → GitHub* e desligue "Deploy to production" (ou desconecte o repositório; nada neste roteiro precisa da integração).

**Como saber que está certo:** depois de desligar, o check `Supabase Preview` deixa de ficar vermelho no `main` (aparece `skipped` ou some). Se um dia ele aparecer **verde** num push no `main`, ele aplicou alguma coisa: investigue.

## 0. Antes de começar

Rode os testes locais (precisa de Docker). Tudo precisa passar:

```bash
bash supabase/tests/run-local.sh
```

Esperado no fim: `TODOS OS TESTES DE RLS PASSARAM`, `TODOS OS TESTES DE ACESSO PASSARAM`, `TODOS OS TESTES DE ATLETAS PASSARAM`, `AUDITORIA DE PERMISSOES PASSOU`, `verificador: 15 checagens OK` e os três `ok - …` do final (trava da migration e pacote).

## 1. Gerar o pacote

Na pasta do repositório, com `develop` atualizada:

```bash
node scripts/build-apply-sql.mjs --out apply.sql
```

Ele só lê arquivos e escreve `apply.sql` (não fala com banco nenhum). Deve listar **12 migrations**, de `20261101120000_foundation_sports.sql` a `20261103140000_athletes_encrypted_fields.sql`. Não commite o `apply.sql`.

## 2. Ensaio num projeto de desenvolvimento (recomendado)

1. No Supabase, crie um projeto novo só para teste (o plano grátis permite dois), com nome que não deixe dúvida, como `timeon-dev`.
2. Faça os passos 3 a 5 nele primeiro. O pacote não depende das tabelas antigas, então roda num projeto vazio. Se o verificador do passo 4 passar lá, repita no projeto do TimeOn.

## 3. Aplicar

1. Abra o **SQL Editor** do projeto. **Confira o nome e o ref no topo e no endereço.**
2. Crie uma consulta nova, cole o conteúdo inteiro de `apply.sql` e clique em **Run**.
3. O editor pode avisar que a consulta tem "operações destrutivas" (`drop`). Isso é esperado: são `drop` de colunas e funções que a própria migration acabou de criar, e a trava da migration de cifra se recusa a rodar se já existir atleta cadastrado. Confirme.
4. Resultado esperado: `Success. No rows returned`.

O editor envia tudo como **uma consulta só, que é uma transação**: se qualquer parte falhar, **nada é aplicado**. Se aparecer erro, copie a mensagem inteira e me mande; o banco continua como estava.

## 4. Verificar

No SQL Editor do **mesmo projeto**, cole o conteúdo de `supabase/verify/after-apply.sql` e rode. Ele só lê o catálogo. **As 15 linhas precisam dizer `OK`.** Se alguma disser `FALHOU`, a coluna `detalhe` mostra o que está errado: não use o sistema e me mande a saída (só tem nomes de tabelas e funções, nenhum dado pessoal).

Confira também no painel:

- *Authentication → Sign In / Providers*: **cadastro público desligado**.
- *Project Settings → API → Exposed schemas*: só `public` (e `graphql_public`). **`private` não pode estar na lista.**
- *Table Editor*: as tabelas novas aparecem com RLS ligado.

## 5. Chaves do CPF e dos dados pessoais

Rode **no seu terminal**, não em chat nem em sessão de IA:

```bash
npm run keys:generate
```

Saem três variáveis: `PII_ENCRYPTION_KEYS`, `PII_KEY_VERSION` e `PII_HASH_KEY`.

1. Copie a saída direto para o **cofre de senhas**, em duas cópias. **Perder `PII_ENCRYPTION_KEYS` é perder todos os CPFs, telefones e datas de nascimento**: sem a chave não há como decifrar.
2. Na Vercel (*Settings → Environment Variables*), crie as três variáveis em *Production* e *Preview*, marcadas como sensíveis, e faça um redeploy.
3. Em desenvolvimento use **outras** chaves (rode o comando de novo para o `.env.local`). Chave de produção nunca vai para o computador de desenvolvimento nem para o repositório.
4. Limpe o histórico do terminal se ele guarda o que foi impresso.

**Rotação:** `npm run keys:generate -- --rotate 2` imprime só a entrada nova. Acrescente-a ao JSON de `PII_ENCRYPTION_KEYS` **sem remover a antiga**, e só depois mude `PII_KEY_VERSION` para `2`. **Não troque `PII_HASH_KEY`**: isso invalida todos os índices de CPF.

## 6. Política de privacidade

Antes de coletar CPF de verdade, publique a política. Há um rascunho em `docs/legal/politica-de-privacidade.md`, com as decisões que só você toma e o que precisa de revisão de quem entende de LGPD.

## 7. Histórico de migrations (só se for usar o CLI depois)

Como o pacote foi colado à mão, o banco continua sem `supabase_migrations`. Se um dia quiser usar `supabase db push`, primeiro registre as migrations como já aplicadas, depois de `supabase link`:

```bash
npx supabase migration repair --status applied 20260426174937 20260430163000 20261030120000 20261030140000 20261030150000 20261101120000 20261101120100 20261101120200 20261101120300 20261101120400 20261102120000 20261102120100 20261102120200 20261103120000 20261103120100 20261103130000 20261103140000
```

Até lá, para cada migration nova futura repita este roteiro (`--from <versão>` gera um pacote só com as novas).

## Se der erro

- **Erro ao rodar o pacote:** nada foi aplicado (é uma transação). Mande a mensagem inteira.
- **`athletes already has rows` / `plaintext phones`:** a trava da migration de cifra parou de propósito, porque já existem atletas ou telefones em claro. Não force. Os dados precisam ser cifrados antes por um script no servidor; me avise.
- **Verificador com `FALHOU`:** não use o sistema; mande a saída.
- **Desfazer:** o pacote só cria objetos novos. No projeto de desenvolvimento, apague e recrie. No de produção, me avise antes de qualquer tentativa de remover.

## Depois

Com o verificador todo `OK` e as chaves na Vercel, falta construir as rotas e telas (inscrição, entrada por código, agenda e jogo ao vivo). Elas só funcionam de verdade depois deste roteiro.
