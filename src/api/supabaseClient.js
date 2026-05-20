import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://wvfaxxyvfjgdxyeakdof.supabase.co'
const supabaseAnonKey = 'sb_publishable_5AJ_hVWTBdG0RsPbMHoFUg_y66hreFP'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
