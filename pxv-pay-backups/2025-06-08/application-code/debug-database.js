const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'http://127.0.0.1:54321'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function debugDatabase() {
  console.log('🔍 Debugging Database State')
  console.log('==========================')

  try {
    // Check if users table exists and its structure
    console.log('\n1️⃣ Checking users table...')
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(1)
    
    if (usersError) {
      console.log('❌ Users table error:', usersError.message)
    } else {
      console.log('✅ Users table accessible')
      if (usersData.length > 0) {
        console.log('   Sample record:', usersData[0])
      }
    }

    // Check RLS policies
    console.log('\n2️⃣ Checking RLS policies...')
    const { data: policies, error: policyError } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
        FROM pg_policies 
        WHERE tablename = 'users' AND schemaname = 'public'
        ORDER BY policyname;
      `
    })
    
    if (policyError) {
      console.log('❌ Policy check error:', policyError.message)
    } else {
      console.log('✅ RLS policies found:')
      policies?.forEach(policy => {
        console.log(`   • ${policy.policyname} (${policy.cmd}) - Roles: ${policy.roles}`)
      })
    }

    // Check triggers
    console.log('\n3️⃣ Checking triggers...')
    const { data: triggers, error: triggerError } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT trigger_name, event_manipulation, action_statement 
        FROM information_schema.triggers 
        WHERE event_object_table = 'users' 
        AND event_object_schema = 'auth'
        ORDER BY trigger_name;
      `
    })
    
    if (triggerError) {
      console.log('❌ Trigger check error:', triggerError.message)
    } else {
      console.log('✅ Auth triggers found:')
      triggers?.forEach(trigger => {
        console.log(`   • ${trigger.trigger_name} (${trigger.event_manipulation})`)
      })
    }

    // Check functions
    console.log('\n4️⃣ Checking functions...')
    const { data: functions, error: funcError } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT routine_name, routine_type, security_type 
        FROM information_schema.routines 
        WHERE routine_name IN ('handle_new_user', 'create_user_profile')
        AND routine_schema = 'public'
        ORDER BY routine_name;
      `
    })
    
    if (funcError) {
      console.log('❌ Function check error:', funcError.message)
    } else {
      console.log('✅ Functions found:')
      functions?.forEach(func => {
        console.log(`   • ${func.routine_name} (${func.routine_type}, ${func.security_type})`)
      })
    }

    // Test direct insert with service role
    console.log('\n5️⃣ Testing direct insert with service role...')
    const testUserId = 'test-' + Date.now()
    const { data: insertData, error: insertError } = await supabase
      .from('users')
      .insert({
        id: testUserId,
        email: `test-${Date.now()}@example.com`,
        role: 'registered_user',
        active: true
      })
      .select()
    
    if (insertError) {
      console.log('❌ Direct insert failed:', insertError.message)
    } else {
      console.log('✅ Direct insert successful:', insertData)
      
      // Clean up
      await supabase.from('users').delete().eq('id', testUserId)
      console.log('✅ Test record cleaned up')
    }

  } catch (error) {
    console.error('❌ Debug failed:', error)
  }
}

debugDatabase() 