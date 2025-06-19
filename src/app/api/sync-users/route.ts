import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Sync users API called')
    console.log('🌍 Environment check:', {
      NODE_ENV: process.env.NODE_ENV,
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasServiceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      supabaseUrlStart: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30),
      timestamp: new Date().toISOString()
    })

    // Check environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!supabaseUrl || !serviceRoleKey) {
      console.error('❌ Missing environment variables:', {
        hasUrl: !!supabaseUrl,
        hasServiceKey: !!serviceRoleKey
      })
      return NextResponse.json(
        { 
          success: false,
          error: 'Server configuration error - missing environment variables',
          details: {
            hasUrl: !!supabaseUrl,
            hasServiceKey: !!serviceRoleKey
          }
        }, 
        { status: 500 }
      )
    }

    // Create admin client
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
    
    console.log('🔍 Fetching auth users...')
    // Get all users from auth.users
    const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers()
    
    if (authError) {
      console.error('❌ Error fetching auth users:', authError)
      return NextResponse.json({ 
        error: 'Failed to fetch auth users', 
        details: authError.message 
      }, { status: 500 })
    }

    console.log(`✅ Found ${authUsers.users.length} auth users`)

    // Get existing users from public.users
    console.log('🔍 Fetching existing users...')
    const { data: existingUsers, error: existingError } = await supabaseAdmin
      .from('users')
      .select('id')

    if (existingError) {
      console.error('❌ Error fetching existing users:', existingError)
      return NextResponse.json({ 
        error: 'Failed to fetch existing users', 
        details: existingError.message 
      }, { status: 500 })
    }

    console.log(`✅ Found ${existingUsers?.length || 0} existing users`)

    const existingUserIds = new Set(existingUsers?.map((u: any) => u.id) || [])
    
    // Find users that need to be synced
    const usersToSync = authUsers.users.filter((authUser: any) => 
      !existingUserIds.has(authUser.id) && authUser.email
    )

    console.log(`📊 Users to sync: ${usersToSync.length}`)

    let insertedUsers = 0
    const errors = []

    // Insert missing users
    for (const authUser of usersToSync) {
      try {
        const { error: insertError } = await supabaseAdmin
          .from('users')
          .insert({
            id: authUser.id,
            email: authUser.email!,
            role: 'registered_user', // Default role
            active: true,
            created_at: authUser.created_at,
            updated_at: authUser.updated_at || authUser.created_at
          })

        if (insertError) {
          console.error(`❌ Error inserting user ${authUser.email}:`, insertError)
          errors.push(`Failed to insert ${authUser.email}: ${insertError.message}`)
        } else {
          console.log(`✅ Inserted user: ${authUser.email}`)
          insertedUsers++
        }
      } catch (err) {
        console.error(`💥 Exception inserting user ${authUser.email}:`, err)
        errors.push(`Exception inserting ${authUser.email}: ${err instanceof Error ? err.message : 'Unknown error'}`)
      }
    }

    const result = {
      success: true, 
      insertedUsers,
      totalAuthUsers: authUsers.users.length,
      totalExistingUsers: existingUsers?.length || 0,
      usersToSync: usersToSync.length,
      message: `Successfully synced ${insertedUsers} new users`,
      errors: errors.length > 0 ? errors : undefined
    }

    console.log('🎉 Sync completed:', result)
    
    return NextResponse.json(result)

  } catch (error) {
    console.error('💥 Sync users exception:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 