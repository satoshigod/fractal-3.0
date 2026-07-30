'use client'
import { useEffect, useState } from 'react'
import Nav from '@/components/Nav'
import { api, requerirSesion, RUTA_ROL } from '@/lib/cliente'
import { fmtCOP, fecha, cap } from '@/lib/format'

export default function Operador() {
  const [perfil, setPerfil] = useState(null); const [d, setD] = useState(null); const [loading, setLoading] = useState(true)
  useEffect(() => { (async () => {
    const s = await requerirSesion(); if (!s) return
    if (s.perfil?.rol !== 'operador' && s.perfil?.rol !== 'admin') { window.location.href = RUTA_ROL[s.perfil?.rol] || '/plataforma'; return }
    setPerfil(s.perfil); setD(await api('/api/operador')); setLoading(false)
  })() }, [])
  if (loading) return <div className="center">Cargando…</div>
  const { activos = [], rentas = [], cedidos = [] } = d
  const comision = rentas.reduce((a, r) => a + Number(r.comision_operador), 0)
  return (<>
    <Nav perfil={perfil} />
    <main className="wrap">
      <h1>Operación</h1><p className="lead">Los activos que operas, los días cedidos y las rentas.</p>
      <div className="stats">
        <div className="stat"><div className="k">Activos operados</div><div className="v">{activos.length}</div></div>
        <div className="stat"><div className="k">Días cedidos</div><div className="v">{cedidos.length}</div></div>
        <div className="stat"><div className="k">Rentas</div><div className="v">{rentas.length}</div></div>
        <div className="stat"><div className="k">Comisión</div><div className="v"><small>{fmtCOP(comision)}</small></div></div>
      </div>
      <div className="eyebrow">Activos que operas</div>
      <div className="card"><table><thead><tr><th>Nombre</th><th>Vertical</th><th>Destino</th><th>Estado</th></tr></thead>
        <tbody>{activos.length ? activos.map(a => <tr key={a.id}><td>{a.nombre}</td><td>{cap(a.vertical)}</td><td>{a.destino || '—'}</td><td><span className="pill gold">{cap(a.estado)}</span></td></tr>) : <tr><td colSpan={4} className="empty">Sin activos.</td></tr>}</tbody></table></div>
      <div className="eyebrow">Días cedidos para rentar</div>
      <div className="card"><table><thead><tr><th>Activo</th><th>Fecha</th><th>Estado</th></tr></thead>
        <tbody>{cedidos.length ? cedidos.map(c => <tr key={c.id}><td>{c.activo?.nombre || '—'}</td><td>{fecha(c.fecha)}</td><td><span className="pill warn">Cedido</span></td></tr>) : <tr><td colSpan={3} className="empty">Sin días cedidos.</td></tr>}</tbody></table></div>
      <div className="eyebrow">Rentas</div>
      <div className="card"><table><thead><tr><th>Activo</th><th>Fecha</th><th>Huésped</th><th>Renta</th><th>Comisión</th><th>Estado</th></tr></thead>
        <tbody>{rentas.length ? rentas.map(r => <tr key={r.id}><td>{r.activo?.nombre || '—'}</td><td>{fecha(r.fecha)}</td><td>{r.huesped_nombre || '—'}</td><td>{fmtCOP(r.monto)}</td><td>{fmtCOP(r.comision_operador)}</td><td><span className="pill ok">{cap(r.estado)}</span></td></tr>) : <tr><td colSpan={6} className="empty">Sin rentas.</td></tr>}</tbody></table></div>
    </main>
  </>)
}
