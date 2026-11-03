# Decisões — acesso, CPF, troca de time e jogos

| | |
|---|---|
| Status | **decidido pelo Thiago em 2026-11-02**; os padrões propostos foram aceitos ("ficou bom") |
| Atualiza | [2026-10-30-gestor-multi-esporte.md](2026-10-30-gestor-multi-esporte.md): D3, D7, D18 e as perguntas Q3 a Q10 |
| Cards | 00023 (este documento), 00024 a 00028 (seção 7) |

## 1. O que o Thiago decidiu

1. **CPF é coletado**, porque é o identificador da pessoa. A relação entre CPF e atleta precisa ser **muito segura** (seção 4). Isso reverte a recomendação anterior de não coletar (antiga D3).
2. **Organização com vários times, um por esporte e categoria.** A atlética é a organização. Cada modalidade é um time e cada modalidade tem versão **masculina e feminina**: Vôlei Masculino, Vôlei Feminino, Futsal Masculino, Futsal Feminino etc. (seção 5). Hoje existe só a **Falcons**, com o time de vôlei.
3. **Trocar de time** pelo próprio site. Ao entrar no time de vôlei da Falcons, o layout e as funcionalidades giram em torno do vôlei.
4. **Quatro tipos de acesso:** admin, gestor, técnico e jogador (seção 2). **O admin concede qualquer acesso; o técnico e o gestor só convidam jogador para o próprio time** (seção 3).
5. **Entra na plataforma só quem aceita um convite ou quem tem o registro criado por um admin.** Não existe cadastro aberto.
6. **No início o convite é um código do time**, que o técnico pode enviar (por código ou por link) para a pessoa entrar como **jogador** (seção 3).
7. **Jogador em quantas modalidades quiser** (vôlei e futsal são só exemplos; pode ser todas): **um login só**, e os dados ficam **separados em cada modalidade**: posição, **número da camisa**, estatísticas, pontos e nota (seção 5).
8. **Agendar jogo e registrar o que aconteceu** para gerenciar os pontos (seção 6).
9. **Ordem dos esportes:** não há ordem específica. Os seis módulos já existem no código; o que muda o ritmo é só o time que a atlética criar.
10. **O gestor também convida jogadores**, como o técnico (seção 3).
11. **Time = esporte + categoria + faixa etária.** As "subs" (sub-17 etc.) também são times separados (seção 5).
12. **Quem pode criar time:** admin, gestor e técnico. Na criação escolhem esporte, categoria (masculino, feminino, misto) e faixa etária. Jogador não cria time. *(interpretação da frase do Thiago, a confirmar)*
13. **A inscrição tem o campo "sexo"**, para o sistema saber a categoria em que a pessoa pode jogar (seção 4A).
14. **Tem que ser sempre fácil de usar.** Poucos toques para as ações do dia a dia (convidar, aceitar, escalar, marcar ponto), textos claros e nada de tela cheia de opções.
15. **Quem entra por código pode precisar de aceite:** o técnico, o gestor ou o admin vê o pedido e aceita ou recusa (seção 3).
16. **Cada modalidade segue a regra da própria modalidade** na pontuação e nos alertas do jogo (seção 6A).
17. **Criar jogo é só do gestor e do admin.** O jogo nasce para um time, com data, hora e modalidade, e aparece no calendário desse time (seção 6).

## 2. Papéis

Os quatro papéis do Thiago mapeiam assim no modelo. Cada pessoa tem um papel **por time** (um jogador pode ser jogador no vôlei e técnico no futsal), e o admin vale para a organização inteira.

| Papel | Modelo | Pode |
|---|---|---|
| **Admin** | `org_memberships` (`owner`, `admin`) | Tudo na organização. **Único que concede os papéis de gestor e técnico.** Gera código de qualquer papel e retira qualquer acesso. Lê CPF. |
| **Gestor** | `team_staff.role = 'manager'` *(novo)* | Administra o time: elenco, agenda de jogos, encerrar jogo. Convida jogadores para o próprio time, como o técnico. Cria times. Vê CPF mascarado e pode revelar, com registro de auditoria. *(proposta)* |
| **Técnico** | `team_staff.role = 'coach'` | Escalação, pontuação ao vivo, estatísticas, ajuste da nota (±5). **Gera e envia o código ou o link de convite de jogador do próprio time.** Cria times. Não convida técnico nem gestor. **Não vê CPF.** |
| **Jogador** | `athletes.user_id` + vínculo em `team_members` | Vê o próprio perfil, nota e estatísticas **por esporte**, confirma presença e acompanha o jogo ao vivo dos seus times. Vê só o próprio CPF. |

