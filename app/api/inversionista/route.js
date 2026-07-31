import { supabaseAdmin as supabase } from '@/lib/supabase-admin'
import { exigirRol } from '@/lib/auth'

export async function GET(req) {
  const g = await exigirRol(req, ['inversionista', 'admin'])
  if (!g.ok) return Response.json({ error: g.error }, { status: g.status })
  const { data: cta } = await supabase.from('cuentas').select('id').eq('perfil_id', g.user.id).maybeSingle()
  let movimientos = [], aportado = 0, repagado = 0
  if (cta?.id) {
    const { data: mv } = await supabase.from('movimientos').select('*')
      .or(`cuenta_origen.eq.${cta.id},cuenta_destino.eq.${cta.id}`).order('creado_en', { ascending: false })
    movimientos = (mv || []).map(m => ({ ...m, signo: m.cuenta_destino === cta.id ? 1 : -1 }))
    aportado = movimientos.filter(m => m.tipo === 'aporte_capital' && m.signo < 0).reduce((a, m) => a + Number(m.monto), 0)
    repagado = movimientos.filter(m => m.tipo === 'repago_inversionista' && m.signo > 0).reduce((a, m) => a + Number(m.monto), 0)
  }
  return Response.json({ aportado, repagado, saldo: aportado - repagado, movimientos })
}
