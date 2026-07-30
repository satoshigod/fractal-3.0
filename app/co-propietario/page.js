'use client'
import { useEffect, useState } from 'react'
import Nav from '@/components/Nav'
import { api, requerirSesion, RUTA_ROL } from '@/lib/cliente'
import { fmtCOP, fecha, cap } from '@/lib/format'
import { puntosNoche } from '@/lib/dominio/puntos'

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

export default function CoPropietario() {
  const [perfil, setPerfil] = useState(null)
  const [d, setD] = useState(null)
  const [loading, setLoading] = useState(true)
  const [mes, setMes] = useState(new Date().getFullYear() === 2026 ? new Date().getMonth() : 0)

  async function cargar() {
    const s = await requerirSesion(); if (!s) return
    if (s.perfil && s.perfil.rol !== 'co_propietario' && s.perfil.rol !== 'admin') {
      window.location.href = RUTA_ROL[s.perfil.rol] || '/plataforma'; return
    }
    setPerfil(s.perfil)
    const data = await api('/api/co-propietario')
    setD(data); setLoading(false)
  }
  useEffect(() => { cargar() }, [])

  if (loading) return <div className="center">Cargando…</div>
  const fr = d.fracciones || [], rentas = d.rentas || [], puntos = d.puntos || []
  const saldo = puntos.filter(p => p.anio === 2026).reduce((a, p) => a + Number(p.puntos), 0)
  const ingreso = rentas.filter(r => r.estado === 'confirmada').reduce((a, r) => a + Number(r.ingreso_copropietario), 0)
  const costoMes = fr.reduce((a, f) => a + Number(f.costo_mensual), 0)
  const activoId = fr[0]?.activo?.id
  const misSlots = fr.map(f => f.slot)
  const resMap = Object.fromEntries((d.reservas || []).map(r => [r.fecha, r.estado]))

  async function accionDia(ds, estadoActual, esWeekend) {
    if (estadoActual === 'reservado' || estadoActual === 'cedido') {
      if (!confirm(`¿Liberar el ${ds} (${estadoActual})?`)) return
      await api(`/api/reservas?activo_id=${activoId}&fecha=${ds}`, { method: 'DELETE' })
      return cargar()
    }
    const op = prompt(`Día ${ds}. Escribe "reservar" (gastas ${esWeekend ? '1.68' : '1.00'} pts) o "ceder" (al operador para rentar).`)
    if (!op) return
    const estado = op.toLowerCase().startsWith('c') ? 'cedido' : 'reservado'
    const r = await api('/api/reservas', { method: 'POST', body: JSON.stringify({ activo_id: activoId, fecha: ds, estado }) })
    if (r.error) { alert('No se pudo: ' + r.error); return }
    cargar()
  }

  return (<>
    <Nav perfil={perfil} />
    <main className="wrap">
      <h1>Mi copropiedad</h1>
      <p className="lead">Tus fracciones, tus puntos, tu calendario y tus ingresos por días cedidos.</p>
      <div className="stats">
        <div className="stat"><div className="k">Fracciones</div><div className="v">{fr.length}</div></div>
        <div className="stat"><div className="k">Puntos 2026</div><div className="v">{saldo.toFixed(0)}</div></div>
        <div className="stat"><div className="k">Costo mensual</div><div className="v"><small>{fmtCOP(costoMes)}</small></div></div>
        <div className="stat"><div className="k">Ingreso cedido</div><div className="v"><small>{fmtCOP(ingreso)}</small></div></div>
      </div>

      <div className="eyebrow">Mis fracciones</div>
      <div className="grid">
        {fr.map(f => (
          <div className="tile" key={f.id}>
            <h3>{f.slot} · {f.activo?.nombre}</h3>
            <div className="rowl"><span className="s">Tipo</span><span>{cap(f.tipo)}</span></div>
            <div className="rowl"><span className="s">Participación</span><span>{(f.pct * 100).toFixed(2)}%</span></div>
            <div className="rowl"><span className="s">Días/año</span><span>{f.dias_anio}</span></div>
            <div className="rowl"><span className="s">Costo mensual</span><span>{fmtCOP(f.costo_mensual)}</span></div>
          </div>
        ))}
      </div>
      {!fr.length && <div className="banner">Aún no tienes fracciones asignadas.</div>}

      <div className="eyebrow">Mi calendario 2026</div>
      {activoId
        ? <Calendario dias={d.calendario} misSlots={misSlots} resMap={resMap} mes={mes} setMes={setMes} accionDia={accionDia} />
        : <div className="empty">Sin calendario (aún no tienes fracciones).</div>}

      <div className="eyebrow">Ingresos por días cedidos</div>
      <div className="card"><table>
        <thead><tr><th>Fecha</th><th>Huésped</th><th>Renta</th><th>Comisión op.</th><th>Tu ingreso</th><th>Estado</th></tr></thead>
        <tbody>{rentas.length ? rentas.map(r => (
          <tr key={r.id}><td>{fecha(r.fecha)}</td><td>{r.huesped_nombre || '—'}</td><td>{fmtCOP(r.monto)}</td>
            <td>{fmtCOP(r.comision_operador)}</td><td>{fmtCOP(r.ingreso_copropietario)}</td>
            <td><span className="pill ok">{cap(r.estado)}</span></td></tr>
        )) : <tr><td colSpan={6} className="empty">Sin ingresos aún.</td></tr>}</tbody>
      </table></div>
    </main>
  </>)
}

function Calendario({ dias, misSlots, resMap, mes, setMes, accionDia }) {
  const y = 2026
  const byDate = Object.fromEntries(dias.map(x => [x.fecha, x]))
  const first = new Date(y, mes, 1).getDay()
  const total = new Date(y, mes + 1, 0).getDate()
  const celdas = []
  for (let i = 0; i < first; i++) celdas.push(<div key={'e' + i}></div>)
  for (let dd = 1; dd <= total; dd++) {
    const ds = `${y}-${String(mes + 1).padStart(2, '0')}-${String(dd).padStart(2, '0')}`
    const cd = byDate[ds]
    if (!cd) { celdas.push(<div className="day other" key={ds}>{dd}</div>); continue }
    const mine = misSlots.includes(cd.slot)
    const st = resMap[ds]
    const cls = 'day' + (mine ? ' mine' : ' other') + (cd.es_especial ? ' sp' : '') + (st === 'reservado' ? ' res' : '') + (st === 'cedido' ? ' ced' : '')
    celdas.push(
      <div className={cls} key={ds} onClick={mine ? () => accionDia(ds, st, cd.es_weekend) : undefined}>
        {dd}<span className="slot">{cd.slot}</span>
      </div>
    )
  }
  return (<div>
    <div className="calhead">
      <button className="btn sm" onClick={() => setMes((mes + 11) % 12)}>‹</button>
      <div className="mon">{MESES[mes]} {y}</div>
      <button className="btn sm" onClick={() => setMes((mes + 1) % 12)}>›</button>
    </div>
    <div className="cal">
      {['D','L','M','M','J','V','S'].map((x, i) => <div className="dow" key={i}>{x}</div>)}
      {celdas}
    </div>
    <div className="callegend">
      <span><i style={{ borderColor: 'var(--gold)' }}></i>Mis días</span>
      <span><i style={{ background: 'rgba(90,138,106,.4)', borderColor: 'var(--ok)' }}></i>Reservado</span>
      <span><i style={{ background: 'rgba(201,162,74,.4)', borderColor: 'var(--warn)' }}></i>Cedido</span>
      <span>★ fecha especial</span>
    </div>
  </div>)
}
