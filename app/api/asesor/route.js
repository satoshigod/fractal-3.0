import { supabaseAdmin as supabase } from '@/lib/supabase-admin'
import { exigirRol } from '@/lib/auth'

export async function GET(req) {
  const g = await exigirRol(req, ['asesor', 'admin'])
  if (!g.ok) return Response.json({ error: g.error }, { status: g.status })
  const [solicitudes, cotizaciones] = await Promise.all([
    supabase.from('solicitudes').select('*').order('creada_en', { ascending: false }),
    supabase.from('cotizaciones').select('*').order('creada_en', { ascending: false }),
  ])
  return Response.json({ solicitudes: solicitudes.data || [], cotizaciones: cotizaciones.data || [] })
}