**Criar time** é permitido a admin, gestor e técnico. Quem cria um time passa a ter, **nesse time**, o mesmo papel que já tem na organização (o técnico vira técnico dele, o gestor vira gestor); criar time nunca dá papel maior que o da pessoa. Jogador não cria time.

Os papéis `scout` e `viewer` continuam aceitos no banco, mas ficam sem uso na interface até alguém pedir.

## 3. Acesso: registro do admin e código do time

Duas portas de entrada, e só elas:

- **Registro criado pelo admin:** o admin cria o usuário e o vínculo. É o caminho de hoje e continua valendo.
- **Código do time:** um código ligado a **um time** (Vôlei Feminino, por exemplo, e não a organização inteira). Quem tem o código cria a conta e entra no time com o papel fixado no código.

O **técnico e o gestor** geram o código do próprio time e o enviam por código ou por link. Quem entra por ele vira **jogador**. Para técnico ou gestor, só o admin gera o código.

Regras do código *(proposta)*:

| Item | Regra |
|---|---|
| Quem gera | **admin:** qualquer papel, em qualquer time. **Técnico e gestor:** só papel jogador, só no próprio time (o gestor convida jogadores como o técnico). |
| Papel | fixado ao gerar (padrão **jogador**); o código nunca deixa o portador escolher o papel. Um código gerado por técnico ou gestor **não pode** valer como técnico, gestor ou admin. |
| Validade | 7 dias por padrão; o admin pode encurtar |
| Usos | jogador: até 30; técnico e gestor: **1 uso** |
| Armazenamento | só o hash do código no banco; o texto aparece uma vez, na tela do admin |
| Formato | 12 caracteres de um alfabeto sem ambiguidade (0/O, 1/I), cerca de 60 bits |
| Tentativas | erro limitado por IP e por código, com bloqueio temporário; mensagem igual para código errado, expirado ou esgotado |
| Revogação | quem gerou revoga o próprio código; o admin revoga qualquer um; quem já entrou continua |
| Visibilidade | o admin vê todos os códigos da organização, com quem gerou, quantos usos e quem usou |
| Auditoria | gerar, usar e revogar entram em `audit_events`, sem o código |

**Aceite de quem entra (opção por código):** ao gerar o código, quem gera escolhe **"Exigir aceite"**. Com o aceite ligado, a pessoa cria a conta, mas fica em **"aguardando"** e só vê uma tela dizendo isso. O técnico, o gestor ou o admin do time recebe o pedido numa lista simples com **Aceitar** e **Recusar** (um toque cada, também em lote). Com o aceite desligado, a pessoa entra na hora. O padrão do código novo é **aceite ligado**; é só desligar quando o grupo for de confiança. Recusar não apaga a conta, só impede o acesso ao time, e fica na auditoria.

**Link de convite:** `https://<site>/entrar#codigo=ABCD...`. O código vai depois do `#`, que o navegador **não envia ao servidor**, então ele não cai em log, em cabeçalho `Referer` nem em histórico de proxy. A página lê o código no navegador e o manda por requisição segura. O link deve ser tratado como senha: quem o recebe entra no time.

**O que acontece ao entrar:** a pessoa cria a conta, preenche os próprios dados (nome, CPF, telefone, nascimento) e ganha o vínculo de jogador no time, ainda **sem posição e sem camisa**; o técnico define depois. Se a pessoa já tem conta e usa **outro código** (de outro time), ela ganha **um segundo perfil esportivo** na mesma conta, sem refazer o cadastro.

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

**Atualização de 2026-11-03:** o Thiago pediu mais dados cifrados. Telefone e a data de nascimento completa passam a ser **cifrados** como o CPF. Em claro ficam só nome, nome de camisa, sexo e o **ano** de nascimento (basta para a faixa etária das subs). A data completa só sai por leitura auditada.

## 4A. Inscrição e o campo "sexo"

A inscrição do jogador tem dados pessoais (um cadastro por pessoa, valem para todas as modalidades) e a escolha do time (cada time tem o próprio perfil esportivo).

| Dado | Regra |
|---|---|
| Nome e nome de camisa | obrigatórios |
| **Sexo** | **obrigatório**; `masculino` ou `feminino`. Não é editável pelo jogador depois de confirmado; admin e gestor corrigem, com auditoria. |
| Nascimento | obrigatório (define a elegibilidade nas subs) |
| CPF | obrigatório, cifrado (seção 4) |
| Telefone | obrigatório |
| Foto | opcional |

Uso do sexo e do nascimento ao entrar num time *(proposta)*:

