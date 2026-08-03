// Autorización centralizada. La fuente de verdad del rol es perfiles.rol.
import { supabaseAdmin } from '@/lib/supabase-admin'

/**
 * Resuelve el usuario y su perfil desde el header Authorization (Bearer token).
 * Evita repetir el bloque de auth en cada ruta.
 * @returns {Promise<{ user: object|null, perfil: object|null }>}
 */
export async function usuarioDesdeRequest(req) {
  const header = req.headers.get('authorization')
  if (!header) return { user: null, perfil: null }
  try {
    const token = header.replace('Bearer ', '')
    const { data: { user } } = await supabaseAdmin.auth.getUser(token)
    if (!user) return { user: null, perfil: null }
    const { data: perfil } = await supabaseAdmin
      .from('perfiles').select('*').eq('id', user.id).maybeSingle()
    return { user, perfil: perfil || null }
  } catch {
    return { user: null, perfil: null }
  }
}

/** Exige un usuario autenticado con uno de los roles dados. */
export async function exigirRol(req, roles) {
  const { user, perfil } = await usuarioDesdeRequest(req)
  if (!user) return { ok: false, status: 401, error: 'No autenticado', user, perfil }
  if (roles && roles.length && !roles.includes(perfil?.rol)) {
    return { ok: false, status: 403, error: 'Rol no autorizado', user, perfil }
  }
  return { ok: true, user, perfil }
}
