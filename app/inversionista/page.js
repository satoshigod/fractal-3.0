'use client'
import { useEffect, useState } from 'react'
import Nav from '@/components/Nav'
import { api, requerirSesion, RUTA_ROL } from '@/lib/cliente'
import { fmtCOP, cap } from '@/lib/format'

export default function Inversionista() {
  const [perfil, setPerfil] = useState(null); const [d, setD] = useState(null); const [loading, setLoading] = useState(true)
  useEffect(() => { (async () => {
    const s = await requerirSesion(); if (!s) return
    if (s.perfil?.rol !== 'inversionista' && s.perfil?.rol !== 'admin') { window.location.href = RUTA_ROL[s.perfil?.rol] || '/plataforma'; return }
    setPerfil(s.perfil); setD(await api('/api/inversionista')); setLoading(false)
  })() }, [])
  if (loading) return <div className="center">Cargando…</div>
  const { aportado = 0, repagado = 0, saldo = 0, movimientos = [] } = d
  return (<>
    <Nav perfil={perfil} />
    <main className="wrap">
      <h1>Mi inversión</h1><p className="lead">Tu capital aportado, los repagos recibidos y tu saldo pendiente.</p>
      <div className="stats">
        <div className="stat"><div className="k">Capital aportado</div><div className="v"><small>{fmtCOP(aportado)}</small></div></div>
        <div className="stat"><div className="k">Repagado</div><div className="v"><small>{fmtCOP(repagado)}</small></div></div>
        <div className="stat"><div className="k">Saldo pendiente</div><div className="v"><small>{fmtCOP(saldo)}</small></div></div>
        <div className="stat"><div className="k">Movimientos</div><div className="v">{movimientos.length}</div></div>
      </div>
      <div className="eyebrow">Movimientos</div>
      <div className="card"><table><thead><tr><th>Fecha</th><th>Concepto</th><th>Monto</th></tr></thead>
        <tbody>{movimientos.length ? movimientos.map(m => (
          <tr key={m.id}><td>{new Date(m.creado_en).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })}</td>
            <td>{cap(m.tipo)}</td>
            <td style={{ color: m.signo > 0 ? 'var(--ok)' : 'var(--cream)' }}>{m.signo > 0 ? '+ ' : '− '}{fmtCOP(m.monto)}</td></tr>
        )) : <tr><td colSpan={3} className="empty">Aún no hay aportes. El flujo de aporte de capital y repago es el siguiente módulo financiero.</td></tr>}</tbody>
      </table></div>
    </main>
  </>)
}
