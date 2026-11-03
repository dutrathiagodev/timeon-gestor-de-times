# TimeOn — Design System

**Versão:** 1.0  
**Escopo:** sistema web de gestão esportiva  
**Direção visual:** esportivo, funcional, minimalista e profissional  
**Referência:** interfaces atuais do TimeOn enviadas em 03/11/2026.

---

## 1. Princípios de design

O Design System do TimeOn deve evoluir a interface existente, não substituí-la por um template genérico.

1. **Clareza antes de decoração.** O gestor precisa localizar rapidamente atletas, equipes, escalações, jogos e estatísticas.
2. **Laranja como assinatura.** A cor da marca destaca ações e estados importantes; não deve pintar toda a interface.
3. **Consistência entre módulos.** Dashboard, atletas, escalação, estatísticas, calendário e segurança devem compartilhar os mesmos padrões.
4. **Densidade controlada.** Interfaces administrativas podem apresentar bastante informação, mas precisam de hierarquia, agrupamento e espaçamento.
5. **Dados confiáveis.** Números, rankings, status e indicadores devem ter rótulos claros, contexto e estados vazios bem explicados.
6. **Temas equivalentes.** Os modos claro e escuro usam a mesma estrutura, componentes e hierarquia. Apenas os tokens visuais mudam.

**Personalidade:** tecnologia aplicada ao esporte. Evitar estética de videogame, neon excessivo, gradientes chamativos, excesso de cartões e elementos decorativos sem função.

---

## 2. Identidade da marca

- **Nome:** TimeOn
- **Símbolo:** atleta em movimento com bola.
- **Cor de reconhecimento:** laranja.
- **Uso do logo:** manter proporção e área de respiro; não redesenhar o símbolo dentro dos componentes.
- **Ícone do produto:** usar o símbolo isolado quando o espaço for reduzido, mantendo contraste suficiente.

### Aplicação

| Local | Aplicação recomendada |
|---|---|
| Sidebar | Logo completo no topo; símbolo no menu recolhido |
| Login | Logo completo em destaque moderado |
| Favicon/app icon | Símbolo isolado |
| Cabeçalho de página | Não repetir o logo; usar título e contexto |
| Botões | Laranja apenas para ação primária |
| Seleção ativa | Fundo laranja translúcido, borda ou indicador lateral discreto |

---

## 3. Fundamentos visuais

### 3.1 Paleta — Dark theme

A interface atual é predominantemente escura. Este é o tema de referência e deve continuar sendo tratado como primeira classe.

| Token | Valor | Uso |
|---|---|---|
| `color-brand` | `#FF6A1A` | Ação primária, foco de marca e destaques |
| `color-brand-hover` | `#F05A12` | Hover do laranja |
| `color-brand-pressed` | `#D94B0A` | Estado pressionado |
| `color-brand-subtle` | `#3A2118` | Fundo de destaque suave |
| `color-bg` | `#101115` | Fundo global |
| `color-sidebar` | `#090A0E` | Navegação lateral |
| `color-surface` | `#17191F` | Cards e superfícies principais |
| `color-surface-raised` | `#1E2027` | Dropdowns, popovers e superfícies elevadas |
| `color-surface-soft` | `#22252C` | Campos, controles e superfícies secundárias |
| `color-border` | `#2C2F37` | Bordas e divisores |
| `color-text` | `#F3F1ED` | Texto principal |
| `color-text-secondary` | `#B4B2B0` | Texto secundário |
| `color-text-muted` | `#85858B` | Metadados, dicas e rótulos |
| `color-disabled` | `#55565D` | Texto e ícones desabilitados |

### 3.2 Paleta — Light theme

O modo claro deve ser claro de verdade, sem simplesmente inverter todas as cores. Usar superfícies neutras levemente quentes para preservar a personalidade da marca.

