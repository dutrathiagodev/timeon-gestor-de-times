-- 00025 · passo 1: posicoes de cada esporte, para o banco validar a posicao do atleta.
-- Cada esporte e um modulo de codigo (src/sports); esta tabela espelha as posicoes dele.
-- O teste src/sports/db-sync.test.ts falha se as duas divergirem.
create table public.sport_positions (
  sport text not null references public.sports (key) on delete cascade,
  key text not null check (key ~ '^[a-z_]+$'),
  label text not null,
  primary key (sport, key)
);

insert into public.sport_positions (sport, key, label) values
  ('volleyball', 'setter', 'Levantador'),
  ('volleyball', 'opposite', 'Oposto'),
  ('volleyball', 'outside', 'Ponteiro'),
  ('volleyball', 'middle', 'Central'),
  ('volleyball', 'libero', 'Líbero'),
  ('futsal', 'goalkeeper', 'Goleiro'),
  ('futsal', 'fixo', 'Fixo'),
  ('futsal', 'ala', 'Ala'),
  ('futsal', 'pivo', 'Pivô'),
  ('football_society', 'goalkeeper', 'Goleiro'),
  ('football_society', 'defender', 'Zagueiro'),
  ('football_society', 'fullback', 'Lateral'),
  ('football_society', 'midfielder', 'Meio-campista'),
  ('football_society', 'attacker', 'Atacante'),
  ('football_field', 'goalkeeper', 'Goleiro'),
  ('football_field', 'defender', 'Zagueiro'),
  ('football_field', 'fullback', 'Lateral'),
  ('football_field', 'defensive_mid', 'Volante'),
  ('football_field', 'midfielder', 'Meia'),
  ('football_field', 'winger', 'Ponta'),
  ('football_field', 'striker', 'Centroavante'),
  ('basketball', 'point_guard', 'Armador'),
  ('basketball', 'shooting_guard', 'Ala-armador'),
  ('basketball', 'small_forward', 'Ala'),
  ('basketball', 'power_forward', 'Ala-pivô'),
  ('basketball', 'center', 'Pivô'),
  ('handball', 'goalkeeper', 'Goleiro'),
  ('handball', 'wing', 'Ponta'),
  ('handball', 'playmaker', 'Armador'),
  ('handball', 'center_back', 'Central'),
  ('handball', 'pivot', 'Pivô')
;

alter table public.sport_positions enable row level security;
create policy sport_positions_read on public.sport_positions
  for select to authenticated using (true);
grant select on public.sport_positions to authenticated;
revoke all on public.sport_positions from anon;
