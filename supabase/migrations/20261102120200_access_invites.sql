-- 00024 · passo 3: codigo do time (convite), pedidos de entrada e aceite.
-- Quem gera o codigo: admin (qualquer papel); gestor e tecnico (so jogador, so no proprio
-- time). O papel fica fixado no codigo. So o hash do codigo e guardado.

create table public.team_invites (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams (id) on delete cascade,
  role text not null check (role in ('player', 'manager', 'coach')),
  code_hash bytea not null unique,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  max_uses integer not null check (max_uses between 1 and 200),
  used_count integer not null default 0 check (used_count >= 0),
  requires_approval boolean not null default true,
  revoked_at timestamptz,
  check (used_count <= max_uses),
  check (expires_at > created_at),
  -- Codigo de gestor e de tecnico vale uma vez so.
  check (role = 'player' or max_uses = 1)
);
create index team_invites_team_id_idx on public.team_invites (team_id);

create table public.team_join_requests (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  invite_id uuid references public.team_invites (id) on delete set null,
  role text not null check (role in ('player', 'manager', 'coach')),
  status text not null default 'pending' check (status in ('pending', 'accepted', 'rejected')),
  created_at timestamptz not null default now(),
  decided_by uuid references auth.users (id) on delete set null,
  decided_at timestamptz
);
create unique index team_join_requests_one_pending
  on public.team_join_requests (team_id, user_id) where status = 'pending';
create index team_join_requests_team_status_idx on public.team_join_requests (team_id, status);

-- Tentativas de usar um codigo, para travar quem fica chutando.
create table public.invite_attempts (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  success boolean not null,
  attempted_at timestamptz not null default now()
);
create index invite_attempts_user_time_idx on public.invite_attempts (user_id, attempted_at desc);

-- Codigo: 12 caracteres de um alfabeto de 32 sem 0, O, 1 e I (cerca de 60 bits).
-- Usa bytes aleatorios do UUID v4, pulando os que tem bits fixos de versao e variante.
create function private.new_invite_code()
returns text
language plpgsql
volatile
set search_path = ''
as $$
declare
  alphabet constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  raw bytea := decode(replace(gen_random_uuid()::text, '-', ''), 'hex');
  positions constant int[] := array[0, 1, 2, 3, 4, 5, 7, 9, 10, 11, 12, 13];
  result text := '';
  pos int;
begin
  foreach pos in array positions loop
    result := result || substr(alphabet, (get_byte(raw, pos) & 31) + 1, 1);
  end loop;
  return result;
end;
$$;

create function private.normalize_invite_code(code text)
returns text
language sql
immutable
set search_path = ''
as $$
  select upper(regexp_replace(coalesce(code, ''), '[^A-Za-z0-9]', '', 'g'));
$$;

create function private.invite_code_hash(code text)
returns bytea
language sql
immutable
set search_path = ''
as $$
  select sha256(convert_to(private.normalize_invite_code(code), 'UTF8'));
$$;

