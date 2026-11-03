# Decisões — acesso, CPF, troca de time e jogos

| | |
|---|---|
| Status | **decidido pelo Thiago em 2026-11-02**; pontos marcados como *proposta* ainda pedem confirmação |
| Atualiza | [2026-10-30-gestor-multi-esporte.md](2026-10-30-gestor-multi-esporte.md): D3, D7, D18 e as perguntas Q3 a Q10 |
| Cards | 00023 (este documento), 00024 a 00028 (seção 7) |

## 1. O que o Thiago decidiu

1. **CPF é coletado**, porque é o identificador da pessoa. A relação entre CPF e atleta precisa ser **muito segura** (seção 4). Isso reverte a recomendação anterior de não coletar (antiga D3).
2. **Organização com vários times, um por esporte.** A atlética é a organização e cada modalidade é um time: vôlei, basquete, futsal etc. Hoje existe só a **Falcons**, com o time de vôlei.
3. **Trocar de time** pelo próprio site. Ao entrar no time de vôlei da Falcons, o layout e as funcionalidades giram em torno do vôlei.
4. **Quatro tipos de acesso:** admin, gestor, técnico e jogador (seção 2). **Só o admin concede acesso.**
5. **Entra na plataforma só quem aceita um convite ou quem tem o registro criado por um admin.** Não existe cadastro aberto.
6. **No início o convite é um código do time** (seção 3).
7. **Jogador em dois ou mais times** (por exemplo vôlei e futsal): a pontuação e as estatísticas ficam **separadas por esporte**, sem mistura.
8. **Agendar jogo e registrar o que aconteceu** para gerenciar os pontos (seção 6).
9. **Ordem dos esportes:** não há ordem específica. Os seis módulos já existem no código; o que muda o ritmo é só o time que a atlética criar.

## 2. Papéis

Os quatro papéis do Thiago mapeiam assim no modelo. Cada pessoa tem um papel **por time** (um jogador pode ser jogador no vôlei e técnico no futsal), e o admin vale para a organização inteira.

| Papel | Modelo | Pode |
|---|---|---|
| **Admin** | `org_memberships` (`owner`, `admin`) | Tudo na organização. **Único que cria times, gera códigos de convite, concede e retira acessos.** Lê CPF. |
| **Gestor** | `team_staff.role = 'manager'` *(novo)* | Administra o time: elenco, agenda de jogos, encerrar jogo. Vê CPF mascarado e pode revelar, com registro de auditoria. *(proposta)* |
| **Técnico** | `team_staff.role = 'coach'` | Escalação, pontuação ao vivo, estatísticas, ajuste da nota (±5). **Não vê CPF.** |
| **Jogador** | `athletes.user_id` + vínculo em `team_members` | Vê o próprio perfil, nota e estatísticas **por esporte**, confirma presença e acompanha o jogo ao vivo dos seus times. Vê só o próprio CPF. |

Os papéis `scout` e `viewer` continuam aceitos no banco, mas ficam sem uso na interface até alguém pedir.

## 3. Acesso: convite e registro criado pelo admin

Duas portas de entrada, e só elas:

- **Registro criado pelo admin:** o admin cria o usuário e o vínculo. É o caminho de hoje e continua valendo.
- **Código do time:** o admin gera um código para um time. Quem tem o código cria a conta e entra com o papel que o admin escolheu ao gerar.

Regras do código *(proposta)*:

| Item | Regra |
|---|---|
| Quem gera | só admin |
| Papel | fixado pelo admin ao gerar (padrão **jogador**); o código nunca deixa o portador escolher o papel |
| Validade | 7 dias por padrão; o admin pode encurtar |
| Usos | jogador: até 30; técnico e gestor: **1 uso** |
| Armazenamento | só o hash do código no banco; o texto aparece uma vez, na tela do admin |
| Formato | 12 caracteres de um alfabeto sem ambiguidade (0/O, 1/I), cerca de 60 bits |
| Tentativas | erro limitado por IP e por código, com bloqueio temporário; mensagem igual para código errado, expirado ou esgotado |
| Revogação | o admin revoga a qualquer momento; quem já entrou continua |
| Auditoria | gerar, usar e revogar entram em `audit_events`, sem o código |

A conta nova passa pelas mesmas regras de hoje: senha, e **2FA TOTP obrigatório** no primeiro acesso. Para criar a conta a partir do código, o servidor precisa de privilégio administrativo do Supabase (chave de serviço). Essa chave fica só em variável de ambiente do servidor, nunca no navegador nem no repositório. *(proposta de implementação, a confirmar na task 00024)*

## 4. CPF: coletar com segurança

Princípio: um vazamento do banco, de um backup ou de uma exportação **não pode revelar CPF**.

