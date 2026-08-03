-- ============================================================================
-- Fractal — esquema del MODELO REAL (C1)
-- Reemplaza el esquema genérico inicial (activos/fracciones/transacciones/reparto).
-- Basado en MODELO.md: perfiles reales, activos multi-vertical, slots A/B/WD,
-- calendario de días, puntos, reservas, cesiones/renta, mercado interno,
-- cotizaciones, solicitudes y mercado secundario.
-- ============================================================================

-- ---- Limpieza del esquema genérico anterior ----
drop function if exists public.confirmar_transaccion(uuid) cascade;
drop function if exists public.activos_disponibilidad() cascade;
drop function if exists public.calc_monto_por_fraccion(numeric,integer) cascade;
drop table if exists public.reparto_lineas cascade;
drop table if exists public.repartos cascade;
drop table if exists public.transacciones cascade;
drop table if exists public.fracciones cascade;
drop table if exists public.documentos cascade;
drop table if exists public.solicitudes cascade;
drop table if exists public.activos cascade;
drop table if exists public.perfiles cascade;

-- ============================ PERFILES / ROLES ============================
create table public.perfiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  nombre       text not null,
  email        text not null,
  telefono     text,
  rol          text not null default 'co_propietario'
                 check (rol in ('dueno','co_propietario','operador','asesor','admin','huesped')),
  -- persona/contexto comercial (no es acceso; es de dónde viene el usuario)
  perfil_origen  text check (perfil_origen in
                 ('deudas','deteriorada','capital','desapego','herederos','lote')),
  perfil_destino text check (perfil_destino in
                 ('comprador_ab','comprador_wd','trae_propiedad','trae_lote','inversion')),
  kyc_estado   text not null default 'pendiente'
                 check (kyc_estado in ('pendiente','en_revision','verificado','rechazado')),
  creado_en    timestamptz not null default now()
);

-- ============================ ACTIVOS (multi-vertical) ============================
create table public.activos (
  id           uuid primary key default gen_random_uuid(),
  nombre       text not null,
  vertical     text not null check (vertical in ('finca','embarcacion','auto','hibrido')),
  destino      text,                       -- Cauca Viejo, Cartagena, San Andrés, ...
  descripcion  text,
  valor_total  numeric(16,2) not null check (valor_total > 0),
  -- Origen: si el activo entró por incorporación de un dueño
  dueno_id     uuid references public.perfiles(id) on delete set null,
  remodelacion numeric(16,2) not null default 0,
  operador_id  uuid references public.perfiles(id) on delete set null,
  imagen_url   text,
  estado       text not null default 'borrador'
                 check (estado in ('borrador','en_origen','disponible','operando','cerrado')),
  creado_en    timestamptz not null default now()
);

-- ============================ FRACCIONES (los 8 slots) ============================
-- Finca: A1 A2 B1 B2 (weekend, 15.65%) · WD1..WD4 (weekday, 9.35%).
create table public.fracciones (
  id                uuid primary key default gen_random_uuid(),
  activo_id         uuid not null references public.activos(id) on delete cascade,
  slot              text not null,          -- A1/A2/B1/B2/WD1..WD4 (o socio_1.. en vehículos)
  tipo              text not null check (tipo in ('weekend','weekday','socio')),
  pct               numeric(6,4) not null check (pct > 0),   -- 0.1565 / 0.0935
  dias_anio         integer not null,
  precio            numeric(16,2) not null check (precio >= 0),
  costo_mensual     numeric(14,2) not null default 0,
  co_propietario_id uuid references public.perfiles(id) on delete set null,
  es_preferente     boolean not null default false,          -- dueño que trajo la propiedad
  estado            text not null default 'disponible'
                      check (estado in ('disponible','reservada','vendida')),
  creado_en         timestamptz not null default now(),
  unique (activo_id, slot)
);

-- ============================ CALENDARIO (días asignados) ============================
create table public.calendario_dias (
  id           uuid primary key default gen_random_uuid(),
  activo_id    uuid not null references public.activos(id) on delete cascade,
  fecha        date not null,
  slot         text not null,               -- slot dueño del día (A1.. / WD1..)
  es_weekend   boolean not null,            -- ab: universo A/B
  es_especial  boolean not null default false,  -- sp: festivo/temporada alta
  es_puente    boolean not null default false,  -- br
  semestre     smallint not null check (semestre in (1,2)),
  unique (activo_id, fecha)
);
create index on public.calendario_dias (activo_id, slot);

