'use client'
// ROADMAP FRACTAL — Capas permanentes y TRANSVERSALES (mismo formato que ESCALA).
// Cualquier funcionalidad cabe en una capa; si no cabe, es señal de una capa nueva.
import { useState } from 'react'
import { SEGMENTOS_ROLES } from '@/lib/segmentosRoles'

const COP = n => new Intl.NumberFormat('es-CO',{style:'currency',currency:'COP',maximumFractionDigits:0}).format(n||0)

const CAPAS = [
  { id:'C0', titulo:'Plataforma y cimientos técnicos', estado:'progreso', valor_total:8000000, valor_hecho:5000000,
    descripcion:'La salud del sistema que sostiene todo lo demás: modelo, contexto, componentes y verificación. No entrega función al usuario, pero define con qué riesgo se construye el resto.',
    hitos:[
      {num:'C0.1', done:true, nombre:'MODELO.md — el dominio real de Fractal, leído del sitio (perfiles, calendario, puntos, cotizadores). Fuente de verdad del negocio.'},
      {num:'C0.2', done:true, nombre:'CONTEXTO.md — archivo maestro con reglas y lecciones que ya costaron errores.'},
      {num:'C0.3', done:true, nombre:'Autorización de rol centralizada (lib/auth.js): la fuente de verdad es perfiles.rol; sumar o verificar un rol es un dato, no un deploy.'},
      {num:'C0.4', done:true, nombre:'Cliente Supabase del servidor unificado (lib/supabase-admin.js); evita que un error se multiplique por copia-pega.'},
      {num:'C0.5', done:true, nombre:'Fórmulas puras separadas del acceso a datos (lib/dominio: puntos, liquidación Origen) con tests unitarios (node --test).'},
      {num:'C0.6', done:false, nombre:'CI que verifique el build en cada push/PR (GitHub Actions), para que un build roto nunca llegue a producción.'},
      {num:'C0.7', done:true, nombre:'Manual de marca + favicons/isotipo de pestaña (public/brand/) en sitio y app.'},
      {num:'C0.8', done:false, nombre:'Componentes base reutilizables (components/) extraídos del diseño real, con la paleta centralizada.'},
      {num:'C0.9', done:false, nombre:'Documentación viva en /docs (arquitectura, base de datos, convenciones que ya costaron bugs) con datos medidos del repo.'},
      {num:'C0.10', done:false, nombre:'Prueba de humo automatizada tras cada deploy: navegador headless que carga las páginas críticas y golpea las APIs con datos reales.'},
    ]},
  { id:'C1', titulo:'Infraestructura', estado:'hecho', valor_total:12000000, valor_hecho:9500000,
    descripcion:'El andamiaje sobre el que corre el producto: base de datos, autenticación, almacenamiento, seguridad.',
    hitos:[
      {num:'C1.1', done:true, nombre:'Supabase propio de Fractal (proyecto pzlfzmpqwscimuxuoucq), separado de ESCALA.'},
      {num:'C1.2', done:true, nombre:'Esquema del modelo real: perfiles con roles, activos multi-vertical, 8 slots A/B/WD, calendario, reservas, puntos, mercado interno, cotizaciones, mercado secundario.'},
      {num:'C1.3', done:true, nombre:'RLS en todas las tablas + seguridad endurecida (0 errores de linter). Verificado en vivo.'},
      {num:'C1.4', done:false, nombre:'Storage: fotos de propiedad (Origen), documentos/escrituras (KYC).'},
    ]},
  { id:'C2', titulo:'Producto central', estado:'progreso', valor_total:25000000, valor_hecho:16000000,
    descripcion:'Lo que el usuario viene a hacer. La capa más grande; todo lo demás existe para servirla.',
    hitos:[
      {num:'C2.1', done:true, nombre:'Plataforma Next.js que también sirve el sitio de marketing (public/), un solo dominio.'},
      {num:'C2.2', done:true, nombre:'Login + registro + enrutamiento por rol: cada usuario entra a su propio panel.'},
      {num:'C2.3', done:true, nombre:'Seis paneles por tipo de usuario (co-propietario, admin, operador, asesor, dueño, huésped).'},
      {num:'C2.4', done:true, nombre:'Calendario transaccional del co-propietario: días por slot, reservar/ceder con puntos.'},
      {num:'C2.5', done:false, nombre:'Cotizadores dentro de la app (2 de Origen, 3 de Destino) — hoy viven solo en las páginas de marketing.'},
    ]},
  { id:'C3', titulo:'Motores de dominio', estado:'pendiente', valor_total:15000000, valor_hecho:0,
    descripcion:'La lógica pesada y delicada, aislada y cubierta con tests.',
    hitos:[
      {num:'C3.1', done:false, nombre:'Motor de puntos (1.68/1.00, 1pt=$1.3M, generación por factor, no acumula entre años).'},
      {num:'C3.2', done:false, nombre:'Mercado interno de días: 4 tipos de intercambio + pago puntos/efectivo/mixto + regla de continuidad.'},
      {num:'C3.3', done:false, nombre:'Asignación semestral del calendario a cada fracción.'},
      {num:'C3.4', done:true, nombre:'Motor Financiero — ledger de doble partida (cuentas, movimientos inmutables) derivado de los escenarios Origen + Destino. Verificado en vivo (la suma da cero).'},
      {num:'C3.5', done:true, nombre:'Estado de cuenta: cobro de la cuota mensual (reparto por fracción) e ingreso por días cedidos, en el panel del co-propietario.'},
      {num:'C3.6', done:false, nombre:'Rol inversionista + aporte de capital y repago con retorno; liquidación al dueño; pago en especie (fracción conservada / lote).'},
    ]},
  { id:'C4', titulo:'Confianza e identidad', estado:'pendiente', valor_total:8000000, valor_hecho:0,
    descripcion:'Reputación, verificación, permisos, cumplimiento.',
    hitos:[
      {num:'C4.1', done:false, nombre:'KYC y escrituras por co-propietario.'},
      {num:'C4.2', done:false, nombre:'Aprobación de la comunidad para nuevos copropietarios (8 familias curadas).'},
      {num:'C4.3', done:false, nombre:'Compliance / RNT por activo.'},
    ]},
  { id:'C5', titulo:'Liquidez / arranque en frío', estado:'progreso', valor_total:6000000, valor_hecho:2000000,
    descripcion:'Cómo el producto consigue sus primeros usuarios y equilibra oferta (Origen) y demanda (Destino).',
    hitos:[
      {num:'C5.1', done:true, nombre:'Sitio público capta leads (WhatsApp, cotizadores).'},
      {num:'C5.2', done:false, nombre:'Conectar cotizadores/formularios del sitio a la tabla de solicitudes por perfil.'},
      {num:'C5.3', done:false, nombre:'Emparejar oferta (propiedades Origen) con demanda (compradores Destino).'},
    ]},
  { id:'C6', titulo:'Inteligencia', estado:'pendiente', valor_total:6000000, valor_hecho:0,
    descripcion:'Capa de datos avanzada: relaciones, matching, valoración, automatización.',
    hitos:[
      {num:'C6.1', done:false, nombre:'Matching activo ↔ perfil (destino, tipo de fracción, presupuesto).'},
      {num:'C6.2', done:false, nombre:'Valoración y proyección de fracciones.'},
    ]},
  { id:'C7', titulo:'Comunidad y ecosistema', estado:'pendiente', valor_total:5000000, valor_hecho:0,
    descripcion:'Lo que hace que los usuarios se queden y traigan a otros.',
    hitos:[
      {num:'C7.1', done:false, nombre:'Gobernanza de las 8 familias por propiedad; lista de espera.'},
      {num:'C7.2', done:false, nombre:'Exchange entre productos (fincas ↔ autos ↔ náutico) con puntos; referidos.'},
    ]},
  { id:'C8', titulo:'Marketing y adquisición orgánica', estado:'progreso', valor_total:5000000, valor_hecho:3000000,
    descripcion:'SEO, contenido, landing pages, presencia.',
    hitos:[
      {num:'C8.1', done:true, nombre:'Sitio con SEO, sitemap, GA (G-FNYVWMH7V7) y landing por vertical.'},
      {num:'C8.2', done:false, nombre:'Botón de WhatsApp con clic unificado en todas las páginas (wa.me/573005485019).'},
      {num:'C8.3', done:false, nombre:'Cotizadores como imán de leads dentro de la app.'},
    ]},
  { id:'C9', titulo:'Monetización', estado:'pendiente', valor_total:6000000, valor_hecho:0,
    descripcion:'Planes, comisiones. Solo tiene sentido con usuarios reales que ya obtienen valor.',
    hitos:[
      {num:'C9.1', done:false, nombre:'Honorarios Origen 12% sobre bolsa vendida.'},
      {num:'C9.2', done:false, nombre:'Fee de gestión 0.35% del activo anual y comisión del operador sobre días cedidos.'},
    ]},
  { id:'C10', titulo:'Integraciones y cumplimiento', estado:'pendiente', valor_total:8000000, valor_hecho:0,
    descripcion:'Canales externos, firma, facturación, legal, apps móviles.',
    hitos:[
      {num:'C10.1', done:false, nombre:'Firma electrónica de escrituras/contratos y facturación.'},
      {num:'C10.2', done:false, nombre:'Canales OTA (Airbnb/Booking) + PMS para días cedidos; app móvil.'},
    ]},
  { id:'C11', titulo:'Campañas de adquisición', estado:'pendiente', valor_total:4000000, valor_hecho:0,
    descripcion:'Iniciativas concretas y temporales para conseguir usuarios. El piloto, no el producto.',
    hitos:[
      {num:'C11.1', done:false, nombre:'Campañas por destino (Cauca Viejo disponible; Cartagena, San Andrés próximamente).'},
      {num:'C11.2', done:false, nombre:'Campañas de incorporación Origen (herederos, lotes).'},
    ]},
]

