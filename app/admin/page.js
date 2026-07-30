'use client'
import { useEffect, useState } from 'react'
import Nav from '@/components/Nav'
import { api, requerirSesion, RUTA_ROL } from '@/lib/cliente'
import { fmtCOP, cap, ROL_LABEL } from '@/lib/format'

export default function Admin() {
  const [perfil, setPerfil] = useState(null); const [d, setD] = useState(null); const [loading, setLoading] = useState(true)
  useEffect(() => { (async () => {
    const s = await requerirSesion(); if (!s) return
    if (s.perfil?.rol !== 'admin') { window.location.href = RUTA_ROL[s.perfil?.rol] || '/plataforma'; return }
    setPerfil(s.perfil); setD(await api('/api/admin')); setLoading(false)
  })() }, [])
  if (loading) return <div className="center">Cargando…</div>
  const { activos = [], fracciones = [], perfiles = [], solicitudes = [], cotizaciones = [] } = d
  return (<>
    <Nav perfil={perfil} />
    <main className="wrap">
      <h1>Administración</h1><p className="lead">Activos, fracciones, usuarios y pipeline comercial.</p>
      <div className="stats">
        <div className="stat"><div className="k">Activos</div><div className="v">{activos.length}</div></div>
        <div className="stat"><div className="k">Fracciones</div><div className="v">{fracciones.length}</div></div>
        <div className="stat"><div className="k">Usuarios</div><div className="v">{perfiles.length}</div></div>
        <div className="stat"><div className="k">Leads</div><div className="v">{solicitudes.length}</div></div>
      </div>
      <div className="eyebrow">Activos</div>
      <div className="card"><table><thead><tr><th>Nombre</th><th>Vertical</th><th>Destino</th><th>Valor</th><th>Estado</th></tr></thead>
        <tbody>{activos.map(a => <tr key={a.id}><td>{a.nombre}</td><td>{cap(a.vertical)}</td><td>{a.destino || '—'}</td><td>{fmtCOP(a.valor_total)}</td><td><span className="pill gold">{cap(a.estado)}</span></td></tr>)}</tbody></table></div>
      <div className="eyebrow">Fracciones</div>
      <div className="card"><table><thead><tr><th>Activo</th><th>Slot</th><th>Tipo</th><th>%</th><th>Precio</th><th>Estado</th></tr></thead>
        <tbody>{fracciones.map(f => <tr key={f.id}><td>{f.activo?.nombre || '—'}</td><td>{f.slot}</td><td>{cap(f.tipo)}</td><td>{(f.pct * 100).toFixed(2)}%</td><td>{fmtCOP(f.precio)}</td><td><span className={'pill ' + (f.estado === 'vendida' ? 'ok' : '')}>{cap(f.estado)}</span></td></tr>)}</tbody></table></div>
      <div className="eyebrow">Usuarios</div>
      <div className="card"><table><thead><tr><th>Nombre</th><th>Correo</th><th>Rol</th><th>KYC</th></tr></thead>
        <tbody>{perfiles.map(p => <tr key={p.id}><td>{p.nombre}</td><td>{p.email}</td><td><span className="pill gold">{ROL_LABEL[p.rol] || p.rol}</span></td><td>{cap(p.kyc_estado)}</td></tr>)}</tbody></table></div>
      <div className="eyebrow">Solicitudes</div>
      <div className="card"><table><thead><tr><th>Nombre</th><th>Producto</th><th>Perfil</th><th>Estado</th></tr></thead>
        <tbody>{solicitudes.length ? solicitudes.map(s => <tr key={s.id}><td>{s.nombre}</td><td>{cap(s.producto || '—')}</td><td>{cap(s.perfil || '—')}</td><td><span className="pill">{cap(s.estado)}</span></td></tr>) : <tr><td colSpan={4} className="empty">Sin leads.</td></tr>}</tbody></table></div>
    </main>
  </>)
}
