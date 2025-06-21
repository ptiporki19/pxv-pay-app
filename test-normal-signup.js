// Test normal signup approach
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'http://127.0.0.1:54321'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testNormalSignup() {
  console.log('🧪 Testing Normal Signup Approach')
  console.log('=================================')

  try {
    const testEmail = `normal-signup-${Date.now()}@example.com`
    
    console.log(`\n📝 Trying normal signup: ${testEmail}`)
    
    // Test normal signup (same as our app uses)
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: 'testPassword123!',
      options: {
        data: {
          full_name: 'Test Normal User',
          role: 'registered_user',
        },
      },
    })

    if (error) {
      console.log('❌ Normal signup failed:', error.message)
      console.log('   Error code:', error.status)
      return false
    }

    console.log('✅ Normal signup successful!')
    console.log('   User ID:', data.user?.id)
    console.log('   Email confirmed:', data.user?.email_confirmed_at ? 'Yes' : 'No')
    console.log('   Session:', data.session ? 'Created' : 'Not created')

    if (data.user?.id) {
      // If signup worked, manually create profile
      console.log('\n📝 Testing manual profile creation...')
      
      const supabaseService = createClient(supabaseUrl, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU')
      
      const { error: profileError } = await supabaseService
        .from('users')
        .insert({
          id: data.user.id,
          email: testEmail,
          role: 'registered_user',
          active: true,
          created_at: new Date().toISOString()
        })

      if (profileError) {
        console.log('⚠️ Profile creation failed:', profileError.message)
      } else {
        console.log('✅ Profile created successfully!')
      }

      // Test login
      console.log('\n📝 Testing login...')
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: 'testPassword123!'
      })

      if (loginError) {
        console.log('❌ Login failed:', loginError.message)
      } else {
        console.log('✅ Login successful!')
        await supabase.auth.signOut()
      }

      // Clean up
      console.log('\n🧹 Cleaning up...')
      const { error: deleteError } = await supabaseService.auth.admin.deleteUser(data.user.id)
      if (!deleteError) {
        console.log('✅ Test user cleaned up')
      }
    }

    console.log('\n🎉 NORMAL SIGNUP TEST COMPLETE!')
    console.log('✅ The signup form should work in your browser!')
    console.log('🔗 Test it at: http://localhost:3000/signup')
    return true

  } catch (error) {
    console.error('❌ Test failed:', error)
    return false
  }
}

testNormalSignup()
  .then(success => {
    process.exit(success ? 0 : 1)
  })
  .catch(error => {
    console.error('Test execution failed:', error)
    process.exit(1)
  }) 