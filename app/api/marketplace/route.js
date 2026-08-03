import { supabaseAdmin as supabase } from '@/lib/supabase-admin'
import { exigirRol } from '@/lib/auth'

export async function GET(req) {
  const g = await exigirRol(req, null)
  if (!g.ok) return Response.json({ error: g.error }, { status: g.status })
  const { data: activos } = await supabase.from('activos')
    .select('id,nombre,vertical,destino,valor_total,m2,habitaciones,banos,amenidades,imagenes,apreciacion_anual,estado')
    .in('estado', ['disponible', 'operando']).eq('vertical', 'finca').order('creado_en')
  const ids = (activos || []).map(a => a.id)
  let fr = []
  if (ids.length) {
    const { data } = await supabase.from('fracciones').select('activo_id,precio,estado').in('activo_id', ids)
    fr = data || []
  }
  const propiedades = (activos || []).map(a => {
    const todas = fr.filter(f => f.activo_id === a.id)
    const libres = todas.filter(f => f.estado === 'disponible')
    return { ...a, libres: libres.length, total: todas.length, desde: libres.length ? Math.min(...libres.map(f => Number(f.precio))) : 0 }
  }).filter(p => p.libres > 0)
  return Response.json({ propiedades })
}
