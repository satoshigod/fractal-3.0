# MODELO — Fractal Colombia (vivefractal.com)

> Síntesis del proyecto **real**, leída completa del repo `fractal-3.0` (Origen y Destino
> íntegros, incluidas sus preguntas frecuentes, más el JS y los cotizadores de cada
> vertical). Es la fuente de verdad del dominio: de aquí se construye la app. No se asume
> nada que no esté en el código/contenido.

---

## 1. Qué es Fractal

Un **ecosistema de copropiedad fraccionada de activos de lujo** en Colombia: segundas
casas (fincas), embarcaciones, autos premium y vehículos híbridos. No es "inversión
fraccionada" genérica: es **propiedad real + acceso por calendario + renta de días no
usados**, coordinado por una **economía de puntos**, con un **operador** que gestiona y
monetiza. El término central es **co-propietario / copropietario** (no "inversionista").

Dos grandes lados:
- **Origen** — la **oferta**: de aquí *salen* las propiedades. Un propietario incorpora
  una casa/finca dormida; Fractal asume deudas, financia remodelación y comercializa
  fracciones.
- **Destino** — la **demanda y operación**: aquí se *optimizan y operan* esas propiedades
  para los co-propietarios (calendario, puntos, renta, comunidad).

---

## 2. Los 7 productos

| Producto | Qué es |
|----------|--------|
| **Origen** | Incorporación de una propiedad dormida (deuda, herencia, lote) → fracciones. |
| **Destino** (antes "homes") | Insignia: fincas fraccionadas con calendario A/B/WD, puntos, mercado interno. |
| **Invest** | La finca enmarcada como inversión estructurada de renta vacacional (vs CDT 11%). |
| **Náutico** | Copropiedad de embarcaciones (categorías; costos por socio). |
| **Premium Cars** | Copropiedad de autos de lujo (6 marcas). |
| **PyP** | Copropiedad de vehículos híbridos entre 2–5 socios, días por placa (pico y placa). |
| **Exchange** | Economía de puntos que conecta productos + mercado interno de reventa. |

---

## 3. Perfiles (el usuario pidió no avanzar sin identificarlos todos)

### Perfiles en ORIGEN (dueño que incorpora)
Del contenido y de las 9 preguntas de Origen:
1. **Dueño con deudas / en aprietos** — deuda con administración/mayordomo, servicios,
   incluso **embargos activos** (Fractal negocia con acreedores para desbloquear).
2. **Dueño con propiedad deteriorada** — necesita remodelación que no puede pagar.
3. **Dueño con capital inmovilizado** — busca eficiencia (millones enterrados que no rentan).
4. **Dueño con desapego** — la vida cambió, nadie va; controla su *curva de desapego*.
5. **Herederos (varios hermanos)** — caso central y difícil: conservan 1–2 fracciones
   colectivas (uno gestiona, todos usan), venden el resto; contempla el heredero que **no**
   quiere participar (se estructura aparte).
6. **Dueño de lote** — tiene terreno sin recursos para construir; Fractal desarrolla y le
   paga en **fracciones** (una casa, o un cluster de unidades).

### Perfiles en DESTINO (quien entra a la finca)
De los 3 cotizadores y las 7 preguntas de Destino:
1. **Comprador Fracción A/B (Weekend)** — fin de semana, festivos, temporada alta; perfil
   *premium / inversión*.
2. **Comprador Fracción WD (Weekday)** — lun–jue; trabajo remoto, retiros, escapadas de
   pareja; menor entrada.
3. **Propietario que trae su propiedad (preferente)** — recibe liquidez y conserva
   **fracción preferente** pagando **menos al mes** que un copropietario externo.
4. **Dueño de lote** — aporta terreno, recibe fracciones (comparte el flujo con Origen).
5. **Perfil inversión (Invest)** — enfocado en ceder días y rentar (comparado con CDT).

### Roles operativos (transversales)
- **Operador** — opera los 23 ítems, alquila **días cedidos**, cobra comisión (~15% OTAs).
- **Asesor / Arquitecto Fractal** — consulta de 30 min; en Origen hace la **visita técnica**.
- **Administrador (Fractal)** — gestiona plataforma, activos, aprobaciones, cumplimiento.
- **Huésped** — alquila días cedidos (estadía corta, sin propiedad).
- **Comunidad** — los 8 copropietarios **aprueban** nuevos miembros (mercado secundario).

---

## 4. Fracciones (fincas): 8 = 100%

| Slot | Tipo | % | Días/año | Costo mensual |
|------|------|---|----------|---------------|
| A1, A2 | Weekend | 15.65% c/u | ~48 | $1.776.056 |
| B1, B2 | Weekend | 15.65% c/u | ~48 | $1.776.056 |
| WD1–WD4 | Weekday | 9.35% c/u | ~43 | $1.493.840 |

4×15.65% + 4×9.35% = **100%**. Costo ≈ 1/8 de la operación. En vehículos (PyP) la lógica
es análoga por **socios (2–5) y placa/día** (modos A con conductor, B/C sin conductor).

---

## 5. El calendario (el corazón — lo técnicamente más difícil)

`CAL`: un objeto por día del año →
`{ "d":"2026-01-01", "o":"A1", "ab":true, "sp":true, "br":false }`
- **o** — slot dueño del día: `A1 A2 B1 B2` (weekend) · `WD1 WD2 WD3 WD4` (weekday).
- **ab** — día weekend (universo A/B) vs weekday.
- **sp** — día especial/premium (festivo, Semana Santa, vacaciones, alta demanda).
- **br** — puente.

