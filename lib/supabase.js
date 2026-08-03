import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pzlfzmpqwscimuxuoucq.supabase.co'
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_gHqKk0y8w6AKKZj9h0joqQ_xC0XPRvD'

export const supabase = createClient(url, key)
