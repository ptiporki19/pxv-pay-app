import { NextResponse } from 'next/server'
import { createPublicClient } from '@/lib/supabase/public'

export async function GET() {
  try {
    const supabase = createPublicClient()
    
    // Test basic connection
    const { data: countries, error } = await supabase
      .from('countries')
      .select('*')
      .limit(1)
    
    if (error) {
      return NextResponse.json({ 
        error: error.message,
        details: error 
      }, { status: 500 })
    }
    
    return NextResponse.json({ 
      success: true,
      countries: countries?.length || 0,
      env: {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
      }
    })
    
  } catch (error) {
    return NextResponse.json({ 
      error: 'Catch error: ' + (error as Error).message 
    }, { status: 500 })
  }
} 