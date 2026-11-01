-- 00017 · Fundacao multi-time, passo 1: esportes de referencia.
-- Cada esporte tambem e um modulo de codigo (src/sports); o script de seed da
-- fase 2 mantem esta tabela sincronizada com o codigo.
create table public.sports (
  key text primary key check (key ~ '^[a-z0-9_]+$'),
  name text not null,
  created_at timestamptz not null default now()
);

insert into public.sports (key, name) values
  ('volleyball', 'Volei'),
  ('futsal', 'Futsal'),
  ('football7', 'Fut7 / Society'),
  ('football', 'Futebol de campo'),
  ('basketball', 'Basquete'),
  ('handball', 'Handebol')
on conflict (key) do nothing;
