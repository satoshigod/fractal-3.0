'use client'
// ROADMAP FRACTAL — Capas estratégicas permanentes y TRANSVERSALES.
// Mismo formato que ESCALA: cualquier funcionalidad cabe en una capa;
// si no cabe, es señal de una capa nueva. Las capas bajas sostienen a las altas.
import { useState } from 'react'

const CAPAS = [
  { id:'C0', titulo:'Plataforma y cimientos técnicos', estado:'progreso',
    descripcion:'La salud del sistema que sostiene todo lo demás: modelo, contexto, componentes y verificación. No entrega función al usuario, pero define con qué riesgo se construye el resto.',
    hitos:[
      {num:'C0.1', done:true, nombre:'MODELO.md — el dominio real de Fractal, leído del sitio (perfiles, calendario, puntos, cotizadores). Fuente de verdad del negocio.'},
      {num:'C0.2', done:true, nombre:'CONTEXTO.md — archivo maestro con reglas y lecciones que ya costaron errores.'},
      {num:'C0.3', done:true, nombre:'Autorización de rol centralizada (lib/auth.js): la fuente de verdad es perfiles.rol; sumar o verificar un rol es un dato, no un deploy.'},
      {num:'C0.4', done:true, nombre:'Cliente Supabase del servidor unificado (lib/supabase-admin.js) para todas las rutas API; evita que un error se multiplique por copia-pega.'},
      {num:'C0.5', done:true, nombre:'Fórmulas puras separadas del acceso a datos (lib/dominio: puntos, liquidación Origen) con tests unitarios (node --test).'},
      {num:'C0.6', done:false, nombre:'CI que verifique el build en cada push/PR (GitHub Actions), para que un build roto nunca llegue a producción.'},
      {num:'C0.7', done:false, nombre:'Manual de marca + favicons/isotipo de pestaña (public/brand/) en sitio y app.'},
    ]},
  { id:'C1', titulo:'Infraestructura', estado:'hecho',
    descripcion:'El andamiaje sobre el que corre el producto: base de datos, autenticación, almacenamiento, seguridad.',
    hitos:[
      {num:'C1.1', done:true, nombre:'Supabase propio de Fractal (proyecto pzlfzmpqwscimuxuoucq), separado de ESCALA.'},
      {num:'C1.2', done:true, nombre:'Esquema del modelo real: perfiles con roles, activos multi-vertical, 8 slots A/B/WD, calendario, reservas, puntos, mercado interno, cotizaciones, mercado secundario.'},
      {num:'C1.3', done:true, nombre:'RLS en todas las tablas + seguridad endurecida (0 errores de linter). Verificado en vivo.'},
      {num:'C1.4', done:false, nombre:'Storage: fotos de propiedad (Origen), documentos/escrituras (KYC).'},
    ]},
  { id:'C2', titulo:'Producto central', estado:'progreso',
    descripcion:'Lo que el usuario viene a hacer. La capa más grande; todo lo demás existe para servirla.',
    hitos:[
      {num:'C2.1', done:true, nombre:'Plataforma Next.js que también sirve el sitio de marketing (public/), un solo dominio.'},
      {num:'C2.2', done:true, nombre:'Login + registro + enrutamiento por rol: cada usuario entra a su propio panel.'},
      {num:'C2.3', done:true, nombre:'Seis paneles por tipo de usuario (co-propietario, admin, operador, asesor, dueño, huésped).'},
      {num:'C2.4', done:true, nombre:'Calendario transaccional del co-propietario: días por slot, reservar/ceder con puntos.'},
      {num:'C2.5', done:false, nombre:'Cotizadores dentro de la app (2 de Origen, 3 de Destino) — hoy viven solo en las páginas de marketing.'},
    ]},
  { id:'C3', titulo:'Motores de dominio', estado:'pendiente',
    descripcion:'La lógica pesada y delicada, aislada y cubierta con tests.',
    hitos:[
      {num:'C3.1', done:false, nombre:'Motor de puntos (1.68/1.00, 1pt=$1.3M, generación por factor, no acumula entre años).'},
      {num:'C3.2', done:false, nombre:'Mercado interno de días: 4 tipos de intercambio + pago puntos/efectivo/mixto + regla de continuidad.'},
      {num:'C3.3', done:false, nombre:'Asignación semestral del calendario a cada fracción.'},
      {num:'C3.4', done:false, nombre:'Liquidación Origen y motor de costos (23 ítems) e ingreso por días cedidos → reparto.'},
    ]},
  { id:'C4', titulo:'Confianza e identidad', estado:'pendiente',
    descripcion:'Reputación, verificación, permisos, cumplimiento.',
    hitos:[
      {num:'C4.1', done:false, nombre:'KYC y escrituras por co-propietario.'},
      {num:'C4.2', done:false, nombre:'Aprobación de la comunidad para nuevos copropietarios (8 familias curadas).'},
      {num:'C4.3', done:false, nombre:'Compliance / RNT por activo.'},
    ]},
  { id:'C5', titulo:'Liquidez / arranque en frío', estado:'progreso',
    descripcion:'Cómo el producto consigue sus primeros usuarios y equilibra oferta (Origen) y demanda (Destino).',
    hitos:[
      {num:'C5.1', done:true, nombre:'Sitio público capta leads (WhatsApp, cotizadores).'},
      {num:'C5.2', done:false, nombre:'Conectar cotizadores/formularios del sitio a la tabla de solicitudes por perfil.'},
      {num:'C5.3', done:false, nombre:'Emparejar oferta (propiedades Origen) con demanda (compradores Destino).'},
    ]},
  { id:'C6', titulo:'Inteligencia', estado:'pendiente',
    descripcion:'Capa de datos avanzada: relaciones, matching, valoración, automatización.',
    hitos:[
      {num:'C6.1', done:false, nombre:'Matching activo ↔ perfil (destino, tipo de fracción, presupuesto).'},
      {num:'C6.2', done:false, nombre:'Valoración y proyección de fracciones.'},
    ]},
  { id:'C7', titulo:'Comunidad y ecosistema', estado:'pendiente',
    descripcion:'Lo que hace que los usuarios se queden y traigan a otros.',
    hitos:[
      {num:'C7.1', done:false, nombre:'Gobernanza de las 8 familias por propiedad; lista de espera.'},
      {num:'C7.2', done:false, nombre:'Exchange entre productos (fincas ↔ autos ↔ náutico) con puntos; referidos.'},
    ]},
  { id:'C8', titulo:'Marketing y adquisición orgánica', estado:'progreso',
    descripcion:'SEO, contenido, landing pages, presencia.',
    hitos:[
      {num:'C8.1', done:true, nombre:'Sitio con SEO, sitemap, GA (G-FNYVWMH7V7) y landing por vertical.'},
      {num:'C8.2', done:false, nombre:'Botón de WhatsApp con clic unificado en todas las páginas (wa.me/573005485019).'},
      {num:'C8.3', done:false, nombre:'Cotizadores como imán de leads dentro de la app.'},
    ]},
  { id:'C9', titulo:'Monetización', estado:'pendiente',
    descripcion:'Planes, comisiones. Solo tiene sentido con usuarios reales que ya obtienen valor.',
    hitos:[
      {num:'C9.1', done:false, nombre:'Honorarios Origen 12% sobre bolsa vendida.'},
      {num:'C9.2', done:false, nombre:'Fee de gestión 0.35% del activo anual y comisión del operador sobre días cedidos.'},
    ]},
  { id:'C10', titulo:'Integraciones y cumplimiento', estado:'pendiente',
    descripcion:'Canales externos, firma, facturación, legal, apps móviles.',
    hitos:[
      {num:'C10.1', done:false, nombre:'Firma electrónica de escrituras/contratos y facturación.'},
      {num:'C10.2', done:false, nombre:'Canales OTA (Airbnb/Booking) + PMS para días cedidos; app móvil.'},
    ]},
  { id:'C11', titulo:'Campañas de adquisición', estado:'pendiente',
    descripcion:'Iniciativas concretas y temporales para conseguir usuarios. El piloto, no el producto.',
    hitos:[
      {num:'C11.1', done:false, nombre:'Campañas por destino (Cauca Viejo disponible; Cartagena, San Andrés próximamente).'},
      {num:'C11.2', done:false, nombre:'Campañas de incorporación Origen (herederos, lotes).'},
    ]},
]

