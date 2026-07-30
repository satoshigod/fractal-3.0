'use client'
// ROADMAP FRACTAL — Capas permanentes y TRANSVERSALES (mismo formato que ESCALA).
// Cualquier funcionalidad cabe en una capa; si no cabe, es señal de una capa nueva.
import { useState } from 'react'

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
      {num:'C3.4', done:false, nombre:'Liquidación Origen y motor de costos (23 ítems) e ingreso por días cedidos → reparto.'},
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
  {n:'L1',  t:'Verificar antes de guardar, siempre por separado', d:'Construir → ver que pasa → recién ahí guardar. Nunca encadenar construir-guardar-publicar en un solo paso: si algo falla en medio, se despliega roto.'},
  {n:'L2',  t:'Consultar el esquema, nunca asumirlo', d:'Antes de leer o escribir una tabla, mirar sus columnas y restricciones reales. El código y la migración son un solo cambio, no dos.'},
  {n:'L3',  t:'Dinero: separar cada evento', d:'informado → comprometido → ejecutado → confirmado. El "recibido" (la fracción asignada) solo ocurre al confirmar, no cuando alguien lo anuncia.'},
  {n:'L4',  t:'Nunca silenciar errores en operaciones sensibles', d:'Leer la respuesta y verificar el resultado antes de dar algo por hecho. Un catch vacío en algo que mueve dinero convierte un fallo en un silencio.'},
  {n:'L5',  t:'No romper lo que ya funciona', d:'Al tocar una página, verificar que sus controles y correos sigan vivos, y partir siempre del archivo bueno. (Lección cara: se dañaron calculadoras y se borraron correos.)'},
  {n:'L6',  t:'Consistencia visible', d:'Un solo set de tokens y un solo nombre por cosa que ve el usuario. Los identificadores internos pueden variar; las etiquetas visibles no.'},
  {n:'L7',  t:'Secretos fuera del repo', d:'La clave pública va protegida por RLS; las llaves de servicio y los tokens nunca se versionan, se usan en memoria y se rotan si se exponen.'},
  {n:'L8',  t:'Leer el modelo real antes de construir', d:'No asumir el dominio. Se construyó una app genérica asumiendo, sin leer Origen y Destino; el resultado no tenía calendario, puntos ni los perfiles reales.'},
  {n:'L9',  t:'Verificar una capacidad antes de afirmarla', d:'Se dijo "no hay acceso a GitHub" sin comprobar; había red y bastaba un token. Revisar entorno, herramientas y credenciales antes de concluir.'},
  {n:'L10', t:'Verificar que la infra se asentó antes de operar', d:'Una migración no persistió porque se aplicó mientras Supabase aún restauraba; se confirmó consultando la base en vivo, no confiando en el "éxito".'},
  {n:'L11', t:'Un "proyecto" es una app en el stack establecido, no HTML suelto', d:'Se empezó con paneles HTML de un archivo cuando el entregable real era una app Next.js como ESCALA. Leer cómo está hecho el proyecto hermano y replicar su stack antes de escribir nada.'},
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
          </div>
        </div>
        <h1>{tab==='roadmap'?'Roadmap estratégico':'Lecciones'}</h1>
        <p className="sub">{tab==='roadmap'
          ? 'Capas permanentes y transversales — la guía maestra para cualquier proyecto. Toda funcionalidad pertenece a una capa; lo que no cabe revela una capa nueva.'
          : 'Cada error que enseñó algo transferible, destilado como regla. Se aplican a Fractal y a cualquier proyecto del ecosistema.'}</p>

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
          <div className="lec" key={l.n}><span className="lnum">{l.n}</span>
            <div><div className="lt">{l.t}</div><div className="ld">{l.d}</div></div>
          </div>
        ))}
        <p className="foot">Fuente del alcance: <b>MODELO.md</b> · Reglas y lecciones: <b>CONTEXTO.md</b>. Documento vivo — se actualiza al cerrar cada fase.</p>
      </main>
    </div>
  )
}
