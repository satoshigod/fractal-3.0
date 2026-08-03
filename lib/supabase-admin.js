// Cliente de Supabase para el servidor (service role). IGNORA RLS.
// Solo se importa desde rutas API / servidor. Para el navegador está lib/supabase.js.
import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pzlfzmpqwscimuxuoucq.supabase.co'
const key = process.env.SUPABASE_SECRET_KEY || 'placeholder-build-only'

export const supabaseAdmin = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
export const supabase = supabaseAdmin
export default supabaseAdmin
