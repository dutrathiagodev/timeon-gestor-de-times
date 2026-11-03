# TimeOn — Design System | Direção de evolução

**Versão:** 1.1  
**Objetivo:** estabelecer uma linguagem visual mais madura, distinta e consistente para a plataforma TimeOn.

> As telas atuais foram usadas apenas para entender o produto, suas funcionalidades e a identidade já existente. Elas não são o layout que deve ser reproduzido. Este documento propõe uma evolução visual.

---

## 1. Direção visual

O TimeOn deve transmitir **gestão esportiva profissional, clareza operacional e confiança**. A interface precisa parecer um produto construído para ligas, universidades, clubes e organizadores — não um template genérico de dashboard.

### Princípios

- **Menos ruído:** evitar excesso de cards, contornos, gradientes e elementos decorativos.
- **Hierarquia editorial:** títulos claros, conteúdo bem agrupado e números com destaque apenas quando forem relevantes.
- **Laranja com intenção:** usar a cor da marca para ações primárias, seleção ativa e pequenos pontos de ênfase.
- **Dados em primeiro lugar:** tabelas, agenda, escalações e indicadores devem ser fáceis de ler e comparar.
- **Personalidade esportiva sutil:** usar o símbolo do atleta e referências ao movimento apenas em pontos institucionais, nunca como decoração em todas as telas.
- **Consistência entre temas:** modo claro e escuro devem compartilhar os mesmos componentes, proporções e estados.

### O que evoluir em relação à interface atual

1. Reduzir a dependência de grandes caixas arredondadas e banners altos no início de todas as páginas.
2. Dar mais espaço útil ao conteúdo e menos peso visual à navegação.
3. Fazer títulos, filtros e ações ocuparem uma única faixa de contexto sempre que possível.
4. Diferenciar melhor informação operacional, indicadores e ações.
5. Padronizar tabelas, estados vazios, formulários, filtros e mensagens do sistema.
6. Evitar gradientes fortes como fundo permanente. Reservá-los, se usados, para peças institucionais pontuais.
7. Rever os cards estatísticos: usar cards somente quando houver comparação ou resumo que justifique sua presença.

---

## 2. Identidade e cores

A marca atual — nome TimeOn, símbolo do atleta e bola — deve ser preservada. A evolução está na aplicação da identidade, não na substituição do logo.

### Paleta de marca

| Token | Valor | Uso |
|---|---|---|
| `brand.orange` | `#FF641A` | Ação principal, seleção, destaques |
| `brand.orange-hover` | `#E95510` | Hover e estados pressionados |
| `brand.orange-soft` | `#FFF0E8` | Fundo de seleção no tema claro |
| `brand.orange-muted` | `#3A2117` | Fundo de seleção no tema escuro |
| `neutral.950` | `#101114` | Fundo principal escuro |
| `neutral.900` | `#17191E` | Superfície elevada escura |
| `neutral.800` | `#24272E` | Superfície secundária escura |
| `neutral.700` | `#343840` | Bordas e divisores escuros |
| `neutral.500` | `#858A93` | Texto secundário escuro |
| `neutral.200` | `#E5E3DE` | Bordas no tema claro |
| `neutral.100` | `#F2F0EB` | Superfície secundária clara |
| `neutral.050` | `#FAF9F6` | Fundo principal claro |
| `white` | `#FFFFFF` | Superfície clara e texto em superfícies escuras |

### Cores semânticas

| Estado | Claro | Escuro |
|---|---|---|
| Sucesso | `#168653` | `#43C58A` |
| Atenção | `#B97712` | `#F0B64D` |
| Erro | `#C83D43` | `#F06B70` |
| Informação | `#3478B8` | `#72AFE8` |

Não usar laranja para representar sucesso, erro ou alerta. A cor da marca não deve competir com os estados semânticos.

### Distribuição sugerida

A maior parte da interface deve ser neutra. O laranja funciona como sinal de ação e orientação, não como preenchimento de todos os cards ou áreas.

---

## 3. Temas claro e escuro

### Tema claro

- Fundo: `#FAF9F6`.
- Superfície principal: `#FFFFFF`.
- Superfície alternativa: `#F2F0EB`.
- Texto principal: `#17191E`.
- Texto secundário: `#666B73`.
- Bordas: `#E5E3DE`.
- Laranja: `#FF641A`.

O tema claro deve ser confortável, com contraste suficiente e sem parecer branco estourado.

### Tema escuro

- Fundo: `#101114`.
- Superfície principal: `#17191E`.
- Superfície alternativa: `#24272E`.
- Texto principal: `#F5F3EF`.
- Texto secundário: `#A5A8AE`.
- Bordas: `#30333A`.
- Laranja: `#FF641A`.

O tema escuro deve usar diferenças sutis de superfície, não sombras pesadas para separar todos os elementos.

### Regra de implementação

O tema deve ser controlado por tokens semânticos (`--color-bg`, `--color-surface`, `--color-text`, `--color-border`, `--color-primary`). Não duplicar componentes para cada tema.

---

## 4. Tipografia

