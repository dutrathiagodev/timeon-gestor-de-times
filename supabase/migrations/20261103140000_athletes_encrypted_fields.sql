-- 00038 · telefone e data de nascimento cifrados no servidor, como o CPF.
--
-- O banco passa a guardar so o texto cifrado (AES-256-GCM, src/lib/field-crypto.ts) do
-- telefone e da data de nascimento completa. Da data fica em claro apenas o ANO
-- (athletes.birth_year), que basta para a faixa etaria das subs: a data completa so sai por
-- read_athlete_private, que audita a leitura. Nome e sexo seguem em claro porque a
-- comissao precisa deles para montar o elenco e os avisos de categoria; o RLS os protege.
-- Nada disto foi aplicado em producao: ainda nao ha dados a migrar.

-- Ano de nascimento em claro; a data completa vai para athlete_private.
alter table public.athletes add column birth_year smallint;
update public.athletes set birth_year = extract(year from birth_date)::smallint;
alter table public.athletes
  alter column birth_year set not null,
  add constraint athletes_birth_year_check check (birth_year between 1900 and 2100);
alter table public.athletes drop column birth_date;

-- athlete_private passa a ter varios campos cifrados, cada um opcional e gravado separado.
alter table public.athlete_private
  drop column key_version,   -- o primeiro byte de cada texto cifrado ja e a versao da chave
  drop column phone,
  alter column cpf_ciphertext drop not null,
  alter column cpf_blind_index drop not null,
  add column phone_ciphertext bytea,
  add column birth_date_ciphertext bytea,
  -- Tamanhos fixos (versao 1 + IV 12 + tag 16 + valor): barram valor em claro, que e menor.
  add constraint athlete_private_phone_len check (phone_ciphertext is null or octet_length(phone_ciphertext) between 39 and 42),
  add constraint athlete_private_birth_len check (birth_date_ciphertext is null or octet_length(birth_date_ciphertext) = 39),
  add constraint athlete_private_cpf_pair check ((cpf_ciphertext is null) = (cpf_blind_index is null));

drop function public.register_my_athlete(uuid, text, text, text, date);
drop function public.register_athlete(uuid, text, text, text, date);
drop function public.correct_athlete_identity(uuid, text, date);
drop function public.set_athlete_private(uuid, bytea, bytea, smallint, text);
drop function public.read_athlete_private(uuid);
drop function private.valid_birth(date);

create function private.valid_birth_year(birth_year smallint)
returns boolean
language sql
stable
set search_path = ''
as $$ select birth_year is not null and birth_year between 1900 and extract(year from current_date)::int; $$;

