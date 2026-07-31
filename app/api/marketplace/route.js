import { supabaseAdmin as supabase } from '@/lib/supabase-admin'
import { exigirRol } from '@/lib/auth'

// Propiedades disponibles para invertir + sus fracciones libres. Cualquier autenticado.
export async function GET(req) {
  const g = await exigirRol(req, null)
  if (!g.ok) return Response.json({ error: g.error }, { status: g.status })
  const { data: activos } = await supabase.from('activos').select('*')
    .in('estado', ['disponible', 'operando']).eq('vertical', 'finca').order('creado_en')
  const ids = (activos || []).map(a => a.id)
  let fr = []
  if (ids.length) {
    const { data } = await supabase.from('fracciones').select('*')
      .in('activo_id', ids).eq('estado', 'disponible').order('slot')
    fr = data || []
  }
  const propiedades = (activos || []).map(a => {
    const fracciones = fr.filter(f => f.activo_id === a.id)
    return { ...a, fracciones, desde: fracciones.length ? Math.min(...fracciones.map(f => Number(f.precio))) : 0 }
  }).filter(p => p.fracciones.length > 0)
  return Response.json({ propiedades })
}
