# Ideias tiradas das referências (2026-11-03)

O Thiago enviou três referências e um guia de gestão de vôlei. Resumo do que serve ao TimeOn. Nada aqui virou card ainda: é matéria-prima para o planejamento.

## O que cada referência traz

- **V-Tático** (verneapps.com.br): mais próximo do TimeOn. Ficha do elenco com medidas (altura, envergadura, salto), chamada de presença com justificativa, placar por set, **quadra tática** com seis jogadores e setas, estatística por fundamento (saque, ataque, bloqueio, recepção, levantamento, defesa), relatórios em PDF/CSV, um login para várias equipes, perfis admin/treinador/auxiliar e backup diário.
- **SocietyGO**: voltado a clubes e quadras, não a times. Aproveita: convite digital, check-in, fila de espera e cobrança por Pix.
- **Guia da CBF Academy** (gestão de futebol): financeiro, pessoas, processos, logística de jogos e planejamento. Para um time, vira financeiro simples, cadastro de atletas, agenda e metas.
- **Guia de gestão de vôlei** (texto colado): liderança técnica e emocional, time equilibrado (não só atacantes), sistema de jogo conforme os atletas (4-2, 5-1), custos (mensalidade, quadra, bolas), regras claras de falta e confirmação de presença, apps como FairSet (sorteio inteligente), SportEasy e VolleyTeams.

## O que já está no TimeOn

Um login para várias organizações e times (troca de acesso), papéis por perfil, escalação por esquema, nota por modalidade, placar e estatísticas ao vivo (motor pronto), gestão de acesso por código (esqueleto).

## Candidatos a card (ordem sugerida)

| Ideia | Origem | Por quê |
| --- | --- | --- |
| Presença em treinos e jogos, com justificativa e regra de faltas | V-Tático, guia de vôlei | evita time incompleto; alimenta a frequência no relatório |
| Sorteio equilibrado pela nota (OVR) | FairSet, VolleyTeams | a nota por modalidade já existe; times parelhos sem briga |
| ~~Financeiro simples~~ (adiado: sem mensalidade por enquanto, 2026-11-03) | CBF, guia de vôlei | gestor controlaria caixa sem planilha |
| Quadra tática: posições e setas, biblioteca de jogadas | V-Tático | complementa a escalação |
| Estatística por fundamento no vôlei | V-Tático | o motor ao vivo já registra lances |
| Relatórios por atleta, jogo e equipe (PDF/CSV) | V-Tático | comissão técnica compartilha |
| Convite digital e fila de espera | SocietyGO | combina com a entrada por código |
| Medidas do atleta (altura, envergadura, salto) | V-Tático | entra na ficha e pode pesar na nota |

Itens com dado de menor, pagamento ou exportação de dados pessoais precisam passar pelo crivo da política de privacidade (LGPD) antes de existirem.

## No layout

Os módulos ainda sem tela (Presença, Sorteio equilibrado, Quadra tática, Relatórios) já aparecem como "Em breve" no menu e na página inicial, só para os papéis que os usariam. O mapa fica em `src/components/layout/modules.ts`.
