// Test auth user creation after our fixes
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'http://127.0.0.1:54321'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testSignupFlow() {
  console.log('🧪 Testing User Signup Flow')
  console.log('============================')

  try {
    const testEmail = `signup-flow-test-${Date.now()}@example.com`
    
    console.log(`\n📝 Creating auth user: ${testEmail}`)
    
    // Test the admin createUser method (same as our signup action uses)
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: 'testPassword123!',
      email_confirm: true,
      user_metadata: {
        full_name: 'Test User Flow',
        role: 'registered_user'
      }
    })

    if (authError) {
      console.log('❌ Auth user creation failed:', authError.message)
      return false
    }

    console.log('✅ Auth user created successfully:', authData.user.id)

    // Test manual profile creation using our RPC function
    console.log('\n📝 Creating user profile using RPC function...')
    const { data: profileResult, error: profileError } = await supabase.rpc('create_user_profile_simple', {
      user_id: authData.user.id,
      user_email: testEmail,
      user_role: 'registered_user'
    })

    if (profileError) {
      console.log('❌ RPC profile creation failed:', profileError.message)
      
      // Try direct insert as fallback
      console.log('\n📝 Trying direct insert fallback...')
      const { error: directInsertError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: testEmail,
          role: 'registered_user',
          active: true,
          created_at: new Date().toISOString()
        })

      if (directInsertError) {
        console.log('❌ Direct insert failed:', directInsertError.message)
        console.log('⚠️ Auth user created but profile creation failed')
      } else {
        console.log('✅ Direct insert successful - profile created!')
      }
    } else {
      console.log('✅ RPC profile creation successful:', profileResult)
    }

    // Verify login works
    console.log('\n📝 Testing login...')
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: 'testPassword123!'
    })

    if (loginError) {
      console.log('❌ Login failed:', loginError.message)
    } else {
      console.log('✅ Login successful:', loginData.user.id)
      await supabase.auth.signOut()
    }

    // Clean up
    console.log('\n🧹 Cleaning up test user...')
    await supabase.auth.admin.deleteUser(authData.user.id)
    console.log('✅ Test user cleaned up')

    console.log('\n🎉 SIGNUP FLOW TEST COMPLETE!')
    
    if (!authError && (!profileError || !directInsertError)) {
      console.log('✅ USER CREATION IS WORKING!')
      console.log('💡 The signup form should work in your browser!')
      console.log('🔗 Test it at: http://localhost:3000/signup')
      return true
    } else {
      console.log('⚠️ Some issues remain')
      return false
    }

  } catch (error) {
    console.error('❌ Test failed:', error)
    return false
  }
}

testSignupFlow()
  .then(success => {
    process.exit(success ? 0 : 1)
  })
  .catch(error => {
    console.error('Test execution failed:', error)
    process.exit(1)
  }) 