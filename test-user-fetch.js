const { createClient } = require('@supabase/supabase-js')

console.log('🧪 Testing user fetch with different authentication methods...')

const supabaseUrl = 'http://127.0.0.1:54321'
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'

async function testUserFetch() {
  try {
    console.log('\n1️⃣ Testing with service role (should work)...')
    const serviceClient = createClient(supabaseUrl, serviceRoleKey)
    
    const { data: serviceUsers, error: serviceError } = await serviceClient
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (serviceError) {
      console.error('❌ Service role error:', serviceError)
    } else {
      console.log(`✅ Service role: Found ${serviceUsers.length} users`)
      serviceUsers.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.email} (${user.role})`)
      })
    }

    console.log('\n2️⃣ Testing with anon key (might fail due to RLS)...')
    const anonClient = createClient(supabaseUrl, anonKey)
    
    const { data: anonUsers, error: anonError } = await anonClient
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (anonError) {
      console.error('❌ Anon key error:', anonError)
    } else {
      console.log(`✅ Anon key: Found ${anonUsers.length} users`)
    }

    console.log('\n3️⃣ Testing with super admin authentication...')
    const authClient = createClient(supabaseUrl, anonKey)
    
    // Try to sign in as super admin
    const { data: authData, error: authError } = await authClient.auth.signInWithPassword({
      email: 'admin@pxvpay.com',
      password: 'admin123456'
    })
    
    if (authError) {
      console.error('❌ Auth error:', authError)
    } else {
      console.log('✅ Authenticated as super admin')
      
      // Now try to fetch users with authenticated session
      const { data: authUsers, error: authUsersError } = await authClient
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (authUsersError) {
        console.error('❌ Authenticated fetch error:', authUsersError)
      } else {
        console.log(`✅ Authenticated fetch: Found ${authUsers.length} users`)
        authUsers.forEach((user, index) => {
          console.log(`   ${index + 1}. ${user.email} (${user.role})`)
        })
      }
    }

    console.log('\n4️⃣ Checking RLS policies on users table...')
    const { data: policies, error: policiesError } = await serviceClient
      .rpc('get_table_policies', { table_name: 'users' })
      .catch(() => {
        // If RPC doesn't exist, try direct query
        return serviceClient
          .from('pg_policies')
          .select('*')
          .eq('tablename', 'users')
      })
    
    if (policiesError) {
      console.log('⚠️  Could not fetch RLS policies (this is normal)')
    } else {
      console.log('📋 RLS Policies found:', policies?.length || 0)
    }

  } catch (err) {
    console.error('💥 Test failed:', err)
  }
}

testUserFetch().then(() => {
  console.log('\n✅ User fetch test completed!')
  process.exit(0)
}) 