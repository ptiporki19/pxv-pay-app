const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function checkTables() {
  console.log('🔍 Checking table structure...\n')
  
  try {
    // Check which tables exist
    const { data: tables, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['users', 'profiles'])
    
    if (error) {
      console.error('❌ Error checking tables:', error.message)
      return
    }
    
    console.log('📊 Available tables:', tables.map(t => t.table_name))
    
    // Check profiles table structure if it exists
    if (tables.find(t => t.table_name === 'profiles')) {
      console.log('\n🔍 Testing profiles table access...')
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .limit(3)
      
      if (profilesError) {
        console.error('❌ Profiles table error:', profilesError.message)
      } else {
        console.log('✅ Profiles table accessible. Sample count:', profiles.length)
        if (profiles.length > 0) {
          console.log('📄 Sample profile structure:', Object.keys(profiles[0]))
        }
      }
    }
    
    // Check users table structure if it exists
    if (tables.find(t => t.table_name === 'users')) {
      console.log('\n🔍 Testing users table access...')
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('*')
        .limit(3)
      
      if (usersError) {
        console.error('❌ Users table error:', usersError.message)
      } else {
        console.log('✅ Users table accessible. Sample count:', users.length)
        if (users.length > 0) {
          console.log('📄 Sample user structure:', Object.keys(users[0]))
        }
      }
    }
    
    // Test auth.admin.createUser functionality
    console.log('\n🔍 Testing auth.admin.createUser...')
    try {
      const testEmail = `test-check-${Date.now()}@example.com`
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: testEmail,
        password: 'TestPassword123!',
        email_confirm: true,
        user_metadata: {
          full_name: 'Test User',
          user_type: 'merchant'
        }
      })
      
      if (authError) {
        console.error('❌ Auth user creation failed:', authError.message)
      } else {
        console.log('✅ Auth user creation works! User ID:', authData.user.id)
        
        // Clean up the test user
        await supabase.auth.admin.deleteUser(authData.user.id)
        console.log('🧹 Test user cleaned up')
      }
    } catch (authTestError) {
      console.error('❌ Auth test failed:', authTestError.message)
    }
    
  } catch (error) {
    console.error('❌ Overall test failed:', error.message)
  }
}

checkTables() 