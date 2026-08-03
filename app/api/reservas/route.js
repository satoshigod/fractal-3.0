import { supabaseAdmin as supabase } from '@/lib/supabase-admin'
import { exigirRol } from '@/lib/auth'
import { puntosNoche } from '@/lib/dominio/puntos'

// Reservar o ceder un día. El día debe pertenecer a un slot del usuario.
export async function POST(req) {
  const g = await exigirRol(req, ['co_propietario', 'admin'])
  if (!g.ok) return Response.json({ error: g.error }, { status: g.status })
  const { activo_id, fecha, estado } = await req.json()
  if (!activo_id || !fecha || !['reservado', 'cedido'].includes(estado))
    return Response.json({ error: 'Datos inválidos' }, { status: 400 })

  const { data: dia } = await supabase.from('calendario_dias')
    .select('slot, es_weekend').eq('activo_id', activo_id).eq('fecha', fecha).maybeSingle()
  if (!dia) return Response.json({ error: 'Ese día no existe en el calendario' }, { status: 404 })

  const { data: frac } = await supabase.from('fracciones')
    .select('slot').eq('activo_id', activo_id).eq('co_propietario_id', g.user.id)
  const misSlots = (frac || []).map(f => f.slot)
  if (!misSlots.includes(dia.slot))
    return Response.json({ error: 'Ese día no es de tus fracciones' }, { status: 403 })

  const pts = estado === 'reservado' ? puntosNoche(dia.es_weekend) : 0
  const { error } = await supabase.from('reservas')
    .insert({ activo_id, fecha, co_propietario_id: g.user.id, estado, puntos_gastados: pts })
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ ok: true, puntos_gastados: pts })
}

// Liberar un día reservado/cedido.
export async function DELETE(req) {
  const g = await exigirRol(req, ['co_propietario', 'admin'])
  if (!g.ok) return Response.json({ error: g.error }, { status: g.status })
  const { searchParams } = new URL(req.url)
  const activo_id = searchParams.get('activo_id'), fecha = searchParams.get('fecha')
  const { error } = await supabase.from('reservas').delete()
    .eq('activo_id', activo_id).eq('fecha', fecha).eq('co_propietario_id', g.user.id)
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ ok: true })
}
