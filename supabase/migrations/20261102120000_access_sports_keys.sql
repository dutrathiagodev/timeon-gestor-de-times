-- 00024 · passo 1: alinha as chaves de esporte do banco com as do codigo (src/sports).
-- A fundacao criou 'football7' e 'football', mas o registro usa 'football_society' e
-- 'football_field'. teams.sport tem FK para sports.key, entao um time de futebol de
-- campo nao poderia ser criado. A fundacao ainda nao foi aplicada em producao.
insert into public.sports (key, name) values
  ('football_society', 'Fut7 / Society'),
  ('football_field', 'Futebol de campo')
on conflict (key) do nothing;

update public.teams set sport = 'football_society' where sport = 'football7';
update public.teams set sport = 'football_field' where sport = 'football';

delete from public.sports where key in ('football7', 'football');
