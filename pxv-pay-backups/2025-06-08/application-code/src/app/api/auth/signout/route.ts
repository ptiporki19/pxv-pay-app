import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  
  // Sign out on the server
  await supabase.auth.signOut()
  
  return NextResponse.json({ success: true })
} 