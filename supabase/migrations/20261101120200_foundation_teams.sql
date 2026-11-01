-- 00017 · passo 3: times (cada um com um esporte) e comissao tecnica.
create table public.teams (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  name text not null check (char_length(name) between 2 and 120),
  slug text not null check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  sport text not null references public.sports (key),
  category text not null default 'mixed' check (category in ('male', 'female', 'mixed')),
  age_group text check (age_group is null or age_group ~ '^[a-z0-9]{2,12}$'),
  color text check (color is null or color ~ '^#[0-9a-f]{6}$'),
  status text not null default 'active' check (status in ('active', 'archived')),
  created_at timestamptz not null default now(),
  unique (organization_id, slug)
);

create index teams_organization_id_idx on public.teams (organization_id);

create table public.team_staff (
  team_id uuid not null references public.teams (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null check (role in ('coach', 'scout', 'viewer')),
  created_at timestamptz not null default now(),
  primary key (team_id, user_id)
);

create index team_staff_user_id_idx on public.team_staff (user_id);

-- O esporte define toda a funcionalidade do time; trocar depois de criado
-- invalidaria posicoes e estatisticas. Fases seguintes podem relaxar a regra
-- para times ainda sem dados.
create function private.block_sport_change()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.sport is distinct from old.sport then
    raise exception 'the sport of a team cannot be changed' using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

create trigger teams_block_sport_change
  before update on public.teams
  for each row execute function private.block_sport_change();
