const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'http://127.0.0.1:54321'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkSignupFunctions() {
  console.log('🔍 Checking User Creation Functions and Triggers')
  console.log('===============================================')

  try {
    // Check for triggers on auth.users
    console.log('\n🔧 Checking auth.users triggers...')
    const { data: triggers, error: triggerError } = await supabase.rpc('exec_sql', {
      sql: `SELECT trigger_name, event_manipulation, action_statement 
             FROM information_schema.triggers 
             WHERE event_object_table = 'users' 
             AND event_object_schema = 'auth';`
    })
    
    if (triggerError) {
      console.log('❌ Error checking triggers:', triggerError.message)
    } else {
      console.log(`✅ Found ${triggers?.length || 0} auth triggers:`)
      if (triggers && triggers.length > 0) {
        triggers.forEach(trigger => {
          console.log(`   • ${trigger.trigger_name} (${trigger.event_manipulation})`)
        })
      }
    }

    // Check for user-related functions
    console.log('\n🔧 Checking user-related functions...')
    const { data: functions, error: funcError } = await supabase.rpc('exec_sql', {
      sql: `SELECT routine_name, routine_type 
             FROM information_schema.routines 
             WHERE routine_name LIKE '%user%' 
             AND routine_schema = 'public';`
    })
    
    if (funcError) {
      console.log('❌ Error checking functions:', funcError.message)
    } else {
      console.log(`✅ Found ${functions?.length || 0} user functions:`)
      if (functions && functions.length > 0) {
        functions.forEach(func => {
          console.log(`   • ${func.routine_name} (${func.routine_type})`)
        })
      }
    }

    // Check if create_user_profile function exists
    console.log('\n🔧 Checking for create_user_profile function...')
    const { data: profileFunc, error: profileError } = await supabase.rpc('exec_sql', {
      sql: `SELECT routine_name, routine_definition 
             FROM information_schema.routines 
             WHERE routine_name = 'create_user_profile' 
             AND routine_schema = 'public';`
    })
    
    if (profileError) {
      console.log('❌ Error checking create_user_profile:', profileError.message)
    } else if (profileFunc && profileFunc.length > 0) {
      console.log('✅ create_user_profile function exists')
    } else {
      console.log('❌ create_user_profile function NOT found')
    }

    // Check RLS policies on users table
    console.log('\n🔒 Checking users table RLS policies...')
    const { data: policies, error: policyError } = await supabase.rpc('exec_sql', {
      sql: `SELECT policyname, cmd, permissive, roles, qual 
             FROM pg_policies 
             WHERE tablename = 'users' 
             AND schemaname = 'public';`
    })
    
    if (policyError) {
      console.log('❌ Error checking RLS policies:', policyError.message)
    } else {
      console.log(`✅ Found ${policies?.length || 0} RLS policies on users table:`)
      if (policies && policies.length > 0) {
        policies.forEach(policy => {
          console.log(`   • ${policy.policyname} (${policy.cmd})`)
        })
      }
    }

    // Test basic user creation with admin privileges
    console.log('\n🧪 Testing direct user creation...')
    try {
      const testEmail = `test_${Date.now()}@example.com`
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: testEmail,
        password: 'testpassword123',
        email_confirm: true,
        user_metadata: {
          full_name: 'Test User',
          role: 'registered_user'
        }
      })

      if (authError) {
        console.log('❌ Direct auth user creation failed:', authError.message)
      } else {
        console.log('✅ Direct auth user creation successful:', authUser.user.id)
        
        // Try to insert into users table
        const { data: userRecord, error: userError } = await supabase
          .from('users')
          .insert({
            id: authUser.user.id,
            email: testEmail,
            full_name: 'Test User',
            role: 'registered_user'
          })
          .select()
          .single()

        if (userError) {
          console.log('❌ Users table insert failed:', userError.message)
        } else {
          console.log('✅ Users table insert successful')
          
          // Clean up test user
          await supabase.auth.admin.deleteUser(authUser.user.id)
          console.log('🧹 Test user cleaned up')
        }
      }
    } catch (testError) {
      console.log('❌ Test user creation failed:', testError)
    }

  } catch (error) {
    console.error('❌ Function check failed:', error)
  }
}

checkSignupFunctions() 