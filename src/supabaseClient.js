import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://lnvkedxilfkswxefzupp.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxudmtlZHhpbGZrc3d4ZWZ6dXBwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwODc2NTgsImV4cCI6MjA5MzY2MzY1OH0.NXNZyjzf2RUkwhABn02E7UVl8yygKPHH4EG9x9YZ0u4'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)