**Família recomendada:** Inter. Geist também pode ser usada, desde que o projeto mantenha uma única família tipográfica de interface.

| Estilo | Tamanho | Peso | Aplicação |
|---|---:|---:|---|
| Display | 32 px | 650–700 | Título excepcional de página institucional |
| H1 | 28 px | 650 | Título da página |
| H2 | 22 px | 600 | Seções principais |
| H3 | 18 px | 600 | Blocos e painéis |
| Body | 14–16 px | 400 | Texto e conteúdo |
| Label | 12–13 px | 550 | Rótulos e campos |
| Caption | 11–12 px | 400 | Ajuda e metadados |
| Data | 20–28 px | 650 | Indicadores numéricos |

Usar números tabulares em placares, tabelas, horários, contagens e estatísticas para manter os valores alinhados.

---

## 5. Grid, espaçamento e dimensões

Adotar uma escala baseada em múltiplos de 4 px.

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

- Largura de conteúdo: fluida, com máximo recomendado de 1440 px.
- Margens em desktop: 24–32 px.
- Distância entre seções: 24–32 px.
- Distância entre controles relacionados: 8–12 px.
- Sidebar: compacta e recolhível, sem competir com o conteúdo.
- Cabeçalho de página: título, contexto e ação principal em uma faixa compacta.

---

## 6. Forma, bordas e elevação

| Token | Valor | Aplicação |
|---|---:|---|
| `radius-sm` | 6 px | Inputs, badges pequenos |
| `radius-md` | 10 px | Botões e superfícies |
| `radius-lg` | 14 px | Painéis e diálogos |
| `radius-xl` | 18 px | Peças institucionais selecionadas |
| `radius-pill` | 999 px | Chips e estados |

- Bordas de 1 px, discretas.
- Sombras leves, reservadas para menus, popovers e diálogos.
- Evitar colocar uma borda em cada elemento interno de um painel.
- Não usar o mesmo nível de arredondamento em todos os elementos; a hierarquia deve ser perceptível.

---

## 7. Navegação e estrutura das páginas

### Navegação principal

A navegação deve ser compacta, previsível e orientada às tarefas do gestor. Pode manter a metáfora de navegação lateral, mas deve ser redesenhada com menos peso visual, melhor agrupamento e possibilidade de recolhimento.

Grupos sugeridos:

- **Visão geral:** dashboard.
- **Competição:** competições, modalidades, calendário, partidas, súmulas e classificação.
- **Pessoas:** equipes, atletas e inscrições.
- **Desempenho:** escalações, estatísticas e relatórios.
- **Administração:** usuários, permissões e configurações.

Mostrar apenas os itens disponíveis para o perfil e contexto ativos. Não exibir módulos indisponíveis como se fossem funcionalidades prontas.

### Cabeçalho de página

Cada página deve apresentar:

1. Nome claro da página.
2. Uma frase curta explicando a tarefa, apenas quando realmente ajudar.
3. Contexto ativo, como competição, temporada ou equipe.
4. Uma ação primária, quando houver.

Evitar banners grandes e repetitivos no topo de cada rota.

---

## 8. Componentes

### Botões

- **Primário:** fundo laranja, texto escuro ou branco conforme contraste medido; apenas uma ação primária por região.
- **Secundário:** superfície neutra e borda discreta.
- **Terciário/ghost:** sem preenchimento, para ações de menor prioridade.
- **Destrutivo:** vermelho semântico, com confirmação quando a ação for irreversível.
- Altura recomendada: 36–40 px para ações compactas e 44 px para ações principais.

### Campos e filtros

- Altura padrão: 40 px.
- Label sempre visível; placeholder não substitui rótulo.
- Estado de foco com contorno acessível e discreto.
- Erro junto ao campo, com explicação objetiva.
- Filtros relacionados devem ficar agrupados e oferecer limpeza simples.

### Cards

Cards devem resumir informação independente. Não transformar cada texto em card. Quando houver dados comparáveis, preferir tabela ou lista estruturada.

### Tabelas

São componentes centrais de uma plataforma de gestão esportiva.

- Cabeçalho fixo quando a tabela for longa.
- Linhas com altura consistente e boa leitura.
- Alinhamento numérico à direita.
- Ações por linha agrupadas em menu ou coluna final.
- Ordenação e filtros claramente indicados.
- Em telas pequenas, permitir rolagem horizontal ou transformar linhas em registros empilhados.
- Nunca depender apenas da cor para indicar estado.

### Badges de status

Usar rótulos curtos: `Agendada`, `Em andamento`, `Finalizada`, `Cancelada`, `Pendente`, `Aprovada`. Cada badge deve combinar cor, texto e, quando necessário, ícone.

### Estado vazio

Deve explicar o que está vazio e apontar a próxima ação possível. Exemplo: “Nenhum atleta cadastrado nesta equipe” + “Cadastrar atleta”. Evitar ilustrações genéricas grandes.

### Feedback

Usar toast para confirmações simples; diálogo para ações irreversíveis; mensagem inline para validação de formulário. O sistema deve explicar o resultado da ação.

