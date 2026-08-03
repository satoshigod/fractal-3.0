'use client'
import { useEffect, useState } from 'react'
import Nav from '@/components/Nav'
import { api, requerirSesion, RUTA_ROL } from '@/lib/cliente'
import { fmtCOP, cap } from '@/lib/format'

export default function Dueno() {
  const [perfil, setPerfil] = useState(null); const [d, setD] = useState(null); const [loading, setLoading] = useState(true)
  useEffect(() => { (async () => {
    const s = await requerirSesion(); if (!s) return
    if (s.perfil?.rol !== 'dueno' && s.perfil?.rol !== 'admin') { window.location.href = RUTA_ROL[s.perfil?.rol] || '/plataforma'; return }
    setPerfil(s.perfil); setD(await api('/api/dueno')); setLoading(false)
  })() }, [])
  if (loading) return <div className="center">Cargando…</div>
  const { activos = [], fracciones = [] } = d
  const vendidas = fracciones.filter(f => f.estado === 'vendida').length
  return (<>
    <Nav perfil={perfil} />
    <main className="wrap">
      <h1>Mi propiedad en Origen</h1><p className="lead">La propiedad que incorporaste y tu curva de desapego.</p>
      <div className="stats">
        <div className="stat"><div className="k">Propiedades</div><div className="v">{activos.length}</div></div>
        <div className="stat"><div className="k">Fracciones</div><div className="v">{fracciones.length}</div></div>
        <div className="stat"><div className="k">Vendidas</div><div className="v">{vendidas}</div></div>
        <div className="stat"><div className="k">Disponibles</div><div className="v">{fracciones.length - vendidas}</div></div>
      </div>
      <div className="eyebrow">Mis propiedades incorporadas</div>
      <div className="card"><table><thead><tr><th>Nombre</th><th>Destino</th><th>Valor</th><th>Remodelación</th><th>Estado</th></tr></thead>
        <tbody>{activos.length ? activos.map(a => <tr key={a.id}><td>{a.nombre}</td><td>{a.destino || '—'}</td><td>{fmtCOP(a.valor_total)}</td><td>{fmtCOP(a.remodelacion)}</td><td><span className="pill gold">{cap(a.estado)}</span></td></tr>) : <tr><td colSpan={5} className="empty">Sin propiedades.</td></tr>}</tbody></table></div>
      <div className="eyebrow">Curva de desapego (fracciones)</div>
      <div className="card"><table><thead><tr><th>Slot</th><th>Tipo</th><th>%</th><th>Precio</th><th>Estado</th></tr></thead>
        <tbody>{fracciones.length ? fracciones.map(f => <tr key={f.id}><td>{f.slot}</td><td>{cap(f.tipo)}</td><td>{(f.pct * 100).toFixed(2)}%</td><td>{fmtCOP(f.precio)}</td><td><span className={'pill ' + (f.estado === 'vendida' ? 'ok' : '')}>{cap(f.estado)}</span></td></tr>) : <tr><td colSpan={5} className="empty">Sin fracciones.</td></tr>}</tbody></table></div>
      {!activos.length && <div className="banner">Aún no tienes una propiedad incorporada. Empieza por el cotizador de Origen.</div>}
    </main>
  </>)
}
