# System design do TimeOn

Como o sistema é organizado e por quê, conforme o uso real: quem usa, o que faz, que dado circula e onde mora. Complementa [feature.spec.md](feature.spec.md) (stack e pastas), [feature.security.md](feature.security.md) (dados) e [feature.design.md](feature.design.md) (marca e layout). O conhecimento esportivo que sustenta as decisões está em [../domain/guia-modalidades-esportivas.md](../domain/guia-modalidades-esportivas.md). Para atualizar tudo isso, veja [../DOCUMENTO-VIVO.md](../DOCUMENTO-VIVO.md).

> Estado: **desenho alvo + o que já existe**. Cada seção diz o que está pronto, o que está só no banco e o que é futuro. O que depende de decisão do dono está em "Decisões em aberto".

## 1. Para quem o sistema existe

O TimeOn é uma plataforma para **gerir times** (elenco, escalação, jogos, pontos, evolução). Uma pessoa entra com um login e pode ter acesso a várias organizações e times.

| Quem | O que precisa fazer | Escopo de acesso |
| --- | --- | --- |
| Administração | tudo da organização, incluindo dar e tirar acesso | a organização inteira |
| Gestor | criar times, gerar códigos, aprovar pedidos, agendar jogos, ver financeiro e relatórios | os times da organização |
| Técnico | escalar, registrar o jogo ao vivo, ajustar a nota (±5), ver presença e relatórios | os times em que é comissão |
| Jogador | ver escalação, jogos, a própria nota e estatísticas | os times em que joga; dado privado só o próprio |
| Público (futuro) | ver calendário, resultados e classificação | só o que o gestor publicar |

Regra de ouro: **acesso por papel e por escopo**. Só entra quem aceita o convite ou quem a administração cadastra (decisão do dono, 2026-11-02). Detalhes em [../backlog/2026-11-02-decisoes-acesso-e-jogos.md](../backlog/2026-11-02-decisoes-acesso-e-jogos.md).

## 2. Visão em camadas

```text
Navegador (Next.js, React 19)         telas por papel, troca de organização e time
      │  chamadas same-origin
Servidor Next.js (rotas /api, proxy)  sessão, limite por IP, cifra/decifra dado sensível, chave de serviço
      │  SQL com a sessão do usuário (RLS) ou funções SECURITY DEFINER
Supabase Postgres + Auth + Storage    regras de acesso (RLS), auditoria, dados
```

- **Regra de negócio esportiva vive no código, sem banco e sem tela**: `src/sports/*` (registro de modalidades, formações, nota/OVR, elegibilidade) e `src/sports/live/*` (motor do jogo ao vivo). São funções puras, testadas, reaproveitadas por tela, rota e relatório.
- **Segurança vive no banco**: RLS em todas as tabelas, funções `SECURITY DEFINER` com `search_path=''`, schema `private`, auditoria que só acrescenta. A tela esconde, o banco impede.
- **Dado sensível passa só pelo servidor**: CPF, telefone e data de nascimento ficam cifrados (AES-256-GCM); só o ano de nascimento fica em claro. Chaves nas variáveis da Vercel.
- **Custo zero**: Vercel grátis, Supabase grátis, sem serviço pago. Nada que exija plano pago entra sem decisão do dono.

## 3. Contextos do domínio

| Contexto | Responsabilidade | Hoje |
| --- | --- | --- |
| Acesso | organização, papéis, convites por código, pedidos, auditoria | banco pronto e testado; telas e rotas faltam (cards 00042, 00043) |
| Modalidades | regras de cada esporte: posições, formações, estatísticas, placar | pronto em `src/sports` (6 modalidades) |
| Elenco | atleta, perfil por time, posições, camisa, elegibilidade | banco pronto; tela antiga só de vôlei (`jogadores_leilao`) |
| Escalação | titulares por esquema tático, avisos de posição | componentes prontos (`LineupBoard`, `FormationPicker`); falta ligar às telas |
| Jogo | agenda, súmula, lances ao vivo, placar, encerramento | motor pronto; agenda e tabelas ao vivo faltam (cards 00040, 00041) |
| Avaliação | nota por modalidade (OVR) e ajuste do técnico | regra pronta; rota, auditoria e botão faltam |
| Presença, financeiro, relatórios | chamada, mensalidades, exportação | só no menu como "Em breve" |

