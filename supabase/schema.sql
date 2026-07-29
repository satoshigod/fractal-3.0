-- ============================================================================
-- Vive Fractal — esquema base (C1)
-- Plataforma de inversión fraccionada en activos reales.
--
-- Migración versionada. Se aplica UNA vez sobre el proyecto Supabase de Vive Fractal
-- (NO sobre ESCALA). Aplicar valida esta SQL contra Postgres real: "que compile no es
-- que funcione". Hasta aplicarla, este archivo es el diseño, no el estado.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- PERFILES  — extiende auth.users con rol y estado KYC
-- ---------------------------------------------------------------------------
create table if not exists public.perfiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  nombre      text not null,
  email       text not null,
  telefono    text,
  rol         text not null default 'inversionista'
                check (rol in ('inversionista','admin')),
  kyc_estado  text not null default 'pendiente'
                check (kyc_estado in ('pendiente','en_revision','verificado','rechazado')),
  creado_en   timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- ACTIVOS  — las fincas / botes / autos que se fraccionan
-- ---------------------------------------------------------------------------
create table if not exists public.activos (
  id                  uuid primary key default gen_random_uuid(),
  nombre              text not null,
  vertical            text not null check (vertical in ('finca','nautico','auto','otro')),
  ubicacion           text,
  descripcion         text,
  valor_total         numeric(14,2) not null check (valor_total > 0),
  fracciones_totales  integer       not null check (fracciones_totales > 0),
  precio_fraccion     numeric(14,2) not null check (precio_fraccion > 0),
  imagen_url          text,
  estado              text not null default 'borrador'
                        check (estado in ('borrador','disponible','fondeado','cerrado')),
  creado_en           timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- FRACCIONES  — tenencia CONFIRMADA. No se insertan a mano: nacen del RPC
-- confirmar_transaccion(). Una fracción existe = el dinero se recibió.
-- ---------------------------------------------------------------------------
create table if not exists public.fracciones (
  id                uuid primary key default gen_random_uuid(),
  activo_id         uuid not null references public.activos(id) on delete restrict,
  inversionista_id  uuid not null references public.perfiles(id) on delete restrict,
  cantidad          integer not null check (cantidad > 0),
  precio_compra     numeric(14,2) not null check (precio_compra >= 0),
  adquirida_en      timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- TRANSACCIONES  — máquina de estados del flujo de dinero.
-- informado -> comprometido -> ejecutado -> confirmado   (o -> cancelado)
-- Cada evento es distinto: informar NO es ejecutar; el recibido es el final.
-- ---------------------------------------------------------------------------
create table if not exists public.transacciones (
  id                uuid primary key default gen_random_uuid(),
  activo_id         uuid not null references public.activos(id) on delete restrict,
  inversionista_id  uuid not null references public.perfiles(id) on delete restrict,
  tipo              text not null default 'compra' check (tipo in ('compra','venta')),
  cantidad          integer not null check (cantidad > 0),
  monto             numeric(14,2) not null check (monto >= 0),
  estado            text not null default 'informado'
                      check (estado in ('informado','comprometido','ejecutado','confirmado','cancelado')),
  nota              text,
  creada_en         timestamptz not null default now(),
  actualizada_en    timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- REPARTOS  — distribución de rendimientos por periodo
-- ---------------------------------------------------------------------------
create table if not exists public.repartos (
  id                  uuid primary key default gen_random_uuid(),
  activo_id           uuid not null references public.activos(id) on delete restrict,
  periodo             text not null,                 -- ej '2026-Q1'
  monto_total         numeric(14,2) not null check (monto_total >= 0),
  monto_por_fraccion  numeric(14,4) not null check (monto_por_fraccion >= 0),
  estado              text not null default 'informado' check (estado in ('informado','confirmado')),
  creado_en           timestamptz not null default now()
);

create table if not exists public.reparto_lineas (
  id                uuid primary key default gen_random_uuid(),
  reparto_id        uuid not null references public.repartos(id) on delete cascade,
  inversionista_id  uuid not null references public.perfiles(id) on delete restrict,
  fracciones        integer not null check (fracciones >= 0),
  monto             numeric(14,2) not null check (monto >= 0)
);

-- ---------------------------------------------------------------------------
-- SOLICITUDES  — leads del sitio público (calculadoras / formularios).
-- Insertables por anónimos; solo admin las lee.
-- ---------------------------------------------------------------------------
create table if not exists public.solicitudes (
  id         uuid primary key default gen_random_uuid(),
  nombre     text not null,
  email      text,
  telefono   text,
  vertical   text check (vertical in ('finca','nautico','auto','otro')),
  mensaje    text,
  origen     text,
  estado     text not null default 'nueva'
               check (estado in ('nueva','contactada','descartada','convertida')),
  creada_en  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- DOCUMENTOS  — KYC / contratos por inversionista
-- ---------------------------------------------------------------------------
create table if not exists public.documentos (
  id                uuid primary key default gen_random_uuid(),
  inversionista_id  uuid not null references public.perfiles(id) on delete cascade,
  tipo              text not null check (tipo in ('cedula','contrato','otro')),
  archivo_url       text not null,
  creado_en         timestamptz not null default now()
);

-- ============================================================================
-- FÓRMULAS PURAS  — separadas del acceso a datos. Solo dependen de sus entradas,
-- son immutable y por eso testeables sin tocar la base (ver tests abajo).
-- ============================================================================
create or replace function public.calc_monto_por_fraccion(
  monto_total numeric, fracciones_totales integer
) returns numeric language sql immutable set search_path = '' as $$
  select case when fracciones_totales > 0
              then round(monto_total / fracciones_totales, 4)
              else 0 end;
$$;

-- Helper de rol (usado por RLS y por el motor de dominio de abajo).
create or replace function public.es_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.perfiles where id = auth.uid() and rol = 'admin');
$$;

-- ============================================================================
-- MOTOR DE DOMINIO  — el único punto donde una compra se vuelve tenencia real.
-- Atómico: cambia el estado Y crea la fracción en una sola transacción. Nunca
-- silencia errores: si el estado previo no es 'ejecutado', aborta.
-- ============================================================================
create or replace function public.confirmar_transaccion(tx_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare tx public.transacciones;
begin
  if not public.es_admin() then
    raise exception 'no autorizado';
  end if;
  select * into tx from public.transacciones where id = tx_id for update;
  if not found then
    raise exception 'transacción no existe';
  end if;
  if tx.estado <> 'ejecutado' then
    raise exception 'solo se confirma una transacción ejecutada (estado actual: %)', tx.estado;
  end if;
  update public.transacciones set estado = 'confirmado', actualizada_en = now()
    where id = tx_id;
  insert into public.fracciones (activo_id, inversionista_id, cantidad, precio_compra)
    values (tx.activo_id, tx.inversionista_id, tx.cantidad, tx.monto);
end;
$$;

-- ---------------------------------------------------------------------------
-- Alta automática de perfil al registrarse
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.perfiles (id, nombre, email)
  values (new.id,
          coalesce(new.raw_user_meta_data->>'nombre', split_part(new.email,'@',1)),
          new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Disponibilidad (fracciones libres por activo). Función SECURITY DEFINER que
-- expone SOLO agregados no sensibles y cuenta entre todos los inversionistas
-- (una vista definer disparaba un lint ERROR). El front la llama por RPC:
-- sb.rpc('activos_disponibilidad').
-- ---------------------------------------------------------------------------
create or replace function public.activos_disponibilidad()
returns table(id uuid, fracciones_totales integer, fracciones_vendidas bigint, fracciones_disponibles bigint)
language sql stable security definer set search_path = public as $$
  select a.id, a.fracciones_totales,
         coalesce(sum(f.cantidad),0)::bigint,
         (a.fracciones_totales - coalesce(sum(f.cantidad),0))::bigint
  from public.activos a
  left join public.fracciones f on f.activo_id = a.id
  group by a.id;
$$;

-- ============================================================================
-- RLS  — todo el acceso pasa por políticas. La anon key es pública; esto la protege.
-- ============================================================================
alter table public.perfiles       enable row level security;
alter table public.activos        enable row level security;
alter table public.fracciones     enable row level security;
alter table public.transacciones  enable row level security;
alter table public.repartos       enable row level security;
alter table public.reparto_lineas enable row level security;
alter table public.solicitudes    enable row level security;
alter table public.documentos     enable row level security;

-- perfiles: cada quien el suyo; admin todos.
create policy perfiles_sel on public.perfiles for select
  using (id = auth.uid() or public.es_admin());
create policy perfiles_upd on public.perfiles for update
  using (id = auth.uid() or public.es_admin());

-- activos: publicados los ve cualquier autenticado; admin ve todo y escribe.
create policy activos_sel on public.activos for select
  using (estado <> 'borrador' or public.es_admin());
create policy activos_all on public.activos for all
  using (public.es_admin()) with check (public.es_admin());

-- fracciones: el dueño las suyas; admin todas y escribe.
create policy fracciones_sel on public.fracciones for select
  using (inversionista_id = auth.uid() or public.es_admin());
create policy fracciones_all on public.fracciones for all
  using (public.es_admin()) with check (public.es_admin());

-- transacciones: el inversionista ve/crea las suyas (arranca en informado/comprometido);
-- admin ve todas y actualiza el estado.
create policy tx_sel on public.transacciones for select
  using (inversionista_id = auth.uid() or public.es_admin());
create policy tx_ins on public.transacciones for insert
  with check (inversionista_id = auth.uid()
              and estado in ('informado','comprometido'));
create policy tx_upd on public.transacciones for update
  using (public.es_admin()) with check (public.es_admin());

-- repartos y sus líneas: el inversionista ve lo suyo; admin todo.
create policy repartos_sel on public.repartos for select using (true);
create policy repartos_all on public.repartos for all
  using (public.es_admin()) with check (public.es_admin());
create policy rlineas_sel on public.reparto_lineas for select
  using (inversionista_id = auth.uid() or public.es_admin());
create policy rlineas_all on public.reparto_lineas for all
  using (public.es_admin()) with check (public.es_admin());

-- solicitudes: cualquiera (anónimo) inserta un lead; solo admin lee/gestiona.
create policy sol_ins on public.solicitudes for insert with check (true);
create policy sol_sel on public.solicitudes for select using (public.es_admin());
create policy sol_upd on public.solicitudes for update
  using (public.es_admin()) with check (public.es_admin());

-- documentos: el dueño los suyos; admin todos.
create policy doc_sel on public.documentos for select
  using (inversionista_id = auth.uid() or public.es_admin());
create policy doc_all on public.documentos for all
  using (public.es_admin()) with check (public.es_admin());

-- ============================================================================
-- GRANTS de ejecución — cerrar el RPC a quien no corresponde.
-- ============================================================================
revoke execute on function public.handle_new_user()            from public, anon, authenticated;
revoke execute on function public.confirmar_transaccion(uuid)   from public, anon;
grant  execute on function public.confirmar_transaccion(uuid)   to authenticated;
revoke execute on function public.activos_disponibilidad()      from public, anon;
grant  execute on function public.activos_disponibilidad()      to authenticated;
-- es_admin() se deja ejecutable (anon + authenticated): lo usa RLS, y solo revela
-- si el que llama es admin.

-- ============================================================================
-- TESTS de la fórmula pura  (red de seguridad barata, sin datos).
-- Corren al aplicar la migración; si algo falla, la migración aborta.
-- ============================================================================
do $$
begin
  assert public.calc_monto_por_fraccion(1000, 4)  = 250,    'reparto simple';
  assert public.calc_monto_por_fraccion(100, 3)   = 33.3333,'redondeo a 4 decimales';
  assert public.calc_monto_por_fraccion(500, 0)   = 0,      'guarda división por cero';
  assert public.calc_monto_por_fraccion(0, 10)    = 0,      'monto cero';
end $$;
