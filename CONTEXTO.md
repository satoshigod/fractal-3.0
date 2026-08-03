# CONTEXTO — Vive Fractal

> Archivo maestro de contexto. Es lo primero que se lee al empezar cada sesión y lo
> primero que se actualiza al terminar una fase. Si hay dos fuentes de verdad, **este
> archivo manda**. Un contexto que no se mantiene es peor que no tenerlo.

**Documentos del proyecto:**
- `CONTEXTO.md` (este) — infra, proceso, reglas y lecciones. Manda para cómo se trabaja.
- `MODELO.md` — el dominio real de Fractal (perfiles, calendario, puntos, cotizadores).
  Manda para qué es el negocio.
- `app/desarrollo.html` — plan de desarrollo por capas (C0–C11) con estado. Manda para el
  orden de construcción.
- `supabase/schema.sql` — esquema versionado (se está rehaciendo para el modelo real).

---

## Qué es y para quién

**Fractal** (vivefractal.com) es un **ecosistema de copropiedad fraccionada de activos de
lujo** en Colombia: fincas, embarcaciones, autos premium y vehículos híbridos. No es
inversión fraccionada genérica: es **propiedad real + acceso por calendario + renta de
días no usados**, con economía de **puntos** y un **operador**. El usuario central es el
**co-propietario** (no "inversionista").

> **El modelo completo del dominio vive en `MODELO.md`** — leído del sitio real (Origen y
> Destino íntegros, calendario, puntos, mercado interno, cotizadores, perfiles). Es la
> fuente de verdad del negocio; este archivo (CONTEXTO) manda para infra/proceso.

- **Dos lados:** **Origen** (la oferta — de aquí salen las propiedades: dueños, herederos,
  lotes) y **Destino** (demanda y operación — donde se optimizan y operan las casas).
- **Sitio actual:** `vivefractal.com` — estático, páginas `index / origen / homes(=Destino)
  / invest / nautico / cars / pyp / exchange`. **Ojo:** las estáticas ya traen **toda** la
  info y los **cotizadores** (2 en Origen, 3 en Destino) — todo eso debe construirse dentro
  de la app. Hoy: solo marketing y captación de leads, sin backend transaccional.

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

- [x] Sitio público con SEO, GA, WhatsApp y cotizadores (leads).
- [x] **Infraestructura viva (C1):** Supabase `pzlfzmpqwscimuxuoucq` con Auth, RLS y
      seguridad endurecida (0 errores de linter). Verificado en vivo.
- [x] **MODELO.md** — dominio real leído y documentado (perfiles, calendario, puntos,
      mercado interno, cotizadores). Fuente de verdad del negocio.
- [x] **Plan por capas** — `app/desarrollo.html` (C0–C11 mapeadas a las funciones reales).
- [⚠] **Primer intento de app (2 paneles genéricos + esquema activos/fracciones/
      transacciones/reparto):** era una **sombra genérica** del modelo real — se hizo
      asumiendo, antes de leer el sitio. **Se reconstruye** sobre MODELO.md. No es el
      producto; sirvió para levantar y verificar la infra.
- [ ] **C1 (rehacer):** esquema del modelo real (activos multi-vertical, slots A/B/WD,
      calendario, puntos, reservas, cesiones, cotizaciones) reemplaza al genérico.
- [ ] **C2:** calendario transaccional + cotizadores (Origen y Destino) + paneles por perfil.
- [ ] **Deploy:** `app/*.html` viven en el repo `fractal-3.0` (Vercel los sirve). El push
      se hace vía token de GitHub cuando el usuario lo provee; no hay credencial persistente
      en el entorno.
- [ ] Conectar cotizadores/formularios del sitio a `solicitudes` (por perfil).

## Credenciales (NO van en el repo)

Hay un usuario admin y uno demo en Auth. Sus contraseñas se entregan por fuera del repo y
deben rotarse tras el primer ingreso (cambiar desde el panel de Supabase → Authentication).
Nunca escribir contraseñas ni llaves de servicio en archivos versionados.

## Decisión resuelta

Vive Fractal corre sobre **su propio** proyecto Supabase `pzlfzmpqwscimuxuoucq` (el que
estaba pausado, reactivado el 28-jul-2026), separado de ESCALA. El esquema estaba vacío
antes de aplicar, así que no hay mezcla de productos. El esquema ya está aplicado.

---

## El plan por capas

El plan estructurado (C0–C11) mapeado a las funciones reales de Fractal, con su estado,
vive en **`app/desarrollo.html`** (para no tener dos fuentes de verdad, no se duplica aquí).

**Regla de secuencia:** las capas altas dependen de las bajas. No optimizar escala ni
monetizar (C9) antes de tener producto (C2) y usuarios (C5). Prioridad hoy: rehacer C1 con
el modelo real y construir C2 (calendario + cotizadores) sobre él.

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
   Las llaves de servicio y los tokens **nunca** se escriben en el repo; se usan en memoria
   y se rotan si se exponen (un token pegado en el chat se considera comprometido).
8. **Leer el modelo real antes de construir — no asumir el dominio.** (Lección cara de este
   proyecto: se construyó una app genérica de "inversión fraccionada" asumiendo, en vez de
   leer Origen y Destino. El resultado no tenía calendario, ni puntos, ni cotizadores, ni
   los perfiles reales.) El dominio se lee del código/contenido y se destila en `MODELO.md`.
9. **Verificar una capacidad antes de afirmar que existe o no.** (Lección: se dijo "no hay
   acceso a GitHub" sin comprobar; había red y bastaba un token.) Revisar entorno,
   herramientas y credenciales antes de concluir.
10. **Verificar que el estado de infra se asentó antes de operar sobre él.** (Lección: una
    migración no persistió porque se aplicó mientras la restauración de Supabase aún no
    terminaba; se confirmó consultando la base en vivo, no confiando en el "éxito".)
11. **Un "proyecto"/"app" es una app en el stack establecido (Next.js), NO archivos HTML
    sueltos.** (Lección cara de esta sesión: se empezó haciendo paneles HTML de un archivo
    cuando el entregable real era una app Next.js como ESCALA — se perdió mucho tiempo y ni
    se sabía qué se había construido hasta que el usuario corrigió.) Antes de construir:
    entender y confirmar el formato del entregable, leer cómo está hecho el proyecto hermano
    (ESCALA) y replicar su stack (Next.js App Router + Supabase + Vercel), no inventar HTML.

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