- Time **masculino** com pessoa de sexo **feminino**, ou o contrário: o sistema **avisa** o técnico, o gestor e o admin e mostra o alerta no elenco. **Não bloqueia**, porque ligas amadoras têm exceções e o admin pode autorizar.
- Time **misto**: qualquer sexo.
- **Sub-N:** a pessoa que passa da idade da sub no ano do campeonato gera o mesmo tipo de alerta.
- O sexo aparece para a comissão técnica do time e para o próprio jogador; não aparece em lista pública nem no jogo ao vivo.

## 5. Times por esporte e categoria, troca de time e separação por esporte

**Um time é a combinação de esporte, categoria e faixa etária** dentro da organização. Exemplo da Falcons:

```
Falcons (organização)
├── Vôlei    ├── Masculino   → "Vôlei Masculino" (adulto), "Vôlei Masculino Sub-17"
│            └── Feminino    → "Vôlei Feminino" (adulto), "Vôlei Feminino Sub-17"
├── Futsal   ├── Masculino   → "Futsal Masculino", "Futsal Masculino Sub-15"
│            └── Feminino    → "Futsal Feminino"
└── Basquete └── ...
```

- A categoria aceita **masculino, feminino e misto**. O modelo já tem `teams.category` com esses três valores.
- **Faixa etária:** vazia significa adulto/livre; as subs (sub-11, sub-13, sub-15, sub-17, sub-20 etc.) são times à parte, cada um com elenco, agenda e nota próprios. O modelo já tem `teams.age_group` (texto curto como `sub17`; vazio é adulto).
- **Trava de time único:** não pode haver dois times com o mesmo esporte, a mesma categoria **e** a mesma faixa etária na organização. Falta essa trava no banco.
- Código de convite, elenco, agenda, escalação, estatísticas e nota são **por time**, então masculino e feminino nunca se misturam.
- O seletor de time agrupa por esporte e depois por categoria. Quem está em só um time entra direto.
- A categoria muda o nome e o agrupamento; **o layout e as funções vêm do esporte**, não da categoria.

- A conta é uma só. Depois do login a pessoa vê os **times em que tem papel**; se for um só, entra direto.
- A URL carrega o time (`/t/[time]/...`); a sidebar tem a troca rápida entre times.
- O módulo do esporte do time define posições, escalação, estatísticas, placar e nota. Ao trocar de time o layout e as funcionalidades mudam junto (um único componente por função, alimentado por `src/sports`).
- Quem joga várias modalidades tem **um login e um cadastro pessoal**, e **um perfil esportivo por time**. Tudo o que é do esporte fica no perfil e **nunca se mistura**: posição, **número da camisa**, estatísticas, pontos, histórico e nota. Pode ser camisa 10 no vôlei e 7 no futsal; a nota do vôlei não influencia a do futsal. Não há limite de modalidades por pessoa.
- O cadastro pessoal é um só: nome, foto, CPF, telefone e nascimento. Mudar o telefone vale para todas as modalidades.
- O **número da camisa é único por time**, não por pessoa: dois atletas não repetem camisa no mesmo time, mas o mesmo número pode existir em times diferentes.
- A nota é calculada com o módulo do esporte do time (`src/sports`), então o mesmo atleta pode ter 82 no vôlei e 67 no futsal.
- O sistema **guarda o sexo informado na inscrição** (seção 4A) e usa esse dado para avisar quando alguém entra numa categoria diferente. O código continua sendo o controle principal: quem o entrega decide quem entra.

## 6. Agendar jogo e registrar pontos

Dois momentos no mesmo fluxo:

1. **Agendar (criar o jogo):** só **gestor e admin**. O formulário é curto e pede:
   - **Time**: já vem preenchido com o time em que a pessoa está (o caso normal). Só aparece para escolher quando ela cria o jogo fora de um time, e lista apenas os times em que ela pode criar jogo.
   - **Modalidade**: vem do time e **não é um campo livre**, porque a modalidade do time define as regras do jogo; não dá para marcar jogo de basquete num time de vôlei.
   - **Dia e hora**, **adversário**, **local** e **tipo** (campeonato, amistoso, treino).
   - O jogo **aparece no calendário do time** escolhido, com a modalidade e a categoria no título (por exemplo "Vôlei Feminino x Atlética Y"). O técnico e os jogadores do time veem; os jogadores recebem na agenda e confirmam presença. Técnico não cria nem edita jogo.
2. **Registrar o que aconteceu:** durante o jogo, técnico (ou gestor) toca em cada lance, e o placar e as estatísticas saem desses lances.
   - Vôlei: ponto de ataque, ace, bloqueio, erro do adversário, erro nosso, com o atleta e o set.
   - Futebol e handebol: gol, assistência, finalização, defesa, falta, cartão, substituição.
   - Basquete: cesta de 2, 3 e lance livre, rebote, assistência, roubo, toco, erro.
   - Cada toque vira um evento com sequência, período e atleta, e **pode ser desfeito**.
   - Quem não puder acompanhar ao vivo lança os números depois (modo manual). Cada jogo usa um modo só, para não contar duas vezes.
   - Ao encerrar o jogo, grava-se o placar, as estatísticas e o **retrato da nota de cada atleta** daquele esporte.

