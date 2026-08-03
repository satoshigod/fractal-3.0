'use client'
import { useEffect, useState } from 'react'
import Nav from '@/components/Nav'
import { api, requerirSesion } from '@/lib/cliente'
import { fmtCOP } from '@/lib/format'

export default function Marketplace() {
  const [perfil, setPerfil] = useState(null)
  const [props, setProps] = useState([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  useEffect(() => { (async () => {
    const s = await requerirSesion(); if (!s) return
    setPerfil(s.perfil); const d = await api('/api/marketplace'); setProps(d.propiedades || []); setLoading(false)
  })() }, [])
  if (loading) return <div className="center">Cargando…</div>
  const filtradas = props.filter(p => !q || (p.nombre + ' ' + p.destino).toLowerCase().includes(q.toLowerCase()))
  return (<>
    <Nav perfil={perfil} />
    <main className="wrap">
      <h1>Marketplace</h1>
      <p className="lead">Propiedades premium en copropiedad. Compra una fracción, úsala y renta los días que no uses.</p>
      <input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar por destino…" style={{ maxWidth: 320, marginBottom: 22 }} />
      <div className="mkgrid">
        {filtradas.map(p => (
          <a className="mkcard" key={p.id} href={`/marketplace/${p.id}`}>
            <div className="mkimg" style={{ backgroundImage: `url(${p.imagenes?.[0] || '/images/finca-hero.jpg'})` }}>
              {p.apreciacion_anual && <span className="mkbadge">▲ {p.apreciacion_anual}%/año</span>}
            </div>
            <div className="mkbody">
              <div className="mkname">{p.nombre}</div>
              <div className="mkdest">{p.destino}</div>
              <div className="mkfacts">{p.m2} m² · {p.habitaciones} hab · {p.banos} baños</div>
              <div className="mkfoot">
                <div><div className="mkdesde">Desde</div><div className="mkprice">{fmtCOP(p.desde)}</div></div>
                <div className="mklibres">{p.libres}/8 libres</div>
              </div>
            </div>
          </a>
        ))}
      </div>
      {!filtradas.length && <div className="empty">No hay propiedades que coincidan.</div>}
    </main>
  </>)
}
