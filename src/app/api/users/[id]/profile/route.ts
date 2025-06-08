import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Use service role to bypass RLS for super admin operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params
    
    console.log('🔍 API: Fetching user profile for ID:', userId)

    // Validate UUID format (relaxed for testing)
    if (!userId || userId.trim() === '') {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Fetch user details using service role (bypasses RLS)
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (userError) {
      console.error('❌ API: User fetch error:', userError)
      
      if (userError.code === 'PGRST116') {
        return NextResponse.json(
          { error: `No user found with ID: ${userId}` },
          { status: 404 }
        )
      }
      
      return NextResponse.json(
        { error: 'Failed to fetch user', details: userError.message },
        { status: 500 }
      )
    }

    if (!userData) {
      return NextResponse.json(
        { error: 'No user data returned' },
        { status: 404 }
      )
    }

    console.log('✅ API: Successfully fetched user profile')

    return NextResponse.json({
      success: true,
      user: userData
    })

  } catch (error) {
    console.error('💥 API: Exception in user profile fetch:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 