-- ============================ RESERVAS ============================
-- El co-propietario reserva sus días asignados (gasta puntos) o los cede al operador.
create table public.reservas (
  id                uuid primary key default gen_random_uuid(),
  activo_id         uuid not null references public.activos(id) on delete cascade,
  fecha             date not null,
  co_propietario_id uuid not null references public.perfiles(id) on delete cascade,
  estado            text not null default 'reservado'
                      check (estado in ('reservado','cedido','usado','liberado')),
  puntos_gastados   numeric(8,2) not null default 0,
  creada_en         timestamptz not null default now(),
  unique (activo_id, fecha)                 -- un día, una reserva
);

-- ============================ PUNTOS (libro de movimientos) ============================
-- No se acumulan entre años: se filtran por semestre/año. Saldo = suma de movimientos.
create table public.puntos_mov (
  id                uuid primary key default gen_random_uuid(),
  co_propietario_id uuid not null references public.perfiles(id) on delete cascade,
  activo_id         uuid not null references public.activos(id) on delete cascade,
  anio              smallint not null,
  semestre          smallint not null check (semestre in (1,2)),
  tipo              text not null check (tipo in
                      ('asignacion','reserva','cesion','intercambio','compra')),
  puntos            numeric(10,2) not null,  -- + asignación/cesión, − reserva/compra
  referencia        text,
  creado_en         timestamptz not null default now()
);
create index on public.puntos_mov (co_propietario_id, activo_id, anio, semestre);

-- ============================ MERCADO INTERNO DE DÍAS ============================
-- 4 tipos: extensión contigua · bloque completo · swap A↔B · swap WD↔WD.
create table public.intercambios_dias (
  id            uuid primary key default gen_random_uuid(),
  activo_id     uuid not null references public.activos(id) on delete cascade,
  tipo          text not null check (tipo in ('extension','bloque','swap_ab','swap_wd')),
  de_id         uuid references public.perfiles(id) on delete set null,  -- vendedor/origen
  a_id          uuid references public.perfiles(id) on delete set null,  -- comprador/destino
  dias          jsonb not null default '[]',   -- fechas involucradas
  puntos        numeric(10,2) not null default 0,
  efectivo      numeric(14,2) not null default 0,
  estado        text not null default 'propuesto'
                  check (estado in ('propuesto','aceptado','rechazado','registrado')),
  creado_en     timestamptz not null default now()
);

-- ============================ CESIÓN / RENTA (días al operador) ============================
create table public.rentas (
  id                 uuid primary key default gen_random_uuid(),
  activo_id          uuid not null references public.activos(id) on delete cascade,
  fecha              date not null,
  co_propietario_id  uuid not null references public.perfiles(id) on delete cascade,
  huesped_nombre     text,
  monto              numeric(14,2) not null check (monto >= 0),
  comision_operador  numeric(14,2) not null default 0,   -- ~15% OTAs
  ingreso_copropietario numeric(14,2) not null default 0,
  estado             text not null default 'reservada'
                       check (estado in ('reservada','confirmada','cancelada')),
  creada_en          timestamptz not null default now()
);

-- ============================ COTIZACIONES (leads de los cotizadores) ============================
create table public.cotizaciones (
  id         uuid primary key default gen_random_uuid(),
  tipo       text not null check (tipo in
               ('origen_ejemplo','origen_wizard','destino_compra','destino_propiedad',
                'destino_lote','vehiculo')),
  perfil_id  uuid references public.perfiles(id) on delete set null,  -- si autenticado
  nombre     text, email text, telefono text,                         -- si lead anónimo
  entradas   jsonb not null default '{}',   -- lo que ingresó el usuario
  resultado  jsonb not null default '{}',   -- lo que calculó el cotizador
  creada_en  timestamptz not null default now()
);

