import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Use service role to bypass RLS for super admin operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const resolvedParams = await params
    const userId = resolvedParams.id
    console.log('📋 API: Fetching user profile for ID:', userId)
    
    // Validate user ID
    if (!userId || userId.trim() === '') {
      console.error('❌ Invalid user ID provided')
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }
    
    // Check environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!supabaseUrl || !serviceRoleKey) {
      console.error('❌ Missing environment variables:', {
        hasUrl: !!supabaseUrl,
        hasServiceKey: !!serviceRoleKey
      })
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey)

    // Fetch user profile
    console.log('🔍 Querying users table...')
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, role, active, created_at, updated_at')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('❌ API: Failed to fetch user profile:', {
        error: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        userId
      })
      return NextResponse.json(
        { error: 'Failed to fetch user', details: error.message },
        { status: 500 }
      )
    }

    if (!user) {
      console.log('❌ User not found:', userId)
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    console.log('✅ API: Successfully fetched user profile:', {
      id: user.id,
      email: user.email,
      role: user.role
    })

    return NextResponse.json({
      success: true,
      user
    })

  } catch (error) {
    console.error('💥 API: Exception in user profile:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 