---

## 9. Componentes esportivos especializados

### Placar

- Mandante e visitante claramente identificados.
- Resultado com maior destaque que os metadados.
- Período, tempo e estado da partida separados do placar.
- Em modalidades por sets ou períodos, mostrar a estrutura correta da modalidade.

### Agenda e calendário

- Separar data, hora, modalidade, equipes, local e estado.
- Oferecer visualização em lista como alternativa ao calendário mensal.
- Diferenciar partidas, treinos, reuniões e eventos com rótulo e ícone, não apenas cor.

### Classificação

- Posição, equipe, pontos e critérios de desempate explícitos.
- Indicar quando os dados foram atualizados.
- Exibir regras de classificação e desempate acessíveis ao gestor.

### Elenco e atletas

- Priorizar nome, número, posição, situação de inscrição e disponibilidade.
- Foto é opcional e não pode ser requisito para cadastro.
- Dados de saúde e informações sensíveis devem ter acesso restrito e finalidade definida.

### Escalação e quadra/campo

- Representação proporcional e legível da área de jogo.
- Posições e funções adaptadas à modalidade.
- Identificação clara de titulares, reservas e alterações.
- Oferecer também uma visualização em lista acessível; não depender apenas do posicionamento visual.

### Estatísticas

- Sempre informar unidade, período, quantidade de eventos e contexto da métrica.
- Permitir filtrar por atleta, equipe, competição, modalidade e período, conforme aplicável.
- Não transformar um ranking isolado em avaliação definitiva do atleta.

---

## 10. Ícones e imagens

- Usar uma única biblioteca de ícones, preferencialmente Lucide.
- Ícones de interface em traço simples, com tamanho de 16, 18 ou 20 px.
- Não misturar ícones preenchidos, 3D e outline sem regra.
- O símbolo do TimeOn é reservado à marca, carregamento ou comunicação institucional; não substitui ícones funcionais.
- Fotografias esportivas devem ser reais, com enquadramento e tratamento consistentes. Não usar imagens artificiais genéricas para preencher espaço.
- Imagens de atletas exigem autorização e cuidado com dados pessoais, sobretudo em categorias de base.

---

## 11. Acessibilidade e responsividade

- Contraste mínimo WCAG AA para texto normal.
- Foco de teclado claramente visível.
- Navegação completa por teclado.
- Alvos de toque recomendados de pelo menos 44 × 44 px em interfaces touch.
- Rótulos associados a campos e mensagens anunciáveis por leitores de tela.
- Não comunicar estado apenas por cor.
- Em tablet, manter tabelas e ações prioritárias utilizáveis.
- Em celular, priorizar tarefas rápidas: consultar agenda, resultado, elenco e presença. Operações densas podem usar layout específico para telas maiores.

---

## 12. Motion e microinterações

- Transições entre 120 e 180 ms para hover, foco e estados simples.
- Animações devem explicar uma mudança, não decorar a interface.
- Respeitar a preferência por movimento reduzido.
- Não animar números continuamente nem usar efeitos de entrada em toda navegação.

---

## 13. Tokens CSS de referência

```css
:root {
  color-scheme: light;
  --brand-primary: #FF641A;
  --brand-primary-hover: #E95510;
  --bg: #FAF9F6;
  --surface: #FFFFFF;
  --surface-muted: #F2F0EB;
  --text: #17191E;
  --text-muted: #666B73;
  --border: #E5E3DE;
  --success: #168653;
  --warning: #B97712;
  --danger: #C83D43;
  --info: #3478B8;
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 14px;
  --radius-xl: 18px;
}

[data-theme="dark"] {
  color-scheme: dark;
  --bg: #101114;
  --surface: #17191E;
  --surface-muted: #24272E;
  --text: #F5F3EF;
  --text-muted: #A5A8AE;
  --border: #30333A;
  --success: #43C58A;
  --warning: #F0B64D;
  --danger: #F06B70;
  --info: #72AFE8;
}
```

Os tokens devem ser centralizados e consumidos pelos componentes. Evitar valores de cor avulsos espalhados pelo código.

---

## 14. Critérios de qualidade visual

Uma tela está alinhada ao Design System quando:

- A tarefa principal é identificada rapidamente.
- O laranja destaca ação ou seleção, sem dominar a página.
- O conteúdo tem hierarquia clara e alinhamento consistente.
- Cards são usados com propósito; tabelas são usadas quando facilitam comparação.
- Estados de carregamento, vazio, erro e sucesso foram projetados.
- O tema claro e o escuro mantêm a mesma estrutura e legibilidade.
- Componentes equivalentes se comportam da mesma forma em todo o produto.
- A tela funciona em teclado, desktop e resoluções menores.

## 15. Nota de implementação

Este documento estabelece direção visual e regras de interface. Ele não afirma que módulos citados já estão implementados nem define regras de negócio. Antes de alterar cada tela, mapear os fluxos existentes e preservar suas funcionalidades, corrigindo a experiência visual sem remover comportamento necessário.