| Token | Valor | Uso |
|---|---|---|
| `color-brand` | `#E95B12` | Ação primária e destaques |
| `color-brand-hover` | `#D94F0C` | Hover |
| `color-brand-pressed` | `#BF4308` | Pressionado |
| `color-brand-subtle` | `#FFF0E7` | Seleção e destaque suave |
| `color-bg` | `#F5F3EE` | Fundo global |
| `color-sidebar` | `#FFFFFF` | Navegação lateral |
| `color-surface` | `#FFFFFF` | Cards e superfícies principais |
| `color-surface-raised` | `#FFFFFF` | Dropdowns, popovers e superfícies elevadas |
| `color-surface-soft` | `#F0EFEC` | Campos e superfícies secundárias |
| `color-border` | `#E2E0DC` | Bordas e divisores |
| `color-text` | `#17181C` | Texto principal |
| `color-text-secondary` | `#55565D` | Texto secundário |
| `color-text-muted` | `#777981` | Metadados e rótulos |
| `color-disabled` | `#A5A6AA` | Texto e ícones desabilitados |

> Os valores são tokens iniciais aproximados a partir das telas e da identidade visual fornecidas. Conferir o laranja diretamente nos arquivos oficiais da marca antes de consolidar em produção.

### 3.3 Cores semânticas

As cores semânticas não substituem o laranja da marca. Devem ser usadas com moderação e sempre acompanhadas de texto, ícone ou outro sinal visual.

| Token | Dark | Light | Significado |
|---|---|---|---|
| `color-success` | `#34C78A` | `#168653` | Confirmado, concluído, disponível |
| `color-warning` | `#F2B84B` | `#A96B00` | Atenção, pendência, prazo próximo |
| `color-danger` | `#F16B6B` | `#C63D3D` | Erro, bloqueio, suspensão |
| `color-info` | `#62A9F5` | `#286FB8` | Informação, dado auxiliar |

**Regra:** não atribuir significado apenas pela cor. Exibir também rótulos como “Disponível”, “Pendente”, “Suspenso” ou “Finalizado”.

### 3.4 Cores de gráficos e estatísticas

- Usar paleta curta e consistente.
- Laranja identifica a série principal ou o dado em foco.
- Azul, verde e amarelo podem diferenciar séries secundárias quando houver necessidade real.
- Não usar uma cor diferente para cada categoria sem justificativa.
- Garantir contraste entre linhas, barras, pontos e fundo.
- Sempre identificar séries por legenda ou rótulo.

---

## 4. Tipografia

**Fonte preferencial:** Inter.  
**Alternativa:** Geist Sans.  
Usar uma única família tipográfica em toda a aplicação.

| Token | Tamanho | Peso | Aplicação |
|---|---:|---:|---|
| `font-display` | 36 px / 40 px | 700 | Título principal de página em desktop |
| `font-h1` | 30 px / 36 px | 700 | Título principal em telas compactas |
| `font-h2` | 22 px / 28 px | 650–700 | Títulos de seção |
| `font-h3` | 18 px / 24 px | 600 | Títulos de cards e painéis |
| `font-body` | 14 px / 21 px | 400 | Texto padrão |
| `font-body-strong` | 14 px / 21 px | 600 | Texto enfatizado |
| `font-small` | 12 px / 18 px | 400–500 | Descrição e apoio |
| `font-label` | 11 px / 16 px | 600 | Rótulos de campos e metadados |
| `font-kpi` | 30–36 px | 700 | Indicadores numéricos |

### Regras tipográficas

- Títulos devem usar capitalização normal, sem transformar tudo em caixa alta.
- Labels pequenos podem usar caixa alta e tracking discreto (`0.06em`), como nas telas atuais.
- Não usar parágrafos longos dentro de cards.
- Valores numéricos devem usar algarismos tabulares (`font-variant-numeric: tabular-nums`).
- Evitar misturar pesos 400, 500, 600, 700 e 800 sem necessidade. Priorizar 400, 500, 600 e 700.

---

## 5. Espaçamento, grid e dimensões

Usar escala baseada em múltiplos de 4 px.

| Token | Valor |
|---|---:|
| `space-1` | 4 px |
| `space-2` | 8 px |
| `space-3` | 12 px |
| `space-4` | 16 px |
| `space-5` | 20 px |
| `space-6` | 24 px |
| `space-8` | 32 px |
| `space-10` | 40 px |
| `space-12` | 48 px |
| `space-16` | 64 px |

