# Documento vivo do TimeOn

Ponto único para **entender, atualizar e melhorar** o sistema. Quem chegar (pessoa ou agente) lê este arquivo, sabe onde cada coisa mora, o que mudou e como propor melhoria. Atualize-o **no mesmo PR** que mudar algo que ele descreve.

Última revisão: 2026-11-03.

## 1. Onde mora cada coisa

| Quero saber... | Leia |
| --- | --- |
| Estado atual, fluxo de trabalho, armadilhas | [HANDOFF.md](HANDOFF.md) |
| Como o sistema é desenhado (atores, camadas, dados, fluxos) | [architecture/system-design.md](architecture/system-design.md) |
| Stack, pastas e regras de código | [architecture/feature.spec.md](architecture/feature.spec.md) |
| Proteção de dados e segurança | [architecture/feature.security.md](architecture/feature.security.md) |
| Marca, cores, layout | [architecture/feature.design.md](architecture/feature.design.md); Design System: [v1.1](architecture/design-system-v1.1.md) (vale) e [v1.0](architecture/design-system-v1.0.md) |
| Regras das modalidades, gestão e avaliação de atleta | [domain/guia-modalidades-esportivas.md](domain/guia-modalidades-esportivas.md) |
| O que o dono decidiu | [backlog/2026-11-02-decisoes-acesso-e-jogos.md](backlog/2026-11-02-decisoes-acesso-e-jogos.md) |
| Ideias vindas de outras ferramentas | [backlog/2026-11-03-ideias-das-referencias.md](backlog/2026-11-03-ideias-das-referencias.md) |
| Como aplicar o banco e as chaves | [runbooks/aplicar-banco-e-chaves.md](runbooks/aplicar-banco-e-chaves.md) |
| Política de privacidade (rascunho) | [legal/politica-de-privacidade.md](legal/politica-de-privacidade.md) |

## 2. O guia de modalidades e o sistema

O guia é a **fonte de verdade esportiva**, mas é feito para quem organiza competições; no TimeOn valem as partes de modalidades, equipe, atleta, jogo, súmula e avaliação (decisão D1). Quando o código divergir do guia, o guia ganha, a não ser que haja decisão do dono registrada. Situação de cada módulo que o guia pede (seção 12.2):

| Módulo do guia | Situação | Onde |
| --- | --- | --- |
| Painel geral | parcial: início por papel e painel antigo do vôlei | `src/components/sections/home`, `dashboard` |
| Modalidades e categorias | **pronto**: 6 modalidades, posições, formações, placar | `src/sports/*` |
| Competições e temporadas | **não será feito**: o TimeOn não controla liga (D1); jogo de liga é só um tipo de jogo no calendário | — |
| Equipes e atletas | **pronto no banco**; telas novas faltam | migrations `20261101…` a `20261103…` |
| Agenda e locais | **banco pronto e testado** (`games`, migration 20261103150000, a aplicar); tela e leitura pelo app faltam; locais ainda são texto livre | card 00040 |
| Tabela de jogos | banco pronto (ver acima); tela falta | card 00040 |
| Súmula digital | motor pronto; tabelas e telas faltam | `src/sports/live`, card 00041 |
| Estatísticas | parcial: definição por modalidade pronta, tela antiga só de vôlei | `src/sports/*` |
| Avaliação de atletas | parcial: nota automática e ajuste ±5 (regra); ficha qualitativa não começou | `src/sports/rating` |
| Disciplina e recursos | não começou; a autorização de menores (D4) vem primeiro | — |
| Comunicação | não começou | — |
| Relatórios | não começou (aparece como "Em breve") | `src/components/layout/modules.ts` |

Regras do guia que o código **já aplica**: formações variáveis por modalidade; posição principal e secundária; nota normalizada por posição (não compara atacante com zagueiro); alertas de categoria e de idade (sub); correção sem apagar (auditoria); dado sensível cifrado.

Regras do guia que **ainda precisam virar código**: autorização de menor (pais e técnico) e bloqueio do cadastro de menor por código de convite; versão do regulamento por jogo; parâmetros por categoria (altura da rede, bola, tempo); impedimento de relacionar atleta suspenso; homologação separada do registro; número de camisa único por time quando o regulamento exigir.

## 3. Como atualizar (por tipo de mudança)

**Regra de modalidade mudou** (nova edição FIVB, FIBA, IHF, CBFS):
1. Atualize [o guia](domain/guia-modalidades-esportivas.md) com a fonte e a data.
2. Ajuste `src/sports/<modalidade>.ts` e os testes que a cobrem.
3. Registre no histórico (seção 5).

**Modalidade nova**:
1. Crie o módulo em `src/sports/` (posições, formações, estatísticas, placar, nota) e registre em `registry.ts`.
2. Inclua as ações de jogo em `src/sports/live/actions.ts`.
3. Acrescente posições e a modalidade no banco por migration (e no guia).
4. O teste do registro (`registry.test.ts`) deve passar sem ajuste de exceção.

