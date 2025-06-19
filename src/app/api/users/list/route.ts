import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
    console.log('📋 API: Fetching users list...')
    
    // Check environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    console.log('🔧 Environment check:', {
      hasUrl: !!supabaseUrl,
      urlPrefix: supabaseUrl?.substring(0, 30) + '...',
      hasServiceKey: !!serviceRoleKey,
      hasAnonKey: !!anonKey,
      serviceKeyPrefix: serviceRoleKey?.substring(0, 30) + '...',
      anonKeyPrefix: anonKey?.substring(0, 30) + '...'
    })
    
    if (!supabaseUrl) {
      console.error('❌ Missing Supabase URL')
      return NextResponse.json(
        { error: 'Server configuration error - missing Supabase URL' },
        { status: 500 }
      )
    }

    // Use service role if available, otherwise use anon key as fallback
    const key = serviceRoleKey || anonKey
    if (!key) {
      console.error('❌ No valid key available')
      return NextResponse.json(
        { error: 'Server configuration error - no valid key' },
        { status: 500 }
      )
    }

    // Create client
    const supabase = createClient(supabaseUrl, key)
    console.log('🔑 Using key type:', serviceRoleKey ? 'service_role' : 'anon')

    // Fetch all users
    const { data: users, error } = await supabase
      .from('users')
      .select('id, email, role, active, created_at, updated_at')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ API: Failed to fetch users:', {
        error: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      })
      
      // Return empty array instead of error to prevent UI breaking
      console.log('📋 Returning empty users array due to error')
      return NextResponse.json({
        success: false,
        users: [],
        count: 0,
        error: error.message,
        keyType: serviceRoleKey ? 'service_role' : 'anon'
      })
    }

    const userList = users || []
    console.log(`✅ API: Successfully fetched ${userList.length} users`)

    return NextResponse.json({
      success: true,
      users: userList,
      count: userList.length,
      keyType: serviceRoleKey ? 'service_role' : 'anon'
    })

  } catch (error) {
    console.error('💥 API: Exception in users list:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
} 