-- Da o acesso (jogador ou comissao) sem duplicar se a pessoa ja tem.
create function private.grant_team_access(team uuid, uid uuid, member_role text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if member_role = 'player' then
    insert into public.team_players (team_id, user_id) values (team, uid) on conflict do nothing;
  else
    insert into public.team_staff (team_id, user_id, role) values (team, uid, member_role) on conflict do nothing;
  end if;
end;
$$;

-- Gera um codigo. O texto so existe na resposta desta chamada.
create function public.create_team_invite(
  p_team uuid,
  p_role text default 'player',
  p_ttl_hours integer default 168,
  p_max_uses integer default 30,
  p_requires_approval boolean default true
)
returns table (invite_id uuid, invite_code text, invite_expires_at timestamptz)
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := (select auth.uid());
  org uuid;
  plain text;
  uses integer := p_max_uses;
  expires timestamptz;
  new_id uuid;
  attempt integer := 0;
begin
  if uid is null then
    raise exception 'not authenticated' using errcode = 'insufficient_privilege';
  end if;
  if p_role not in ('player', 'manager', 'coach') then
    raise exception 'invalid role' using errcode = 'invalid_parameter_value';
  end if;
  if p_ttl_hours is null or p_ttl_hours not between 1 and 720 then
    raise exception 'ttl must be between 1 and 720 hours' using errcode = 'invalid_parameter_value';
  end if;

  org := private.org_of_team(p_team);
  if org is null then
    raise exception 'team not found' using errcode = 'insufficient_privilege';
  end if;

  if p_role = 'player' then
    if not private.can_invite_players(p_team) then
      raise exception 'not allowed to invite players to this team' using errcode = 'insufficient_privilege';
    end if;
  else
    if not private.has_org_role(org, array['owner', 'admin']) then
      raise exception 'only admin can create manager or coach codes' using errcode = 'insufficient_privilege';
    end if;
    uses := 1;
  end if;
  if uses is null or uses not between 1 and 200 then
    raise exception 'max uses must be between 1 and 200' using errcode = 'invalid_parameter_value';
  end if;
  if exists (select 1 from public.teams t where t.id = p_team and t.status <> 'active') then
    raise exception 'team is archived' using errcode = 'check_violation';
  end if;

  expires := now() + make_interval(hours => p_ttl_hours);
  loop
    plain := private.new_invite_code();
    begin
      insert into public.team_invites
        (team_id, role, code_hash, created_by, expires_at, max_uses, requires_approval)
      values
        (p_team, p_role, private.invite_code_hash(plain), uid, expires, uses, coalesce(p_requires_approval, true))
      returning id into new_id;
      exit;
    exception when unique_violation then
      attempt := attempt + 1;
      if attempt >= 5 then raise; end if;
    end;
  end loop;

  perform private.audit(
    org, 'invite.created', 'team_invite', new_id,
    jsonb_build_object(
      'team_id', p_team, 'role', p_role, 'max_uses', uses,
      'expires_at', expires, 'requires_approval', coalesce(p_requires_approval, true)
    )
  );

  return query select
    new_id,
    substr(plain, 1, 4) || '-' || substr(plain, 5, 4) || '-' || substr(plain, 9, 4),
    expires;
end;
$$;

-- Usa um codigo. Devolve o resultado em vez de levantar erro, porque uma excecao
-- desfaria o registro da tentativa. Codigo errado, vencido, revogado ou esgotado
-- dao a mesma resposta ('invalid'). Cinco erros em 15 minutos travam a pessoa.
create function public.redeem_team_invite(p_code text)
returns table (outcome text, joined_team_id uuid)
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := (select auth.uid());
  normalized text := private.normalize_invite_code(p_code);
  invite public.team_invites%rowtype;
  org uuid;
  failures integer;
begin
  if uid is null then
    raise exception 'not authenticated' using errcode = 'insufficient_privilege';
  end if;

  select count(*) into failures
  from public.invite_attempts a
  where a.user_id = uid and not a.success and a.attempted_at > now() - interval '15 minutes';
  if failures >= 5 then
    return query select 'too_many_attempts'::text, null::uuid;
    return;
  end if;

  select * into invite
  from public.team_invites i
  where length(normalized) = 12 and i.code_hash = private.invite_code_hash(normalized)
  for update;

  if not found
     or invite.revoked_at is not null
     or invite.expires_at <= now()
     or invite.used_count >= invite.max_uses
     or exists (select 1 from public.teams t where t.id = invite.team_id and t.status <> 'active') then
    insert into public.invite_attempts (user_id, success) values (uid, false);
    return query select 'invalid'::text, null::uuid;
    return;
  end if;

  if exists (select 1 from public.team_staff s where s.team_id = invite.team_id and s.user_id = uid)
     or exists (select 1 from public.team_players p where p.team_id = invite.team_id and p.user_id = uid) then
    return query select 'already_member'::text, invite.team_id;
    return;
  end if;
  if exists (
    select 1 from public.team_join_requests r
    where r.team_id = invite.team_id and r.user_id = uid and r.status = 'pending'
  ) then
    return query select 'already_pending'::text, invite.team_id;
    return;
  end if;

  org := private.org_of_team(invite.team_id);
  update public.team_invites set used_count = used_count + 1 where id = invite.id;
  insert into public.invite_attempts (user_id, success) values (uid, true);

  if invite.requires_approval then
    insert into public.team_join_requests (team_id, user_id, invite_id, role)
    values (invite.team_id, uid, invite.id, invite.role);
    perform private.audit(
      org, 'invite.redeemed', 'team_invite', invite.id,
      jsonb_build_object('team_id', invite.team_id, 'role', invite.role, 'result', 'pending')
    );
    return query select 'pending'::text, invite.team_id;
    return;
  end if;

  perform private.grant_team_access(invite.team_id, uid, invite.role);
  insert into public.team_join_requests (team_id, user_id, invite_id, role, status, decided_at)
  values (invite.team_id, uid, invite.id, invite.role, 'accepted', now());
  perform private.audit(
    org, 'invite.redeemed', 'team_invite', invite.id,
    jsonb_build_object('team_id', invite.team_id, 'role', invite.role, 'result', 'joined')
  );
  return query select 'joined'::text, invite.team_id;
end;
$$;

-- Aceita ou recusa um pedido. Pedido de jogador: admin, gestor ou tecnico do time.
-- Pedido de gestor ou tecnico: so admin. Ninguem decide o proprio pedido.
create function public.decide_join_request(p_request uuid, p_accept boolean)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := (select auth.uid());
  req public.team_join_requests%rowtype;
  org uuid;
  allowed boolean;
  new_status text;
begin
  if uid is null then
    raise exception 'not authenticated' using errcode = 'insufficient_privilege';
  end if;
  select * into req from public.team_join_requests r where r.id = p_request for update;
  if not found then
    raise exception 'request not found' using errcode = 'insufficient_privilege';
  end if;
  org := private.org_of_team(req.team_id);

  if req.user_id = uid then
    allowed := false;
  elsif req.role = 'player' then
    allowed := private.can_invite_players(req.team_id);
  else
    allowed := private.has_org_role(org, array['owner', 'admin']);
  end if;
  if not allowed then
    raise exception 'not allowed to decide this request' using errcode = 'insufficient_privilege';
  end if;
  if req.status <> 'pending' then
    raise exception 'request already decided' using errcode = 'check_violation';
  end if;

  new_status := case when p_accept then 'accepted' else 'rejected' end;
  update public.team_join_requests
    set status = new_status, decided_by = uid, decided_at = now()
    where id = req.id;
  if p_accept then
    perform private.grant_team_access(req.team_id, req.user_id, req.role);
  end if;
  perform private.audit(
    org, 'join_request.' || new_status, 'team_join_request', req.id,
    jsonb_build_object('team_id', req.team_id, 'role', req.role)
  );
  return new_status;
end;
$$;

-- Revoga um codigo: quem gerou ou admin. Quem ja entrou continua.
create function public.revoke_team_invite(p_invite uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := (select auth.uid());
  inv public.team_invites%rowtype;
  org uuid;
begin
  if uid is null then
    raise exception 'not authenticated' using errcode = 'insufficient_privilege';
  end if;
  select * into inv from public.team_invites i where i.id = p_invite for update;
  if not found then
    raise exception 'invite not found' using errcode = 'insufficient_privilege';
  end if;
  org := private.org_of_team(inv.team_id);
  if inv.created_by is distinct from uid and not private.has_org_role(org, array['owner', 'admin']) then
    raise exception 'not allowed to revoke this invite' using errcode = 'insufficient_privilege';
  end if;
  update public.team_invites set revoked_at = coalesce(revoked_at, now()) where id = inv.id;
  perform private.audit(org, 'invite.revoked', 'team_invite', inv.id, jsonb_build_object('team_id', inv.team_id));
end;
$$;

-- RLS: tudo e escrito pelas funcoes acima; o cliente so le.
alter table public.team_invites enable row level security;
alter table public.team_join_requests enable row level security;
alter table public.invite_attempts enable row level security;

-- Admin ve todos; quem gerou ve o seu; gestor e tecnico veem os codigos de jogador do time.
create policy team_invites_read on public.team_invites
  for select to authenticated
  using (
    (select private.has_org_role(private.org_of_team(team_id), array['owner', 'admin']))
    or created_by = (select auth.uid())
    or (role = 'player' and (select private.can_invite_players(team_id)))
  );

-- A pessoa ve o proprio pedido; admin ve todos; gestor e tecnico veem os pedidos de jogador do time.
create policy team_join_requests_read on public.team_join_requests
  for select to authenticated
  using (
    user_id = (select auth.uid())
    or (select private.has_org_role(private.org_of_team(team_id), array['owner', 'admin']))
    or (role = 'player' and (select private.can_invite_players(team_id)))
  );

-- O hash do codigo nunca sai do banco: leitura por colunas, sem code_hash.
revoke all on public.team_invites, public.team_join_requests, public.invite_attempts from anon, authenticated;
grant select (id, team_id, role, created_by, created_at, expires_at, max_uses, used_count, requires_approval, revoked_at)
  on public.team_invites to authenticated;
grant select on public.team_join_requests to authenticated;

revoke all on all functions in schema private from public, anon;
grant execute on all functions in schema private to authenticated;
revoke all on function
  public.create_team_invite(uuid, text, integer, integer, boolean),
  public.redeem_team_invite(text),
  public.decide_join_request(uuid, boolean),
  public.revoke_team_invite(uuid)
  from public, anon;
grant execute on function
  public.create_team_invite(uuid, text, integer, integer, boolean),
  public.redeem_team_invite(text),
  public.decide_join_request(uuid, boolean),
  public.revoke_team_invite(uuid)
  to authenticated;