### Layout desktop

- Sidebar expandida: `180–200 px`.
- Sidebar recolhida: `64–72 px`.
- Altura do cabeçalho global, quando utilizado: `64 px`.
- Largura máxima do conteúdo: `1440 px`.
- Padding horizontal do conteúdo: `32 px` em desktop; `24 px` em telas intermediárias; `16 px` em mobile.
- Distância entre seções: `24–32 px`.
- Gaps de grade: `12–16 px`.

### Layout responsivo

| Faixa | Comportamento |
|---|---|
| `≥ 1280 px` | Sidebar expandida e conteúdo em múltiplas colunas |
| `1024–1279 px` | Sidebar recolhível; reduzir colunas de indicadores |
| `768–1023 px` | Sidebar compacta ou navegação em drawer; painéis em 1–2 colunas |
| `< 768 px` | Navegação em drawer; cards em uma coluna; tabelas com rolagem horizontal ou visualização alternativa |

Não reduzir indefinidamente a largura das tabelas. Em telas pequenas, priorizar as colunas essenciais e permitir abrir os detalhes do registro.

---

## 6. Bordas, raios e elevação

| Token | Valor | Uso |
|---|---:|---|
| `radius-sm` | 6 px | Chips e pequenos controles |
| `radius-md` | 10 px | Inputs, botões e cards compactos |
| `radius-lg` | 14 px | Cards e painéis |
| `radius-xl` | 18 px | Cabeçalhos de destaque e modais grandes |
| `radius-pill` | 999 px | Badges e avatares circulares |

- Bordas de 1 px são o padrão para separar superfícies.
- Preferir borda a sombra para definir limites no tema escuro.
- Sombras devem ser discretas e usadas principalmente em menus, popovers e modais.
- Não aplicar sombra forte em todos os cards.

---

## 7. Iconografia

**Biblioteca preferencial:** Lucide.

- Usar traço consistente, preferencialmente `1.8–2 px`.
- Tamanho padrão de ícones de navegação: `18–20 px`.
- Ícones de ações em botões: `16–18 px`.
- Não misturar ícones preenchidos, 3D e outline sem uma regra.
- Ícones devem acompanhar rótulos em ações importantes; não depender apenas do desenho.
- Usar ícones esportivos apenas quando representarem claramente a modalidade ou fundamento.

---

## 8. Estrutura padrão das páginas

Todas as páginas administrativas devem seguir a mesma sequência visual:

1. **Cabeçalho da página:** breadcrumb opcional, etiqueta de contexto, título, descrição curta e ação principal.
2. **Indicadores:** apenas métricas diretamente relevantes para aquele módulo.
3. **Ferramentas:** busca, filtros, ordenação, seleção de temporada/equipe quando aplicável.
4. **Conteúdo principal:** tabela, calendário, quadra, lista ou visualização específica.
5. **Detalhes e apoio:** painel lateral, resumo, histórico ou ajuda contextual quando necessário.

### Cabeçalho de página

- Título com verbo ou substantivo claro: “Gestão do elenco”, “Escalação e rotações”, “Calendário esportivo”.
- Descrição de uma ou duas linhas explicando a finalidade da página.
- Uma ação principal por cabeçalho, sempre que possível.
- Ações secundárias em menu ou junto ao título, sem competir com a principal.
- Etiquetas como “Tático” ou “Performance” devem ser pequenas e informativas, não decorativas.

### Cards de indicadores (KPI)

Cada KPI deve conter:

- Rótulo objetivo.
- Valor em destaque.
- Complemento que explique o valor ou seu período.
- Ícone apenas quando ajudar no reconhecimento.
- Variação percentual somente quando houver período de comparação confiável.

Evitar indicadores sem contexto, como “+12%” sem informar em relação a quê.

---

## 9. Componentes

### 9.1 Navegação lateral