## 6A. Regras por modalidade

A pontuação e os alertas do jogo ao vivo seguem a regra de cada modalidade, vindas do módulo do esporte em `src/sports`. O técnico toca no lance e o sistema aplica a regra; ele não faz conta.

| Modalidade | Como o ponto vale | Quando termina | Alertas (só avisam) |
|---|---|---|---|
| **Vôlei** | cada rally vale 1 ponto, para quem ganha a jogada; erro nosso dá ponto ao adversário | set vai a 25 (o 5º, a 15) com 2 de diferença; vence quem fizer 3 sets; o sistema fecha o set sozinho | líbero na rede (escalação) |
| **Basquete** | cesta de 2, de 3 ou lance livre de 1 | 4 quartos; empate pede prorrogação, e não pode terminar empatado | atleta com 5 faltas |
| **Futsal** | gol vale 1 | 2 tempos; empate permitido (prorrogação e pênaltis opcionais) | 5 faltas acumuladas do time no tempo; 2 amarelos viram vermelho |
| **Fut7 / Society e campo** | gol vale 1 | 2 tempos; empate permitido | 2 amarelos viram vermelho |
| **Handebol** | gol vale 1 | 2 tempos; empate permitido | 3 exclusões de 2 min do atleta viram exclusão definitiva |

Cada lance sem ponto (defesa, passe, desarme, rebote, falta, cartão) conta só na estatística. Lance que dá ponto atualiza o placar e a estatística ao mesmo tempo.

## 7. Tarefas decorrentes

| Card | Tarefa | Depende de |
|---|---|---|
| 00023 | Este documento e a atualização do plano | nada |
| 00024 | Papel de gestor, código do time com aceite opcional (admin gera qualquer papel; técnico e gestor só jogador), trava de um time por esporte, categoria e faixa etária, criação de time por admin, gestor e técnico, regras de acesso no banco, com testes de RLS | 00023 validado |
| 00025 | Atletas (com sexo e nascimento), vínculo por time e CPF seguro (criptografia, índice cego, RPC auditada), com alertas de categoria e de sub | 00024 |
| 00026 | Motor de pontuação ao vivo em `src/sports` (lances → placar, set e período, estatísticas, desfazer, regra e alertas por modalidade) | nada (código puro) |
| 00027 | Agenda de jogos (criação só por gestor e admin, no calendário do time) e registro dos lances (tabelas, RPC, rotas) | 00024 e 00026 |
| 00028 | Telas: seletor de time, agenda, jogo ao vivo | 00027 e o layout (card 00031) |

Os números 00019 a 00022 dos PRs anteriores foram escolhidos sem consultar o Trello. Confira se batem com os cards do quadro.

## 8. Confirmações

Aceitas em 2026-11-02 ("ficou bom"): gestor revela o CPF com auditoria; código de técnico e gestor com 1 uso; criar time por admin, gestor e técnico, com o criador no mesmo papel; sexo ou idade fora da categoria só avisam. (A aceitação de "telefone e nascimento sem cifra de campo" foi revertida em 2026-11-03: agora são cifrados.)

Ainda para confirmar:

1. O padrão do código novo é **aceite ligado** (a pessoa espera a aprovação). Prefere o padrão desligado, entrando na hora?

## 9. Respostas do dono (2026-11-03)

1. **Escopo (D1).** O TimeOn mexe com **organização, e dentro dela os seus times**. Não há controle de liga (nem competição, tabela ou classificação). A liga só aparece como **tipo de jogo no calendário** ("jogo da liga"), para o time saber que joga.
2. **Público (D2).** Família e torcida **não têm acesso por enquanto**; talvez no futuro.
3. **Mensalidade (D3).** **Sem mensalidade por enquanto.** O módulo Financeiro sai do menu até haver decisão.
4. **Menores (D4).** Entram, **com autorização dos pais e do técnico**. Falta desenhar onde a autorização é registrada (quem assina, validade, o que acontece sem ela) e revisar a política de privacidade para dado de menor.
5. **Homologação (D5).** **Só o gestor** homologa o jogo (administração, como papel acima, também pode).
6. **Modalidades (D6).** **Sempre separadas**: cada time tem a sua modalidade e nada mistura. Na visão da organização aparecem **todos os times**, agrupados por modalidade.