const LECCIONES = [
  {n:'L1', cat:'Verificación', t:'Subir sin verificar que compile', caso:'En Fractal se corre `npm run build` antes de cada push; valida el esquema y compila las rutas.', regla:'Verificar el build primero y mostrar el resultado. Commitear solo si pasó. Nunca encadenar build-commit-push.'},
  {n:'L2', cat:'Producto', t:'Construir la pantalla y no el camino a ella', caso:'Se hicieron el login y los seis paneles, pero el sitio no tenía cómo llegar a ellos; se agregó el botón "Ingresar" → /plataforma.', regla:'Una pantalla no está lista hasta que se pueda llegar navegando. La ruta de entrada es parte de la tarea.'},
  {n:'L3', cat:'Datos', t:'Asumir el esquema en vez de consultarlo', caso:'Antes de cada operación se consultan las columnas y constraints reales de la base (perfiles, activos, fracciones).', regla:'Antes de un insert/update, consultar columnas y constraints reales. Nunca catch vacío en operaciones de dinero.'},
  {n:'L4', cat:'Datos', t:'Cambiar el código sin migrar la base que lo valida', caso:'Los estados (enums/CHECK) viven en la base y como valores exactos en el front; cambian en el mismo commit.', regla:'Al cambiar un valor que la base valida (enum, CHECK), migrar también la base. Código y datos son un solo cambio.'},
  {n:'L5', cat:'Lenguaje', t:'Unificar un nombre y dejar duplicados visibles', caso:'Al renombrar homes→destino se actualizaron todos los enlaces y se dejó una redirección 301, sin duplicados visibles.', regla:'Al unificar nombres, verificar que no queden dos entradas con la misma etiqueta visible.'},
  {n:'L6', cat:'Producto', t:'Editar una página sin verificar que sus botones funcionen', caso:'El botón de WhatsApp y los CTA del sitio deben apuntar a algo real (wa.me/573005485019), no a un número de relleno.', regla:'Al tocar una página, verificar que sus enlaces y botones lleven a algo real. Reportar los rotos o de prueba.'},
  {n:'L7', cat:'Modelo', t:'Confundir informar con pagar', caso:'El flujo de compra separa informado → comprometido → ejecutado → confirmado; la fracción nace solo al confirmar (RPC atómico).', regla:'Al modelar dinero, separar cada evento: informar, comprometerse, pagar y confirmar son cosas distintas.'},
  {n:'L8', cat:'Duplicación', t:'El mismo arreglo no llega a todas las copias', caso:'El cliente Supabase del servidor y la autorización de rol se centralizaron (lib/supabase-admin.js, lib/auth.js) en vez de repetirse por ruta.', regla:'Cuando un patrón se repite más de 3 veces, extraerlo. La duplicación cuesta que los arreglos no se propaguen.'},
  {n:'L9', cat:'Proceso', t:'Trabajar sin ver la base de datos', caso:'Fractal se construyó con el conector de Supabase activo desde el inicio; el esquema y los datos se verifican en vivo.', regla:'Dar acceso a la base desde el día 1. Lo que no se puede verificar se asume, y las suposiciones se pagan caro.'},
  {n:'L10', cat:'Ritmo', t:'Velocidad que se paga después', caso:'Cada avance sin verificación produce corrección al día siguiente.', regla:'Decir explícitamente si se prefiere velocidad o verificación. "Sigue" se interpreta como avanzar sin verificar.'},
  {n:'L11', cat:'Arquitectura', t:'No definir los cimientos antes de construir encima', caso:'Se hizo primero el esquema del modelo real (C1) y los tokens/dominio antes de las pantallas (C2).', regla:'Definir componentes base, tokens y esquema al inicio. Retrofitearlos después cuesta multiplicado por pantalla.'},
  {n:'L12', cat:'Refactor', t:'Migrar por detección superficial produce falsos positivos', caso:'El criterio de reemplazo es qué ES el elemento, no que comparta un valor de estilo.', regla:'En un refactor, migrar por semántica, no por coincidencia. Revisar cada candidato; no migrar de más.'},
  {n:'L13', cat:'Método', t:'Un archivo maestro de contexto que sobreviva a la sesión', caso:'CONTEXTO.md concentra qué es, stack, IDs, estado y reglas; MODELO.md el dominio. Se leen al empezar cada sesión.', regla:'Todo proyecto arranca con un archivo maestro versionado. Si hay dos fuentes de verdad, declarar cuál manda.'},
  {n:'L14', cat:'Método', t:'Conectar las herramientas reales desde el día 1', caso:'Repo (GitHub), base (Supabase) y deploy (Vercel) conectados; los tokens se usan en memoria y se rotan si se exponen.', regla:'Conectar repo + base + deploy desde el inicio. Los secretos nunca se versionan y se rotan si se exponen.'},
  {n:'L15', cat:'Método', t:'Un plan de desarrollo estructurado, no una lista de tareas', caso:'El desarrollo se organiza en capas C0–C11 (esta misma página), transversales a cualquier proyecto.', regla:'El trabajo se organiza en capas de propósito. Lo que no cabe en ninguna revela una capa faltante.'},
  {n:'L16', cat:'Verificación', t:'Que compile no significa que funcione', caso:'El esquema se aplicó y se ejercitó contra la base real (crear compra, confirmar, ver la fracción nacer); no bastó con que compilara.', regla:'Compilar es necesario, no suficiente. La verificación de ejecución debe estar automatizada, no depender de acordarse.'},
  {n:'L17', cat:'Refactor', t:'Un refactor se mide por su objetivo, no por dejar cero coincidencias', caso:'El sitio de marketing y la app son familias distintas: no comparten componentes, cada una tiene los suyos.', regla:'Un refactor está completo cuando cumple su objetivo, no cuando no queda ni una coincidencia textual.'},
  {n:'L18', cat:'Verificación', t:'Para testear lógica acoplada a la base, separar la fórmula del acceso', caso:'lib/dominio (puntos, liquidación Origen) son funciones puras con tests (node --test) que corren sin Supabase.', regla:'La fórmula (cálculo) se separa del acceso a datos y se cubre con tests rápidos sin depender de la base.'},
  {n:'L19', cat:'Arquitectura', t:'Centralizar no es lo mismo que migrar', caso:'Los tokens de diseño y los clientes/helpers son el lugar único; el código nuevo los adopta desde el día uno.', regla:'Crear el mecanismo central entrega la mayor parte del valor; la migración del código viejo es incremental.'},
  {n:'L20', cat:'Método', t:'Leer el modelo real antes de construir — no asumir el dominio', caso:'Se construyó una app genérica de inversión asumiendo, sin leer Origen y Destino: no tenía calendario, puntos ni los perfiles reales. Hubo que rehacerla sobre MODELO.md.', regla:'El dominio se lee del código/contenido y se destila en un documento, antes de construir. No inventar el modelo.'},
  {n:'L21', cat:'Proceso', t:'Verificar una capacidad antes de afirmar que existe o no', caso:'Se dijo "no hay acceso a GitHub" sin comprobar; había red y bastaba un token.', regla:'Revisar entorno, herramientas y credenciales antes de concluir que algo no se puede.'},
  {n:'L22', cat:'Datos', t:'Verificar que la infra se asentó antes de operar', caso:'Una migración no persistió porque se aplicó mientras Supabase aún restauraba; se confirmó consultando la base en vivo.', regla:'Confirmar que el estado de infraestructura se asentó consultándolo en vivo, no confiando en el "éxito".'},
  {n:'L23', cat:'Seguridad', t:'Nunca exponer credenciales al público', caso:'Las cuentas demo, con contraseña, quedaron visibles en la página de login pública; se quitaron y se rotaron todas las contraseñas.', regla:'Ninguna credencial va en una página pública ni en el repo. Si se expone, se rota de inmediato.'},
  {n:'L24', cat:'Método', t:'Un "proyecto" es una app en el stack establecido, no HTML suelto', caso:'Se empezó con paneles HTML de un archivo cuando el entregable real era una app Next.js como ESCALA.', regla:'Al pedir un proyecto/app, leer cómo está hecho el proyecto hermano y replicar su stack (Next.js) antes de escribir nada.'},
]