-- ============================ SOLICITUDES (leads por perfil/producto) ============================
create table public.solicitudes (
  id        uuid primary key default gen_random_uuid(),
  nombre    text not null,
  email     text, telefono text,
  producto  text check (producto in
              ('origen','destino','invest','nautico','cars','pyp','exchange')),
  perfil    text,                            -- persona declarada
  mensaje   text,
  origen    text,                            -- página / cotizador de procedencia
  estado    text not null default 'nueva'
              check (estado in ('nueva','contactada','descartada','convertida')),
  creada_en timestamptz not null default now()
);

-- ============================ MERCADO SECUNDARIO (reventa de fracciones) ============================
create table public.reventas (
  id           uuid primary key default gen_random_uuid(),
  fraccion_id  uuid not null references public.fracciones(id) on delete cascade,
  vendedor_id  uuid not null references public.perfiles(id) on delete cascade,
  precio       numeric(16,2) not null check (precio >= 0),
  comprador_id uuid references public.perfiles(id) on delete set null,
  estado       text not null default 'listada'
                 check (estado in ('listada','aprobacion_comunidad','vendida','retirada')),
  creada_en    timestamptz not null default now()
);
-- aprobación de la comunidad (8 familias): cada copropietario del activo vota
create table public.aprobaciones_comunidad (
  id           uuid primary key default gen_random_uuid(),
  reventa_id   uuid not null references public.reventas(id) on delete cascade,
  votante_id   uuid not null references public.perfiles(id) on delete cascade,
  aprobado     boolean not null,
  creado_en    timestamptz not null default now(),
  unique (reventa_id, votante_id)
);

-- ============================================================================
-- FÓRMULAS PURAS (immutable, testeables sin datos)
-- ============================================================================
-- Valor en puntos de una noche: FDS/especial = 1.68 · entre semana = 1.00
create or replace function public.fx_puntos_noche(es_weekend boolean)
returns numeric language sql immutable set search_path = '' as $$
  select case when es_weekend then 1.68 else 1.00 end;
$$;

-- Liquidación Origen: activo = valor + remodelación; menos remodelación, deudas,
-- honorarios (12% del activo) y el valor de la fracción conservada.
create or replace function public.fx_liquidacion_origen(
  valor numeric, remodelacion numeric, deudas numeric,
  fee_pct numeric default 0.12, valor_fraccion_conservada numeric default 0)
returns numeric language sql immutable set search_path = '' as $$
  select (valor + remodelacion)
       - remodelacion
       - deudas
       - (valor + remodelacion) * fee_pct
       - valor_fraccion_conservada;
$$;

-- ============================================================================
-- HELPERS de rol
-- ============================================================================
create or replace function public.es_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.perfiles where id = auth.uid() and rol = 'admin');
$$;
create or replace function public.es_operador()
returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.perfiles where id = auth.uid() and rol in ('operador','admin'));
$$;

-- Alta automática de perfil al registrarse
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.perfiles (id, nombre, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'nombre', split_part(new.email,'@',1)), new.email)
  on conflict (id) do nothing;
  return new;
end; $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();
revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- ============================================================================
-- RLS
-- ============================================================================
alter table public.perfiles              enable row level security;
alter table public.activos               enable row level security;
alter table public.fracciones            enable row level security;
alter table public.calendario_dias       enable row level security;
alter table public.reservas              enable row level security;
alter table public.puntos_mov            enable row level security;
alter table public.intercambios_dias     enable row level security;
alter table public.rentas                enable row level security;
alter table public.cotizaciones          enable row level security;
alter table public.solicitudes           enable row level security;
alter table public.reventas              enable row level security;
alter table public.aprobaciones_comunidad enable row level security;

-- perfiles: propio o admin
create policy perf_sel on public.perfiles for select using (id = auth.uid() or public.es_admin());
create policy perf_upd on public.perfiles for update using (id = auth.uid() or public.es_admin());

-- activos: publicados los ve cualquier autenticado; admin/operador escriben
create policy act_sel on public.activos for select using (estado <> 'borrador' or public.es_operador());
create policy act_all on public.activos for all using (public.es_operador()) with check (public.es_operador());

