import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ympllswqaysgheokuber.supabase.co'
const supabaseKey = 'sb_publishable_lkbxitbteqgK_WcE2yitOg_LUYRJNbI'

export const supabase = createClient(supabaseUrl, supabaseKey)