- Fundo próprio, ligeiramente mais escuro que a área de conteúdo no tema escuro.
- Logo no topo, divisória sutil e grupos de navegação com títulos discretos.
- Item ativo com superfície laranja translúcida, borda discreta e ícone/texto de alto contraste.
- Itens inativos em tom secundário; hover com mudança leve de superfície.
- Itens indisponíveis devem ser desabilitados de forma explícita, sem parecer uma funcionalidade quebrada.
- Rodapé pode conter contexto da temporada, organização e ações de conta.
- Manter navegação e espaçamento idênticos em todos os módulos.

### 9.2 Botões

| Variante | Uso | Aparência |
|---|---|---|
| Primary | Ação mais importante da tela | Fundo laranja, texto escuro ou branco conforme contraste validado |
| Secondary | Ação complementar | Superfície neutra com borda |
| Tertiary/Ghost | Ação de baixo destaque | Transparente, texto principal ou secundário |
| Danger | Ação destrutiva | Vermelho sem competir visualmente com o Primary |
| Icon button | Ação compacta e reconhecível | Ícone centralizado, tooltip e área clicável adequada |

Estados obrigatórios: default, hover, focus-visible, active, disabled e loading.

- Altura padrão: `40 px`.
- Altura compacta: `32–36 px`.
- Altura grande: `44–48 px`.
- Usar verbos claros: “Novo atleta”, “Salvar escalação”, “Registrar resultado”.
- Evitar “OK” ou “Clique aqui” quando a ação puder ser nomeada.

### 9.3 Campos e filtros

- Label sempre visível acima do campo; placeholder não substitui label.
- Altura padrão de `40 px`.
- Foco com borda/anel laranja perceptível.
- Erro com mensagem textual próxima ao campo.
- Filtros aplicados devem permanecer visíveis e ser fáceis de remover.
- Busca deve indicar quais atributos pesquisa, por exemplo: “Nome, apelido ou curso”.
- Diferenciar filtros temporários de filtros já aplicados, quando houver botão “Aplicar”.

### 9.4 Tabelas e listas

- Cabeçalho com rótulos claros e contraste moderado.
- Linhas com altura de `48–56 px`, ajustada ao conteúdo.
- Alinhamento numérico consistente; números podem ser alinhados à direita.
- Ações por linha devem ficar em local previsível, preferencialmente no final.
- Evitar bordas fortes em todas as células; usar divisores sutis.
- Ordenação deve ter estado visual e acessível.
- Informar quantidade de resultados e estado dos filtros.
- Não usar apenas cor para comunicar disponibilidade ou disciplina.

### 9.5 Badges e status

- `Disponível`: success.
- `Indisponível`: neutral ou danger, conforme o motivo.
- `Pendente`: warning.
- `Em andamento`: info ou brand.
- `Finalizado`: neutral/success.
- `Suspenso`: danger.
- `Rascunho`: neutral.

Badges são pequenos e não devem virar botões sem indicação de interação.

### 9.6 Cards

- Usar para agrupar conteúdo relacionado, não para cada elemento individual.
- Título e conteúdo devem ter hierarquia clara.
- Padding padrão de `16–20 px`.
- Evitar aninhar muitos cards dentro de outros cards.
- Se a tela tiver muitos cards, avaliar se uma tabela, lista ou seção simples comunica melhor.

### 9.7 Modal, drawer e confirmação

- Modal para tarefas curtas e focadas.
- Drawer para edição ou consulta contextual mais extensa.
- Confirmação explícita para exclusões, encerramento de competição e ações irreversíveis.
- Exibir consequência da ação e identificar claramente o registro afetado.
- Não abrir modal para exibir informações que caberiam em uma página simples.

### 9.8 Tooltip e ajuda contextual

- Usar para explicar ícones, abreviações e métricas menos conhecidas.
- Não esconder instruções essenciais apenas em tooltip.
- Tooltip deve abrir por hover e foco de teclado.

### 9.9 Estados vazios, carregamento e erro

**Vazio:** explicar o que não foi encontrado e oferecer a próxima ação possível. Exemplo: “Nenhum atleta encontrado. Ajuste os filtros ou cadastre o primeiro atleta.”

**Carregamento:** usar skeleton quando a estrutura da tela já for conhecida; usar indicador simples para ações curtas.

