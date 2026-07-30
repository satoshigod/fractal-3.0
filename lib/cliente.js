'use client'
import { supabase } from '@/lib/supabase'

export const RUTA_ROL = {
  admin: '/admin', operador: '/operador', asesor: '/asesor',
  dueno: '/dueno', co_propietario: '/co-propietario', huesped: '/huesped',
}

/** Sesión actual (o null). */
export async function sesion() {
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

/** fetch a una ruta API con el token de sesión. Devuelve JSON. */
export async function api(path, opts = {}) {
  const s = await sesion()
  const res = await fetch(path, {
    ...opts,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${s?.access_token || ''}`, ...(opts.headers || {}) },
  })
  return res.json()
}

/** Carga sesión + perfil; redirige a /plataforma si no hay sesión. */
export async function requerirSesion() {
  const s = await sesion()
  if (!s) { window.location.href = '/plataforma'; return null }
  const { data: perfil } = await supabase.from('perfiles').select('*').eq('id', s.user.id).maybeSingle()
  return { session: s, perfil }
}