O mapa de módulos que alimenta menu e página inicial é `src/components/layout/modules.ts`.

## 4. Modelo de dados

### 4.1 O que existe no banco de produção (12 migrations aplicadas em 2026-11-03)

| Tabela | Papel |
| --- | --- |
| `organizations`, `org_memberships` | organização e quem pertence a ela, com papel |
| `sports`, `sport_positions` | modalidades e posições |
| `teams` | time = organização + modalidade + categoria + faixa etária (único por combinação) |
| `team_staff`, `team_players`, `team_members` | comissão, jogadores e vínculo do atleta com o time (camisa, posições) |
| `athletes`, `athlete_private` | cadastro e dado sensível cifrado (sem política: só funções do servidor leem) |
| `team_invites`, `team_join_requests`, `invite_attempts` | código do time (só o hash), pedidos com aceite, trava de tentativas |
| `audit_events` | auditoria que só acrescenta |

### 4.2 Como o guia de modalidades se encaixa

O guia (seção 13) propõe um modelo centrado em **competição**. O TimeOn é centrado em **time**. Os dois cabem juntos assim:

| Entidade do guia | No TimeOn |
| --- | --- |
| `Sport`, `Position` | `sports`, `sport_positions` (existe) |
| `Team`, `Athlete`, `TeamRegistration` | `teams`, `athletes`, `team_members` (existe) |
| `StaffMember` | `team_staff`, `org_memberships` (existe) |
| `AuditLog` | `audit_events` (existe) |
| `Rulebook` | **falta**: versão do regulamento ligada a jogo e competição |
| `Competition`, `Division` | **falta**, fase posterior (ver decisão D1) |
| `Venue` | **falta**: locais de jogo e treino |
| `Match`, `MatchRoster`, `MatchOfficial` | **falta**: card 00040 (agenda) |
| `MatchEvent` | **falta**: card 00041; o motor `src/sports/live` já define as ações por modalidade |
| `DisciplinaryCase` | **falta**: suspensões e recursos |
| `AthleteAssessment`, `AssessmentItem` | **falta**: ficha de avaliação com evidência (guia, seção 10) |
| `AvailabilityRecord` | **falta**: disponibilidade mínima, sem dado clínico |

### 4.3 Princípios do modelo (valem para tudo que for criado)

1. **Permanente separado do contextual**: atleta e time são permanentes; inscrição, escalação, jogo e estatística pertencem a um contexto (time, temporada, competição).
2. **Eventos configuráveis por modalidade**, não uma coluna por estatística: catálogo de ações por esporte (já em `src/sports/live/actions.ts`), com metadados.
3. **Oficial separado de analítico**: placar e súmula homologados não mudam em silêncio; estatísticas derivadas podem ser recalculadas.
4. **Nada se apaga**: correção é retificação com justificativa e entrada na auditoria.
5. **Cada jogo guarda a versão do regulamento** com que foi jogado.
6. **Todo dado novo declara a quem pertence** (organização e time) e tem RLS no mesmo migration; teste de RLS positivo e negativo por papel.

## 5. Máquinas de estado

**Jogo**: `rascunho → agendado → em andamento → encerrado → homologado`, com saídas `adiado`, `suspenso`, `cancelado`. Só gestor homologa; depois de homologado só muda por retificação auditada. Classificação e estatísticas oficiais só usam jogo homologado.

**Pedido de entrada**: `pendente → aceito | recusado`, ou `aceito` direto quando o código dispensa aprovação. Aceitar cria o vínculo; recusar não deixa rastro de dado pessoal além da auditoria.

**Código do time**: `ativo → usado | revogado | expirado`. Papel fixo no código; código de comissão vale uma vez; 5 erros em 15 minutos travam.

**Inscrição do atleta no time**: `rascunho → pendente → aprovado | recusado`, e `suspenso` por decisão disciplinar.

## 6. Fluxos principais

### 6.1 Entrar no sistema
Gestor gera código do time (papel fixo) → compartilha link `/entrar#CODIGO` → pessoa cria conta (senha e 2FA) → servidor valida o código com limite por IP → banco registra o uso → se exige aprovação, cai em pedidos pendentes → gestor aceita ou recusa, em lote se quiser.

