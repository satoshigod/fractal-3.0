import { supabaseAdmin as supabase } from '@/lib/supabase-admin'
import { exigirRol } from '@/lib/auth'

export async function GET(req) {
  const g = await exigirRol(req, ['dueno', 'admin'])
  if (!g.ok) return Response.json({ error: g.error }, { status: g.status })
  const { data: activos } = await supabase.from('activos').select('*').eq('dueno_id', g.user.id)
  const ids = (activos || []).map(a => a.id)
  let fracciones = []
  if (ids.length) {
    const { data } = await supabase.from('fracciones').select('*, activo:activos(nombre)').in('activo_id', ids)
    fracciones = data || []
  }
  return Response.json({ activos: activos || [], fracciones })
}
