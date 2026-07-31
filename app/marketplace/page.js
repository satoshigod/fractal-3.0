'use client'
import { useEffect, useState } from 'react'
import Nav from '@/components/Nav'
import { supabase } from '@/lib/supabase'
import { api, requerirSesion } from '@/lib/cliente'
import { fmtCOP, cap } from '@/lib/format'

export default function Marketplace() {
  const [perfil, setPerfil] = useState(null)
  const [props, setProps] = useState([])
  const [loading, setLoading] = useState(true)
  const [abierta, setAbierta] = useState(null)
  const [comprando, setComprando] = useState(null)

  async function cargar() { const d = await api('/api/marketplace'); setProps(d.propiedades || []) }
  useEffect(() => { (async () => {
    const s = await requerirSesion(); if (!s) return
    setPerfil(s.perfil); await cargar(); setLoading(false)
  })() }, [])

  async function invertir(fr, nombre) {
    if (!confirm(`¿Invertir en la fracción ${fr.slot} de ${nombre} por ${fmtCOP(fr.precio)}?`)) return
    setComprando(fr.id)
    const { error } = await supabase.rpc('comprar_fraccion', { p_fraccion: fr.id })
    setComprando(null)
    if (error) { alert('No se pudo completar: ' + error.message); return }
    alert('¡Listo! Tu fracción quedó registrada. La verás en "Mi copropiedad".')
    window.location.href = '/co-propietario'
  }

  if (loading) return <div className="center">Cargando…</div>
  return (<>
    <Nav perfil={perfil} />
    <main className="wrap">
      <h1>Marketplace</h1>
      <p className="lead">Propiedades disponibles para invertir. Compra una fracción y conviértete en co-propietario.</p>
      <div className="grid">
        {props.map(p => {
          const open = abierta === p.id
          return (
            <div className="tile" key={p.id} style={{ gridColumn: open ? '1 / -1' : 'auto' }}>
              <h3>{p.nombre}</h3>
              <div className="rowl" style={{ borderTop: 'none' }}><span className="s">Destino</span><span>{p.destino}</span></div>
              <div className="rowl"><span className="s">Valor total</span><span>{fmtCOP(p.valor_total)}</span></div>
              <div className="rowl"><span className="s">Fracciones libres</span><span>{p.fracciones.length} de 8</span></div>
              <div className="rowl"><span className="s">Desde</span><span>{fmtCOP(p.desde)}</span></div>
              <div style={{ marginTop: 12 }}>
                <button className="btn sm" onClick={() => setAbierta(open ? null : p.id)}>{open ? 'Ocultar fracciones' : 'Ver fracciones e invertir'}</button>
              </div>
              {open && <div style={{ marginTop: 14 }}><table>
                <thead><tr><th>Fracción</th><th>Tipo</th><th>Días/año</th><th>Precio</th><th>Cuota/mes</th><th></th></tr></thead>
                <tbody>{p.fracciones.map(f => (
                  <tr key={f.id}><td>{f.slot}</td><td>{cap(f.tipo)}</td><td>{f.dias_anio}</td><td>{fmtCOP(f.precio)}</td><td>{fmtCOP(f.costo_mensual)}</td>
                    <td><button className="btn sm primary" disabled={comprando === f.id} onClick={() => invertir(f, p.nombre)}>{comprando === f.id ? '...' : 'Invertir'}</button></td></tr>
                ))}</tbody></table></div>}
            </div>
          )
        })}
      </div>
      {!props.length && <div className="empty">No hay propiedades disponibles por ahora.</div>}
    </main>
  </>)
}
