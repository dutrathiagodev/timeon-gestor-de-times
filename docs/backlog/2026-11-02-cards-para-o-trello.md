# Cards para o Trello

O quadro "TimeOn - Gestor de Times" é onde o Thiago acompanha o trabalho, mas **não havia conector de Trello na sessão** que gerou estes PRs. Este arquivo tem o texto pronto dos cards, no modelo do projeto (O que é / Por quê / Pai / Depende de, mais critérios de aceite).

**Os números dos cards 00019 a 00026 foram escolhidos sem consultar o quadro.** Confira com o Trello: se algum número já existe com outro assunto, renomeie a branch, o PR e o `Refs:` do commit, ou ajuste o card. Os cards novos abaixo ainda não têm número.

Etiquetas: tipo (FEATURE, TASK, CONFIG), prioridade (P0, P1, P2) e área (banco, interface, servidor, docs).

## Já entregues (para mover para Done ou conferir)

| Nº provisório | Tipo | Título | PR | O que é |
|---|---|---|---|---|
| 00018 | FEATURE | Registro de esportes | #29 | Módulos de seis esportes em `src/sports`: posições, formações, estatísticas, placar. |
| 00019 | FEATURE | OVR por esporte | #30 | Nota 40–99 por esporte; o vôlei dá a mesma nota de hoje. |
| 00020 | FEATURE | Card de nota por esporte | #32, #40 | Componente `RatingCard`. O #40 corrige o selo da posição, que ficou fora do #32. |
| 00021 | FEATURE | Ajuste do treinador (±5) | #33 | Só a regra (validação e aplicação). Falta rota, auditoria e botão. |
| 00022 | FEATURE | Escalação visual por esporte | #35 | Componente `LineupBoard` com clique, teclado e arrastar. |
| 00023 | TASK | Decisões de acesso, CPF e jogos | #37 | Documento de decisões de 2026-11-02. |
| 00024 | FEATURE | Banco: papéis, criar time e código do time | #39 | Gestor, time único por esporte+categoria+faixa, código com aceite, auditoria. |
| 00025 | FEATURE | Banco: atletas, perfil por time e CPF seguro | a abrir | Atletas, sexo, nascimento, camisa por time, CPF cifrado com leitura auditada. |
| 00026 | FEATURE | Motor de pontuação ao vivo | #38 | Lances viram placar, sets e estatísticas pela regra de cada modalidade. |

## A criar

### Agenda de jogos
- **Tipo/prioridade/área:** FEATURE, P1, banco + servidor.
- **O que é:** criar jogo (time, modalidade vinda do time, dia, hora, adversário, local, tipo). Aparece no calendário do time.
- **Por quê:** o Thiago quer agendar o jogo e gerenciar os pontos nele.
- **Pai:** épico multi-esporte. **Depende de:** 00024, 00026.
- **Critérios de aceite:**
  - [ ] só gestor e admin criam e editam jogo; técnico e jogador só veem
  - [ ] modalidade e categoria vêm do time e não são campo livre
  - [ ] o jogo aparece só no calendário do time escalado
  - [ ] teste de RLS positivo e negativo por papel

### Registro dos lances ao vivo (tabelas e RPC)
- **Tipo/prioridade/área:** FEATURE, P1, banco + servidor.
- **O que é:** gravar cada lance do jogo (sequência, período, atleta), com desfazer, e calcular placar e estatísticas pelo motor `src/sports/live`. Modo manual como alternativa, um modo por jogo.
- **Depende de:** agenda de jogos, 00026.
- **Critérios de aceite:**
  - [ ] só técnico, gestor e admin registram; jogador só acompanha
  - [ ] desfazer reabre set ou partida
  - [ ] encerrar grava placar, estatísticas e o retrato da nota por atleta e por esporte

### Entrada por código: rota, tela e limite por IP
- **Tipo/prioridade/área:** FEATURE, P1, servidor + interface.
- **O que é:** página `/entrar` (código depois do `#`), criação da conta com senha e 2FA, uso do código. Tela de pedidos pendentes com Aceitar e Recusar, também em lote.
- **Por quê:** é a porta de entrada decidida pelo Thiago; o banco já trava erros de quem tem conta, mas **quem ainda não tem conta só é barrado por limite por IP no servidor**.
- **Depende de:** 00024 aplicada no Supabase do projeto, chave de serviço só no servidor.
- **Critérios de aceite:**
  - [ ] limite por IP e mensagem igual para qualquer falha
  - [ ] 2FA obrigatório no primeiro acesso
  - [ ] o código não aparece em log, URL enviada ao servidor nem erro
  - [ ] usabilidade: poucos toques, textos claros

### Inscrição do jogador e rota do CPF
- **Tipo/prioridade/área:** FEATURE, P1, servidor + interface.
- **O que é:** formulário de inscrição (nome, sexo, nascimento, CPF, telefone) e rotas que usam `src/lib/cpf.ts` (cifrar, índice cego, decifrar só na revelação) e as funções do banco.
- **Depende de:** 00025, variáveis `CPF_ENCRYPTION_KEYS`, `CPF_KEY_VERSION` e `CPF_HASH_KEY` na Vercel.
- **Critérios de aceite:**
  - [ ] CPF nunca em log, URL, erro nem lista; exibição mascarada, "revelar" é ação explícita
  - [ ] duplicado detectado pelo índice cego, sem decifrar
  - [ ] avisos de categoria e sub (`eligibilityAlerts`) aparecem para a comissão

### Seletor de time e telas por esporte
- **Tipo/prioridade/área:** FEATURE, P2, interface.
- **O que é:** ligar `RatingCard`, `LineupBoard` e o jogo ao vivo às telas, com o seletor de time (agrupado por esporte e categoria).
- **Depende de:** card 00031 (layout novo) e do banco aplicado.

### Privacidade do CPF (LGPD)
- **Tipo/prioridade/área:** TASK, P1, docs.
- **O que é:** texto da política de privacidade com a finalidade única (identificar o atleta), prazo de guarda e como pedir a exclusão; gerar e guardar as chaves do CPF fora do repositório.
- **Dono:** Thiago.
- **Critérios de aceite:**
  - [ ] política publicada antes de coletar CPF de verdade
  - [ ] chaves geradas, guardadas no cofre de senhas e configuradas na Vercel
  - [ ] plano de rotação das chaves

### Aplicar as migrations no Supabase do projeto
- **Tipo/prioridade/área:** CONFIG, P1, banco.
- **Dono:** Thiago. **Nenhuma sessão de IA aplica migration no banco.**
- **O que é:** conferir primeiro num projeto de desenvolvimento, depois aplicar no `plataforma-gestao-time` (`supabase db push`).
- **Critérios de aceite:**
  - [ ] confirmar que o projeto é o certo antes de aplicar (ref `ncvejypuuorvvhqvbbsa`)
  - [ ] rodar `bash supabase/tests/run-local.sh` antes
  - [ ] backup ou ponto de restauração antes de aplicar
  - [ ] conferir as policies no painel depois