Total año: 192 días A/B, 173 weekday. Por fracción: A/B ~48, WD ~43–44. **Asignación
semestral**. Garantía de fechas premium para A/B.

---

## 6. Sistema de puntos

- 1 noche **FDS/especial** = **1.68 pts** · 1 noche **entre semana** = **1.00 pt**.
- **1 punto = $1.300.000**.
- Los puntos se generan por fracción (Exchange: valor × factor
  `homes 0.00042 · cars 0.0012 · nautico 0.0009`).
- Sirven para **reservar**, **intercambiar** y **ceder** días. **No se acumulan entre años.**

---

## 7. Mercado interno de días (4 tipos de intercambio · pago puntos/efectivo/mixto)

Fractal valida y registra cada transacción en la APP.
1. **Extensión contigua** — comprar solo el día inmediatamente anterior/siguiente a tu
   bloque (regla de continuidad: nunca días sueltos en medio de otra semana). Cada compra
   extiende el bloque.
2. **Compra de bloque completo** — comprar el bloque entero de otro (aunque no sea contiguo).
3. **Intercambio A ↔ B** — swap de bloques weekend entre A1/A2/B1/B2; diferencia en
   puntos/efectivo.
4. **Intercambio WD ↔ WD** — swap de semanas completas entre los 4 weekday.

---

## 8. Los 23 ítems (motor de costos, finca completa = $11.142.083/mes)

Gestión (admin Fractal, property manager, plataforma/APP, contabilidad, PMS, publicidad,
compliance/RNT, pasarela) · Personal (servicio doméstico, mayordomo) · Mantenimiento
(preventivo, jardinería, insumos, lavandería) · Servicios (públicos, amenidades, **OTAs
solo si alquila**) · Legal/fiscal/fondos (seguros, predial, fondo reposición, contingencia,
ICA, parafiscal turismo) · **Fee Fractal 0.35% activo/año ÷12** ($175.000 por fracción).
Cada ítem se reparte entre los 8 según el tipo de uso.

---

## 9. Cotizadores (todos deben construirse en la app)

**Origen — 2 cotizadores:**
1. **"¿Cómo se ven los números?"** (`#ejemplo`): 3 sliders (valor, remodelación, deudas) +
   conservar fracción → liquidación en vivo (activo fractalizado → precio/fracción →
   liquidación neta = bolsa − remodelación − deudas − 12% fee − fracción conservada).
2. **"Cotiza tu propiedad gratis" → "Cotización Fractal Origen"** (`#cotizador`): wizard
   multi-paso (estado, reparaciones, deudas, embargos, fotos, amenidades) → cotización
   detallada + desglose del costo mensual (1/8) + potencial de ingreso por días cedidos.

**Destino — 3 cotizadores** (un solo widget, 3 modos): **comprar una fracción** ·
**tengo una propiedad** (liquidez + fracción preferente, paga menos) · **tengo un lote**
(Fractal construye, paga en fracciones). Más el **simulador de extensiones/swaps** del
mercado interno y la **comparación** (timeshare vs casa propia vs arriendo vs Fractal).

**Verticales:** náutico/cars/pyp tienen sus propias calculadoras de costo por socio y (pyp)
por vehículo/placa (`ALL_DATA`, `ASIG`, `MOD_INFO`).

---

## 10. Mercado secundario de fracciones

Reventa libre (el dueño fija precio; Fractal aporta análisis y compradores). Solo **8
familias** por propiedad; nuevos miembros **aprobados por la comunidad** existente. Lista
de espera activa; fracciones con historial tienen prima de acceso.

---

## 11. Economía de Origen (curva de desapego)

Etapas: **0** casa 100% tuya → **1** primera fracción vendida (recibes recursos − pasivos;
usas 7/8) → **2–6** más ventas, más liquidez, menos uso → **7** conservas tu fracción
escriturada, costos entre 8 iguales. Liquidación = bolsa (8 fracciones) − remodelación −
deudas − **honorarios Fractal 12%** − fracción conservada. Costos mensuales del dueño: 1/8
(o **$0** si vende las 8). Tiempos: bueno 2–3m, regular 4–6m, malo 6–9m.

---

## 12. Qué debe ser la app

Gira en torno a **uso coordinado por calendario + puntos**, con paneles por rol:
- **Roles/accesos** para los perfiles de arriba (dueño, co-propietario A/B/WD, operador,
  asesor, admin, huésped).
- **Activos multi-vertical** (finca/embarcación/auto/híbrido) con su esquema de fracciones
  o socios.
- **Calendario transaccional** (días asignados por slot, reservas, estados).
- **Puntos** (saldo por copropietario, generación, gasto, sin acumular entre años).
- **Mercado interno de días** (los 4 tipos de intercambio, pago mixto, validación Fractal).
- **Cesión y renta** (días cedidos → operador → ingreso al copropietario).
- **Origen**: flujo de incorporación + los 2 cotizadores.
- **Destino**: los 3 cotizadores + comparación + simulador de swaps.
- **Mercado secundario** de fracciones con aprobación de comunidad.
- **Motor de costos** (23 ítems) e ingresos.

> El primer intento (activos/fracciones/transacciones/repartos, 2 roles, sin calendario ni
> puntos ni cotizadores) era una sombra genérica. Se reconstruye sobre este modelo.

*Leído de: index, origen, homes(Destino), invest, nautico, cars, exchange, pyp,
origen-antioquia — texto, JS, cotizadores y FAQs. Documento vivo.*
