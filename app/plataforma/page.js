'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { RUTA_ROL } from '@/lib/cliente'

export default function Plataforma() {
  const [modo, setModo] = useState('login')     // 'login' | 'registro'
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [msg, setMsg] = useState(null)          // { tipo, texto }
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => { if (session) irAPanel(session.user.id) })
  }, [])

  async function irAPanel(uid) {
    const { data } = await supabase.from('perfiles').select('rol').eq('id', uid).maybeSingle()
    window.location.href = RUTA_ROL[data?.rol] || '/co-propietario'
  }

  function traducir(m) {
    if (/Invalid login/i.test(m)) return 'Correo o contraseña incorrectos.'
    if (/already registered|already been registered/i.test(m)) return 'Ese correo ya tiene cuenta. Inicia sesión.'
    if (/at least 6|password should be/i.test(m)) return 'La contraseña debe tener al menos 6 caracteres.'
    return m
  }

  async function enviar() {
    if (!email || !pass || (modo === 'registro' && !nombre)) {
      setMsg({ tipo: 'err', texto: 'Completa todos los campos.' }); return
    }
    setBusy(true); setMsg(null)
    try {
      if (modo === 'registro') {
        const { data, error } = await supabase.auth.signUp({ email, password: pass, options: { data: { nombre } } })
        if (error) throw error
        if (data.session) { await irAPanel(data.user.id) }
        else {
          setMsg({ tipo: 'ok', texto: 'Cuenta creada. Revisa tu correo para confirmarla y luego inicia sesión.' })
          setModo('login')
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass })
        if (error) throw error
        await irAPanel(data.user.id)
      }
    } catch (e) {
      setMsg({ tipo: 'err', texto: traducir(e.message) })
    } finally { setBusy(false) }
  }

  const registro = modo === 'registro'
  return (
    <div className="login"><div className="card">
      <span className="brand">VIVE <b>FRACTAL</b></span>
      <div className="sub">{registro ? 'Crear cuenta' : 'Iniciar sesión'}</div>

      {registro && (<>
        <label>Nombre</label>
        <input value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Tu nombre" autoComplete="name" />
      </>)}
      <label>Correo</label>
      <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@correo.com" autoComplete="email" />
      <label>Contraseña</label>
      <input type="password" value={pass} onChange={e => setPass(e.target.value)} placeholder="••••••••"
        autoComplete={registro ? 'new-password' : 'current-password'} onKeyDown={e => e.key === 'Enter' && enviar()} />

      <button className="btn primary" onClick={enviar} disabled={busy}>{busy ? '...' : (registro ? 'Crear cuenta' : 'Entrar')}</button>
      {msg && <div className={'msg ' + msg.tipo}>{msg.texto}</div>}

      <div className="switch">
        {registro
          ? <>¿Ya tienes cuenta? <a onClick={() => { setModo('login'); setMsg(null) }}>Inicia sesión</a></>
          : <>¿Nuevo aquí? <a onClick={() => { setModo('registro'); setMsg(null) }}>Crear cuenta</a></>}
      </div>
    </div></div>
  )
}
