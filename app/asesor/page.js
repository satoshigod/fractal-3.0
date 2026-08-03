'use client'
import { useEffect, useState } from 'react'
import Nav from '@/components/Nav'
import { api, requerirSesion, RUTA_ROL } from '@/lib/cliente'
import { cap } from '@/lib/format'

export default function Asesor() {
  const [perfil, setPerfil] = useState(null); const [d, setD] = useState(null); const [loading, setLoading] = useState(true)
  useEffect(() => { (async () => {
    const s = await requerirSesion(); if (!s) return
    if (s.perfil?.rol !== 'asesor' && s.perfil?.rol !== 'admin') { window.location.href = RUTA_ROL[s.perfil?.rol] || '/plataforma'; return }
    setPerfil(s.perfil); setD(await api('/api/asesor')); setLoading(false)
  })() }, [])
  if (loading) return <div className="center">Cargando…</div>
  const { solicitudes = [], cotizaciones = [] } = d
  const nuevas = solicitudes.filter(s => s.estado === 'nueva').length
  return (<>
    <Nav perfil={perfil} />
    <main className="wrap">
      <h1>Comercial</h1><p className="lead">Leads y cotizaciones para dar seguimiento.</p>
      <div className="stats">
        <div className="stat"><div className="k">Leads</div><div className="v">{solicitudes.length}</div></div>
        <div className="stat"><div className="k">Nuevos</div><div className="v">{nuevas}</div></div>
        <div className="stat"><div className="k">Cotizaciones</div><div className="v">{cotizaciones.length}</div></div>
        <div className="stat"><div className="k">Convertidos</div><div className="v">{solicitudes.filter(s => s.estado === 'convertida').length}</div></div>
      </div>
      <div className="eyebrow">Solicitudes</div>
      <div className="card"><table><thead><tr><th>Nombre</th><th>Contacto</th><th>Producto</th><th>Perfil</th><th>Origen</th><th>Estado</th></tr></thead>
        <tbody>{solicitudes.length ? solicitudes.map(s => <tr key={s.id}><td>{s.nombre}</td><td>{[s.email, s.telefono].filter(Boolean).join(' · ') || '—'}</td><td>{cap(s.producto || '—')}</td><td>{cap(s.perfil || '—')}</td><td>{s.origen || '—'}</td><td><span className="pill">{cap(s.estado)}</span></td></tr>) : <tr><td colSpan={6} className="empty">Sin leads.</td></tr>}</tbody></table></div>
      <div className="eyebrow">Cotizaciones</div>
      <div className="card"><table><thead><tr><th>Tipo</th><th>Nombre</th><th>Contacto</th></tr></thead>
        <tbody>{cotizaciones.length ? cotizaciones.map(c => <tr key={c.id}><td>{cap(c.tipo)}</td><td>{c.nombre || '—'}</td><td>{c.email || '—'}</td></tr>) : <tr><td colSpan={3} className="empty">Sin cotizaciones.</td></tr>}</tbody></table></div>
    </main>
  </>)
}
