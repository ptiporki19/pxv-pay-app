const { Client } = require('pg')

async function isolateAuthIssue() {
  console.log('🔍 Isolating Auth User Creation Issue')
  console.log('====================================')

  const client = new Client({
    connectionString: 'postgresql://postgres:postgres@127.0.0.1:54322/postgres'
  })

  try {
    await client.connect()
    console.log('✅ Connected to database')

    // First, disable the trigger temporarily
    console.log('\n1️⃣ Temporarily disabling user creation trigger...')
    await client.query('DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;')
    console.log('✅ Trigger disabled')

    // Test basic auth user creation without trigger
    console.log('\n2️⃣ Testing basic auth user creation without trigger...')
    
    const { createClient } = require('@supabase/supabase-js')
    const supabase = createClient(
      'http://127.0.0.1:54321',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
    )

    const testEmail = `test_no_trigger_${Date.now()}@example.com`
    
    try {
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: testEmail,
        password: 'testpassword123',
        email_confirm: true,
        user_metadata: {
          role: 'registered_user'
        }
      })

      if (authError) {
        console.log('❌ Auth user creation failed even without trigger:', authError.message)
        console.log('   This suggests the issue is not with our trigger')
        
        // Check if it's a configuration issue
        console.log('\n🔧 Checking Supabase configuration...')
        const { data: status, error: statusError } = await supabase.auth.admin.listUsers()
        if (statusError) {
          console.log('❌ Admin API not working:', statusError.message)
        } else {
          console.log(`✅ Admin API working, found ${status.users?.length || 0} users`)
        }
        
      } else {
        console.log('✅ Auth user creation works without trigger:', authUser.user.id)
        
        // Now test manual profile creation
        console.log('\n3️⃣ Testing manual profile creation...')
        
        try {
          const { data: profile, error: profileError } = await supabase
            .from('users')
            .insert({
              id: authUser.user.id,
              email: testEmail,
              role: 'registered_user'
            })
            .select()
            .single()

          if (profileError) {
            console.log('❌ Manual profile creation failed:', profileError.message)
          } else {
            console.log('✅ Manual profile creation successful:', profile)
          }
        } catch (profileTestError) {
          console.log('❌ Profile test error:', profileTestError.message)
        }
        
        // Re-enable trigger and test
        console.log('\n4️⃣ Re-enabling trigger and testing...')
        await client.query(`
          CREATE TRIGGER on_auth_user_created
            AFTER INSERT ON auth.users
            FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
        `)
        console.log('✅ Trigger re-enabled')
        
        // Test another user with trigger
        const testEmail2 = `test_with_trigger_${Date.now()}@example.com`
        
        const { data: authUser2, error: authError2 } = await supabase.auth.admin.createUser({
          email: testEmail2,
          password: 'testpassword123',
          email_confirm: true,
          user_metadata: {
            role: 'registered_user'
          }
        })

        if (authError2) {
          console.log('❌ Auth user creation failed with trigger re-enabled:', authError2.message)
        } else {
          console.log('✅ Auth user creation works with trigger:', authUser2.user.id)
          
          // Check if profile was created by trigger
          await new Promise(resolve => setTimeout(resolve, 1000))
          
          const { data: autoProfile, error: autoProfileError } = await supabase
            .from('users')
            .select('*')
            .eq('id', authUser2.user.id)
            .single()

          if (autoProfileError) {
            console.log('❌ Auto profile creation failed:', autoProfileError.message)
          } else {
            console.log('✅ Auto profile creation successful:', autoProfile)
          }
          
          // Cleanup
          await supabase.auth.admin.deleteUser(authUser2.user.id)
          console.log('🧹 Second test user cleaned up')
        }
        
        // Cleanup first user
        await supabase.auth.admin.deleteUser(authUser.user.id)
        console.log('🧹 First test user cleaned up')
      }
    } catch (testError) {
      console.log('❌ Test failed with error:', testError.message)
    }

    console.log('\n🎯 Issue Isolation Complete!')

  } catch (error) {
    console.error('❌ Isolation failed:', error)
  } finally {
    await client.end()
    console.log('🔌 Database connection closed')
  }
}

isolateAuthIssue() 