**Erro:** explicar o que falhou em linguagem simples, preservar dados preenchidos e oferecer tentar novamente quando apropriado.

**Sucesso:** confirmação breve e específica, sem bloquear a continuidade do trabalho.

---

## 10. Componentes específicos de gestão esportiva

### Atletas

- Foto ou avatar, nome, número, posição e situação do cadastro.
- Separar dados cadastrais, esportivos, disponibilidade e histórico.
- Informações pessoais ou de saúde devem ter acesso restrito.
- Exibir histórico de alterações relevantes sem misturar com estatísticas de desempenho.

### Equipes e organizações

- Identificação da equipe, modalidade, categoria, temporada e situação.
- Diferenciar organização, equipe e elenco.
- Mostrar claramente qual equipe está ativa no contexto de trabalho.

### Escalação e quadra

- Representar posições e zonas com fidelidade à modalidade selecionada.
- Permitir visualizar titulares e banco separadamente.
- Indicar posição ocupada, atleta selecionado e posição ainda vazia.
- Não depender apenas de cor: incluir número, nome ou rótulo.
- Em modalidades com rotações, explicitar a rotação atual e a sequência.
- Fornecer alternativa em lista acessível para quem não consegue interpretar a quadra visual.

### Jogos e calendário

- Mostrar data, horário, modalidade, categoria, equipes, local e status.
- Diferenciar treino, amistoso e competição.
- Exibir fuso horário quando houver participantes em regiões diferentes.
- Estados: agendado, confirmado, em andamento, finalizado, adiado e cancelado.
- Alterações de horário ou local devem gerar histórico e notificação aos envolvidos quando aplicável.

### Estatísticas e desempenho

- Sempre identificar atleta/equipe, período, competição e quantidade de eventos analisados.
- Distinguir valor acumulado, média, percentual e taxa por jogo.
- Permitir filtrar por posição, modalidade, categoria e período.
- Exibir tamanho da amostra; não comparar atletas com quantidades muito diferentes de participação sem contextualização.
- Não apresentar um “overall” como verdade absoluta. Explicar critérios e pesos, permitir configuração quando fizer sentido e manter o detalhe dos indicadores disponível.
- Diferenciar estatística registrada, indicador calculado e avaliação subjetiva de comissão técnica.

### Disciplina e segurança

- Exibir sanções, advertências e suspensões com data, motivo, responsável pelo registro e situação.
- Restringir dados sensíveis por perfil de acesso.
- Registrar ações administrativas relevantes em trilha de auditoria.

---

## 11. Interação e movimento

- Transições discretas entre `120–180 ms`.
- Usar movimento para confirmar mudança de estado, abrir menus ou dar feedback, não para decorar.
- Respeitar `prefers-reduced-motion`.
- Hover não deve ser o único meio de descobrir uma ação.
- Elementos clicáveis precisam de cursor, foco e feedback consistentes.
- Evitar animação contínua em KPIs, gráficos ou elementos que chamem atenção durante o uso prolongado.

---

## 12. Acessibilidade

- Buscar conformidade com WCAG 2.2 nível AA.
- Contraste de texto normal de pelo menos `4.5:1`; texto grande de pelo menos `3:1`.
- Foco de teclado claramente visível.
- Alvos interativos preferencialmente com pelo menos `44 × 44 px` em contextos de toque.
- Todos os campos com labels associados.
- Tabelas com cabeçalhos semânticos.
- Não transmitir informação exclusivamente por cor, posição ou ícone.
- Disponibilizar navegação por teclado nos menus, diálogos, tabelas e componentes interativos.
- Garantir que tema escuro e claro sejam igualmente legíveis.

---

## 13. Temas e implementação

A aplicação deve usar tokens semânticos, não cores hexadecimais espalhadas pelos componentes.

### Exemplo de tokens CSS