-- A propria pessoa se inscreve (depois de entrar por codigo). O servidor ja validou a data,
-- tirou o ano e cifrou a data completa; sexo e ano ficam gravados aqui e depois so admin ou
-- gestor corrigem.
create function public.register_my_athlete(
  p_organization uuid,
  p_full_name text,
  p_nickname text,
  p_sex text,
  p_birth_year smallint,
  p_birth_date_ciphertext bytea
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := (select auth.uid());
  new_id uuid;
begin
  if uid is null or not private.has_org_access(p_organization) then
    raise exception 'no access to this organization' using errcode = 'insufficient_privilege';
  end if;
  if not private.valid_birth_year(p_birth_year) or p_birth_date_ciphertext is null then
    raise exception 'invalid birth data' using errcode = 'invalid_parameter_value';
  end if;

  insert into public.athletes (organization_id, user_id, created_by, full_name, nickname, sex, birth_year)
  values (p_organization, uid, uid, btrim(p_full_name), nullif(btrim(p_nickname), ''), p_sex, p_birth_year)
  returning id into new_id;
  insert into public.athlete_private (athlete_id, organization_id, birth_date_ciphertext)
  values (new_id, p_organization, p_birth_date_ciphertext);

  -- Entra no elenco de cada time em que ja tem acesso de jogador.
  insert into public.team_members (team_id, athlete_id)
  select p.team_id, new_id
  from public.team_players p
  join public.teams t on t.id = p.team_id
  where p.user_id = uid and t.organization_id = p_organization
  on conflict (team_id, athlete_id) do nothing;

  perform private.audit(p_organization, 'athlete.registered', 'athlete', new_id, '{"by":"self"}'::jsonb);
  return new_id;
end;
$$;

-- Admin ou gestor cadastra quem ainda nao tem conta.
create function public.register_athlete(
  p_organization uuid,
  p_full_name text,
  p_nickname text,
  p_sex text,
  p_birth_year smallint,
  p_birth_date_ciphertext bytea
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_id uuid;
begin
  if (select auth.uid()) is null or not private.is_org_manager(p_organization) then
    raise exception 'only admin or manager can register athletes' using errcode = 'insufficient_privilege';
  end if;
  if not private.valid_birth_year(p_birth_year) or p_birth_date_ciphertext is null then
    raise exception 'invalid birth data' using errcode = 'invalid_parameter_value';
  end if;
  insert into public.athletes (organization_id, created_by, full_name, nickname, sex, birth_year)
  values (p_organization, (select auth.uid()), btrim(p_full_name), nullif(btrim(p_nickname), ''), p_sex, p_birth_year)
  returning id into new_id;
  insert into public.athlete_private (athlete_id, organization_id, birth_date_ciphertext)
  values (new_id, p_organization, p_birth_date_ciphertext);
  perform private.audit(p_organization, 'athlete.registered', 'athlete', new_id, '{"by":"staff"}'::jsonb);
  return new_id;
end;
$$;

-- Sexo e nascimento: so admin ou gestor corrigem (a pessoa nao muda depois de inscrita).
create function public.correct_athlete_identity(
  p_athlete uuid,
  p_sex text,
  p_birth_year smallint,
  p_birth_date_ciphertext bytea
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  org uuid;
begin
  select a.organization_id into org from public.athletes a where a.id = p_athlete;
  if org is null or not private.is_athlete_manager(p_athlete) then
    raise exception 'only admin or manager can correct identity data' using errcode = 'insufficient_privilege';
  end if;
  if not private.valid_birth_year(p_birth_year) or p_birth_date_ciphertext is null then
    raise exception 'invalid birth data' using errcode = 'invalid_parameter_value';
  end if;
  update public.athletes set sex = p_sex, birth_year = p_birth_year where id = p_athlete;
  insert into public.athlete_private (athlete_id, organization_id, birth_date_ciphertext)
  values (p_athlete, org, p_birth_date_ciphertext)
  on conflict (athlete_id) do update set birth_date_ciphertext = excluded.birth_date_ciphertext, updated_at = now();
  perform private.audit(org, 'athlete.identity_corrected', 'athlete', p_athlete, '{"fields":["sex","birth_date"]}'::jsonb);
end;
$$;

-- CPF e telefone: o servidor cifra e calcula o indice cego; o banco guarda e audita.
-- Parametro nulo = "nao mexer". O CPF e o indice cego vem juntos ou nenhum dos dois.
create function public.set_athlete_private(
  p_athlete uuid,
  p_cpf_ciphertext bytea default null,
  p_cpf_blind_index bytea default null,
  p_phone_ciphertext bytea default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  org uuid;
  changed jsonb := '[]'::jsonb;
begin
  select a.organization_id into org from public.athletes a where a.id = p_athlete;
  if org is null or not private.can_access_athlete_private(p_athlete) then
    raise exception 'not allowed' using errcode = 'insufficient_privilege';
  end if;
  if (p_cpf_ciphertext is null) <> (p_cpf_blind_index is null) then
    raise exception 'cpf ciphertext and blind index must come together' using errcode = 'invalid_parameter_value';
  end if;
  if p_cpf_ciphertext is null and p_phone_ciphertext is null then
    raise exception 'nothing to set' using errcode = 'invalid_parameter_value';
  end if;

  insert into public.athlete_private (athlete_id, organization_id, cpf_ciphertext, cpf_blind_index, phone_ciphertext)
  values (p_athlete, org, p_cpf_ciphertext, p_cpf_blind_index, p_phone_ciphertext)
  on conflict (athlete_id) do update set
    cpf_ciphertext = coalesce(excluded.cpf_ciphertext, public.athlete_private.cpf_ciphertext),
    cpf_blind_index = coalesce(excluded.cpf_blind_index, public.athlete_private.cpf_blind_index),
    phone_ciphertext = coalesce(excluded.phone_ciphertext, public.athlete_private.phone_ciphertext),
    updated_at = now();
  update public.athletes a set cpf_registered = exists (
    select 1 from public.athlete_private p where p.athlete_id = a.id and p.cpf_ciphertext is not null
  ) where a.id = p_athlete;

  if p_cpf_ciphertext is not null then changed := changed || '"cpf"'::jsonb; end if;
  if p_phone_ciphertext is not null then changed := changed || '"phone"'::jsonb; end if;
  perform private.audit(org, 'athlete_private.set', 'athlete', p_athlete, jsonb_build_object('fields', changed));
end;
$$;

-- Leitura: confere o papel e grava a leitura na MESMA transacao, antes de devolver.
-- Devolve so texto cifrado; quem decifra e o servidor.
create function public.read_athlete_private(p_athlete uuid)
returns table (cpf_ciphertext bytea, phone_ciphertext bytea, birth_date_ciphertext bytea)
language plpgsql
security definer
set search_path = ''
as $$
declare
  org uuid;
begin
  select a.organization_id into org from public.athletes a where a.id = p_athlete;
  if org is null or not private.can_access_athlete_private(p_athlete) then
    raise exception 'not allowed' using errcode = 'insufficient_privilege';
  end if;
  perform private.audit(org, 'athlete_private.read', 'athlete', p_athlete, '{}'::jsonb);
  return query
    select p.cpf_ciphertext, p.phone_ciphertext, p.birth_date_ciphertext
    from public.athlete_private p where p.athlete_id = p_athlete;
end;
$$;

revoke all on all functions in schema private from public, anon;
grant execute on all functions in schema private to authenticated;
revoke all on function
  public.register_my_athlete(uuid, text, text, text, smallint, bytea),
  public.register_athlete(uuid, text, text, text, smallint, bytea),
  public.correct_athlete_identity(uuid, text, smallint, bytea),
  public.set_athlete_private(uuid, bytea, bytea, bytea),
  public.read_athlete_private(uuid)
  from public, anon;
grant execute on function
  public.register_my_athlete(uuid, text, text, text, smallint, bytea),
  public.register_athlete(uuid, text, text, text, smallint, bytea),
  public.correct_athlete_identity(uuid, text, smallint, bytea),
  public.set_athlete_private(uuid, bytea, bytea, bytea),
  public.read_athlete_private(uuid)
  to authenticated;
