const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

async function testSupabaseConnection() {
  console.log('🔍 Testing Supabase Connection...')
  console.log('📋 Current Configuration:')
  console.log('  URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
  console.log('  Service Key exists:', !!process.env.SUPABASE_SERVICE_ROLE_KEY)
  console.log('  Service Key starts with:', process.env.SUPABASE_SERVICE_ROLE_KEY?.substring(0, 50) + '...')
  
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Missing environment variables!')
    return
  }

  // Test with service role
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  try {
    console.log('\n🔍 Testing database connection...')
    
    // Test 1: Try to fetch users from the users table
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, role, created_at')
      .limit(5)

    if (usersError) {
      console.error('❌ Error fetching users:', usersError)
    } else {
      console.log(`✅ Successfully connected! Found ${users?.length || 0} users`)
      if (users && users.length > 0) {
        console.log('📋 Sample users:')
        users.forEach(user => {
          console.log(`  - ${user.email} (${user.role})`)
        })
      }
    }

    // Test 2: Try to fetch auth users (this requires service role)
    console.log('\n🔍 Testing auth users access...')
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
    
    if (authError) {
      console.error('❌ Error fetching auth users:', authError)
      console.log('💡 This suggests the service role key might be invalid or local-only')
    } else {
      console.log(`✅ Auth access works! Found ${authUsers.users?.length || 0} auth users`)
    }

  } catch (error) {
    console.error('💥 Connection test failed:', error)
  }
}

testSupabaseConnection() 