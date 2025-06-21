import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/supabase'

// Create a single supabase client for browser usage
export const createClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://frdksqjaiuakkalebnzd.supabase.co'
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyZGtzcWphaXVha2thbGVibnpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkyNTE4NzgsImV4cCI6MjA2NDgyNzg3OH0.rwmLX3kTR9ZLJueBSwm8Q7qhnF4oCXtZUYb2komHqTA'
  
  if (!url || !key) {
    console.error('Missing Supabase environment variables')
    throw new Error('Supabase configuration error')
  }
  
  return createBrowserClient<Database>(url, key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  })
} 