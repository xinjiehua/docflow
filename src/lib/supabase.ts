import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://usdjzfnorulfedmtzupf.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVzZGp6Zm5vcnVsZmVkbXR6dXBmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM1NTU3NjIsImV4cCI6MjA5OTEzMTc2Mn0.ZLCXyY7pV9QMX4ZYbqiVM-Qvyv2wfvP-LhYM9IHIeZ0'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Admin client with service_role key for privileged operations (e.g. reset user password)
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVzZGp6Zm5vcnVsZmVkbXR6dXBmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MzU1NTc2MiwiZXhwIjoyMDk5MTMxNzYyfQ.U0FISodGGme47fD-PeNP2GBb-YHRBP26Co1S3q4JiC8'
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey)