const EST = { hecho:['Hecho','ok'], progreso:['En progreso','prog'], pendiente:['Pendiente','todo'] }

export default function Desarrollo() {
  const [abierta, setAbierta] = useState('C0')
  const totalHitos = CAPAS.reduce((a,c)=>a+c.hitos.length,0)
  const hechos = CAPAS.reduce((a,c)=>a+c.hitos.filter(h=>h.done).length,0)
  const pct = Math.round(hechos/totalHitos*100)
  return (
    <div className="dwrap">
      <header className="dhead">
        <span className="brand">VIVE <b>FRACTAL</b></span>
        <h1>Plan de desarrollo por capas</h1>
        <p className="sub">Capas estables de propósito, transversales a cualquier proyecto. Las altas dependen de las bajas: no se optimiza escala ni se monetiza antes de tener producto y usuarios.</p>
        <div className="prog"><div className="progbar"><span style={{width:pct+'%'}}></span></div><div className="progtxt">{hechos} de {totalHitos} hitos · {pct}%</div></div>
      </header>
      <main className="dmain">
        {CAPAS.map(c=>{
          const [label,cls]=EST[c.estado]
          const done=c.hitos.filter(h=>h.done).length
          const open=abierta===c.id
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
        })}
        <p className="foot">Fuente del alcance: <b>MODELO.md</b> · Reglas y lecciones: <b>CONTEXTO.md</b>. Documento vivo — se actualiza al cerrar cada fase.</p>
      </main>
    </div>
  )
}