### 6.2 Inscrever o atleta
Formulário (nome, sexo, nascimento, CPF, telefone) → rota do servidor cifra CPF/telefone/nascimento, calcula índice cego do CPF → função `register_athlete` grava → `eligibilityAlerts` avisa categoria e sub à comissão → CPF só aparece mascarado; "revelar" é ação explícita e auditada.

### 6.3 Jogar e registrar
Gestor agenda (time, dia, hora, adversário, local, tipo) → técnico monta a escalação no esquema → durante o jogo registra lances (ou usa o modo manual) → motor calcula placar, sets e estatísticas e avisa regra da modalidade → encerrar grava placar, estatística e o retrato da nota → gestor homologa.

### 6.4 Avaliar o atleta
Nota automática por modalidade (40 a 99, a partir das estatísticas) + ajuste do técnico de ±5 com motivo, auditado. A ficha qualitativa (1 a 5 com evidência) segue o guia, seção 10, e fica restrita a quem avalia.

## 7. Segurança e privacidade (resumo; norma em feature.security.md)

- Cadastro público desligado; acesso por convite ou por cadastro da administração.
- RLS em tudo; `anon` sem acesso; permissões padrão do Supabase conferidas por auditoria no CI.
- CPF, telefone e nascimento cifrados; leitura auditada; rotação de chaves documentada.
- Dado de menor, imagem e saúde: só o mínimo; nada clínico na plataforma; nada público sem autorização.
- Notas internas e avaliações **não** são estatística oficial e não vão para ranking público.
- Política de privacidade (LGPD) publicada antes de coletar CPF de verdade (card 00045).

## 8. Requisitos não funcionais

| Tema | Meta |
| --- | --- |
| Uso no celular | tudo funciona em 375 px, alvos de toque de 44 px, sem rolagem lateral |
| Jogo ao vivo | lance registrado com um toque; **fila offline** para não perder lance sem internet (a fazer) |
| Acessibilidade | teclado, foco visível, leitor de tela, respeito a "reduzir movimento" |
| Qualidade | CI com lint, testes, build e RLS; teste de sabotagem para regras de segurança |
| Custo | plano grátis; nada que cobre por uso sem aprovação |
| Rastreabilidade | auditoria append-only para decisões e leitura de dado sensível |
| Evolução | migrations versionadas, aplicadas pelo dono em pacote único e conferidas pelo verificador |

## 9. Como o sistema cresce (alinhado ao guia, seção 17)

| Etapa | Entrega | Cards |
| --- | --- | --- |
| 1. Operação | acesso por código, inscrição, agenda de jogos, escalação, súmula básica, auditoria | 00040, 00042, 00043, 00044 |
| 2. Estatística por modalidade | lances ao vivo persistidos, estatística por posição, relatórios PDF/CSV | 00041 |
| 3. Avaliação | ficha por posição com evidência, metas, histórico | a criar |
| 4. Automação | presença, sorteio equilibrado pela nota, alertas de conflito e suspensão | a criar |
| 5. Competição (opcional) | competição, divisão, classificação, disciplina e recursos | a criar (D1) |

Recomendação do próprio guia, adotada aqui: **não usar IA para dar nota ao atleta** antes de ter definições padronizadas e histórico confiável.

## 10. Decisões em aberto

| # | Pergunta | Por que importa |
| --- | --- | --- |
| D1 | O TimeOn gere só times, ou também a liga/competição (como o Futi)? | muda o modelo (Competition, Division, tabela, súmula oficial) e o público |
| D2 | O público (família, torcida) vê resultados? Em que endereço? | cria o papel "público" e dados publicáveis |
| D3 | Haverá cobrança de mensalidade dentro do sistema (Pix) ou só controle manual? | pagamento tem custo, risco e regra própria |
| D4 | Menores de idade entram no sistema? Quem autoriza? | LGPD pede cuidado específico com dado de menor |
| D5 | Quem homologa o jogo: só gestor ou também técnico? | define a separação entre registrar e validar |
| D6 | As seis modalidades entram juntas ou uma a uma depois do vôlei? | ordem do trabalho nas telas |

Resolvida uma decisão, registre em `docs/backlog/` e troque a linha aqui por uma frase com a data.
