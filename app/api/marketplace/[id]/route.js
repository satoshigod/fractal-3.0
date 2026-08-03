import { supabaseAdmin as supabase } from '@/lib/supabase-admin'
import { exigirRol } from '@/lib/auth'

export async function GET(req, { params }) {
  const g = await exigirRol(req, null)
  if (!g.ok) return Response.json({ error: g.error }, { status: g.status })
  const { id } = await params
  const { data: activo } = await supabase.from('activos').select('*').eq('id', id).maybeSingle()
  if (!activo) return Response.json({ error: 'Propiedad no encontrada' }, { status: 404 })
  const { data: fracciones } = await supabase.from('fracciones').select('*').eq('activo_id', id).order('slot')
  return Response.json({ activo, fracciones: fracciones || [] })
}
