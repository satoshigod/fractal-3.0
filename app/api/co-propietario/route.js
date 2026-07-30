import { supabaseAdmin as supabase } from '@/lib/supabase-admin'
import { exigirRol } from '@/lib/auth'

// Datos del panel del co-propietario: fracciones, puntos, calendario, reservas, rentas.
export async function GET(req) {
  const g = await exigirRol(req, ['co_propietario', 'admin'])
  if (!g.ok) return Response.json({ error: g.error }, { status: g.status })
  const uid = g.user.id

  const [frRes, ptRes, renRes] = await Promise.all([
    supabase.from('fracciones').select('*, activo:activos(id,nombre,destino)').eq('co_propietario_id', uid),
    supabase.from('puntos_mov').select('puntos, anio').eq('co_propietario_id', uid),
    supabase.from('rentas').select('*').eq('co_propietario_id', uid),
  ])
  const fracciones = frRes.data || []
  let calendario = [], reservas = []
  const activoId = fracciones[0]?.activo?.id
  if (activoId) {
    const [c, r] = await Promise.all([
      supabase.from('calendario_dias').select('*').eq('activo_id', activoId).order('fecha'),
      supabase.from('reservas').select('*').eq('co_propietario_id', uid),
    ])
    calendario = c.data || []; reservas = r.data || []
  }
  return Response.json({ fracciones, puntos: ptRes.data || [], rentas: renRes.data || [], calendario, reservas })
}