| Camada | Decisão |
|---|---|
| Tabela | `athlete_private`, separada do cadastro do atleta; nenhuma tela de lista lê essa tabela |
| Criptografia | O servidor cifra o CPF com **AES-256-GCM** antes de gravar. A chave fica em variável de ambiente do servidor, fora do banco. O banco só guarda texto cifrado, com um byte de versão da chave para permitir rotação. |
| Unicidade e busca | Índice cego: **HMAC-SHA-256** do CPF com outra chave. Permite achar duplicado sem decifrar nada. |
| Validação | Dígitos verificadores e formato no servidor; só números são gravados |
| Leitura | Só por RPC `SECURITY DEFINER` que confere o papel e **grava a leitura em `audit_events` na mesma transação**: quem, quando, qual atleta. O CPF nunca entra na auditoria. |
| Quem lê | Admin; gestor do time do atleta *(proposta)*; o próprio jogador. Técnico não. |
| Exibição | Mascarado (`***.***.123-**`); "revelar" é uma ação explícita e auditada |
| Vazamento | Nunca em log, URL, mensagem de erro, parâmetro de busca nem resposta de lista |
| Acesso direto | RLS sem nenhuma policy de leitura para `authenticated` em `athlete_private`; só a RPC acessa |
| Exportação e backup | Contêm só o texto cifrado |
| Apagar | Atleta ou admin pode pedir; a linha é apagada e a auditoria mantém só o fato |
| Base legal | Finalidade única: identificar o atleta (inscrição e vínculo). Registrar na política de privacidade antes de coletar de verdade. |

Telefone e data de nascimento seguem a mesma tabela e a mesma regra de leitura, sem criptografia de campo (são menos sensíveis; revisar se o Thiago quiser).

## 5. Troca de time e separação por esporte

- A conta é uma só. Depois do login a pessoa vê os **times em que tem papel**; se for um só, entra direto.
- A URL carrega o time (`/t/[time]/...`); a sidebar tem a troca rápida entre times.
- O módulo do esporte do time define posições, escalação, estatísticas, placar e nota. Ao trocar de time o layout e as funcionalidades mudam junto (um único componente por função, alimentado por `src/sports`).
- Quem joga em dois esportes tem **um perfil esportivo por time**: posição, camisa, estatísticas, histórico e nota **nunca se misturam**. Os dados pessoais (nome, foto, CPF) são um só.

## 6. Agendar jogo e registrar pontos

Dois momentos no mesmo fluxo:

1. **Agendar:** data e hora, adversário, local, tipo (campeonato, amistoso, treino), time. Gestor e admin criam; técnico vê. Os jogadores do time recebem o jogo na agenda e confirmam presença.
2. **Registrar o que aconteceu:** durante o jogo, técnico (ou gestor) toca em cada lance, e o placar e as estatísticas saem desses lances.
   - Vôlei: ponto de ataque, ace, bloqueio, erro do adversário, erro nosso, com o atleta e o set.
   - Futebol e handebol: gol, assistência, finalização, defesa, falta, cartão, substituição.
   - Basquete: cesta de 2, 3 e lance livre, rebote, assistência, roubo, toco, erro.
   - Cada toque vira um evento com sequência, período e atleta, e **pode ser desfeito**.
   - Quem não puder acompanhar ao vivo lança os números depois (modo manual). Cada jogo usa um modo só, para não contar duas vezes.
   - Ao encerrar o jogo, grava-se o placar, as estatísticas e o **retrato da nota de cada atleta** daquele esporte.

## 7. Tarefas decorrentes

| Card | Tarefa | Depende de |
|---|---|---|
| 00023 | Este documento e a atualização do plano | nada |
| 00024 | Papel de gestor, código do time e as regras de acesso no banco, com testes de RLS | 00023 validado |
| 00025 | Atletas, vínculo por esporte e CPF seguro (criptografia, índice cego, RPC auditada) | 00024 |
| 00026 | Motor de pontuação ao vivo em `src/sports` (lances → placar e estatísticas, desfazer) | nada (código puro) |
| 00027 | Agenda de jogos e registro dos lances (tabelas, RPC, rotas) | 00024 e 00026 |
| 00028 | Telas: seletor de time, agenda, jogo ao vivo | 00027 e o layout (card 00031) |

Os números 00019 a 00022 dos PRs anteriores foram escolhidos sem consultar o Trello. Confira se batem com os cards do quadro.

## 8. Para o Thiago confirmar

1. Gestor pode **revelar** o CPF (com auditoria) ou só ver mascarado?
2. Código de técnico e de gestor com **1 uso** está bom?
3. Aceitar o convite cria a conta **na hora** (com senha e 2FA), ou prefere que o admin aprove antes de liberar o acesso?
4. Telefone e nascimento sem criptografia de campo está aceitável?
