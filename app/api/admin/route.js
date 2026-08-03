import { supabaseAdmin as supabase } from '@/lib/supabase-admin'
import { exigirRol } from '@/lib/auth'

export async function GET(req) {
  const g = await exigirRol(req, ['admin'])
  if (!g.ok) return Response.json({ error: g.error }, { status: g.status })
  const [activos, fracciones, perfiles, solicitudes, cotizaciones] = await Promise.all([
    supabase.from('activos').select('*'),
    supabase.from('fracciones').select('*, activo:activos(nombre)'),
    supabase.from('perfiles').select('*'),
    supabase.from('solicitudes').select('*').order('creada_en', { ascending: false }),
    supabase.from('cotizaciones').select('*').order('creada_en', { ascending: false }),
  ])
  return Response.json({
    activos: activos.data || [], fracciones: fracciones.data || [], perfiles: perfiles.data || [],
    solicitudes: solicitudes.data || [], cotizaciones: cotizaciones.data || [],
  })
}
