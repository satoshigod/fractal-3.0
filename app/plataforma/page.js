'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { RUTA_ROL } from '@/lib/cliente'

const CUENTAS = [
  ['Administrador', 'admin@vivefractal.com', 'ViveFractal#Admin1'],
  ['Operador', 'operador@vivefractal.com', 'Fractal#Operador1'],
  ['Asesor', 'asesor@vivefractal.com', 'Fractal#Asesor1'],
  ['Dueño (Origen)', 'dueno@vivefractal.com', 'Fractal#Dueno1'],
  ['Co-propietario', 'inversionista.demo@vivefractal.com', 'ViveFractal#Demo1'],
  ['Huésped', 'huesped@vivefractal.com', 'Fractal#Huesped1'],
]

export default function Plataforma() {
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => { if (session) irAPanel(session.user.id) })
  }, [])

  async function irAPanel(uid) {
    const { data } = await supabase.from('perfiles').select('rol').eq('id', uid).maybeSingle()
    window.location.href = RUTA_ROL[data?.rol] || '/co-propietario'
  }

  async function entrar() {
    if (!email || !pass) { setMsg('Escribe correo y contraseña.'); return }
    setBusy(true)
    const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass })
    setBusy(false)
    if (error) { setMsg(/Invalid login/i.test(error.message) ? 'Correo o contraseña incorrectos.' : error.message); return }
    await irAPanel(data.user.id)
  }

  return (
    <div className="login"><div className="card">
      <span className="brand">VIVE <b>FRACTAL</b></span>
      <div className="sub">Plataforma</div>
      <label>Correo</label>
      <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@correo.com" />
      <label>Contraseña</label>
      <input type="password" value={pass} onChange={e => setPass(e.target.value)} placeholder="••••••••"
        onKeyDown={e => e.key === 'Enter' && entrar()} />
      <button className="btn primary" onClick={entrar} disabled={busy}>{busy ? '...' : 'Entrar'}</button>
      {msg && <div className="msg err">{msg}</div>}
      <div className="demo">
        <b>Cuentas demo</b> (clic para autocompletar) · un login por tipo de usuario:
        {CUENTAS.map(([n, e, p]) => (
          <div className="row" key={e} onClick={() => { setEmail(e); setPass(p) }}>
            <span>{n}</span><span>{e.split('@')[0]}@…</span>
          </div>
        ))}
      </div>
    </div></div>
  )
}
