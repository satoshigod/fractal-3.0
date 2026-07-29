# CONTEXTO — Vive Fractal

> Archivo maestro de contexto. Es lo primero que se lee al empezar cada sesión y lo
> primero que se actualiza al terminar una fase. Si hay dos fuentes de verdad, **este
> archivo manda**. Un contexto que no se mantiene es peor que no tenerlo.

---

## Qué es y para quién

**Vive Fractal** es una plataforma de **inversión fraccionada en activos reales** en
Antioquia, Colombia: fincas, náutico y autos. Un inversionista compra *fracciones* de un
activo y recibe rendimientos proporcionales. Lenguaje de marca: *"co-propietario
fundador"*, *"monetiza tu propiedad"*.

- **Público:** dueños de fincas que quieren monetizar, e inversionistas que quieren
  entrar con ticket bajo a activos reales.
- **Sitio actual:** `vivefractal.com` — sitio estático (GitHub Pages), páginas
  `index / homes / origen / invest / nautico / cars / pyp / exchange`. Solo marketing y
  captación de leads; **sin backend**.

## Stack

| Pieza          | Tecnología                                        |
|----------------|---------------------------------------------------|
| Front público  | HTML/CSS/JS estático en GitHub Pages              |
| Front producto | HTML + JS de una sola página, sin build (Pages)   |
| Backend        | Supabase (Postgres + Auth + Storage)              |
| Cliente DB     | `@supabase/supabase-js@2` vía CDN                 |
| Analítica      | Google Analytics `G-FNYVWMH7V7`                   |

Sin paso de build a propósito: el hosting es estático, así que las interfaces de producto
son HTML de un archivo que corren tal cual en Pages. El único servicio externo es Supabase.

## IDs de infraestructura

- **Supabase — proyecto de Vive Fractal:** `pzlfzmpqwscimuxuoucq`
  (URL `https://pzlfzmpqwscimuxuoucq.supabase.co`). Esquema aplicado, RLS activo, sin
  avisos de seguridad. Región `us-east-1`. Antes se llamaba "satoshigod's Project".
- **NO usar el proyecto `ESCALA` (`avrjgcitrgziiweirzfe`).** Es otro producto, con datos
  reales. Mezclar los dos es crear dos fuentes de verdad en una sola base.
- Repo del sitio: `fractal-3.0` (GitHub Pages).
- Contacto: `info@vivefractal.com` · WhatsApp `+57 300 548 5019`.

## Estado actual

- [x] Sitio público con SEO, GA, botón de WhatsApp y calculadoras (leads).
- [x] **C0/C1 — cimientos:** esquema aplicado y verificado en vivo, RLS activo, seguridad
      endurecida (0 errores de linter). Fórmulas puras con tests que corren al migrar.
- [x] **C1 — infraestructura viva:** base `pzlfzmpqwscimuxuoucq` con las 8 tablas, funciones
      y políticas. Usuario **admin** real creado + un **inversionista demo**.
- [x] **C2 — producto central:** dos interfaces funcionales cableadas a la base.
- [x] **C3 — motor de dominio VERIFICADO contra datos reales:** flujo completo de compra
      (informar→comprometer→ejecutar→confirmar) ejercitado; la fracción nace solo al
      confirmar, la guarda rechaza confirmar antes de tiempo, la disponibilidad baja bien,
      y el reparto calcula correcto ($500.000 a 5 fracciones).
- [ ] **Deploy del front:** subir `app/*.html` al repo de VF (Vercel). No se puede hacer
      desde el entorno de Claude (sin credencial de GitHub). Alternativa: abrir los .html
      localmente en el navegador — hablan con Supabase por HTTPS y funcionan igual.
- [ ] Conectar los formularios del sitio público a la tabla `solicitudes`.

## Credenciales (NO van en el repo)

Hay un usuario admin y uno demo en Auth. Sus contraseñas se entregan por fuera del repo y
deben rotarse tras el primer ingreso (cambiar desde el panel de Supabase → Authentication).
Nunca escribir contraseñas ni llaves de servicio en archivos versionados.

## Decisión resuelta

