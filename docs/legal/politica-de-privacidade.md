# Política de Privacidade do TimeOn (RASCUNHO)

> **Rascunho técnico, não é aconselhamento jurídico.** Foi escrito a partir do que o sistema faz hoje. Antes de publicar, preencha os campos entre `[colchetes]`, decida os pontos da seção "Decisões do dono" e peça a revisão de alguém que entenda de LGPD (Lei 13.709/2018). Apague este aviso só depois dessa revisão.

## Decisões do dono antes de publicar

1. **Quem é o controlador?** A atlética (nome e CNPJ) ou o dono do projeto como pessoa? Isso muda quem responde pelos dados.
2. **Quem é o encarregado** (contato para o titular exercer direitos) e qual o e-mail.
3. **Prazo de guarda.** Proposta abaixo: enquanto o vínculo estiver ativo e até 5 anos depois, para registro de campeonatos. Defina o prazo que vale para vocês.
4. **Compartilhamento com campeonatos e federações.** Hoje o sistema não envia nada para fora. Se um dia enviar a ficha do atleta a um campeonato, isso precisa de aviso e base própria.
5. **Atletas menores de 18 anos.** O dono decidiu em 2026-11-03: entram **com autorização dos pais e do técnico**. Falta definir como a autorização é registrada e por quanto tempo vale (seção 8).
6. **Foto do atleta.** Se for usada só para o card, fica como está; se for usada para reconhecimento facial, é dado biométrico (sensível) e muda tudo.

## 1. Quem somos

O TimeOn é uma plataforma de gestão de times esportivos da **[NOME DA ATLÉTICA / CNPJ]** ("controladora"). Esta política explica quais dados pessoais tratamos, para quê, como os protegemos e como você exerce seus direitos.

Contato do encarregado pelo tratamento de dados: **[NOME] — [E-MAIL]**.

## 2. Quais dados tratamos

| Dado | Para que serve | Onde fica |
|---|---|---|
| Nome e nome de camisa | identificar você no elenco e no jogo | texto, protegido por controle de acesso |
| Sexo | indicar a categoria em que você pode jogar (masculino, feminino, misto) | texto, protegido por controle de acesso |
| Ano de nascimento | conferir a faixa etária das categorias de base (sub-17 etc.) | texto, protegido por controle de acesso |
| **Data de nascimento completa** | confirmar a identidade e a idade exata | **cifrada** |
| **CPF** | identificar você de forma única (inscrição e vínculo) | **cifrado** |
| **Telefone** | contato para avisos do time | **cifrado** |
| Foto (opcional) | aparecer no seu cartão de atleta | armazenamento privado, com link temporário |
| Posição, camisa, estatísticas e nota por esporte | gestão esportiva do time | texto, protegido por controle de acesso |
| E-mail de login e registros de acesso | entrar na plataforma com segurança | serviço de autenticação |

Não coletamos dados de saúde, religião, origem racial nem biometria.

## 3. Para que usamos (finalidades) e em que base legal

- **Identificar o atleta e vinculá-lo ao time** e às competições: [execução de procedimentos ligados à sua participação na atlética / consentimento / legítimo interesse — escolher com a revisão jurídica].
- **Montar elenco, escalação e controlar categoria e faixa etária**: mesma base.
- **Registrar jogos, pontuação e estatísticas.**
- **Segurança**: registrar quem acessou dados pessoais, para investigar uso indevido.

Não usamos seus dados para publicidade nem os vendemos.

## 4. Com quem compartilhamos

- **Comissão do seu time e administradores da atlética**, conforme o papel de cada um (veja a seção 5).
- **Provedores de infraestrutura** que armazenam e processam os dados em nosso nome: Supabase (banco de dados e autenticação) e Vercel (hospedagem). Os dados pessoais mais sensíveis chegam a eles **já cifrados**; as chaves ficam só no nosso servidor.
- **Campeonatos e federações:** [não compartilhamos hoje; se isso mudar, avisaremos antes e pediremos a base adequada].

## 5. Quem dentro da atlética vê o quê

| Pessoa | Vê |
|---|---|
| Você (jogador) | o seu próprio cadastro, CPF, telefone e data de nascimento, e a sua nota e estatísticas |
| Técnico | nome, sexo, ano de nascimento, posição, camisa e estatísticas do elenco do time. **Nunca vê CPF, telefone nem data completa.** |
| Gestor | tudo o que o técnico vê, mais o CPF, telefone e data completa dos atletas do seu time |
| Administrador | tudo da atlética |

**Cada vez que alguém lê o CPF, o telefone ou a data completa de nascimento, o sistema registra quem leu e quando** (sem registrar o valor). Você pode pedir ao encarregado a lista de quem acessou os seus dados.

## 6. Como protegemos

- CPF, telefone e data de nascimento completa são **cifrados antes de chegar ao banco de dados** (AES-256-GCM). Quem copiar o banco ou um backup não consegue ler esses dados sem as chaves, que ficam em outro lugar.
- O CPF tem também um índice irreversível (HMAC) para detectar cadastro duplicado sem precisar decifrá-lo.
- Acesso por papéis, com regras no próprio banco de dados (RLS), e não só na tela.
- Login com verificação em duas etapas.
- Registro de auditoria de leituras e alterações sensíveis, que não pode ser alterado nem apagado.
- Cadastro só por convite ou por um administrador: não existe cadastro aberto.
- Conexão criptografada (HTTPS) e armazenamento em disco cifrado pelo provedor.

Nenhum sistema é totalmente seguro. Se houver um incidente que possa causar dano relevante, avisaremos você e a Autoridade Nacional de Proteção de Dados (ANPD) conforme a lei.

## 7. Por quanto tempo guardamos

[Proposta: enquanto o seu vínculo com a atlética estiver ativo e por até **5 anos** depois dele, para registro de competições. Depois disso, apagamos ou anonimizamos.] Você pode pedir a exclusão antes (seção 9).

## 8. Menores de 18 anos

O tratamento de dados de crianças (até 12 anos) exige consentimento específico de pelo menos um dos pais ou do responsável legal, e o de adolescentes (12 a 17) deve sempre considerar o melhor interesse do jovem. [Definir como a atlética colhe e guarda esse consentimento — por exemplo, uma autorização assinada na inscrição, anexada ao cadastro.] O sistema ainda **não** tem campo nem fluxo de responsável: até existir, a atlética precisa guardar essa autorização fora do sistema.

## 9. Seus direitos

Você pode pedir ao encarregado, a qualquer momento: confirmação de que tratamos seus dados; acesso; correção de dados incompletos ou errados; anonimização, bloqueio ou eliminação de dados desnecessários; portabilidade; informação sobre com quem compartilhamos; revogação do consentimento (quando essa for a base); e revisão de decisões automatizadas (não tomamos decisões automatizadas sobre você).

- **Correção:** nome e nome de camisa você mesmo altera. **Sexo e data de nascimento só um administrador ou gestor corrige**, para evitar uso indevido das categorias.
- **Exclusão do CPF e dos dados de contato:** a própria pessoa ou um administrador pode apagar. O cadastro esportivo (nome, ano de nascimento, histórico do time) pode ser mantido quando houver obrigação ou interesse legítimo, ou apagado a pedido.
- Responderemos em até **[15] dias**.

Se não ficar satisfeito, você pode reclamar à ANPD.

## 10. Mudanças nesta política

Quando mudarmos esta política, publicaremos a nova versão aqui, com a data. Mudanças que alterem a finalidade dos dados serão avisadas antes.

Última atualização: **[DATA]**.
