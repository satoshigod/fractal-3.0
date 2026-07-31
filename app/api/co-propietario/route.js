import { supabaseAdmin as supabase } from '@/lib/supabase-admin'
import { exigirRol } from '@/lib/auth'

// Datos del panel del co-propietario: fracciones, puntos, calendario, reservas, rentas,
// y su estado de cuenta financiero (cargos + ledger + saldo).
export async function GET(req) {
  const g = await exigirRol(req, ['co_propietario', 'admin'])
  if (!g.ok) return Response.json({ error: g.error }, { status: g.status })
  const uid = g.user.id

  const [frRes, ptRes, renRes, cargosRes, ctaRes] = await Promise.all([
    supabase.from('fracciones').select('*, activo:activos(id,nombre,destino)').eq('co_propietario_id', uid),
    supabase.from('puntos_mov').select('puntos, anio').eq('co_propietario_id', uid),
    supabase.from('rentas').select('*').eq('co_propietario_id', uid),
    supabase.from('cargos').select('*, activo:activos(nombre)').eq('co_propietario_id', uid).order('periodo', { ascending: false }),
    supabase.from('cuentas').select('id').eq('perfil_id', uid).maybeSingle(),
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

  // Ledger del co-propietario (movimientos donde su cuenta es origen o destino)
  let movimientos = [], saldo = 0
  const ctaId = ctaRes.data?.id
  if (ctaId) {
    const { data: mv } = await supabase.from('movimientos').select('*')
      .or(`cuenta_origen.eq.${ctaId},cuenta_destino.eq.${ctaId}`).order('creado_en', { ascending: false })
    movimientos = (mv || []).map(m => ({ ...m, signo: m.cuenta_destino === ctaId ? 1 : -1 }))
    saldo = movimientos.reduce((a, m) => a + m.signo * Number(m.monto), 0)
  }

  return Response.json({
    fracciones, puntos: ptRes.data || [], rentas: renRes.data || [], calendario, reservas,
    cargos: cargosRes.data || [], movimientos, saldo,
  })
}