const EST = { hecho:['Hecho','ok'], progreso:['En progreso','prog'], pendiente:['Pendiente','todo'] }
const Iso = () => (
  <svg viewBox="0 0 400 400" width="40" height="40" style={{verticalAlign:'middle'}}>
    <polygon points="320,150 250,80 150,80 80,150 80,250 150,320 250,320 320,250" fill="none" stroke="#b8935a" strokeWidth="8"/>
    <polygon points="172,150 172,250 262,200" fill="#c2a15c"/><circle cx="172" cy="250" r="14" fill="#b8935a"/>
  </svg>
)

export default function Desarrollo() {
  const [tab, setTab] = useState('roadmap')
  const [abierta, setAbierta] = useState('C0')
  const totalHitos = CAPAS.reduce((a,c)=>a+c.hitos.length,0)
  const hechos = CAPAS.reduce((a,c)=>a+c.hitos.filter(h=>h.done).length,0)
  const pend = totalHitos - hechos
  const pct = Math.round(hechos/totalHitos*100)
  const valTotal = CAPAS.reduce((a,c)=>a+c.valor_total,0)
  const valHecho = CAPAS.reduce((a,c)=>a+c.valor_hecho,0)

  return (
    <div className="dwrap">
      <header className="dhead">
        <div className="dtop"><span className="brand"><Iso /> <b>FRACTAL</b></span>
          <div className="dtabs">
            <button className={tab==='roadmap'?'on':''} onClick={()=>setTab('roadmap')}>Roadmap</button>
            <button className={tab==='lecciones'?'on':''} onClick={()=>setTab('lecciones')}>Lecciones</button>
            <button className={tab==='segmentos'?'on':''} onClick={()=>setTab('segmentos')}>Segmentos</button>
          </div>
        </div>
        <h1>{tab==='roadmap'?'Roadmap estratégico':tab==='lecciones'?'Lecciones':'Segmentos por rol'}</h1>
        <p className="sub">{tab==='roadmap'
          ? 'Capas permanentes y transversales — la guía maestra para cualquier proyecto. Toda funcionalidad pertenece a una capa; lo que no cabe revela una capa nueva.'
          : tab==='lecciones' ? 'Cada error que enseñó algo transferible, destilado como regla. Se aplican a Fractal y a cualquier proyecto del ecosistema.'
          : 'El trabajo que cada tipo de usuario realiza en la plataforma, organizado en segmentos y tareas.'}</p>

        {tab==='roadmap' && (<>
          <div className="cards">
            <div className="c"><div className="cv ok">{hechos}/{totalHitos}</div><div className="ck">Ítems completados</div></div>
            <div className="c"><div className="cv warn">{pct}%</div><div className="ck">Completado</div></div>
            <div className="c"><div className="cv warn">{pend}</div><div className="ck">Pendientes</div></div>
            <div className="c"><div className="cv info">{COP(valHecho)}</div><div className="ck">Valor ejecutado</div></div>
            <div className="c"><div className="cv">{COP(valTotal)}</div><div className="ck">Valor total</div></div>
          </div>
          <div className="progbar"><span style={{width:pct+'%'}}></span></div>
        </>)}
      </header>

      <main className="dmain">
        {tab==='roadmap' ? CAPAS.map(c=>{
          const [label,cls]=EST[c.estado]; const done=c.hitos.filter(h=>h.done).length; const open=abierta===c.id
          return (
            <div className="cap" key={c.id}>
              <div className="caphead" onClick={()=>setAbierta(open?null:c.id)}>
                <span className="capid">{c.id}</span>
                <div className="capmeta"><div className="capname">{c.titulo}</div><div className="capdesc">{c.descripcion}</div></div>
                <span className="capcount">{done}/{c.hitos.length}</span>
                <span className={'est '+cls}>{label}</span>
                <span className="tri" style={{transform:open?'rotate(90deg)':'none'}}>›</span>
              </div>
              {open && <ul className="hitos">{c.hitos.map(h=>(
                <li key={h.num} className={h.done?'d':'t'}><span className="hnum">{h.num}</span><span>{h.nombre}</span></li>
              ))}</ul>}
            </div>
          )
        }) : LECCIONES.map(l=>(
          <div className="lec" key={l.n}>
            <span className="lnum">{l.n}</span>
            <div className="lbody">
              <div className="lhead"><span className="lt">{l.t}</span><span className="lcat">{l.cat}</span></div>
              <div className="lcaso"><b>Caso:</b> {l.caso}</div>
              <div className="lregla"><b>Regla:</b> {l.regla}</div>
            </div>
          </div>
        ))}
        {tab==='segmentos' && Object.entries(SEGMENTOS_ROLES).map(([rol,segs])=>(
          <div className="cap" key={rol}>
            <div className="caphead" onClick={()=>setAbierta(abierta===rol?null:rol)}>
              <span className="capid" style={{fontSize:18}}>{rol}</span>
              <div className="capmeta"><div className="capdesc">{Object.keys(segs).length} segmentos · {Object.values(segs).reduce((a,t)=>a+t.length,0)} tareas</div></div>
              <span className="tri" style={{transform:abierta===rol?'rotate(90deg)':'none'}}>›</span>
            </div>
            {abierta===rol && <div className="segbody">{Object.entries(segs).map(([seg,tareas])=>(
              <div className="seg" key={seg}>
                <div className="segname">{seg}</div>
                <ul className="segtareas">{tareas.map((t,i)=>(
                  <li key={i}><span className="segt">{t.nombre}</span><span className="segcat">{t.categoria}</span><div className="segd">{t.descripcion}</div></li>
                ))}</ul>
              </div>
            ))}</div>}
          </div>
        ))}
        <p className="foot">Fuente del alcance: <b>MODELO.md</b> · Reglas y lecciones: <b>CONTEXTO.md</b>. Documento vivo — se actualiza al cerrar cada fase.</p>
      </main>
    </div>
  )
}
