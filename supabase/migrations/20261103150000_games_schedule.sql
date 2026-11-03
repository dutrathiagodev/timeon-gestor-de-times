-- 00040 · agenda de jogos do time.
--
-- Decisoes do dono (2026-11-02 e 2026-11-03): so gestor e administracao criam, editam e
-- homologam jogo; tecnico e jogador so veem, e so os do proprio time. Modalidade e
-- categoria vem do time (nao ha campo livre). A liga nao e controlada pelo sistema: o jogo de
-- liga e so um tipo de jogo no calendario. Jogo homologado nao muda mais nem some.
--
-- O jogo nasce SEMPRE como "scheduled"; o ciclo vai ate "finished" e so entao o gestor
-- homologa (os lances e o placar entram no card 00041). Toda criacao, edicao, homologacao e
-- exclusao vai para audit_events na mesma transacao.

create table public.games (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams (id) on delete cascade,
  kind text not null default 'friendly' check (kind in ('friendly', 'training', 'league', 'other')),
  opponent text check (opponent is null or char_length(btrim(opponent)) between 1 and 80),
  venue text check (venue is null or char_length(btrim(venue)) <= 120),
  starts_at timestamptz not null,
  status text not null default 'scheduled'
    check (status in ('scheduled', 'confirmed', 'in_progress', 'finished', 'postponed', 'cancelled', 'homologated')),
  notes text check (notes is null or char_length(notes) <= 500),
  created_by uuid references auth.users (id) on delete set null,
  homologated_by uuid references auth.users (id) on delete set null,
  homologated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Amistoso e jogo de liga tem adversario; treino e "outro" podem nao ter.
  check (kind not in ('friendly', 'league') or opponent is not null),
  check ((status = 'homologated') = (homologated_at is not null))
);
create index games_team_starts_idx on public.games (team_id, starts_at);

-- Regras que o RLS sozinho nao expressa ------------------------------------------------------

create function private.games_guard()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    new.created_by := (select auth.uid());
    new.status := 'scheduled';
    new.homologated_by := null;
    new.homologated_at := null;
    new.created_at := now();
    new.updated_at := now();
    return new;
  end if;

  if tg_op = 'DELETE' then
    if old.status = 'homologated' then
      raise exception 'jogo homologado nao pode ser apagado' using errcode = '42501';
    end if;
    return old;
  end if;

  -- UPDATE
  if old.status = 'homologated' then
    raise exception 'jogo homologado nao pode ser alterado' using errcode = '42501';
  end if;
  if new.team_id <> old.team_id then
    raise exception 'o jogo nao troca de time' using errcode = '42501';
  end if;
  new.created_by := old.created_by;
  new.created_at := old.created_at;
  new.updated_at := now();
  if new.status = 'homologated' then
    if old.status <> 'finished' then
      raise exception 'so se homologa jogo encerrado' using errcode = '42501';
    end if;
    new.homologated_by := (select auth.uid());
    new.homologated_at := now();
  else
    new.homologated_by := null;
    new.homologated_at := null;
  end if;
  return new;
end;
$$;

create trigger games_guard_ins before insert on public.games
  for each row execute function private.games_guard();
create trigger games_guard_upd before update on public.games
  for each row execute function private.games_guard();
create trigger games_guard_del before delete on public.games
  for each row execute function private.games_guard();

create function private.games_audit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  org uuid;
begin
  if tg_op = 'DELETE' then
    org := private.org_of_team(old.team_id);
    perform private.audit(org, 'game.deleted', 'game', old.id,
      jsonb_build_object('team_id', old.team_id, 'kind', old.kind, 'status', old.status));
    return old;
  end if;
  org := private.org_of_team(new.team_id);
  if tg_op = 'INSERT' then
    perform private.audit(org, 'game.created', 'game', new.id,
      jsonb_build_object('team_id', new.team_id, 'kind', new.kind));
  elsif new.status = 'homologated' then
    perform private.audit(org, 'game.homologated', 'game', new.id,
      jsonb_build_object('team_id', new.team_id));
  else
    perform private.audit(org, 'game.updated', 'game', new.id,
      jsonb_build_object('team_id', new.team_id, 'from_status', old.status, 'to_status', new.status));
  end if;
  return new;
end;
$$;

create trigger games_audit_trg after insert or update or delete on public.games
  for each row execute function private.games_audit();

-- Acesso -------------------------------------------------------------------------------------

alter table public.games enable row level security;

create policy games_read on public.games
  for select to authenticated using ((select private.can_read_team(team_id)));
create policy games_insert on public.games
  for insert to authenticated with check ((select private.can_manage_team(team_id)));
create policy games_update on public.games
  for update to authenticated
  using ((select private.can_manage_team(team_id)))
  with check ((select private.can_manage_team(team_id)));
create policy games_delete on public.games
  for delete to authenticated using ((select private.can_manage_team(team_id)));

revoke all on public.games from anon, authenticated;
grant select, insert, update, delete on public.games to authenticated;

revoke all on function private.games_guard(), private.games_audit() from public, anon, authenticated;
