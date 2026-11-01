-- 00017 · passo 2: organizacoes e quem as administra.
-- Funcoes auxiliares vivem em "private": esse schema nao e exposto pela API.
create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated;

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 120),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  created_at timestamptz not null default now()
);

create table public.org_memberships (
  organization_id uuid not null references public.organizations (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null check (role in ('owner', 'admin')),
  created_at timestamptz not null default now(),
  primary key (organization_id, user_id)
);

create index org_memberships_user_id_idx on public.org_memberships (user_id);

-- Toda organizacao precisa de pelo menos um owner. Ao apagar a organizacao
-- inteira (cascade) a regra nao se aplica, pois a linha pai ja nao existe.
create function private.enforce_last_owner()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if old.role = 'owner'
     and (tg_op = 'DELETE' or new.role is distinct from 'owner' or new.organization_id <> old.organization_id)
     and exists (select 1 from public.organizations o where o.id = old.organization_id)
     and not exists (
       select 1 from public.org_memberships m
       where m.organization_id = old.organization_id
         and m.role = 'owner'
         and m.user_id <> old.user_id
     ) then
    raise exception 'organization % must keep at least one owner', old.organization_id
      using errcode = 'check_violation';
  end if;
  return coalesce(new, old);
end;
$$;

create trigger org_memberships_keep_owner
  before update or delete on public.org_memberships
  for each row execute function private.enforce_last_owner();
