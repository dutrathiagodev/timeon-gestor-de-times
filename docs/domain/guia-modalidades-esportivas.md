# Guia de modalidades esportivas, gestão de competições e avaliação de atletas

**Modalidades:** futsal, futebol de campo, futebol 7 (Fut7), basquete, voleibol e handebol  
**Público-alvo:** gestores esportivos, organizadores de campeonatos, coordenadores, treinadores, analistas e equipes de desenvolvimento de sistemas de gestão esportiva  
**Base normativa consultada:** documentos de federações e entidades oficiais disponíveis em 3 de novembro de 2026  
**Objetivo:** servir como material de estudo e como referência funcional para projetar um site de gestão de modalidades, equipes, atletas, partidas, estatísticas e avaliações.

> **Aviso importante sobre regulamentos:** este guia explica as regras mais comuns das versões adultas e oficiais das modalidades. Não substitui o regulamento específico de uma competição. Categorias de base, campeonatos universitários, ligas amadoras, federações estaduais e organizadores podem adaptar tempo, tamanho de elenco, substituições, critérios de desempate, punições e outros detalhes. Antes de publicar uma competição no sistema, o gestor deve cadastrar a edição exata do regulamento que será aplicada.

---

## Sumário

1. [Como entender as seis modalidades](#1-como-entender-as-seis-modalidades)
2. [Diferenças entre categorias femininas e masculinas](#2-diferenças-entre-categorias-femininas-e-masculinas)
3. [Futsal](#3-futsal)
4. [Futebol de campo](#4-futebol-de-campo)
5. [Futebol 7 -- Fut7](#5-futebol-7--fut7)
6. [Basquete](#6-basquete)
7. [Voleibol](#7-voleibol)
8. [Handebol](#8-handebol)
9. [Como um gestor esportivo deve pensar](#9-como-um-gestor-esportivo-deve-pensar)
10. [Como avaliar um atleta de maneira responsável](#10-como-avaliar-um-atleta-de-maneira-responsável)
11. [Indicadores e critérios por modalidade](#11-indicadores-e-critérios-por-modalidade)
12. [Como transformar isso em um site de gestão](#12-como-transformar-isso-em-um-site-de-gestão)
13. [Modelo de dados recomendado](#13-modelo-de-dados-recomendado)
14. [Fluxo de trabalho de uma competição](#14-fluxo-de-trabalho-de-uma-competição)
15. [Indicadores de gestão e qualidade](#15-indicadores-de-gestão-e-qualidade)
16. [Privacidade, segurança e ética](#16-privacidade-segurança-e-ética)
17. [Plano de implantação do sistema](#17-plano-de-implantação-do-sistema)
18. [Referências oficiais e científicas](#18-referências-oficiais-e-científicas)

---

# 1. Como entender as seis modalidades

As seis modalidades são esportes coletivos, mas exigem formas diferentes de organizar o jogo, registrar resultados e avaliar atletas.

| Modalidade | Ambiente | Jogadores em quadra/campo por equipe | Objetivo principal | O que mais influencia a gestão |
|---|---|---:|---|---|
| Futsal | Quadra | 5 (4 de linha + goleiro) | Marcar gols em uma quadra reduzida | Cronômetro efetivo, faltas acumuladas, substituições volantes e cartões |
| Futebol de campo | Campo gramado | 11 | Marcar gols em um campo amplo | Tempo corrido, impedimento, substituições, cartões e escalação |
| Fut7 | Campo reduzido, geralmente society | 7, conforme regulamento | Marcar gols em espaço menor que o futebol de campo | Regulamento próprio da liga, dimensões, tempo, substituições e punições temporárias |
| Basquete | Quadra | 5 | Marcar pontos na cesta adversária | Relógio de jogo e de posse, faltas individuais/coletivas e estatísticas de arremesso |
| Voleibol | Quadra dividida por rede | 6 | Fazer a bola tocar o solo adversário ou provocar erro | Pontos por rally, rotação, sets, substituições e fundamento de cada ação |
| Handebol | Quadra | 7 (6 jogadores de linha + goleiro) | Marcar gols com as mãos | Exclusões de 2 minutos, tiros de 7 metros, substituições e controle de jogo passivo |

## 1.1 O que muda na lógica do jogo

- **Futsal:** pouco espaço, decisões rápidas, alternância intensa entre ataque e defesa, rotações frequentes e grande importância do domínio orientado, passe curto, finalização e cobertura defensiva.
- **Futebol de campo:** espaço amplo, duração longa, organização por setores, controle de profundidade e largura, transições, bolas paradas e gestão do esforço durante a partida.
- **Fut7:** mantém a lógica do futebol, mas em campo menor e com menos jogadores. A participação individual tende a ser mais constante, mas as regras concretas variam entre entidades.
- **Basquete:** alternância rápida de posse, criação de vantagem, arremessos, rebotes, bloqueios, faltas e gestão de relógio. A eficiência das posses é mais informativa do que observar apenas o placar.
- **Voleibol:** não existe disputa contínua de posse. Cada rally é uma sequência de saque, recepção, levantamento, ataque, bloqueio e defesa. A qualidade da primeira bola condiciona as opções de ataque.
- **Handebol:** combina velocidade, contato físico permitido, circulação de bola, criação de superioridade, arremessos e transições. As funções de goleiro, pontas, armadores e pivô têm demandas diferentes.

## 1.2 Conceitos que o gestor precisa dominar

**Regra do jogo:** norma técnica da modalidade, publicada por entidade como IFAB, FIFA/CBFS, FIBA, FIVB ou IHF.

**Regulamento da competição:** documento do campeonato que define inscrição, categorias, formato, prazos, punições administrativas, critérios de desempate, quantidade de atletas e adaptações permitidas.

**Súmula:** registro oficial de uma partida. Deve conter participantes, escalações, placar, ocorrências, cartões, substituições e validação da arbitragem, conforme a modalidade.

**Estatística de partida:** registro objetivo de eventos, como gols, assistências, faltas, rebotes, bloqueios, erros ou defesas. A definição de cada evento deve ser padronizada.

**Avaliação de atleta:** interpretação estruturada do desempenho, considerando função, contexto, nível da competição, amostra observada e critérios técnicos. Não é sinônimo de estatística.

**Elegibilidade:** condição que permite ao atleta participar de determinada competição, conforme idade, inscrição, documentação, vínculo, suspensão e demais regras.

---

# 2. Diferenças entre categorias femininas e masculinas

## 2.1 Primeiro princípio: regra e desempenho são assuntos diferentes

Na maioria das modalidades, a estrutura central das regras é a mesma para as categorias femininas e masculinas. As diferenças regulamentares mais visíveis aparecem em equipamentos ou parâmetros específicos, como:

- **Voleibol:** altura oficial da rede adulta é, em regra, 2,43 m no masculino e 2,24 m no feminino.
- **Basquete:** no padrão FIBA adulto, costuma-se usar bola tamanho 7 no masculino e tamanho 6 no feminino. A cesta permanece a 3,05 m e a quadra oficial mantém as mesmas dimensões.
- **Handebol:** para adultos, normalmente se usa bola tamanho 3 no masculino e tamanho 2 no feminino. O tempo de jogo e as dimensões da quadra são os mesmos.
- **Futsal:** as leis centrais e a especificação adulta da bola podem ser iguais entre as categorias, mas parâmetros de competição podem variar. Como exemplo concreto, as diretrizes nacionais da CBFS de 2025 indicaram quadra mínima de 38 × 18 m em categorias masculinas adultas e 36 × 18 m em categorias femininas adultas; para adultos, a mesma diretriz indicou bola de 400–440 g e 62–64 cm para ambos. Isso é uma regra técnica daquela edição/competição, não uma diferença universal de toda liga. Confira sempre o regulamento vigente. [S26]
- **Futebol de campo:** as Leis do Jogo são essencialmente as mesmas entre as categorias adultas. Categorias, competições e critérios de inscrição podem variar conforme a entidade.
- **Fut7:** as regras dependem do livro adotado pela entidade organizadora. Não se deve presumir uma diferença entre categorias sem consultar o regulamento correspondente.

O voleibol tem regulamento oficial FIVB 2025–2028; o handebol tem livro IHF de 1º de março de 2025; o basquete deve seguir a edição FIBA adotada pela competição. [S4] [S7] [S8]

## 2.2 Diferenças físicas: como interpretar a ciência

A literatura de fisiologia do exercício identifica diferenças médias entre grupos de homens e mulheres adultos em algumas características físicas, especialmente força absoluta, potência e velocidade, influenciadas por fatores biológicos e hormonais. O consenso do American College of Sports Medicine destaca que a magnitude da diferença varia de acordo com a exigência do esporte e com a variável medida. Isso **não permite prever a capacidade de uma pessoa individual** nem justifica usar o mesmo padrão numérico para atletas de categorias diferentes. [S10]

Em esportes coletivos, também existem diferenças entre perfis de jogo observados em determinadas competições. Isso pode estar relacionado a aspectos físicos, táticos, técnicos, culturais, nível competitivo, recursos de treinamento, regras específicas e tamanho da amostra científica. Não se deve transformar uma tendência observada em uma regra universal.

Uma revisão sobre lesões em esportes coletivos encontrou maior incidência geral de algumas lesões em atletas homens nas amostras analisadas, mas maior incidência de lesão do ligamento cruzado anterior entre mulheres. Os autores também alertam que os resultados variam por modalidade e que ainda faltam estudos comparativos em vários esportes. [S11]

Uma revisão de 2024 sobre demandas de esportes coletivos femininos identificou grande concentração de estudos no futebol e menor volume de pesquisa em modalidades indoor; na amostra da revisão, havia apenas um estudo de futsal feminino até a data de corte da busca. Trabalhos posteriores passaram a ampliar esse campo, mas a base científica ainda não é igualmente robusta para todas as modalidades. [S12] [S13]

## 2.3 O que o gestor deve fazer

1. Criar categorias distintas quando a competição assim exigir: masculino, feminino, misto, idade ou divisão técnica.
2. Cadastrar parâmetros regulamentares por categoria, como bola, altura da rede, tempo, limite de inscritos e critérios de elegibilidade.
3. Comparar atletas prioritariamente com referências da mesma modalidade, posição, categoria, idade e nível competitivo.
4. Não penalizar uma atleta por não atingir uma marca física baseada em uma equipe masculina, nem o inverso.
5. Garantir condições equivalentes de inscrição, arbitragem, quadra/campo, horários, divulgação, premiação e atendimento.
6. Registrar dados suficientes para identificar diferenças de oportunidades e participação, sem transformar sexo ou gênero em explicação automática de desempenho.

---

# 3. Futsal

## 3.1 Características gerais

O futsal é disputado em quadra, com cinco atletas por equipe em jogo: quatro jogadores de linha e um goleiro. É uma modalidade intermitente e de alta intensidade: períodos curtos de esforço intenso são alternados com deslocamentos, pausas e momentos de menor intensidade. O espaço reduzido exige domínio de bola, velocidade de decisão, aceleração, mudança de direção, passe, finalização e organização coletiva.

A revisão de Spyrou e colaboradores descreve o futsal como uma modalidade com alta demanda fisiológica e técnica, envolvendo ações repetidas de sprint, potência dos membros inferiores, capacidade aeróbia e habilidade específica. O estudo também mostra que atletas de elite tendem a apresentar maior capacidade física e mais ações intensas que atletas de níveis inferiores. [S1]

## 3.2 Regras básicas do futsal

A referência normativa brasileira é o livro de regras da CBFS alinhado às leis da FIFA. Em fevereiro de 2026, a CBFS informou a publicação de uma nova edição oficial para as competições organizadas pela entidade e pelas federações estaduais. [S2]

| Item | Padrão comum em competições oficiais adultas |
|---|---|
| Jogadores em quadra | 5 por equipe, incluindo goleiro |
| Duração | 2 tempos de 20 minutos de tempo cronometrado efetivo |
| Intervalo | Definido pelo regulamento; frequentemente 10 minutos em competições oficiais |
| Substituições | Volantes/ilimitadas, respeitando o procedimento e a zona de substituição |
| Faltas | Faltas acumuladas por equipe em cada período; em regra, a partir da 6ª falta acumulada no período aplica-se tiro livre direto sem barreira, observadas as condições e o local de cobrança previstos no livro vigente |
| Cartões | Amarelo (advertência) e vermelho (expulsão), com consequências previstas no regulamento |
| Impedimento | Não existe impedimento no futsal |
| Goleiro | Tem restrições específicas de reposição e controle da bola, conforme a regra vigente |
| Bola | Bola própria de futsal, com quique reduzido e especificações por categoria |

**Pontos que costumam gerar dúvidas:**

- O cronômetro oficial para quando a bola sai ou há interrupção prevista nas regras. Por isso, 40 minutos de jogo efetivo podem representar uma duração total de evento muito maior.
- A regra de faltas acumuladas exige que a mesa acompanhe faltas por equipe e por período. O sistema não deve misturá-las com faltas individuais.
- A substituição pode ocorrer com a bola em jogo, desde que seja feita pelo local e procedimento corretos.
- A expulsão não deve ser tratada como um simples cartão: o sistema precisa registrar a consequência imediata e a eventual suspensão para jogos futuros.
- O goleiro-linha é uma opção tática que altera a composição ofensiva e o risco defensivo. O sistema pode permitir registrar essa situação, mas ela não deve ser confundida com a posição cadastral do atleta.

## 3.3 Posições e funções

- **Goleiro:** defende finalizações, orienta a defesa, inicia transições e pode participar da construção ofensiva.
- **Fixo:** referência defensiva, protege a zona central, faz coberturas e inicia a saída de bola.
- **Ala:** atua pelos corredores, cria situações de um contra um, recompõe e participa da circulação ofensiva.
- **Pivô:** oferece apoio de costas para o gol, protege a bola, dá continuidade às jogadas e finaliza próximo à meta.

As equipes podem variar sistemas e funções; o gestor deve permitir que um atleta tenha posição principal e posições secundárias.

## 3.4 Feminino e masculino no futsal

As regras centrais não são diferentes apenas pelo gênero. O que pode variar são os parâmetros de categorias de base, a edição do regulamento, o tamanho do elenco e o calendário da competição. Há também parâmetros técnicos de torneio que merecem atenção: nas diretrizes nacionais CBFS de 2025, a quadra mínima indicada foi 38 × 18 m para categorias masculinas adultas e 36 × 18 m para categorias femininas adultas; a bola adulta manteve a mesma faixa de peso e circunferência para ambos. A própria diretriz permite ajustes em competições estaduais. Portanto, o gestor deve cadastrar parâmetros por competição e versão do regulamento, e não assumir que essa diferença vale em toda competição ou em 2026 sem conferir o documento vigente. [S26]

Na análise do desempenho, não se deve assumir que o jogo feminino é simplesmente uma versão mais lenta do masculino. Uma revisão sistemática publicada em 2025, com 50 estudos sobre futsal feminino, identificou exigências fisiológicas elevadas, variação de desempenho ao longo da partida e diferenças entre níveis competitivos. Os autores também apontaram limitações metodológicas e a necessidade de mais estudos com dados de partidas oficiais e diferentes posições. [S3]

## 3.5 Como avaliar um jogador de futsal

Além de gols e assistências, considere:

- **Goleiro:** percentual de defesas, qualidade das defesas por zona, reposição que gera progressão, decisão em situações de goleiro-linha e comunicação defensiva.
- **Fixo:** duelos defensivos, interceptações, coberturas corretas, perdas perigosas, qualidade do primeiro passe e capacidade de proteger a zona central.
- **Ala:** conduções que criam vantagem, dribles eficazes, passes para finalização, recomposição, pressão após perda e capacidade de manter amplitude.
- **Pivô:** recepções sob pressão, proteção de bola, finalizações por oportunidade, assistências de parede, faltas sofridas e criação de espaço para os companheiros.

**Indicadores físicos possíveis:** acelerações, desacelerações, sprints repetidos, mudanças de direção, potência de salto e percepção subjetiva de esforço. Use tecnologia de rastreamento apenas quando houver equipamento, protocolo e equipe capacitada; não invente precisão a partir de dados incompletos.

---

# 4. Futebol de campo

## 4.1 Características gerais

O futebol de campo é disputado por duas equipes com até 11 jogadores cada, incluindo um goleiro. O campo é amplo, e a partida exige organização coletiva ao longo de dois períodos longos. O desempenho depende de técnica, tomada de decisão, posicionamento, leitura de espaços, condição física, comunicação e execução tática.

A análise de futebol deve observar o atleta individualmente, os setores da equipe e o comportamento coletivo. A literatura recomenda interpretar ações conforme o contexto — local, momento, adversário, posição e situação do placar — em vez de tratar todos os eventos como equivalentes. [S5]

## 4.2 Regras básicas do futebol

O órgão responsável pelas Leis do Jogo é a IFAB. A página oficial disponibiliza a edição 2026/27 e suas 17 leis. [S6]

| Item | Regra geral do futebol adulto |
|---|---|
| Jogadores | Até 11 por equipe, sendo um goleiro |
| Mínimo para iniciar/continuar | Em regra, 7 jogadores |
| Duração | 2 tempos de 45 minutos |
| Intervalo | Até 15 minutos, conforme regulamento |
| Substituições | Em muitas competições oficiais, até 5 substituições, com limite de oportunidades de parada definido pelas regras da competição |
| Impedimento | Existe e depende da posição e participação ativa do jogador no momento em que a bola é tocada por um companheiro |
| Reinícios | Tiro de saída, lateral, tiro de meta, escanteio, tiro livre direto/indireto e pênalti |
| Disciplina | Cartões amarelo e vermelho, com sanções posteriores conforme o regulamento |

A duração pode ser ajustada em categorias de base e amistosos, quando permitido. O número de substituições também depende da competição. O sistema deve ler o regulamento específico, não fixar cinco substituições como regra universal de todo torneio.

## 4.3 Posições e funções

- **Goleiro:** proteção da meta, comunicação da linha defensiva, saída de bola e controle da profundidade.
- **Zagueiro:** proteção da área, duelos, cobertura, jogo aéreo e início da construção.
- **Lateral/ala:** amplitude, apoio ofensivo, cruzamentos, cobertura e defesa do corredor.
- **Volante:** proteção à defesa, recuperação, equilíbrio e progressão da bola.
- **Meia central:** conexão entre setores, criação, passe progressivo, ritmo e ocupação de espaços.
- **Ponta:** amplitude, profundidade, drible, cruzamento e ataque ao espaço.
- **Centroavante:** referência ofensiva, finalização, movimentação, pressão e participação na construção.

O sistema deve aceitar formações variáveis (4-3-3, 4-4-2, 3-5-2 etc.) sem tratar uma formação como obrigatória.

## 4.4 Feminino e masculino no futebol

As leis de jogo são essencialmente as mesmas. Categorias, calendário, competições, critérios de inscrição e protocolos podem variar conforme a entidade.

A avaliação deve respeitar exigências e referências da competição. Uma revisão sistemática de demandas físicas do futebol feminino mostrou variação por posição: meio-campistas centrais tendem a acumular mais distância total, pontas mais distância em alta intensidade e atacantes mais sprints, com variação ao longo dos tempos. A conclusão prática é que a posição e o contexto devem orientar o treinamento e a avaliação. [S14]

## 4.5 Como avaliar um jogador de futebol

- **Goleiro:** defesas por tipo de finalização, posicionamento, domínio da área, saídas, reposição e decisão sob pressão.
- **Zagueiro:** duelos aéreos e terrestres, antecipações, cobertura, condução progressiva, passes que quebram linhas e erros que geram finalizações adversárias.
- **Lateral:** duelos defensivos, apoio, cruzamentos com qualidade, progressões, recuperação e equilíbrio entre atacar e recompor.
- **Volante:** interceptações, proteção de zona, recepção sob pressão, passes progressivos, perdas em zona central e coberturas.
- **Meia:** criação de chances, passe entre linhas, conduções, decisão em transição, pressão e ocupação de espaço.
- **Ponta:** dribles eficazes, corridas em profundidade, cruzamentos, finalizações, recomposição e criação de superioridade.
- **Atacante:** qualidade e volume de finalizações, movimentação sem bola, conversão ajustada à qualidade das chances, pressão e participação na construção.

Não avalie um zagueiro pelo mesmo conjunto de critérios de um centroavante. Nem toda ação decisiva aparece no placar.

---

# 5. Futebol 7 -- Fut7

## 5.1 Características gerais

O Fut7 é uma modalidade de futebol em campo reduzido, normalmente com sete atletas por equipe em campo, incluindo o goleiro. Também é conhecido em alguns contextos como futebol society. A proposta é manter elementos do futebol em uma área menor, com menos participantes e maior frequência de participação na bola.

**Atenção:** não existe um único conjunto universal de regras aplicado por todos os campeonatos que usam o nome Fut7. Entidades diferentes publicam livros próprios, e ligas locais podem adaptar o regulamento. A CBF7, por exemplo, divulgou alterações em seu livro de regras em 2024, incluindo mudança no retorno do atleta após punição de dois minutos por cartão amarelo e ajustes no tiro/arremesso de meta. [S9]

## 5.2 Regras e pontos para confirmar no regulamento

| Item | O que costuma existir | O que o gestor precisa configurar |
|---|---|---|
| Jogadores em campo | 7 por equipe, incluindo goleiro | Número mínimo para iniciar e continuar |
| Duração | Dois períodos, mas o tempo varia entre competições | Duração, intervalo e se o cronômetro é corrido ou parado |
| Campo | Dimensões reduzidas, com variações por entidade | Comprimento, largura, tipo de gramado e áreas |
| Substituições | Frequentemente volantes | Limite, zona e procedimento |
| Laterais | Podem ser cobrados com as mãos ou com os pés, conforme a regra adotada | Tipo de cobrança e distância defensiva |
| Faltas coletivas | Algumas entidades aplicam tiro livre após determinado número de faltas | Limite por período e local de cobrança |
| Cartões | Podem incluir advertência, expulsão e punição temporária | Duração da punição e condições para retorno |
| Impedimento | Em muitos formatos locais não é aplicado da mesma forma que no futebol de campo | Se existe, em que zona e com qual interpretação |

O gestor deve anexar ou vincular o livro de regras da organização e registrar qual versão está ativa. Uma partida não pode ser julgada com base em uma mistura de regulamentos.

## 5.3 Funções dos jogadores

- **Goleiro:** defesa, comunicação e reposição rápida.
- **Defensor:** marcação, cobertura, proteção central e saída de bola.
- **Meio-campista:** equilíbrio, circulação, transição e apoio aos dois lados.
- **Ala:** amplitude, velocidade, condução e recomposição.
- **Atacante/pivô:** finalização, proteção de bola, movimentação e criação de espaço.

Os nomes variam conforme o modelo tático e a liga. O sistema deve permitir posição principal, posição secundária e função tática específica.

## 5.4 Feminino e masculino no Fut7

Não se deve assumir diferenças de regra entre categorias sem consultar o regulamento. A organização pode ter divisões masculina e feminina com os mesmos parâmetros de jogo ou parâmetros próprios, dependendo da entidade.

Há menos literatura científica específica para Fut7 do que para futebol de campo, basquete ou voleibol. Por isso, pode-se usar parte da literatura de futebol e dos jogos reduzidos como referência inicial, deixando explícito que os resultados não são automaticamente transferíveis. O gestor deve coletar dados próprios da competição e evitar conclusões fortes com amostras pequenas.

## 5.5 Como avaliar um atleta de Fut7

Avalie ações relevantes ao espaço reduzido:

- velocidade de decisão e execução em pouco espaço;
- domínio orientado e proteção da bola;
- passe curto sob pressão e progressão;
- capacidade de vencer ou atrasar o adversário no um contra um;
- transição defensiva após a perda;
- cobertura e comunicação;
- finalização e movimentação sem bola;
- resistência a esforços repetidos.

Registre o tempo de participação e a função exercida. Um jogador que atua como defensor não pode ser avaliado principalmente pela quantidade de gols.

---

# 6. Basquete

## 6.1 Características gerais

O basquete é disputado por duas equipes de cinco jogadores em quadra. O objetivo é marcar pontos arremessando a bola na cesta adversária. O jogo combina deslocamentos curtos e intensos, acelerações, desacelerações, saltos, mudanças de direção, contato físico e decisões rápidas com e sem a bola.

A revisão sistemática de Stojanović e colaboradores descreveu as demandas físicas e fisiológicas de partidas de basquete, considerando período, posição, nível competitivo e sexo. A literatura aponta esforço intenso, deslocamentos de alta intensidade e variação entre funções e contextos. [S15]

## 6.2 Regras básicas segundo o padrão FIBA

| Item | Padrão FIBA adulto |
|---|---|
| Jogadores em quadra | 5 por equipe |
| Duração | 4 períodos de 10 minutos |
| Prorrogação | Períodos extras de 5 minutos, se necessários |
| Posse | Relógio de 24 segundos para tentar arremesso válido, com reinícios conforme a regra |
| Avanço da bola | Em regra, 8 segundos para passar a bola da quadra de defesa à quadra de ataque |
| Pontuação | 1 ponto no lance livre; 2 em arremesso dentro da linha de três; 3 fora da linha de três |
| Faltas | Controle individual e coletivo; em regra, jogador é eliminado após 5 faltas pessoais |
| Violações | Andar, dois dribles, retorno irregular à quadra de defesa, 3 segundos, 5 segundos e outras previstas nas regras |
| Substituições | Em interrupções autorizadas, com procedimento controlado pela mesa |

A FIBA publica as regras de jogo e as regras de equipamentos em documentos separados. A edição de 2024 entrou em vigor em 1º de outubro de 2024; o gestor deve conferir se a competição já adotou edição posterior ou adaptações locais. [S16]

## 6.3 Feminino e masculino no basquete

No basquete FIBA adulto, a diferença mais visível é o tamanho da bola: normalmente tamanho 7 para homens e tamanho 6 para mulheres. A altura da cesta é a mesma. Os quatro períodos de 10 minutos e a estrutura central do jogo também são os mesmos no padrão FIBA.

A revisão de demandas de jogo de basquete analisou os dois sexos e observou exigências físicas relevantes em ambos. Para avaliação, isso reforça a necessidade de normalizar estatísticas por minutos, posses e função, e não de usar uma expectativa única para todas as categorias. [S15]

## 6.4 Posições e funções

- **Armador (PG):** organiza o ataque, controla ritmo, distribui passes e toma decisões sob pressão.
- **Ala-armador (SG):** cria arremessos, ataca closeouts, pontua e defende jogadores de perímetro.
- **Ala (SF):** função versátil de pontuação, defesa, rebote e transição.
- **Ala-pivô (PF):** rebote, bloqueios, jogo próximo à cesta e, em muitos sistemas, arremesso de média/longa distância.
- **Pivô (C):** proteção de aro, rebote, bloqueios, jogo de costas para a cesta e finalizações próximas ao aro.

## 6.5 Como avaliar um jogador de basquete

- **Armador:** assistências, relação assistências/turnovers, controle de ritmo, criação de vantagem e defesa na bola.
- **Ala-armador:** eficiência de arremesso por zona, capacidade de criar o próprio arremesso, movimentação sem bola e defesa de perímetro.
- **Ala:** versatilidade, rebotes, defesa em múltiplas posições, cortes, finalização e tomada de decisão.
- **Ala-pivô:** rebotes contestados, bloqueios, eficiência perto da cesta, defesa de pick-and-roll e espaçamento ofensivo.
- **Pivô:** proteção de aro, rebotes, bloqueios que geram vantagem, finalizações no garrafão e defesa posicional.

Métricas importantes:

- **FG%:** arremessos convertidos / arremessos tentados.
- **3P%:** bolas de três convertidas / tentadas.
- **FT%:** lances livres convertidos / tentados.
- **TS%:** indicador de eficiência de pontuação que considera arremessos de dois, três e lances livres.
- **AST/TO:** relação entre assistências e turnovers.
- **Rebotes por oportunidade:** mais informativo que o total bruto quando o tempo de quadra é diferente.
- **Pontos por posse:** ajuda a avaliar eficiência ofensiva, considerando volume de posses.

Nenhuma métrica deve ser interpretada isoladamente. Um atleta pode ter baixo volume de arremessos porque sua função é criar espaço, defender ou organizar a equipe.

---

# 7. Voleibol

## 7.1 Características gerais

O voleibol é disputado por duas equipes de seis jogadores em quadra, separadas por uma rede. O objetivo é fazer a bola tocar o chão do lado adversário ou provocar um erro. Cada equipe pode realizar até três contatos para devolver a bola, além do contato de bloqueio conforme a regra.

O jogo é estruturado em rallies. A recepção condiciona o levantamento; o levantamento condiciona as opções de ataque; o bloqueio e a defesa tentam reduzir a eficácia da ação adversária. É uma modalidade em que a qualidade técnica de cada fundamento e a organização coletiva aparecem diretamente na sequência de ações.

## 7.2 Regras básicas

A referência internacional é o livro FIVB 2025–2028. [S4]

| Item | Padrão do voleibol de quadra |
|---|---|
| Jogadores em quadra | 6 por equipe |
| Quadra | 18 m x 9 m |
| Sets | Melhor de 5 sets |
| Sets comuns | 25 pontos, com diferença mínima de 2 |
| Tie-break | 15 pontos, com diferença mínima de 2 |
| Contatos | Até 3 contatos para devolver a bola, sem contar o bloqueio como contato da equipe no voleibol de quadra padrão |
| Rotação | A equipe roda no sentido horário quando recupera o direito de sacar |
| Toque na rede | Falta conforme as situações descritas na regra |
| Libero | Especialista defensivo, com restrições próprias de ataque, saque e posição conforme o regulamento |
| Substituições | Limitadas por set, com regras específicas; o libero segue procedimento distinto |

## 7.3 Feminino e masculino no voleibol

A diferença regulamentar mais conhecida é a altura da rede: 2,43 m para homens adultos e 2,24 m para mulheres adultas no padrão internacional. As dimensões da quadra e o objetivo de jogo são os mesmos. Categorias juvenis podem ter parâmetros diferentes.

Estudos de análise de jogo encontraram diferenças entre perfis de saque, ataque, recepção e continuidade de rally em partidas masculinas e femininas de alto nível. Outro estudo com 8.541 rallies identificou variações de eficácia e participação de atacantes por sexo e posição. Esses resultados descrevem amostras específicas e não devem virar regras fixas sobre todos os jogos ou atletas. [S17] [S18]

## 7.4 Posições e funções

- **Levantador:** organiza o ataque e escolhe o atacante e o tipo de levantamento.
- **Ponteiro:** participa da recepção, ataque pelas extremidades e defesa.
- **Oposto:** atacante de referência, muitas vezes com carga elevada de finalização.
- **Central:** bloqueio, ataque rápido e leitura do levantador adversário.
- **Líbero:** recepção e defesa, com uniforme diferente e limitações regulamentares.

## 7.5 Como avaliar um jogador de voleibol

- **Levantador:** precisão e distribuição, qualidade das decisões, variação de ataque, velocidade de organização e relação com cada atacante.
- **Ponteiro:** eficiência de recepção, qualidade de ataque, estabilidade sob pressão, bloqueio e defesa.
- **Oposto:** eficiência ofensiva, qualidade em bolas altas, saque, bloqueio e desempenho em situações decisivas.
- **Central:** bloqueios efetivos, leitura, tempo de salto, ataque de primeiro tempo e deslocamento lateral.
- **Líbero:** qualidade de recepção, defesa, controle de segunda bola e comunicação.

Padronize a classificação dos fundamentos. Exemplo de recepção: erro direto, recepção que limita o ataque, recepção positiva e recepção perfeita. O significado de cada categoria precisa estar escrito no sistema para que todos os anotadores utilizem o mesmo critério.

---

# 8. Handebol

## 8.1 Características gerais

O handebol é disputado por duas equipes de sete jogadores em quadra: seis jogadores de linha e um goleiro. O objetivo é marcar gols com arremessos feitos com as mãos. É uma modalidade de alta intensidade que combina corrida, saltos, mudanças de direção, contato permitido, passes rápidos, fintas e arremessos.

A revisão sistemática de demandas físicas no handebol de elite identificou variações de distância, intensidade e ações técnicas de acordo com posição, sexo e contexto competitivo. O estudo também destacou que pontas, armadores e pivôs apresentam perfis de ação diferentes. [S19]

## 8.2 Regras básicas

A referência internacional é o livro IHF de handebol indoor, edição de 1º de março de 2025, com alterações que passaram a vigorar em 1º de julho de 2025. [S7] [S20]

| Item | Padrão adulto IHF |
|---|---|
| Jogadores em quadra | 7 por equipe, incluindo goleiro |
| Duração | 2 tempos de 30 minutos |
| Intervalo | Normalmente 10 minutos; regulamentos podem prever ajustes permitidos |
| Quadra | 40 m x 20 m |
| Gol | 3 m de largura x 2 m de altura |
| Área do goleiro | Linha de 6 m; em regra, só o goleiro pode permanecer na área |
| Tiro de 7 m | Cobrança de penalidade em situações previstas na regra |
| Manejo da bola | Até 3 passos e até 3 segundos segurando a bola, sem drible; após drible, aplicam-se restrições específicas |
| Substituições | Volantes, pela zona de substituição e com procedimento correto |
| Sanções | Advertência, exclusão de 2 minutos e desqualificação, conforme a infração |
| Jogo passivo | A equipe não pode manter a posse sem tentar uma ação ofensiva de forma adequada |

**Pontos táticos e regulamentares:**

- O goleiro pode ser substituído por um jogador de linha em determinadas situações, respeitando os procedimentos de identificação e as regras de área.
- O tiro de 7 metros é diferente de um tiro livre comum e deve ser registrado separadamente.
- A exclusão de dois minutos reduz temporariamente o número de jogadores em quadra; o sistema deve controlar o tempo de punição e o retorno.
- O gestor precisa registrar os cartões e exclusões de atletas e membros da comissão técnica conforme a súmula oficial.

## 8.3 Feminino e masculino no handebol

O próprio regulamento IHF declara que as regras se aplicam igualmente a participantes homens e mulheres, exceto pelas especificações de tamanho da bola. Para adultos, o padrão mais comum é bola tamanho 3 para homens e tamanho 2 para mulheres. A bola tamanho 2 também é usada em algumas categorias masculinas jovens; portanto, categoria etária e uso de resina importam. [S8]

O tempo normal de partida adulta e as dimensões da quadra são os mesmos. Estudos de demandas mostram diferenças de perfil e de ações por posição e competição, mas a amostra científica nem sempre é equilibrada: a revisão de handebol de elite analisou muito mais atletas homens do que mulheres. Isso limita a generalização de comparações entre os sexos. [S19]

## 8.4 Posições e funções

- **Goleiro:** defesas, leitura do arremesso, reposição e orientação da defesa.
- **Ponta:** atua próximo à lateral, busca ângulos de arremesso e participa de contra-ataques.
- **Armador central:** organiza o ataque, distribui a bola e coordena o sistema ofensivo.
- **Armador lateral:** realiza arremessos de média/longa distância, infiltrações e passes ao pivô.
- **Pivô:** joga próximo à linha de 6 m, cria bloqueios, ocupa defensores e finaliza em espaços curtos.
- **Especialista defensivo:** função possível em sistemas de substituição entre ataque e defesa, de acordo com a equipe.

## 8.5 Como avaliar um jogador de handebol

- **Goleiro:** percentual de defesas por zona e tipo de arremesso, defesas em 7 m, reposições que geram contra-ataque e comunicação.
- **Ponta:** eficiência de finalização em ângulos reduzidos, contra-ataques, retorno defensivo e leitura de espaço.
- **Armador central:** assistências, qualidade de decisão, organização, perdas de bola, ritmo e liderança tática.
- **Armador lateral:** eficiência de arremesso, infiltrações, passes ao pivô, bloqueios recebidos e criação de superioridade.
- **Pivô:** bloqueios, ocupação de espaço, finalizações sob contato, assistências, faltas sofridas e colaboração defensiva.

Não use o total de gols como único indicador. Um pivô pode ter grande influência ao fixar defensores e liberar espaços para os armadores, mesmo sem finalizar muitas vezes.

---

# 9. Como um gestor esportivo deve pensar

O gestor esportivo não é apenas a pessoa que atualiza placares ou monta tabelas. Ele organiza um ambiente em que atletas, equipes, arbitragem, comissão técnica, patrocinadores e público consigam participar com regras claras, segurança, previsibilidade e confiança.

## 9.1 Pense em seis frentes

### A. Governança e regulamento

- Defina quem organiza, quem decide, quem julga recursos e quem valida resultados.
- Tenha um regulamento geral e regulamentos específicos por modalidade/categoria.
- Numere as versões e registre a data de vigência.
- Publique critérios de desempate, inscrição, transferência, suspensão, W.O., protesto, recurso e premiação antes do início.
- Não altere regra importante durante o campeonato sem processo formal e comunicação às equipes.

### B. Pessoas e inscrições

- Cadastre equipes, atletas, treinadores, dirigentes, árbitros e anotadores.
- Defina os documentos realmente necessários para validar cada inscrição.
- Estabeleça prazos e estados: rascunho, enviado, pendente, aprovado, recusado e suspenso.
- Controle idade, categoria, quantidade máxima de inscritos, vínculo com equipe e elegibilidade.
- Tenha um canal para correção de dados e contestação de inscrição.

### C. Operação dos jogos

- Planeje quadras/campos, horários, arbitragem, mesa, bolas, coletes, redes, placares e atendimento de emergência.
- Considere tempo de montagem, aquecimento, troca de equipes, intervalo e atrasos.
- Evite que uma equipe tenha partidas em sequência sem recuperação adequada.
- Tenha plano de contingência para chuva, falta de energia, falha do placar, ausência de árbitro ou indisponibilidade do local.
- Confirme a disponibilidade do espaço e a acessibilidade de atletas e público.

### D. Integridade competitiva

- Mantenha critérios iguais para equipes em condições equivalentes.
- Registre decisões administrativas, alterações de súmula e punições com autoria, data e justificativa.
- Separe o papel de quem registra um resultado do papel de quem o homologa, quando possível.
- Tenha procedimento de protesto e recurso com prazo definido.
- Bloqueie alterações silenciosas em partidas encerradas; toda correção precisa de trilha de auditoria.

### E. Saúde, segurança e bem-estar

- Planeje atendimento inicial e fluxo de encaminhamento em caso de lesão.
- Não permita que uma plataforma administrativa dê diagnóstico médico.
- Registre disponibilidade esportiva de forma mínima; dados clínicos detalhados devem ter acesso restrito.
- Considere temperatura, hidratação, iluminação, qualidade do piso, segurança das traves e condições do entorno.
- Ajuste calendário quando houver acúmulo excessivo de jogos ou deslocamentos.

### F. Comunicação e transparência

- Publique calendário, resultados, classificação, regulamentos e avisos em um canal oficial.
- Envie notificações sobre alterações diretamente aos representantes das equipes.
- Mostre a origem e o horário da última atualização dos resultados.
- Tenha um histórico de mudanças: o que mudou, por que mudou e quem autorizou.
- Use linguagem clara para atletas e público, sem esconder regras em documentos difíceis de encontrar.

## 9.2 Perguntas que o gestor deve fazer antes de cada decisão

1. **Está no regulamento?** A regra existe e foi publicada antes da competição?
2. **É igual para todos?** A decisão cria vantagem ou desvantagem indevida?
3. **Está documentado?** Consigo explicar depois o que aconteceu e por que decidi assim?
4. **Afeta a saúde ou a segurança?** Há risco que exige interrupção, atendimento ou alteração de calendário?
5. **Os dados estão corretos?** O registro foi conferido por uma pessoa responsável?
6. **Quem precisa saber?** Equipes, arbitragem, mesa, atletas e público receberam a informação apropriada?
7. **O sistema permite corrigir sem apagar o histórico?** Uma operação confiável precisa de rastreabilidade.

## 9.3 O gestor não deve confundir

- **Popularidade com desempenho:** atleta conhecido não é necessariamente o melhor avaliado.
- **Estatística com qualidade:** muitos gols ou pontos não explicam tudo o que aconteceu em quadra/campo.
- **Disciplina com personalidade:** cartão é um evento de jogo; comportamento deve ser avaliado com critérios observáveis e justos.
- **Lesão com falta de comprometimento:** disponibilidade física não é uma medida moral.
- **Opinião com evidência:** a avaliação de treinador é importante, mas precisa de critérios, exemplos e contexto.
- **Ranking com desenvolvimento:** uma lista dos melhores pode ajudar em determinada decisão, mas não substitui um plano de evolução individual.

---

# 10. Como avaliar um atleta de maneira responsável

## 10.1 Quatro dimensões principais

Uma avaliação equilibrada deve observar quatro dimensões e, quando possível, uma quinta dimensão contextual:

| Dimensão | O que observa | Exemplos |
|---|---|---|
| Técnica | Execução dos fundamentos | Passe, domínio, finalização, saque, recepção, arremesso, defesa |
| Tática | Leitura e decisão | Posicionamento, escolha de ação, cobertura, ocupação de espaço, transição |
| Física | Capacidades relacionadas à modalidade | Velocidade, aceleração, potência, resistência, mudança de direção, salto |
| Comportamental/psicossocial | Condutas observáveis em contexto esportivo | Comunicação, cooperação, resposta ao erro, responsabilidade, respeito às regras |
| Contexto | Condições que alteram a interpretação | Posição, minutos, função, adversário, placar, nível, idade e categoria |

A revisão guarda-chuva de análises de esportes coletivos mostra que a pesquisa trabalha com níveis individuais, de interação entre atletas, de grupo e da equipe como um todo. Também observa lacunas em variáveis psicossociais e na análise de desempenho feminino. Portanto, uma avaliação limitada a ações individuais deixa parte importante do jogo de fora. [S21]

## 10.2 Processo recomendado em cinco etapas

**Etapa 1 — Definir a finalidade.** A avaliação será usada para desenvolvimento, seleção, escalação, premiação, acompanhamento ou pesquisa? Cada finalidade exige critérios diferentes.

**Etapa 2 — Definir a função.** Registre modalidade, posição, função tática, categoria, nível e papel esperado do atleta.

**Etapa 3 — Reunir evidências.** Combine observação de jogo, estatísticas, vídeo, treino e, quando aplicável, testes físicos conduzidos por profissional qualificado.

**Etapa 4 — Comparar com referência adequada.** Compare o atleta com jogadores da mesma posição, modalidade, categoria, idade e nível competitivo; quando isso não for possível, declare a limitação.

**Etapa 5 — Dar retorno e definir objetivo.** Apresente pontos fortes, prioridades de evolução e uma ação concreta para o próximo ciclo. Reavalie após período suficiente para observar mudança.

## 10.3 Escala de avaliação sugerida

O sistema pode usar uma escala de 1 a 5, sempre acompanhada de descrição:

| Nota | Descrição operacional |
|---:|---|
| 1 | Muito abaixo do esperado para a função e nível; necessita de desenvolvimento prioritário |
| 2 | Abaixo do esperado; demonstra o fundamento em algumas situações, mas com inconsistência |
| 3 | Adequado; atende ao esperado na maior parte das situações observadas |
| 4 | Acima do esperado; demonstra consistência e gera impacto positivo recorrente |
| 5 | Destaque; demonstra excelência consistente e impacto claro no nível avaliado |
| N/O | Não observado ou sem amostra suficiente |

**Não transforme N/O em zero.** Ausência de observação não é desempenho ruim. O avaliador deve incluir uma evidência curta que explique a nota (por exemplo: “fez cobertura em três transições defensivas e anulou duas progressões pelo corredor”).

## 10.4 Modelo de ficha individual

| Campo | Exemplo de preenchimento |
|---|---|
| Atleta | Nome e identificador interno |
| Modalidade / categoria | Futsal / Feminino adulto |
| Equipe / temporada | Equipe A / 2026 |
| Posição / função | Ala direita / amplitude e transição |
| Partida observada | Rodada 3, adversário, data |
| Minutos observados | 24 minutos |
| Fundamento avaliado | Passe sob pressão |
| Nota | 4/5 |
| Evidência | 8 de 10 passes sob pressão mantiveram a posse ou avançaram a jogada |
| Contexto | Pressão alta do adversário; placar equilibrado |
| Ponto forte | Boa orientação corporal antes de receber |
| Ponto de desenvolvimento | Aumentar variedade de passe em transição |
| Próxima ação | Treino específico e nova observação em duas semanas |
| Avaliador | Identificação do profissional |

## 10.5 Evite os erros mais comuns

- avaliar depois de observar apenas uma partida;
- comparar posições diferentes pela mesma estatística;
- usar total bruto sem considerar minutos ou oportunidades;
- confundir volume com eficiência;
- dar notas sem evidência observável;
- mudar o critério de avaliação de um atleta para outro;
- usar métricas tecnológicas sem saber sua margem de erro;
- transformar uma avaliação esportiva em diagnóstico psicológico ou médico;
- divulgar publicamente avaliações internas sem finalidade e autorização adequadas.

## 10.6 Como usar testes físicos

Testes devem ter protocolo padronizado, aquecimento, instruções, equipamento adequado e profissional responsável. Exemplos possíveis, escolhidos conforme a modalidade e a idade:

- sprint curto (por exemplo, 5 m, 10 m ou 20 m);
- teste de mudança de direção;
- salto vertical/contramovimento;
- teste de resistência intermitente;
- avaliação de força conduzida por profissional;
- questionário curto de percepção de esforço e recuperação.

Um teste não mede “talento” de forma definitiva. Serve para acompanhar uma capacidade específica, com margem de erro conhecida e reavaliação em condições semelhantes.

## 10.7 Carga, recuperação e saúde

O consenso do Comitê Olímpico Internacional recomenda monitorar conjuntamente carga externa, resposta interna, bem-estar, sintomas e lesões. A carga externa pode incluir minutos, distância, sprints, saltos ou número de ações; a interna pode incluir percepção de esforço e resposta fisiológica individual. Nenhum marcador isolado identifica com segurança o estado de adaptação ou risco de lesão. O monitoramento deve ser individualizado e não pode virar uma fórmula automática de liberação ou veto ao atleta. [S22]

---

# 11. Indicadores e critérios por modalidade

Esta seção oferece uma base prática para montar formulários e painéis. Os indicadores são sugestões, não uma lista obrigatória. Cada competição deve escolher poucos indicadores que tenham finalidade clara e que possam ser registrados com consistência.

## 11.1 Futsal

| Função | Indicadores quantitativos | Avaliação qualitativa |
|---|---|---|
| Goleiro | Defesas, gols sofridos, defesas por zona, reposições eficazes | Posicionamento, comunicação, decisão em um contra um |
| Fixo | Interceptações, desarmes, duelos, passes progressivos, perdas perigosas | Cobertura, proteção central, orientação da linha |
| Ala | Dribles eficazes, passes para finalização, recuperações, finalizações | Amplitude, transição, decisão no um contra um |
| Pivô | Finalizações, gols, assistências, faltas sofridas, recepções | Proteção de bola, fixação de marcação, continuidade |

## 11.2 Futebol de campo

| Função | Indicadores quantitativos | Avaliação qualitativa |
|---|---|---|
| Goleiro | Defesas por tipo de chute, saídas, reposições | Posicionamento, domínio da área, comunicação |
| Zagueiro | Duelos ganhos, cortes, interceptações, passes progressivos | Cobertura, leitura de profundidade, liderança da linha |
| Lateral | Duelos, cruzamentos, progressões, recuperações | Equilíbrio ofensivo/defensivo e temporização |
| Volante | Interceptações, recuperações, passes progressivos, perdas | Proteção de zona e orientação corporal |
| Meia | Chances criadas, passes entre linhas, assistências, perdas | Leitura de espaço e ritmo |
| Ponta | Dribles, cruzamentos, sprints, finalizações | Amplitude, profundidade, recomposição |
| Centroavante | Finalizações, gols, xG quando houver fonte confiável, duelos | Movimentação sem bola e pressão |

## 11.3 Fut7

| Função | Indicadores quantitativos | Avaliação qualitativa |
|---|---|---|
| Goleiro | Defesas, reposições que geram ataque, gols sofridos | Leitura e comunicação |
| Defensor | Duelos, interceptações, coberturas, perdas em zona defensiva | Proteção da área e saída sob pressão |
| Meio-campista | Passes progressivos, recuperações, assistências, participação nas posses | Equilíbrio e transição |
| Ala | Dribles, cruzamentos, progressões e recomposição | Decisão no espaço reduzido |
| Atacante | Finalizações, gols, assistências, recepções e faltas sofridas | Movimentação e conexão com a equipe |

## 11.4 Basquete

| Função | Indicadores quantitativos | Avaliação qualitativa |
|---|---|---|
| Armador | Assistências, turnovers, AST/TO, pontos por posse | Organização e leitura da defesa |
| Ala-armador | FG%, 3P%, tentativas por zona, turnovers | Criação de arremesso e defesa de perímetro |
| Ala | Eficiência, rebotes, roubos, versatilidade defensiva | Capacidade de atuar em várias funções |
| Ala-pivô | Rebotes, bloqueios, finalizações próximas, faltas | Espaçamento e defesa de pick-and-roll |
| Pivô | Rebotes, tocos, eficiência no garrafão, faltas | Proteção de aro e bloqueios |

## 11.5 Voleibol

| Função | Indicadores quantitativos | Avaliação qualitativa |
|---|---|---|
| Levantador | Distribuição, assistências de ataque, erros de levantamento | Escolha de opção, variação e tempo |
| Ponteiro | Eficiência de recepção, ataques positivos, erros, bloqueios | Estabilidade em situações de pressão |
| Oposto | Eficiência de ataque, pontos, erros, bloqueios | Capacidade de finalizar bolas difíceis |
| Central | Bloqueios efetivos, pontos de ataque rápido, erros | Leitura do levantador e tempo de bloqueio |
| Líbero | Qualidade de recepção, defesas, erros de passe | Posicionamento e comunicação |

## 11.6 Handebol

| Função | Indicadores quantitativos | Avaliação qualitativa |
|---|---|---|
| Goleiro | Defesas por zona, defesas em 7 m, reposições | Leitura do arremessador e comunicação |
| Ponta | Gols, eficiência de arremesso, contra-ataques | Ângulo de finalização e retorno defensivo |
| Armador central | Assistências, perdas, gols, criação de superioridade | Organização e decisão |
| Armador lateral | Eficiência de arremesso, infiltrações, assistências | Escolha entre arremesso e passe |
| Pivô | Gols, bloqueios, faltas sofridas, assistências | Fixação de defensores e criação de espaço |
| Defensor | Bloqueios, interceptações, faltas, exclusões | Comunicação e coordenação coletiva |

## 11.7 Regras para definir bons indicadores

1. **Defina o evento:** o que conta como assistência, defesa, bloqueio, erro ou passe progressivo?
2. **Defina o denominador:** por jogo, por minuto, por posse, por tentativa, por rally ou por oportunidade?
3. **Defina o responsável:** quem registra e quem confere?
4. **Defina o contexto:** posição, minutos, placar, adversário e fase da partida.
5. **Teste a confiabilidade:** dois anotadores conseguem registrar o mesmo lance de forma semelhante?
6. **Evite excesso:** 8 indicadores confiáveis são melhores que 40 indicadores inconsistentes.

---

# 12. Como transformar isso em um site de gestão

O site deve ser pensado como uma plataforma de operação esportiva, não apenas como uma página de placares. O sistema precisa dar suporte ao gestor no pré-campeonato, durante os jogos e no pós-campeonato.

## 12.1 Perfis de usuário

| Perfil | Acesso recomendado |
|---|---|
| Administrador da plataforma | Configurações gerais, usuários, permissões e auditoria |
| Gestor da competição | Modalidades, regulamentos, equipes, inscrições, tabela, punições e homologações |
| Coordenador de modalidade | Categoria, calendário, escala de arbitragem e conferência de súmulas |
| Árbitro | Súmula, ocorrências, cartões, resultado e validação da partida |
| Mesário/anotador | Registro de eventos e estatísticas autorizadas |
| Treinador/representante | Elenco, documentos, escalação, calendário e recursos da própria equipe |
| Atleta | Perfil, calendário, estatísticas pessoais autorizadas e comunicados |
| Público | Calendário, resultados, classificação e informações públicas |

A regra principal é o **acesso por função e escopo**: um treinador deve acessar sua equipe, e não alterar a escalação do adversário; um anotador deve registrar eventos, mas não homologar uma decisão disciplinar; o público não deve acessar informações privadas.

## 12.2 Módulos essenciais

### 1. Painel geral

- competições ativas;
- jogos do dia;
- partidas aguardando súmula;
- inscrições pendentes;
- equipes confirmadas;
- alertas de suspensão;
- locais indisponíveis;
- ocorrências e recursos em aberto.

### 2. Modalidades e categorias

- cadastro das seis modalidades;
- modalidade indoor ou outdoor;
- regras específicas por modalidade;
- categorias por gênero, faixa etária e nível;
- parâmetros de bola, rede, campo, quadra e duração;
- versão do regulamento aplicada.

### 3. Competições e temporadas

- nome, edição e período;
- modalidade e categoria;
- formato (pontos corridos, grupos, mata-mata, festival);
- regulamento e critérios de desempate;
- limite de equipes e atletas;
- inscrições e prazos;
- premiações e fases.

### 4. Equipes e atletas

- dados básicos;
- foto e número de camisa;
- posição principal e secundária;
- equipe e histórico de vínculos;
- categoria e elegibilidade;
- status de inscrição;
- documentos mínimos necessários;
- autorização de uso de imagem, quando aplicável;
- registro de suspensões e transferências.

### 5. Agenda e locais

- quadras, campos e ginásios;
- disponibilidade por data e horário;
- partidas e intervalos entre partidas;
- bloqueios por manutenção;
- conflito de horário entre equipes;
- responsável pelo local;
- mapa ou endereço de acesso.

### 6. Tabela de jogos

- geração manual ou assistida;
- fase, rodada e grupo;
- mandante e visitante;
- data, hora e local;
- árbitros e mesa;
- status: rascunho, agendado, em andamento, encerrado, adiado, suspenso, cancelado ou homologado.

### 7. Súmula digital

- escalações;
- substituições;
- gols/pontos;
- cartões e sanções;
- faltas e eventos específicos da modalidade;
- ocorrências;
- observação da arbitragem;
- assinatura/validação;
- histórico de retificações.

### 8. Estatísticas

- estatísticas individuais e coletivas;
- filtros por temporada, categoria, equipe e atleta;
- minutos ou tempo de participação;
- indicadores específicos por modalidade;
- exportação e relatórios;
- separação entre dado oficial e dado analítico.

### 9. Avaliação de atletas

- modelos de ficha por modalidade e posição;
- escala de avaliação com descrições;
- evidências e observações;
- vídeo ou referência de lance, quando permitido;
- metas e evolução ao longo da temporada;
- acesso restrito a treinadores e profissionais autorizados.

### 10. Disciplina e recursos

- cartões;
- suspensão automática, quando prevista;
- julgamento ou decisão administrativa;
- prazo de recurso;
- documentos anexos;
- decisão final e responsável;
- rastreabilidade.

### 11. Comunicação

- avisos gerais;
- comunicados por modalidade ou equipe;
- mudanças de horário;
- confirmação de jogos;
- prazo de inscrição;
- alertas de suspensão;
- log de entrega/visualização, se necessário.

### 12. Relatórios

- classificação;
- artilharia e pontuação;
- cartões e disciplina;
- presença e participação;
- estatísticas por modalidade;
- relatório de operação;
- relatório de avaliação de atletas;
- dados exportáveis em CSV/PDF.

## 12.3 O que deve acontecer antes, durante e depois de cada partida

**Antes:** o sistema confirma equipe, elegibilidade, suspensões, local, árbitro, horário, uniformes e escalações. Pendências críticas aparecem para o gestor.

**Durante:** a mesa registra o placar e eventos da modalidade. O sistema valida regras básicas, como atleta inscrito, substituição permitida e tempo de punição, sem substituir o julgamento da arbitragem.

**Depois:** o árbitro/mesa conclui a súmula; um responsável confere; o gestor homologa; as estatísticas são atualizadas; eventuais ocorrências e recursos são encaminhados.

## 12.4 Painéis por modalidade

Não tente colocar os mesmos campos em todas as partidas. Use um núcleo comum e componentes específicos:

| Modalidade | Campos específicos importantes na súmula |
|---|---|
| Futsal | Gols, assistências (se coletadas), faltas acumuladas por período, cartões, expulsões, tempo efetivo, substituições |
| Futebol | Gols, assistências (se coletadas), cartões, substituições, acréscimos, pênaltis, impedimentos (opcional) |
| Fut7 | Gols, cartões, punições temporárias, faltas coletivas se previstas, substituições e regras de reinício específicas |
| Basquete | Pontos por atleta, faltas pessoais/coletivas, lances livres, 2P, 3P, rebotes, assistências, roubos, tocos e turnovers |
| Voleibol | Sets, pontos, rodízio, saques, erros, aces, recepção, ataques, bloqueios, líbero e substituições |
| Handebol | Gols, arremessos, defesas, 7 m, exclusões de 2 min, cartões, desqualificações e tempos técnicos |

---

# 13. Modelo de dados recomendado

Uma boa modelagem separa informações permanentes (atleta, equipe, local) de informações específicas de uma competição (inscrição, escalação, partida e estatística).

## 13.1 Entidades principais

| Entidade | Responsabilidade | Campos principais sugeridos |
|---|---|---|
| `Sport` | Modalidade | id, nome, tipo de superfície, configuração padrão |
| `Rulebook` | Edição de regras | id, sport_id, entidade, edição, vigência, URL, arquivo, versão |
| `Competition` | Competição/temporada | id, nome, edição, início, fim, status, regulamento |
| `Division` | Categoria | id, competition_id, gênero/categoria, faixa etária, nível |
| `Team` | Equipe | id, nome, escudo, responsável, contato |
| `Athlete` | Cadastro do atleta | id, nome, data de nascimento, foto, dados de contato mínimos |
| `TeamRegistration` | Vínculo equipe-atleta na competição | athlete_id, team_id, division_id, número, status, data de aprovação |
| `Position` | Posição/função | id, sport_id, nome, descrição |
| `AthletePosition` | Posições do atleta | athlete_id, position_id, principal/secundária |
| `StaffMember` | Comissão técnica e gestão | id, nome, função, contato |
| `Venue` | Local de jogo | id, nome, endereço, tipo, capacidade, disponibilidade |
| `Match` | Partida | id, competition_id, division_id, rodada, mandante, visitante, data, local, status |
| `MatchRoster` | Atletas relacionados | match_id, athlete_id, número, titular/reserva, elegibilidade validada |
| `MatchEvent` | Evento da partida | match_id, athlete_id, tipo, período, minuto/tempo, detalhes |
| `MatchOfficial` | Arbitragem/mesa | match_id, user_id, função |
| `DisciplinaryCase` | Processo disciplinar | athlete/team, motivo, decisão, vigência, recurso |
| `AthleteAssessment` | Avaliação | athlete_id, avaliador, data, contexto, modelo, resultado |
| `AssessmentItem` | Critério avaliado | assessment_id, critério, nota, evidência, observação |
| `AvailabilityRecord` | Disponibilidade esportiva | athlete_id, status, período, observação mínima |
| `AuditLog` | Trilha de auditoria | usuário, ação, entidade, valor anterior, valor novo, data |

## 13.2 Relacionamentos básicos

```text
Sport 1 ─── N Rulebook
Sport 1 ─── N Position
Competition 1 ─── N Division
Competition 1 ─── N Match
Division 1 ─── N TeamRegistration
Team 1 ─── N TeamRegistration
Athlete 1 ─── N TeamRegistration
Match 1 ─── N MatchRoster
Match 1 ─── N MatchEvent
Athlete 1 ─── N MatchEvent
Athlete 1 ─── N AthleteAssessment
AthleteAssessment 1 ─── N AssessmentItem
Venue 1 ─── N Match
Match 1 ─── N MatchOfficial
```

## 13.3 Regras de integridade que o sistema deve aplicar

- Não permitir inscrição duplicada do mesmo atleta na mesma divisão, salvo exceção explicitamente prevista.
- Validar limite de atletas, idade, prazo e documentação no momento da inscrição.
- Não permitir número de camisa duplicado na mesma equipe e competição, quando o regulamento exigir unicidade.
- Não permitir que atleta suspenso seja relacionado a uma partida durante a vigência da suspensão.
- Validar que o atleta pertence à equipe da partida.
- Não recalcular classificação com evento não homologado.
- Não apagar uma súmula encerrada; permitir retificação com justificativa e trilha de auditoria.
- Registrar o regulamento e a versão de regra associados a cada partida.
- Guardar a definição da estatística: por exemplo, o que o sistema considera assistência, bloqueio efetivo ou defesa.
- Separar placar oficial de métricas analíticas que podem ser corrigidas ou recalculadas.

## 13.4 Eventos configuráveis por modalidade

Evite criar uma coluna para cada estatística possível em todas as modalidades. Uma abordagem mais flexível é manter um catálogo de eventos por esporte:

- `event_type`: goal, foul, yellow_card, red_card, substitution, shot, rebound, assist, block, ace, reception_error, 2min_exclusion etc.
- `sport_id`: modalidade a que o evento pertence.
- `requires_athlete`: se precisa de atleta associado.
- `requires_team`: se precisa de equipe associada.
- `period_type`: tempo, quarto, set ou período.
- `counts_for_score`: se altera o placar oficial.
- `metadata_schema`: dados adicionais específicos, como zona de arremesso, tipo de saque ou região do campo.

Assim, o sistema compartilha a estrutura principal, mas respeita as diferenças de cada esporte.

---

# 14. Fluxo de trabalho de uma competição

## 14.1 Fase de planejamento

1. Definir objetivo, público, orçamento, datas e responsáveis.
2. Selecionar modalidades e categorias.
3. Obter o livro de regras e definir o regulamento da competição.
4. Definir formato e critérios de desempate.
5. Reservar quadras/campos e equipe de arbitragem.
6. Estabelecer inscrição, documentação e calendário de divulgação.
7. Preparar plano de emergência e contingência.

## 14.2 Fase de inscrição

1. Equipes criam cadastro e indicam representante.
2. Representante envia elenco e comissão técnica.
3. Gestor confere limite, idade, categoria e documentos.
4. Pendências são devolvidas com motivo claro.
5. Inscrição é aprovada ou recusada.
6. O sistema congela o elenco em determinada data, se o regulamento assim estabelecer.

## 14.3 Fase de competição

1. Publicar tabela e horários.
2. Confirmar local e arbitragem.
3. Fazer conferência de atletas antes da partida.
4. Registrar escalação e eventos.
5. Encerrar súmula e colher validações.
6. Homologar resultado e atualizar classificação.
7. Aplicar suspensões e comunicar equipes.
8. Receber recursos dentro do prazo e registrar decisão.

## 14.4 Encerramento

- confirmar classificação final;
- homologar premiações;
- gerar relatório por modalidade e categoria;
- registrar ocorrências e aprendizados;
- avaliar a qualidade do calendário e da arbitragem;
- arquivar documentos conforme política de retenção;
- coletar feedback de equipes, atletas e staff.

---

# 15. Indicadores de gestão e qualidade

O gestor também precisa avaliar a competição, não apenas os atletas.

| Indicador | O que responde | Como calcular/observar |
|---|---|---|
| Jogos realizados no prazo | O calendário foi cumprido? | Partidas realizadas na data / partidas previstas |
| Súmulas homologadas | Os registros foram finalizados? | Súmulas homologadas / jogos realizados |
| Erros de cadastro | Os dados estão confiáveis? | Correções após aprovação por quantidade de inscrições |
| Ocorrências por jogo | Há problemas operacionais ou disciplinares? | Ocorrências registradas / partidas |
| Tempo para homologação | Quanto demora para publicar resultado oficial? | Horário de homologação - horário de encerramento |
| Recursos procedentes | Há falhas recorrentes na organização? | Recursos aceitos / recursos julgados |
| Disponibilidade de locais | A infraestrutura foi confiável? | Horas disponíveis / horas reservadas |
| Participação por categoria | A oferta foi equilibrada? | Equipes e atletas por modalidade/categoria |
| Satisfação | Como os participantes avaliam a experiência? | Pesquisa simples e anônima após a competição |

Não tente usar um único indicador como nota final do gestor. A leitura deve considerar orçamento, tamanho da competição, nível de exigência e contexto.

---

# 16. Privacidade, segurança e ética

Um sistema esportivo trata dados pessoais: nome, data de nascimento, foto, telefone, equipe e histórico de participação. Também pode lidar com dados sensíveis, como informações relacionadas à saúde. A LGPD estabelece princípios de finalidade, adequação, necessidade, transparência, segurança e responsabilização. [S23] [S24]

## 16.1 Recomendações práticas

- Colete apenas dados necessários para inscrição, operação, segurança e finalidade declarada.
- Informe por que cada dado é coletado, quem pode acessá-lo e por quanto tempo será mantido.
- Separe dados públicos (nome esportivo, equipe, número, estatísticas publicáveis) de dados privados (documentos, contatos e informações clínicas).
- Restrinja dados de saúde a profissionais autorizados e à finalidade adequada.
- Não exiba diagnóstico, atestado ou histórico clínico no perfil público do atleta.
- Crie controle de acesso por função, registro de acessos e procedimento para incidentes.
- Permita correção dos dados e estabeleça política de retenção e descarte.
- Para crianças e adolescentes, considere o melhor interesse e as regras específicas de tratamento de dados de menores; não presuma que a publicação de uma foto ou estatística esteja automaticamente autorizada. [S25]
- Tenha autorização específica para uso de imagem quando for necessária, com finalidade e canais informados.

## 16.2 Avaliação e exposição pública

Notas internas, pareceres de treinador, observações comportamentais e informações de saúde não devem ser publicadas como se fossem estatísticas oficiais. Se houver ranking público, use indicadores transparentes e previamente definidos, evite constrangimento e permita correção de erro factual.

## 16.3 A plataforma não substitui profissionais

O sistema pode registrar informações e apoiar decisões, mas não substitui árbitros, treinadores, fisioterapeutas, médicos, psicólogos do esporte ou profissionais de educação física. Uma ferramenta não deve indicar retorno ao jogo, diagnosticar lesão ou definir aptidão clínica sem autoridade profissional.

---

# 17. Plano de implantação do sistema

## Etapa 1 — MVP operacional

Implemente primeiro o que torna a competição administrável:

- usuários e permissões;
- modalidades e categorias;
- competição e regulamentos;
- equipes e atletas;
- inscrição e validação;
- locais e tabela de jogos;
- súmula básica;
- placar e classificação;
- cartões/suspensões;
- histórico de alterações.

## Etapa 2 — Estatísticas por modalidade

Depois que a operação básica estiver estável:

- eventos específicos por modalidade;
- estatísticas individuais e coletivas;
- filtros por posição e categoria;
- relatórios de desempenho;
- exportação de dados;
- painéis públicos de resultados.

## Etapa 3 — Avaliação e desenvolvimento

- modelos de avaliação por posição;
- notas com descritores e evidências;
- histórico de desenvolvimento;
- metas individuais;
- comparação contextualizada;
- dashboards privados para treinadores e coordenadores.

## Etapa 4 — Inteligência e automação

- alertas de conflito de calendário;
- alertas de suspensão e inscrição irregular;
- geração assistida de tabelas;
- identificação de estatísticas incompletas;
- relatórios comparativos;
- integração com placares ou dispositivos externos, se houver padrão confiável.

**Recomendação de produto:** não comece com inteligência artificial para “dar nota” automaticamente aos atletas. Primeiro padronize as definições, melhore a qualidade dos registros e construa histórico confiável. A automação só será útil se os dados forem corretos, contextualizados e auditáveis.

---

# 18. Referências oficiais e científicas

As referências abaixo foram escolhidas para sustentar as regras e os princípios de análise apresentados neste guia. Sempre consulte a edição mais recente do regulamento da entidade que organiza sua competição.

## Regras e documentos oficiais

**[S2] Confederação Brasileira de Futsal (CBFS).** *Novo livro de regras do futsal é publicado pela CBFS.* 9 fev. 2026. Notícia oficial sobre a edição nacional das leis do futsal.  
https://cbfs.com.br/site/noticia_det.asp?cod=5343

**[S26] Confederação Brasileira de Futsal (CBFS).** *Livro Nacional de Leis do Jogo do Futsal 2025 — Diretrizes para competições CBFS 2025.* Documento usado aqui apenas para ilustrar parâmetros de quadra e bola por categoria na edição de 2025; confirme a diretriz da competição/temporada vigente antes de configurar o sistema.  
https://lnfoficial.com.br/media/2025/02/Livro-de-Regras-2025-CBFS.pdf

**[S4] Fédération Internationale de Volleyball (FIVB).** *Official Volleyball Rules 2025–2028.*  
https://www.fivb.com/volleyball/the-game/official-volleyball-rules/  
PDF das regras: https://www.fivb.com/wp-content/uploads/2025/01/FIVB-Volleyball_Rules2025_2028-EN.pdf

**[S6] International Football Association Board (IFAB).** *Laws of the Game 2026/27.*  
https://theifab.com/

**[S7] International Handball Federation (IHF).** *Rules of the Game – Indoor Handball.* Edição de 1º mar. 2025.  
https://www.ihf.info/sites/default/files/2025-02/09A%20-%20Rules%20of%20the%20Game_Indoor%20Handball_E.pdf

**[S8] International Handball Federation (IHF).** *Rule 3 – The Ball.* Especificações de circunferência e peso por categoria adulta e juvenil, no livro oficial de regras de 2025. Consultar o documento S7.  
https://www.ihf.info/sites/default/files/2025-02/09A%20-%20Rules%20of%20the%20Game_Indoor%20Handball_E.pdf

**[S9] Confederação Brasileira de Futebol 7 (CBF7).** *CBF7 atualiza regras do Fut7.* 25 jan. 2024.  
https://cbf7.com.br/noticias/2024-1-cbf7-atualiza-regras-do-fut7

**[S16] Fédération Internationale de Basketball (FIBA).** *Official Basketball Rules 2024.* Válidas a partir de 1º out. 2024, conforme publicação consultada.  
https://refereeing.fiba.basketball/en/rule-zone/official-basketball-rules-2024  
Regras e equipamentos: https://refereeing.fiba.basketball/en/rules

## Pesquisa científica e análise de desempenho

**[S1] Spyrou, K. et al.** *Physical and Physiological Match-Play Demands and Player Characteristics in Futsal: A Systematic Review.* 2020. Revisão das exigências físicas, fisiológicas e características dos atletas de futsal.  
https://pubmed.ncbi.nlm.nih.gov/33240157/  
Texto completo: https://pmc.ncbi.nlm.nih.gov/articles/PMC7677190/

**[S3] Barreira, J.; Wunderlich, K.; Batista, A. B. C. V.; Silva Junior, J. E. P.** *Physiological demands and player characteristics in women’s futsal: a systematic review.* Frontiers in Physiology, 1 ago. 2025. DOI: 10.3389/fphys.2025.1642594.  
https://pubmed.ncbi.nlm.nih.gov/40821947/  
Texto completo: https://www.frontiersin.org/journals/physiology/articles/10.3389/fphys.2025.1642594/full

**[S5] What Performance Analysts Need to Know About Research Trends in Association Football (2012–2016): A Systematic Review.** 2018. Revisão de tendências em análise de jogo, padrões táticos, bolas paradas e perfis de atividade.  
https://pubmed.ncbi.nlm.nih.gov/29243038/

**[S10] Hunter, S. K. et al.** *The Biological Basis of Sex Differences in Athletic Performance: Consensus Statement for the American College of Sports Medicine.* Medicine & Science in Sports & Exercise, 2023. DOI: 10.1249/MSS.0000000000003300.  
https://pubmed.ncbi.nlm.nih.gov/37772882/

**[S11] Zech, A. et al.** *Sex differences in injury rates in team-sport athletes: A systematic review and meta-regression analysis.* Journal of Sport and Health Science, 2022. DOI: 10.1016/j.jshs.2021.04.003.  
https://pubmed.ncbi.nlm.nih.gov/34052518/  
Texto completo: https://pmc.ncbi.nlm.nih.gov/articles/PMC8847930/

**[S12] Pérez Armendáriz, M. L.; Spyrou, K.; Alcaraz, P. E.** *Match demands of female team sports: a scoping review.* Biology of Sport, 2024. DOI: 10.5114/biolsport.2024.129476.  
https://pubmed.ncbi.nlm.nih.gov/38188119/  
Texto completo: https://pmc.ncbi.nlm.nih.gov/articles/PMC10765441/

**[S13] Barreira, J.; Silva Junior, J. E. P.; Souza, C. P.** *Research on women's futsal: a scoping review.* Science and Medicine in Football, 2024. DOI: 10.1080/24733938.2024.2310503.  
https://pubmed.ncbi.nlm.nih.gov/38314677/

**[S14] Rodríguez Porras, L. D. et al.** *Profile of Physical Demands in Female Soccer Players During Competitions: A Systematic Review.* Strength & Conditioning Journal, 2024. DOI: 10.1519/SSC.0000000000000829.  
https://doi.org/10.1519/SSC.0000000000000829

**[S15] Stojanović, E. et al.** *The Activity Demands and Physiological Responses Encountered During Basketball Match-Play: A Systematic Review.* Sports Medicine, 2018. DOI: 10.1007/s40279-017-0794-z.  
https://pubmed.ncbi.nlm.nih.gov/29039018/

**[S17] João, P. V.; Leite, N.; Mesquita, I.; Sampaio, J.** *Sex differences in discriminative power of volleyball game-related statistics.* Perceptual and Motor Skills, 2010. DOI: 10.2466/05.11.25.PMS.111.6.893-900.  
https://pubmed.ncbi.nlm.nih.gov/21319626/

**[S18] Variations of technical actions and efficacy of national teams’ volleyball attackers according to their sex and playing positions.** International Journal of Performance Analysis in Sport, 2019. Estudo com 8.541 rallies. DOI: 10.1080/24748668.2019.1625658.  
https://doi.org/10.1080/24748668.2019.1625658

**[S19] Physical Demands during Official Competitions in Elite Handball: A Systematic Review.** 2023. Revisão de distância, intensidade e ações específicas por posição e competição.  
https://pubmed.ncbi.nlm.nih.gov/36834047/  
Texto completo: https://pmc.ncbi.nlm.nih.gov/articles/PMC9965087/

**[S20] International Handball Federation (IHF).** *Amended Rules of the Game enforced from 1 July 2025.* 1 jul. 2025.  
https://www.ihf.info/index.php/media-center/news/amended-rules-game-enforced-1-july-2025

**[S21] Match Analysis in Team Ball Sports: An Umbrella Review of Systematic Reviews and Meta-Analyses.** 2022. Analisa níveis individuais, interações, equipes, variáveis táticas, técnicas, físicas e psicossociais.  
https://pmc.ncbi.nlm.nih.gov/articles/PMC9100301/

**[S22] Soligard, T. et al.** *How much is too much? (Part 1) International Olympic Committee consensus statement on load in sport and risk of injury.* British Journal of Sports Medicine, 2016. DOI: 10.1136/bjsports-2016-096581.  
https://pubmed.ncbi.nlm.nih.gov/27535989/  
Texto completo: https://doi.org/10.1136/bjsports-2016-096581

## Privacidade e proteção de dados

**[S23] Brasil.** Lei nº 13.709/2018 — Lei Geral de Proteção de Dados Pessoais (LGPD). Orientação institucional do Ministério da Saúde.  
https://www.gov.br/saude/pt-br/acesso-a-informacao/lgpd

**[S24] Autoridade Nacional de Proteção de Dados (ANPD).** Perguntas frequentes sobre dados pessoais, dados sensíveis e bases legais.  
https://www.gov.br/anpd/pt-br/acesso-a-informacao/perguntas-frequentes

**[S25] Autoridade Nacional de Proteção de Dados (ANPD).** Orientações sobre tratamento de dados pessoais de crianças e adolescentes e observância do melhor interesse.  
https://www.gov.br/anpd/pt-br/centrais-de-conteudo/materiais-educativos-e-publicacoes/copy_of_guia_legitimo_interesse.pdf

---

## Fechamento: a visão que deve orientar o projeto

Um bom sistema de gestão esportiva precisa responder a três perguntas com confiança:

1. **O que aconteceu?** Resultado, eventos, escalações, cartões, punições e ocorrências registrados corretamente.
2. **Como a competição está funcionando?** Calendário, elegibilidade, locais, arbitragem, classificação, pendências e comunicação sob controle.
3. **Como atletas e equipes estão evoluindo?** Estatísticas e avaliações contextualizadas, com critérios claros, histórico e privacidade.

A tecnologia deve tornar o esporte mais organizado, justo e compreensível — não transformar atletas em números sem contexto. O melhor sistema é aquele que ajuda o gestor a tomar decisões melhores, permite que a arbitragem registre os fatos com precisão, dá transparência às equipes e oferece aos atletas uma visão útil do próprio desenvolvimento.
