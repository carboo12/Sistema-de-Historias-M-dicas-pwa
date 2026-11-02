begin;

create schema if not exists legacy;

create table legacy.import_batches (
  id uuid primary key default gen_random_uuid(),
  source_file text not null,
  source_hash text,
  status text not null default 'running'
    check (status in ('running', 'completed', 'failed')),
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  stats jsonb not null default '{}'::jsonb
);

create table legacy.raw_rows (
  id bigserial primary key,
  batch_id uuid not null references legacy.import_batches(id) on delete cascade,
  table_name text not null,
  row_number integer not null,
  data jsonb not null,
  imported_at timestamptz not null default now(),
  unique (batch_id, table_name, row_number)
);

create index raw_rows_table_idx
  on legacy.raw_rows (batch_id, table_name, id);

create index raw_rows_data_gin_idx
  on legacy.raw_rows using gin (data jsonb_path_ops);

create or replace function legacy.clean_text(p_text text)
returns text
language sql
immutable
as $$
  select nullif(btrim(regexp_replace(coalesce(p_text, ''), '[[:space:]]+', ' ', 'g')), '');
$$;

create or replace function legacy.clean_clinical(p_text text)
returns text
language sql
immutable
as $$
  select nullif(btrim(replace(coalesce(p_text, ''), E'\r\n', E'\n')), '');
$$;

create or replace function legacy.norm_code(p_text text)
returns text
language sql
immutable
as $$
  select nullif(upper(btrim(coalesce(p_text, ''))), '');
$$;

create or replace function legacy.norm_document(p_text text)
returns text
language sql
immutable
as $$
  select nullif(upper(regexp_replace(coalesce(p_text, ''), '[[:space:]]+', '', 'g')), '');
$$;

create or replace function legacy.anamnesis_code(p_tipo text, p_codigo text, p_idline text)
returns text
language sql
immutable
as $$
  select nullif(
    concat_ws(':', legacy.norm_code(p_tipo), legacy.norm_code(p_codigo), legacy.norm_code(p_idline)),
    ''
  );
$$;

create or replace function legacy.safe_numeric(p_text text)
returns numeric
language plpgsql
stable
as $$
declare
  v text;
begin
  v := btrim(coalesce(p_text, ''));
  if v = '' or v !~ '^-?[0-9]+([.][0-9]+)?$' then
    return null;
  end if;
  begin
    return v::numeric;
  exception when others then
    return null;
  end;
end;
$$;

create or replace function legacy.safe_date(p_text text)
returns date
language plpgsql
stable
as $$
declare
  v text;
begin
  v := btrim(coalesce(p_text, ''));
  if v = '' or v like '0000-00-00%' then
    return null;
  end if;
  if v ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' then
    begin
      return v::date;
    exception when others then
      return null;
    end;
  end if;
  if v ~ '^[0-9]{1,2}/[0-9]{1,2}/[0-9]{4}$' then
    begin
      return to_date(v, 'DD/MM/YYYY');
    exception when others then
      return null;
    end;
  end if;
  return null;
end;
$$;

create or replace function legacy.safe_time(p_text text)
returns time
language plpgsql
stable
as $$
declare
  v text;
begin
  v := regexp_replace(btrim(coalesce(p_text, '')), '[[:space:]]+', ' ', 'g');
  if v = '' then
    return null;
  end if;
  begin
    return to_timestamp(v, 'HH12:MI AM')::time;
  exception when others then
    null;
  end;
  begin
    return to_timestamp(v, 'HH24:MI:SS')::time;
  exception when others then
    null;
  end;
  begin
    return to_timestamp(v, 'HH24:MI')::time;
  exception when others then
    null;
  end;
  return null;
end;
$$;

create or replace function legacy.to_timestamptz(p_date date, p_time time, p_tz text)
returns timestamptz
language sql
stable
as $$
  select case
    when p_date is null then null
    when p_time is null then (p_date::timestamp at time zone coalesce(p_tz, 'America/Managua'))
    else ((p_date + p_time) at time zone coalesce(p_tz, 'America/Managua'))
  end;
$$;

