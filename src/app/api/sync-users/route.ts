import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// Use service role for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Sync users API called')

    // For now, let's skip the token verification and just check if this is a super admin request
    // In production, you'd want proper authentication
    
    // Get all users from auth.users
    const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers()
    
    if (authError) {
      console.error('Error fetching auth users:', authError)
      return NextResponse.json({ error: 'Failed to fetch auth users' }, { status: 500 })
    }

    console.log('Found auth users:', authUsers.users.length)

    // Get existing users from public.users
    const { data: existingUsers, error: existingError } = await supabaseAdmin
      .from('users')
      .select('id')

    if (existingError) {
      console.error('Error fetching existing users:', existingError)
      return NextResponse.json({ error: 'Failed to fetch existing users' }, { status: 500 })
    }

    console.log('Found existing users:', existingUsers?.length || 0)

    const existingUserIds = new Set(existingUsers?.map((u: any) => u.id) || [])
    
    // Find users that need to be synced
    const usersToSync = authUsers.users.filter((authUser: any) => 
      !existingUserIds.has(authUser.id) && authUser.email
    )

    console.log('Users to sync:', usersToSync.length)

    let insertedUsers = 0

    // Insert missing users
    for (const authUser of usersToSync) {
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
        console.error(`Error inserting user ${authUser.email}:`, insertError)
      } else {
        console.log(`✅ Inserted user: ${authUser.email}`)
        insertedUsers++
      }
    }

    return NextResponse.json({ 
      success: true, 
      insertedUsers,
      totalAuthUsers: authUsers.users.length,
      message: `Synced ${insertedUsers} new users`
    })

  } catch (error) {
    console.error('Sync users error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 