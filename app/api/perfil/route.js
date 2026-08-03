import { usuarioDesdeRequest } from '@/lib/auth'

export async function GET(req) {
  const { user, perfil } = await usuarioDesdeRequest(req)
  if (!user) return Response.json({ error: 'No autenticado' }, { status: 401 })
  return Response.json({ perfil })
}
