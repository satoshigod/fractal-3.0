'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Nav from '@/components/Nav'
import { supabase } from '@/lib/supabase'
import { api, requerirSesion } from '@/lib/cliente'
import { fmtCOP, cap } from '@/lib/format'

export default function Ficha() {
  const { id } = useParams()
  const [perfil, setPerfil] = useState(null)
  const [d, setD] = useState(null)
  const [loading, setLoading] = useState(true)
  const [img, setImg] = useState(0)
  const [comprando, setComprando] = useState(null)
  async function cargar() { const r = await api(`/api/marketplace/${id}`); setD(r) }
  useEffect(() => { (async () => {
    const s = await requerirSesion(); if (!s) return
    setPerfil(s.perfil); await cargar(); setLoading(false)
  })() }, [id])

  async function invertir(fr) {
    if (!confirm(`¿Invertir en la fracción ${fr.slot} por ${fmtCOP(fr.precio)}?\n\nEntrada (8%): ${fmtCOP(fr.precio * 0.08)}\nSaldo: ${fmtCOP(fr.precio * 0.92)}`)) return
    setComprando(fr.id)
    const { error } = await supabase.rpc('comprar_fraccion', { p_fraccion: fr.id })
    setComprando(null)
    if (error) { alert('No se pudo: ' + error.message); return }
    alert('¡Listo! Tu fracción quedó registrada. La verás en "Mi copropiedad".')
    window.location.href = '/co-propietario'
  }

  if (loading) return <div className="center">Cargando…</div>
  if (!d?.activo) return (<><Nav perfil={perfil} /><main className="wrap"><div className="empty">Propiedad no encontrada.</div></main></>)
  const a = d.activo, fr = d.fracciones || []
  const libres = fr.filter(f => f.estado === 'disponible')
  const desde = libres.length ? Math.min(...libres.map(f => Number(f.precio))) : 0
  const imgs = a.imagenes?.length ? a.imagenes : ['/images/finca-hero.jpg']
  const tarifa = t => t === 'weekend' ? 1200000 : 800000
  const ingreso = f => Math.round(f.dias_anio * 0.5 * tarifa(f.tipo))

  return (<>
    <Nav perfil={perfil} />
    <main className="wrap">
      <a href="/marketplace" style={{ color: 'var(--stone)', fontSize: 13 }}>← Volver al marketplace</a>
      <div className="fichahero" style={{ backgroundImage: `url(${imgs[img]})` }}>
        {a.apreciacion_anual && <span className="mkbadge">▲ {a.apreciacion_anual}%/año de valorización</span>}
      </div>
      {imgs.length > 1 && <div className="thumbs">{imgs.map((im, i) => <div key={i} className={'thumb' + (i === img ? ' on' : '')} style={{ backgroundImage: `url(${im})` }} onClick={() => setImg(i)} />)}</div>}

      <h1 style={{ marginTop: 18 }}>{a.nombre}</h1>
      <p className="lead" style={{ marginBottom: 8 }}>{a.destino}</p>
      <p style={{ color: 'var(--cream)', fontSize: 14, marginBottom: 22 }}>{a.descripcion}</p>

      <div className="facts">
        <div className="fact"><div className="fv">{a.m2}</div><div className="fk">m²</div></div>
        <div className="fact"><div className="fv">{a.habitaciones}</div><div className="fk">Habitaciones</div></div>
        <div className="fact"><div className="fv">{a.banos}</div><div className="fk">Baños</div></div>
        <div className="fact"><div className="fv">{a.parqueaderos}</div><div className="fk">Parqueaderos</div></div>
        <div className="fact"><div className="fv" style={{ color: 'var(--ok)' }}>{a.apreciacion_anual}%</div><div className="fk">Valorización/año</div></div>
      </div>

      <div className="props">
        <div className="prop"><b>Usa y renta.</b> Reservas tus días con puntos y cedes los que no uses — el operador los renta y te paga.</div>
        <div className="prop"><b>Propiedad real.</b> Copropiedad escriturada que se aprecia, no un timeshare.</div>
        <div className="prop"><b>Gestión profesional.</b> Mayordomo, servicios, seguros e impuestos — los 23 ítems, sin que muevas un dedo.</div>
      </div>

      {a.amenidades?.length > 0 && <>
        <div className="eyebrow">Amenidades</div>
        <div className="amen">{a.amenidades.map((x, i) => <span key={i} className="amenpill">{x}</span>)}</div>
      </>}

      <div className="eyebrow">Fracciones — desde {fmtCOP(desde)}</div>
      <div className="card"><table>
        <thead><tr><th>Fracción</th><th>Tipo</th><th>Días/año</th><th>Precio</th><th>Cuota/mes</th><th>Ingreso pot./año</th><th></th></tr></thead>
        <tbody>{fr.map(f => (
          <tr key={f.id} style={{ opacity: f.estado === 'disponible' ? 1 : 0.45 }}>
            <td>{f.slot}</td><td>{cap(f.tipo)}</td><td>{f.dias_anio}</td><td>{fmtCOP(f.precio)}</td><td>{fmtCOP(f.costo_mensual)}</td>
            <td style={{ color: 'var(--ok)' }}>~{fmtCOP(ingreso(f))}</td>
            <td>{f.estado === 'disponible'
              ? <button className="btn sm primary" disabled={comprando === f.id} onClick={() => invertir(f)}>{comprando === f.id ? '...' : 'Invertir'}</button>
              : <span className="pill">Vendida</span>}</td></tr>
        ))}</tbody>
      </table></div>

      <div className="eyebrow" style={{ marginTop: 24 }}>Financiación</div>
      <p style={{ fontSize: 13.5, color: 'var(--cream)' }}>Compra ahora, paga después: <b style={{ color: 'var(--gold-l)' }}>entrada del 8%</b> y el saldo con plan de pago. Ejemplo (fracción desde {fmtCOP(desde)}): entrada <b>{fmtCOP(desde * 0.08)}</b> + saldo <b>{fmtCOP(desde * 0.92)}</b>.</p>

      <div style={{ marginTop: 22, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <a className="btn primary" href={`https://wa.me/573005485019?text=${encodeURIComponent('Hola, quiero agendar una visita a ' + a.nombre)}`} target="_blank" rel="noreferrer">Agendar visita</a>
        <a className="btn" href="/marketplace">Ver otras propiedades</a>
      </div>
    </main>
  </>)
}
