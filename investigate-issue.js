const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'http://127.0.0.1:54321'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function investigateIssue() {
  console.log('🔍 Investigating User Creation Issue')
  console.log('===================================')

  try {
    // Step 1: Check users table structure
    console.log('\n1️⃣ Checking users table structure...')
    const { data: tableInfo, error: tableError } = await supabase
      .from('users')
      .select('*')
      .limit(0)
    
    if (tableError) {
      console.log('❌ Users table error:', tableError.message)
    } else {
      console.log('✅ Users table accessible')
    }

    // Step 2: Check if we can manually create a user with different approaches
    console.log('\n2️⃣ Testing manual user creation...')
    
    // Try with text role
    try {
      const testUserId1 = crypto.randomUUID()
      const { error: textRoleError } = await supabase
        .from('users')
        .insert({
          id: testUserId1,
          email: `test-text-${Date.now()}@example.com`,
          role: 'registered_user', // String literal
          active: true
        })
      
      if (textRoleError) {
        console.log('❌ Text role insert failed:', textRoleError.message)
      } else {
        console.log('✅ Text role insert successful')
        await supabase.from('users').delete().eq('id', testUserId1)
      }
    } catch (e) {
      console.log('❌ Text role test failed:', e.message)
    }

    // Step 3: Check enum values
    console.log('\n3️⃣ Checking user_role enum...')
    try {
      const { data: enumData, error: enumError } = await supabase.rpc('exec_sql', {
        sql: `SELECT unnest(enum_range(NULL::user_role)) as role_value;`
      })
      
      if (enumError) {
        console.log('❌ Enum check failed:', enumError.message)
      } else {
        console.log('✅ Enum values:', enumData?.map(r => r.role_value))
      }
    } catch (e) {
      console.log('❌ Enum check error:', e.message)
    }

    // Step 4: Try the simplest possible auth user creation
    console.log('\n4️⃣ Testing simplest auth user creation...')
    try {
      const { data: simpleAuthData, error: simpleAuthError } = await supabase.auth.admin.createUser({
        email: `simple-test-${Date.now()}@example.com`,
        password: 'testpass123',
        email_confirm: true
      })
      
      if (simpleAuthError) {
        console.log('❌ Simple auth user creation failed:', simpleAuthError.message)
        console.log('   Full error:', JSON.stringify(simpleAuthError, null, 2))
      } else {
        console.log('✅ Simple auth user creation successful:', simpleAuthData.user.id)
        await supabase.auth.admin.deleteUser(simpleAuthData.user.id)
      }
    } catch (e) {
      console.log('❌ Simple auth test error:', e.message)
    }

    // Step 5: Check current trigger status
    console.log('\n5️⃣ Checking trigger status...')
    try {
      const { data: triggerData, error: triggerError } = await supabase.rpc('exec_sql', {
        sql: `SELECT trigger_name, event_manipulation, action_statement FROM information_schema.triggers WHERE event_object_table = 'users' AND event_object_schema = 'auth';`
      })
      
      if (triggerError) {
        console.log('❌ Trigger check failed:', triggerError.message)
      } else {
        console.log('✅ Triggers found:', triggerData?.length || 0)
        triggerData?.forEach(t => console.log(`   • ${t.trigger_name} (${t.event_manipulation})`))
      }
    } catch (e) {
      console.log('❌ Trigger check error:', e.message)
    }

  } catch (error) {
    console.error('❌ Investigation failed:', error)
  }
}

investigateIssue() 