**Tabela ou regra de acesso nova**: migration com RLS e testes de RLS positivo e negativo no mesmo PR; rode `bash supabase/tests/run-local.sh`; atualize [system-design.md](architecture/system-design.md) (seção 4). Quem aplica no banco de produção é o dono.

**Decisão do dono**: grave em `docs/backlog/` com a data; se resolver uma "decisão em aberto" do system design, troque a linha por uma frase com a data.

**Tela nova**: entre em `src/components/layout/modules.ts` (nome, papéis, "Em breve" ou endereço) e siga o design; teste no celular (375 px) e com teclado.

**Ideia vinda de fora**: anote em `docs/backlog/…-ideias-…md` com a origem e o porquê; só vira card quando o dono priorizar.

## 4. Como melhorar o sistema para ajudar todos

Ciclo contínuo, curto:

1. **Ouvir**: o que o gestor, o técnico e o jogador travam hoje? Registre a queixa com as palavras da pessoa e o papel dela.
2. **Classificar**: é regra do esporte (guia), acesso, tela, dado ou custo?
3. **Decidir com o dono** quando mexer em acesso, dado pessoal, dinheiro ou menor de idade.
4. **Virar card** no Trello (5 dígitos, o mesmo da branch e do `Refs:` do commit) com critérios de aceite testáveis.
5. **Entregar pequeno**: um PR por card, testes verdes, conferido no celular.
6. **Conferir com quem usa** e registrar o resultado aqui.

Perguntas de qualidade antes de entregar (do guia, seção 9.2): está no regulamento? É igual para todos? Está documentado? Afeta saúde ou segurança? Os dados foram conferidos? Quem precisa saber? Dá para corrigir sem apagar o histórico?

Medir o sistema (guia, seção 15), quando houver dado: jogos no prazo, súmulas homologadas, erros de cadastro após aprovação, tempo até homologar, ocorrências por jogo.

## 5. Histórico

| Data | O que mudou |
| --- | --- |
| 2026-11-03 | Agenda de jogos no banco: tabela `games` com RLS (só administração e gestor escrevem), homologação travada e auditoria; 20 testes novos. **Migration ainda não aplicada em produção.** |
| 2026-11-03 | Cartas: toda posição mostra seis estatísticas próprias (tabela em `card-stats.ts`); a nota geral não mudou. Estatísticas sem lance que as alimente acompanham a nota. |
| 2026-11-03 | Escalação: mais esquemas por modalidade (futsal 3-1; Fut7 3-1-2; campo 4-1-4-1, 3-4-3, 5-3-2; basquete 1-2-2, 2-1-2, 1-3-1, Horns, 4 abertos; handebol 3-3 e 2-4 no ataque, 6-0 e 5-1 na defesa). Líbero vale em todo sistema do vôlei (regra FIVB). Mover posições cria o esquema "Personalizado", que pode ser salvo com nome (por enquanto só no navegador). Falcons com um time de cada modalidade e organização Teste, ainda fixos em `src/lib/teams.ts`. |
| 2026-11-03 | Cartas dos atletas redesenhadas a partir das referências do dono: variantes especial (90+), ouro, prata e bronze, estatísticas por posição e galeria em `/cartas`. |
| 2026-11-03 | Design System v1.1 aplicado como base provisória (tokens, Inter, faixa de título, menu recolhível só com o que existe, tabelas). Tema claro com tokens prontos, ainda não ligado. |
| 2026-11-03 | Dono respondeu D1 a D6: sem controle de liga, família e torcida sem acesso, sem mensalidade, menores com autorização dos pais e do técnico, só o gestor homologa, modalidades sempre separadas. Financeiro saiu do menu. |
| 2026-11-03 | Banco de produção aplicado (15 de 15). Formações: futsal 1-2-1, futebol 4-3-3 com laterais; seletor de esquema (PR #49). Moldura nova com troca de organização e time, menu por papel, gestão de acesso (esqueleto) e módulos "Em breve" (PRs #50 e #51). System design e este documento. |
| 2026-11-02 | Decisões do dono sobre acesso, código do time, CPF, times por modalidade/categoria/faixa e jogos. Motor de jogo ao vivo, nota por modalidade, escalação visual e banco de acesso/atletas. |

## 6. Glossário

- **Organização**: grupo que reúne vários times (ex.: uma atlética).
- **Time**: modalidade + categoria + faixa etária dentro de uma organização.
- **Papel**: administração, gestor, técnico ou jogador.
- **Código do time**: código curto (12 caracteres) que dá entrada com papel fixo; só o hash fica guardado.
- **OVR (nota)**: número de 40 a 99 calculado por modalidade e posição.
- **Súmula**: registro oficial do jogo; só vale depois de homologada.
- **Homologar**: o gestor confirma o resultado; depois disso só se corrige por retificação auditada.
- **Elegibilidade**: se o atleta pode jogar naquela categoria (idade, sexo, inscrição, suspensão).
- **RLS**: regra de acesso por linha no banco; é a defesa real, a tela só esconde.