```css
:root,
[data-theme="light"] {
  color-scheme: light;
  --color-brand: #E95B12;
  --color-brand-hover: #D94F0C;
  --color-brand-subtle: #FFF0E7;
  --color-bg: #F5F3EE;
  --color-sidebar: #FFFFFF;
  --color-surface: #FFFFFF;
  --color-surface-raised: #FFFFFF;
  --color-surface-soft: #F0EFEC;
  --color-border: #E2E0DC;
  --color-text: #17181C;
  --color-text-secondary: #55565D;
  --color-text-muted: #777981;
  --color-success: #168653;
  --color-warning: #A96B00;
  --color-danger: #C63D3D;
  --color-info: #286FB8;
}

[data-theme="dark"] {
  color-scheme: dark;
  --color-brand: #FF6A1A;
  --color-brand-hover: #F05A12;
  --color-brand-subtle: #3A2118;
  --color-bg: #101115;
  --color-sidebar: #090A0E;
  --color-surface: #17191F;
  --color-surface-raised: #1E2027;
  --color-surface-soft: #22252C;
  --color-border: #2C2F37;
  --color-text: #F3F1ED;
  --color-text-secondary: #B4B2B0;
  --color-text-muted: #85858B;
  --color-success: #34C78A;
  --color-warning: #F2B84B;
  --color-danger: #F16B6B;
  --color-info: #62A9F5;
}
```

### Regras de implementação

- Componentes devem consumir tokens semânticos (`--color-surface`, `--color-text`), não tokens de tema diretamente.
- O tema deve ser controlado em um único ponto da aplicação e persistido conforme a arquitetura adotada.
- Preferência inicial: respeitar a escolha salva pelo usuário; na primeira visita, considerar a preferência do sistema operacional.
- Não duplicar componentes para cada tema.
- Testar componentes em ambos os temas, incluindo hover, focus, disabled, loading, erro e vazio.
- Centralizar escalas de tipografia, espaçamento, raios e breakpoints.

---

## 14. Padrões de conteúdo e linguagem

O tom do TimeOn é profissional, direto e próximo de quem organiza esporte.

| Evitar | Preferir |
|---|---|
| “Ops! Parece que algo deu errado 😅” | “Não foi possível salvar. Tente novamente.” |
| “Clique aqui” | “Cadastrar atleta” |
| “Overall” sem explicação | “Índice de desempenho” com critérios disponíveis |
| “Dados” | “Estatísticas da temporada” |
| “OK” | “Salvar alterações” |

- Usar português do Brasil.
- Escrever nomes de modalidades corretamente: vôlei/voleibol, futsal, futebol, basquete/basquetebol e handebol.
- Usar termos esportivos adequados ao contexto da modalidade.
- Datas no formato `DD/MM/AAAA` na interface brasileira.
- Horários no formato `HH:mm`.
- Deixar claro quando um dado é fictício, estimado ou ainda não registrado.

---

## 15. Critérios de consistência (checklist)

Antes de aprovar uma nova tela, verificar:

- [ ] Usa a sidebar e a estrutura padrão do TimeOn.
- [ ] Mantém o laranja como destaque, sem excesso.
- [ ] Usa os tokens de cor, tipografia, espaçamento e raio.
- [ ] Tem título, descrição e ação principal claros.
- [ ] Busca, filtros e ordenação têm estados visíveis.
- [ ] Possui estados de vazio, carregamento, erro e sucesso.
- [ ] Funciona nos temas claro e escuro.
- [ ] Funciona em desktop, tablet e mobile.
- [ ] É navegável por teclado e tem foco visível.
- [ ] Não depende apenas de cores ou ícones para explicar informações.
- [ ] Apresenta contexto suficiente para interpretar indicadores e estatísticas.
- [ ] Não introduz elementos decorativos ou componentes diferentes sem necessidade.

---

## 16. Direção final

O TimeOn deve manter a linguagem visual que já aparece nas telas atuais: base escura elegante, superfícies discretas, laranja pontual, tipografia forte e navegação lateral objetiva. O Design System organiza essa linguagem para que todas as áreas do produto pareçam partes do mesmo sistema.

**Princípio central:** menos ruído visual, mais clareza operacional. O gestor deve perceber o que está acontecendo, entender o que exige atenção e conseguir agir com poucos passos.