create or replace function legacy.hash_key(variadic p_values text[])
returns text
language sql
immutable
as $$
  select md5(array_to_string(array(select coalesce(u.x, '') from unnest(p_values) as u(x)), '|'));
$$;

create or replace function legacy.map_sex(p_value text)
returns text
language sql
immutable
as $$
  select case
    when upper(btrim(coalesce(p_value, ''))) in ('1', 'M', 'MASCULINO') then 'M'
    when upper(btrim(coalesce(p_value, ''))) in ('2', 'F', 'FEMENINO') then 'F'
    when upper(btrim(coalesce(p_value, ''))) in ('X', 'OTRO') then 'X'
    else 'U'
  end;
$$;

create or replace function legacy.map_country(p_value text)
returns text
language sql
immutable
as $$
  select case upper(btrim(coalesce(p_value, '')))
    when 'NICARAGUA' then 'Nicaragua'
    when 'PANAMA' then 'Panamá'
    when 'PANAMÁ' then 'Panamá'
    when 'COLOMBIA' then 'Colombia'
    when 'EL SALVADOR' then 'El Salvador'
    when 'ESTADOS UNIDOS' then 'Estados Unidos'
    when 'USA' then 'Estados Unidos'
    when 'MEXICO' then 'México'
    when 'MÉXICO' then 'México'
    when 'COSTA RICA' then 'Costa Rica'
    when 'HONDURAS' then 'Honduras'
    when 'GUATEMALA' then 'Guatemala'
    when 'VENEZUELA' then 'Venezuela'
    when 'REPUBLICA DOMINICANA' then 'República Dominicana'
    when 'REPÚBLICA DOMINICANA' then 'República Dominicana'
    when 'ECUADOR' then 'Ecuador'
    when 'PERU' then 'Perú'
    when 'PERÚ' then 'Perú'
    when 'BOLIVIA' then 'Bolivia'
    when 'CHILE' then 'Chile'
    when 'ARGENTINA' then 'Argentina'
    when 'BRASIL' then 'Brasil'
    when 'CANADA' then 'Canadá'
    when 'CANADÁ' then 'Canadá'
    when 'ESPANA' then 'España'
    when 'ESPAÑA' then 'España'
    else null
  end;
$$;

create or replace function legacy.map_marital_status(p_value text)
returns text
language sql
immutable
as $$
  select case btrim(coalesce(p_value, ''))
    when '1' then 'soltero'
    when '2' then 'casado'
    when '3' then 'union_libre'
    when '4' then 'divorciado'
    when '5' then 'viudo'
    else 'desconocido'
  end;
$$;

create or replace function legacy.map_appointment_status(p_value text)
returns text
language sql
immutable
as $$
  select case btrim(coalesce(p_value, ''))
    when '1' then 'atendida'
    when '2' then 'cancelada'
    when '3' then 'no_asistio'
    when '4' then 'reprogramada'
    when '5' then 'programada'
    else 'programada'
  end;
$$;

create or replace function legacy.map_consultation_status(p_value text)
returns text
language sql
immutable
as $$
  select case btrim(coalesce(p_value, ''))
    when '0' then 'borrador'
    when '1' then 'firmada'
    else 'firmada'
  end;
$$;

create or replace function legacy.is_pseudo_history(p_code text)
returns boolean
language sql
immutable
as $$
  select coalesce(btrim(p_code), '') in ('', '0', '00', '000');
$$;

create or replace function legacy.currency_code(p_text text)
returns char(3)
language sql
immutable
as $$
  select case upper(btrim(coalesce(p_text, '')))
    when 'USD' then 'USD'::char(3)
    when 'US$' then 'USD'::char(3)
    when 'C$' then 'NIO'::char(3)
    when 'NIO' then 'NIO'::char(3)
    when 'PAB' then 'PAB'::char(3)
    when 'COP' then 'COP'::char(3)
    when 'VES' then 'VES'::char(3)
    when 'BS' then 'VES'::char(3)
    when 'BS.' then 'VES'::char(3)
    else 'NIO'::char(3)
  end;
$$;

commit;