Vive Fractal corre sobre **su propio** proyecto Supabase `pzlfzmpqwscimuxuoucq` (el que
estaba pausado, reactivado el 28-jul-2026), separado de ESCALA. El esquema estaba vacío
antes de aplicar, así que no hay mezcla de productos. El esquema ya está aplicado.

---

## El plan por capas (Parte 1 de la metodología, aterrizado)

| Capa | En Vive Fractal | Estado |
|------|-----------------|--------|
| **C0** Cimientos | Tokens de diseño, esquema versionado, funciones puras con test | Hecho (esquema) |
| **C1** Infraestructura | Supabase: Postgres, Auth, Storage, RLS | Diseñado; falta aplicar |
| **C2** Producto central | Panel inversionista + panel admin | Hecho (falta cablear) |
| **C3** Motores de dominio | Máquina de estados de transacciones, reparto de rendimientos | En `schema.sql` (RPC) |
| **C4** Confianza e identidad | Roles (inversionista/admin), estado KYC, RLS | Base puesta |
| **C5** Liquidez / arranque | Leads del sitio → `solicitudes` → conversión | Parcial |
| **C6** Inteligencia | Matching activo↔inversionista, valoración | No empezado |
| **C7** Comunidad | Referidos, ranking de co-propietarios | No empezado |
| **C8** Marketing | SEO + GA + WhatsApp (ya en el sitio) | Hecho |
| **C9** Monetización | Comisión por fracción / reparto | No empezado |
| **C10** Integraciones | Firma de contratos, facturación | No empezado |
| **C11** Campañas | Iniciativas puntuales de captación | No empezado |

**Regla de secuencia:** no optimizar escala ni monetizar antes de tener producto (C2) y
usuarios (C5). Hoy la prioridad es cablear C1 y llevar leads a inversionistas reales.

---

## Reglas que no se rompen

1. **Verificar antes de guardar, siempre por separado.** Construir → ver que pasa →
   recién ahí guardar. Nunca "construir-y-guardar-y-publicar" en un paso.
2. **Consultar el esquema, nunca asumirlo.** Antes de leer/escribir una tabla, mirar sus
   columnas y restricciones reales. Código y migración van juntos.
3. **Dinero: separar cada evento.** `informado → comprometido → ejecutado → confirmado`.
   El "recibido" (fracción asignada) **solo** ocurre en `confirmado`, no antes.
4. **Nunca silenciar errores en operaciones sensibles.** Leer la respuesta de Supabase y
   verificar el resultado antes de dar algo por hecho. Nada de `catch` vacío en dinero.
5. **No romper lo que ya funciona.** (Lección cara: en una sesión se dañaron las
   calculadoras y se borraron los `info@vivefractal.com`. Al tocar una página, verificar
   que sus controles y correos sigan vivos, y partir del archivo bueno.)
6. **Consistencia visible.** Un solo set de tokens, un solo nombre por cosa que ve el
   usuario. Identificadores internos pueden variar; etiquetas visibles no.
7. **Secretos:** la `anon key` de Supabase es pública por diseño (va protegida por RLS).
   Las llaves de servicio **nunca** se escriben en el repo.

## Convenciones que ya costaron errores

- Los **estados** viven como `CHECK` en la base **y** como valores exactos en el front. Si
  cambia uno, cambia el otro en el mismo commit.
- La **fórmula** (cálculo) se separa del **acceso a datos**: los cálculos delicados son
  funciones puras/`immutable` en SQL (`calc_monto_por_fraccion`) y tienen su test.
- Las fracciones **no** se insertan a mano: nacen del RPC `confirmar_transaccion`, que es
  el único punto donde una compra se vuelve tenencia real.
- Una pantalla no está lista hasta que se pueda **llegar** a ella y sus botones lleven a
  algo real.

## Tokens de diseño (heredados del sitio)

```
--bg:#0d0d0b   --panel:#15130f  --line:#2a2620
--gold:#b8935a --gold-l:#d4b07a --cream:#f5f0e8 --stone:#7a7468
--ok:#5a8a6a   --warn:#c9a24a   --err:#b56a5a
Display/números: 'Cormorant Garamond' (serif)
UI/datos:        'DM Sans' (sans)
```

---

*Documento vivo. Cada error nuevo que enseñe algo transferible se destila como regla; el
caso concreto queda en el registro de la sesión donde ocurrió.*
