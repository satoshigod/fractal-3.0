import { supabaseAdmin as supabase } from '@/lib/supabase-admin'
import { exigirRol } from '@/lib/auth'

export async function GET(req) {
  const g = await exigirRol(req, ['operador', 'admin'])
  if (!g.ok) return Response.json({ error: g.error }, { status: g.status })
  const [activos, rentas, cedidos] = await Promise.all([
    supabase.from('activos').select('*').eq('operador_id', g.user.id),
    supabase.from('rentas').select('*, activo:activos(nombre)').order('fecha'),
    supabase.from('reservas').select('*, activo:activos(nombre)').eq('estado', 'cedido'),
  ])
  return Response.json({ activos: activos.data || [], rentas: rentas.data || [], cedidos: cedidos.data || [] })
}
