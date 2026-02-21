import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Cambiamos el nombre de la variable de 'supabase' a 'supabaseClient'
export const supabaseClient = createClient(url, key)