-- fracciones: dueño de la fracción, u operador/admin; escritura operador/admin
create policy fr_sel on public.fracciones for select
  using (co_propietario_id = auth.uid() or public.es_operador() or estado = 'disponible');
create policy fr_all on public.fracciones for all using (public.es_operador()) with check (public.es_operador());

-- calendario: visible a autenticados (para reservar); escribe operador/admin
create policy cal_sel on public.calendario_dias for select using (auth.uid() is not null);
create policy cal_all on public.calendario_dias for all using (public.es_operador()) with check (public.es_operador());

-- reservas: propias, u operador/admin; el co-propietario crea/gestiona las suyas
create policy res_sel on public.reservas for select using (co_propietario_id = auth.uid() or public.es_operador());
create policy res_ins on public.reservas for insert with check (co_propietario_id = auth.uid() or public.es_operador());
create policy res_upd on public.reservas for update using (co_propietario_id = auth.uid() or public.es_operador());

-- puntos: propios o admin
create policy pts_sel on public.puntos_mov for select using (co_propietario_id = auth.uid() or public.es_operador());
create policy pts_all on public.puntos_mov for all using (public.es_operador()) with check (public.es_operador());

-- intercambios: participante u operador/admin
create policy int_sel on public.intercambios_dias for select using (de_id = auth.uid() or a_id = auth.uid() or public.es_operador());
create policy int_ins on public.intercambios_dias for insert with check (de_id = auth.uid() or a_id = auth.uid() or public.es_operador());
create policy int_upd on public.intercambios_dias for update using (de_id = auth.uid() or a_id = auth.uid() or public.es_operador());

-- rentas: dueño de la fracción cedida u operador/admin
create policy rent_sel on public.rentas for select using (co_propietario_id = auth.uid() or public.es_operador());
create policy rent_all on public.rentas for all using (public.es_operador()) with check (public.es_operador());

-- cotizaciones: cualquiera crea (lead); dueño o admin leen
create policy cot_ins on public.cotizaciones for insert with check (true);
create policy cot_sel on public.cotizaciones for select using (perfil_id = auth.uid() or public.es_admin());

-- solicitudes: cualquiera crea (lead público); solo admin lee/gestiona
create policy sol_ins on public.solicitudes for insert with check (true);
create policy sol_sel on public.solicitudes for select using (public.es_admin());
create policy sol_upd on public.solicitudes for update using (public.es_admin()) with check (public.es_admin());

-- reventas: vendedor, comprador, u operador/admin; comunidad ve las que vota
create policy rev_sel on public.reventas for select using (vendedor_id = auth.uid() or comprador_id = auth.uid() or public.es_operador());
create policy rev_all on public.reventas for all using (vendedor_id = auth.uid() or public.es_operador()) with check (vendedor_id = auth.uid() or public.es_operador());

-- aprobaciones: el votante las suyas; operador/admin todas
create policy apr_sel on public.aprobaciones_comunidad for select using (votante_id = auth.uid() or public.es_operador());
create policy apr_ins on public.aprobaciones_comunidad for insert with check (votante_id = auth.uid());

-- ============================================================================
-- GRANTS
-- ============================================================================
revoke execute on function public.es_admin() from public;      grant execute on function public.es_admin() to authenticated, anon;
revoke execute on function public.es_operador() from public;   grant execute on function public.es_operador() to authenticated;

-- ============================================================================
-- TESTS de las fórmulas puras (corren al aplicar; si fallan, aborta)
-- ============================================================================
do $$
begin
  assert public.fx_puntos_noche(true)  = 1.68, 'noche FDS = 1.68 pts';
  assert public.fx_puntos_noche(false) = 1.00, 'noche entre semana = 1.00 pt';
  -- Liquidación: valor 800M, remod 50M, deudas 8M, fee 12%, sin conservar:
  -- (850) - 50 - 8 - 850*0.12 = 850 - 50 - 8 - 102 = 690M
  assert public.fx_liquidacion_origen(800000000, 50000000, 8000000) = 690000000, 'liquidación base';
  -- conservando una fracción de 125M: 690M - 125M = 565M
  assert public.fx_liquidacion_origen(800000000, 50000000, 8000000, 0.12, 125000000) = 565000000, 'liquidación conservando fracción';
end $$;
