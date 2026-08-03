'use client'
import { useEffect, useState } from 'react'
import Nav from '@/components/Nav'
import { supabase } from '@/lib/supabase'
import { requerirSesion, RUTA_ROL } from '@/lib/cliente'
import { cap } from '@/lib/format'

export default function Huesped() {
  const [perfil, setPerfil] = useState(null); const [activos, setActivos] = useState([]); const [loading, setLoading] = useState(true)
  useEffect(() => { (async () => {
    const s = await requerirSesion(); if (!s) return
    if (s.perfil?.rol !== 'huesped' && s.perfil?.rol !== 'admin') { window.location.href = RUTA_ROL[s.perfil?.rol] || '/plataforma'; return }
    setPerfil(s.perfil)
    const { data } = await supabase.from('activos').select('*').in('estado', ['disponible', 'operando'])
    setActivos(data || []); setLoading(false)
  })() }, [])
  if (loading) return <div className="center">Cargando…</div>
  return (<>
    <Nav perfil={perfil} />
    <main className="wrap">
      <h1>Estadías</h1><p className="lead">Explora destinos Fractal disponibles para reservar una estadía.</p>
      <div className="grid">
        {activos.map(a => (
          <div className="tile" key={a.id}>
            <h3>{a.nombre}</h3>
            <div className="rowl"><span className="s">Destino</span><span>{a.destino || '—'}</span></div>
            <div className="rowl"><span className="s">Tipo</span><span>{cap(a.vertical)}</span></div>
            <div style={{ marginTop: 12 }}><button className="btn sm primary" onClick={() => alert('Solicitud de estadía enviada (demo).')}>Consultar disponibilidad</button></div>
          </div>
        ))}
      </div>
      {!activos.length && <div className="empty">No hay destinos disponibles por ahora.</div>}
    </main>
  </>)
}
